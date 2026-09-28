import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_CATALOGS } from '../data/defaultCatalog'
import {
  ARTIST_DISCOGRAPHIES,
  FEATURED_PLAYLISTS,
  POPULAR_GENRES,
  NEW_RELEASES_2025_2026,
  FAMOUS_LYRICS_MAP,
} from '../data/searchEngine'
import { api } from '../api'

// One <audio> element for the whole app — like a real player. The queue,
// repeat modes, shuffle and infinite autoplay live here so any view can start
// playback, mobile background keeps playing uninterrupted, and the mini-player
// always reflects it. Internal state is mirrored into refs so listeners never
// read stale closures.

const AudioContext = createContext(null)

const fallbackCover = (track) =>
  track?.cover ||
  'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#2c231c"/><circle cx="80" cy="84" r="34" fill="none" stroke="#e09a4e" strokeWidth="6"/><circle cx="80" cy="84" r="13" fill="#e09a4e"/></svg>`
    )

const trackKey = (t) => t?.id || `${t?.title || ''}|${t?.artist || ''}`

const ALL_FALLBACK_TRACKS = [
  ...Object.values(DEFAULT_CATALOGS).flat(),
  ...Object.values(ARTIST_DISCOGRAPHIES).flat(),
  ...NEW_RELEASES_2025_2026,
  ...FEATURED_PLAYLISTS.flatMap((p) => p.tracks || []),
  ...POPULAR_GENRES.flatMap((g) => g.tracks || []),
  ...FAMOUS_LYRICS_MAP.filter((m) => m.stream_url),
]

function resolveTrackStream(track) {
  if (!track) return null
  if (track.stream_url) return track

  const tTitle = (track.title || '').trim().toLowerCase()
  const match = ALL_FALLBACK_TRACKS.find((t) => {
    if (!t || !t.stream_url) return false
    const candTitle = (t.title || '').trim().toLowerCase()
    return candTitle === tTitle || candTitle.includes(tTitle) || tTitle.includes(candTitle)
  })

  if (match && match.stream_url) {
    return {
      ...track,
      stream_url: match.stream_url,
      cover: track.cover || match.cover,
      duration: track.duration || match.duration || 240,
    }
  }
  return track
}

/**
 * Finds continuation tracks related to current track to power Spotify-style
 * infinite radio autoplay so music never stops on mobile / background.
 */
function findRelatedContinuation(currentTrack, existingQueue = []) {
  if (!currentTrack) return ALL_FALLBACK_TRACKS.slice(0, 6)
  const seenKeys = new Set((existingQueue || []).map((t) => trackKey(t).toLowerCase()))
  const curArtist = (currentTrack.artist || currentTrack.artist_playlist || '').toLowerCase()
  const curCategory = currentTrack.category || ''

  // 1. If currently in artist playlist mode, prioritize tracks from that artist discography
  let artistHits = []
  for (const [artKey, tracks] of Object.entries(ARTIST_DISCOGRAPHIES || {})) {
    if (curArtist.includes(artKey.replace(/_/g, ' ')) || curArtist.includes(artKey.split('_')[0])) {
      artistHits = tracks.filter((t) => !seenKeys.has(trackKey(t).toLowerCase()))
      break
    }
  }

  // Same artist tracks from fallback catalog
  const catalogArtistMatches = ALL_FALLBACK_TRACKS.filter((t) => {
    if (seenKeys.has(trackKey(t).toLowerCase())) return false
    const tArtist = (t.artist || '').toLowerCase()
    return (
      tArtist &&
      curArtist &&
      (tArtist.includes(curArtist) || curArtist.includes(tArtist) || tArtist.split(',')[0] === curArtist.split(',')[0])
    )
  })

  // 2. Same category / mood tracks
  const categoryMatches =
    curCategory && DEFAULT_CATALOGS[curCategory]
      ? DEFAULT_CATALOGS[curCategory].filter((t) => !seenKeys.has(trackKey(t).toLowerCase()))
      : []

  // 3. Popular evergreen pool
  const remaining = ALL_FALLBACK_TRACKS.filter((t) => !seenKeys.has(trackKey(t).toLowerCase()))

  const pool = [...artistHits, ...catalogArtistMatches, ...categoryMatches, ...remaining]
  const picked = []
  for (const t of pool) {
    const k = trackKey(t).toLowerCase()
    if (!seenKeys.has(k)) {
      seenKeys.add(k)
      picked.push(t)
      if (picked.length >= 8) break
    }
  }

  // If pool was completely exhausted, recycle fresh tracks from catalog
  if (picked.length === 0) {
    return ALL_FALLBACK_TRACKS.slice(0, 8)
  }
  return picked
}

export function AudioProvider({ children }) {
  const audioRef = useRef(null)
  const [current, setCurrent] = useState(null) // {track, queue, index}
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('sangeet.vol') ?? 0.8))
  const [repeat, setRepeat] = useState('off') // off | all | one
  const [shuffle, setShuffle] = useState(false)
  const [error, setError] = useState(null)

  // refs mirroring state for the event listeners
  const stateRef = useRef({ current: null, repeat: 'off', shuffle: false, duration: 0 })
  stateRef.current = { current, repeat, shuffle, duration }

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const el = new Audio()
      el.preload = 'auto'
      el.setAttribute('playsinline', 'true')
      el.setAttribute('webkit-playsinline', 'true')

      el.addEventListener('timeupdate', () => {
        setProgress(el.currentTime)
        // Update MediaSession playback position
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && el.duration > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: el.duration,
              playbackRate: el.playbackRate || 1.0,
              position: Math.min(el.currentTime, el.duration),
            })
          } catch {}
        }

        // Proactive queue replenishment: if near end of track and near end of queue, append next tracks in advance!
        const st = stateRef.current
        const cur = st.current
        if (cur && cur.queue && el.duration > 15 && el.duration - el.currentTime < 12) {
          if (cur.index >= cur.queue.length - 2) {
            const more = findRelatedContinuation(cur.track, cur.queue)
            if (more.length > 0) {
              cur.queue.push(...more)
            }
          }
        }
      })

      el.addEventListener('loadedmetadata', () => setDuration(el.duration || 0))
      el.addEventListener('durationchange', () => setDuration(el.duration || 0))
      el.addEventListener('play', () => {
        setPlaying(true)
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing'
        }
      })
      el.addEventListener('pause', () => {
        setPlaying(false)
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused'
        }
      })
      el.addEventListener('error', () => {
        // Do not auto-skip if error was just a harmless abort from switching tracks
        if (el.error && el.error.code === 1) { // MEDIA_ERR_ABORTED
          return
        }
        if (!el.src || el.networkState === 0) {
          return
        }

        // Automatic Bitrate Resiliency: if 320kbps fails on CDN, degrade to 160kbps, then 96kbps
        if (/_320\.(mp4|m4a|mp3)/i.test(el.src)) {
          el.src = el.src.replace(/_320\.(mp4|m4a|mp3)/i, '_160.$1')
          el.play().catch(() => {})
          return
        }
        if (/_160\.(mp4|m4a|mp3)/i.test(el.src)) {
          el.src = el.src.replace(/_160\.(mp4|m4a|mp3)/i, '_96.$1')
          el.play().catch(() => {})
          return
        }

        const st = stateRef.current
        const cur = st.current
        const q = cur?.queue || []
        const curIndex = cur?.index ?? 0

        // 1. First attempt to rescue the current song with a verified stream from ALL_FALLBACK_TRACKS
        if (cur?.track) {
          const tTitle = (cur.track.title || '').trim().toLowerCase()
          const matchedFallback = ALL_FALLBACK_TRACKS.find((t) => {
            if (!t || !t.stream_url) return false
            const candTitle = (t.title || '').trim().toLowerCase()
            return (
              (candTitle === tTitle || candTitle.includes(tTitle) || tTitle.includes(candTitle)) &&
              !el.src.includes(t.stream_url)
            )
          })
          if (matchedFallback && matchedFallback.stream_url) {
            const rescuedTrack = {
              ...cur.track,
              stream_url: matchedFallback.stream_url,
              cover: cur.track.cover || matchedFallback.cover,
            }
            if (q[curIndex]) {
              q[curIndex] = rescuedTrack
            }
            setCurrent({ track: rescuedTrack, queue: q, index: curIndex })
            el.src = rescuedTrack.stream_url
            el.play().catch(() => {})
            return
          }
        }

        // 2. Try next track in current queue
        const nextIdx = curIndex + 1
        for (let i = nextIdx; i < q.length; i++) {
          const cand = q[i]
          if (cand && cand.stream_url) {
            setCurrent({ track: cand, queue: q, index: i })
            el.src = cand.stream_url
            el.play().catch(() => {})
            setError(`Auto-skipped “${cur?.track?.title || 'track'}” (stream unavailable). Playing next…`)
            return
          }
        }

        // 3. If queue exhausted or no valid stream found, pick verified continuation track
        const moreTracks = findRelatedContinuation(cur?.track, q)
        const workingTrack = moreTracks.find((t) => t && t.stream_url)
        if (workingTrack) {
          const newQ = [...q, workingTrack]
          setCurrent({ track: workingTrack, queue: newQ, index: newQ.length - 1 })
          el.src = workingTrack.stream_url
          el.play().catch(() => {})
          setError(`Auto-skipped “${cur?.track?.title || 'track'}”. Playing next…`)
          return
        }

        setError('This track could not be streamed right now.')
        setPlaying(false)
      })

      // Continuous non-stop background audio progression
      el.addEventListener('ended', () => {
        const st = stateRef.current
        const cur = st.current
        if (!cur) return

        if (st.repeat === 'one') {
          el.currentTime = 0
          el.play().catch(() => {})
          return
        }

        let q = cur.queue ? [...cur.queue] : []
        let nextIdx = cur.index + 1

        // Infinite Autoplay: music NEVER stops!
        if (nextIdx >= q.length) {
          if (st.repeat === 'all' && q.length > 0) {
            nextIdx = 0
          } else {
            // Fetch next related continuation tracks
            const moreTracks = findRelatedContinuation(cur.track, q)
            if (moreTracks.length > 0) {
              q.push(...moreTracks)
            } else {
              nextIdx = 0
            }
          }
        }

        if (st.shuffle && q.length > 1) {
          nextIdx = Math.floor(Math.random() * q.length)
        }

        const nextTrack = q[nextIdx]
        if (nextTrack) {
          setCurrent({ track: nextTrack, queue: q, index: nextIdx })
          if (nextTrack.stream_url) {
            el.src = nextTrack.stream_url
            // Immediate synchronous play to keep mobile background wakelock active
            const p = el.play()
            if (p && p.catch) {
              p.catch((err) => {
                console.warn('Autoplay continuation notice:', err)
              })
            }
          }
        }
      })

      audioRef.current = el
    }
    return audioRef.current
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const playTrack = useCallback(
    async (track, queue = null) => {
      let q = queue ? [...queue] : current?.queue?.some((t) => trackKey(t) === trackKey(track)) ? [...current.queue] : [track]
      
      // If queue is single track, automatically append related continuation tracks so it plays continuously!
      if (q.length <= 1) {
        const autoQueue = findRelatedContinuation(track, q)
        q = [...q, ...autoQueue]
      }

      const index = q.findIndex((t) => trackKey(t) === trackKey(track))
      const el = ensureAudio()
      setError(null)

      let activeTrack = resolveTrackStream(track)
      if (!activeTrack.stream_url) {
        try {
          const searchRes = await api.search(`${activeTrack.title} ${activeTrack.artist || ''}`)
          const candidate = searchRes?.tracks?.find((t) => t && t.stream_url)
          if (candidate && candidate.stream_url) {
            activeTrack = {
              ...activeTrack,
              stream_url: candidate.stream_url,
              cover: activeTrack.cover || candidate.cover,
            }
          }
        } catch { /* ignore */ }
      }

      const activeIndex = index >= 0 ? index : 0
      q[activeIndex] = activeTrack
      setCurrent({ track: activeTrack, queue: q, index: activeIndex })

      if (activeTrack.stream_url && el.src !== activeTrack.stream_url) {
        el.src = activeTrack.stream_url
      }

      if (activeTrack.stream_url) {
        el.play()
          .then(() => setPlaying(true))
          .catch((err) => {
            if (err.name === 'NotAllowedError') {
              setError('Playback paused by browser — tap play button.')
            } else if (err.name === 'AbortError') {
              // Benign: interrupted by another play/pause action
            } else {
              setError(null)
            }
          })
      } else {
        setError('Stream URL unavailable right now.')
      }
    },
    [current, ensureAudio]
  )

  const toggle = useCallback(() => {
    const el = ensureAudio()
    if (!current) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }, [current, ensureAudio])

  const _advance = useCallback(
    (dir, track, queue, index) => {
      const st = stateRef.current
      let q = queue ? [...queue] : []
      if (!q.length) return
      if (st.shuffle) {
        const nextIdx = Math.floor(Math.random() * q.length)
        const t = q[nextIdx]
        playTrack(t, q)
        return
      }
      let nextIdx = index + dir
      if (nextIdx < 0) nextIdx = q.length - 1
      if (nextIdx >= q.length) {
        // Queue expansion on manual skip next
        const more = findRelatedContinuation(track, q)
        if (more.length > 0) {
          q.push(...more)
        } else {
          nextIdx = 0
        }
      }
      playTrack(q[nextIdx], q)
    },
    [playTrack]
  )

  const next = useCallback(() => {
    if (!current) return
    _advance(1, current.track, current.queue, current.index)
  }, [current, _advance])

  const prev = useCallback(() => {
    if (!current) return
    const el = audioRef.current
    if (el && el.currentTime > 4) {
      el.currentTime = 0
      return
    }
    _advance(-1, current.track, current.queue, current.index)
  }, [current, _advance])

  const seek = useCallback((t) => {
    if (audioRef.current) audioRef.current.currentTime = t
    setProgress(t)
  }, [])

  const setVol = useCallback((v) => {
    setVolume(v)
    localStorage.setItem('sangeet.vol', String(v))
  }, [])

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'))
  }, [])

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), [])

  // Sync with native OS MediaSession (Lock screen, notifications, car Bluetooth, earbuds)
  useEffect(() => {
    const track = current?.track
    if (!track || !('mediaSession' in navigator)) return

    try {
      const art = track.cover || fallbackCover(track)
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.title || 'Sangeet Track',
        artist: track.artist || 'Sangeet',
        album: track.album || 'Sangeet Stream',
        artwork: [
          { src: art, sizes: '96x96', type: 'image/jpeg' },
          { src: art, sizes: '128x128', type: 'image/jpeg' },
          { src: art, sizes: '192x192', type: 'image/jpeg' },
          { src: art, sizes: '256x256', type: 'image/jpeg' },
          { src: art, sizes: '384x384', type: 'image/jpeg' },
          { src: art, sizes: '512x512', type: 'image/jpeg' },
        ],
      })
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) audioRef.current.play().catch(() => {})
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) audioRef.current.pause()
      })
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        next()
      })
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prev()
      })
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime != null) seek(details.seekTime)
      })
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10
        if (audioRef.current) seek(Math.min(duration, audioRef.current.currentTime + offset))
      })
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10
        if (audioRef.current) seek(Math.max(0, audioRef.current.currentTime - offset))
      })
    } catch (e) {
      console.warn('MediaSession initialization:', e)
    }
  }, [current?.track, playing, duration, next, prev, seek])

  const value = useMemo(
    () => ({
      current,
      playing,
      progress,
      duration,
      volume,
      repeat,
      shuffle,
      error,
      setError,
      playTrack,
      toggle,
      next,
      prev,
      seek,
      setVol,
      cycleRepeat,
      toggleShuffle,
      fallbackCover,
    }),
    [
      current,
      playing,
      progress,
      duration,
      volume,
      repeat,
      shuffle,
      error,
      playTrack,
      toggle,
      next,
      prev,
      seek,
      setVol,
      cycleRepeat,
      toggleShuffle,
    ]
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudio() {
  return useContext(AudioContext)
}
