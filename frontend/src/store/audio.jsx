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

  // Authoritative real-time player state ref so background native DOM listeners,
  // lock screen MediaSession, and phone lock screen continuation NEVER read stale React closures.
  const stateRef = useRef({ current: null, repeat: 'off', shuffle: false, duration: 0, playing: false })
  const isTransitioningRef = useRef(false)
  const audioCtxRef = useRef(null)

  const enableAudioKeepAlive = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!audioCtxRef.current && AudioCtx) {
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        gain.gain.value = 0.00001
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        audioCtxRef.current = ctx
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {})
      }
    } catch {}
  }, [])

  useEffect(() => {
    stateRef.current.repeat = repeat
  }, [repeat])

  useEffect(() => {
    stateRef.current.shuffle = shuffle
  }, [shuffle])

  useEffect(() => {
    stateRef.current.duration = duration
  }, [duration])

  useEffect(() => {
    stateRef.current.playing = playing
  }, [playing])

  // Synchronize native OS MediaSession metadata (Lock screen, notifications, car Bluetooth, earbuds)
  const updateMediaSession = useCallback((track, isPlaying = true) => {
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
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    } catch (e) {
      console.warn('MediaSession sync note:', e)
    }
  }, [])

  // Proactive background pre-fetch: warms up HTTP cache, DNS, and TLS handshake
  // so track transitions have 0 latency and mobile OS audio hardware never suspends.
  const prefetchTrack = useCallback((url) => {
    if (!url || typeof window === 'undefined') return
    try {
      fetch(url, { mode: 'no-cors' }).catch(() => {})
    } catch {}
  }, [])

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

        // Proactive stream pre-resolution, HTTP pre-buffering & queue replenishment
        // Before track ends, ensure next track stream is pre-resolved and cached so mobile background transition is 100% seamless
        const cur = stateRef.current.current
        if (cur && cur.queue && el.duration > 5) {
          const nextIdx = cur.index + 1
          if (nextIdx < cur.queue.length && cur.queue[nextIdx]) {
            if (!cur.queue[nextIdx].stream_url) {
              cur.queue[nextIdx] = resolveTrackStream(cur.queue[nextIdx])
            }
            if (cur.queue[nextIdx]?.stream_url) {
              prefetchTrack(cur.queue[nextIdx].stream_url)
            }
          }
          // Replenish continuation tracks proactively when approaching the end of queue
          if (el.duration - el.currentTime < 20 && cur.index >= cur.queue.length - 2) {
            const more = findRelatedContinuation(cur.track, cur.queue).map(resolveTrackStream)
            if (more.length > 0) {
              cur.queue.push(...more)
            }
          }
        }
      })

      el.addEventListener('loadedmetadata', () => {
        const d = el.duration || 0
        stateRef.current.duration = d
        setDuration(d)
      })
      el.addEventListener('durationchange', () => {
        const d = el.duration || 0
        stateRef.current.duration = d
        setDuration(d)
      })
      el.addEventListener('play', () => {
        isTransitioningRef.current = false
        stateRef.current.playing = true
        setPlaying(true)
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing'
        }
      })
      el.addEventListener('pause', () => {
        // Prevent end-of-track pause or track transition from falsely stopping background playback session on mobile
        if (el.ended || isTransitioningRef.current) {
          return
        }
        stateRef.current.playing = false
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

        const cur = stateRef.current.current
        const q = cur?.queue ? [...cur.queue] : []
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
            const rescuedState = { track: rescuedTrack, queue: q, index: curIndex }
            stateRef.current.current = rescuedState
            setCurrent(rescuedState)
            updateMediaSession(rescuedTrack, true)
            el.src = rescuedTrack.stream_url
            el.play().catch(() => {})
            return
          }
        }

        // 2. Try next track in current queue
        const nextIdx = curIndex + 1
        for (let i = nextIdx; i < q.length; i++) {
          const cand = resolveTrackStream(q[i])
          if (cand && cand.stream_url) {
            q[i] = cand
            const nextState = { track: cand, queue: q, index: i }
            stateRef.current.current = nextState
            setCurrent(nextState)
            updateMediaSession(cand, true)
            el.src = cand.stream_url
            el.play().catch(() => {})
            setError(`Auto-skipped “${cur?.track?.title || 'track'}” (stream unavailable). Playing next…`)
            return
          }
        }

        // 3. If queue exhausted or no valid stream found, pick verified continuation track
        const moreTracks = findRelatedContinuation(cur?.track, q).map(resolveTrackStream)
        const workingTrack = moreTracks.find((t) => t && t.stream_url)
        if (workingTrack) {
          const newQ = [...q, workingTrack]
          const nextState = { track: workingTrack, queue: newQ, index: newQ.length - 1 }
          stateRef.current.current = nextState
          setCurrent(nextState)
          updateMediaSession(workingTrack, true)
          el.src = workingTrack.stream_url
          el.play().catch(() => {})
          setError(`Auto-skipped “${cur?.track?.title || 'track'}”. Playing next…`)
          return
        }

        setError('This track could not be streamed right now.')
        stateRef.current.playing = false
        setPlaying(false)
      })

      // Continuous non-stop background audio progression (100% resilient for mobile background & lock screen)
      el.addEventListener('ended', () => {
        const cur = stateRef.current.current
        if (!cur) return

        if (stateRef.current.repeat === 'one') {
          el.currentTime = 0
          el.play().catch(() => {})
          return
        }

        let q = cur.queue ? [...cur.queue] : []
        let nextIdx = cur.index + 1

        // Sequential autoplay: loop or expand queue
        if (nextIdx >= q.length) {
          if (stateRef.current.repeat === 'all' && q.length > 0) {
            nextIdx = 0
          } else {
            // Replenish continuation tracks
            const moreTracks = findRelatedContinuation(cur.track, q).map(resolveTrackStream)
            if (moreTracks.length > 0) {
              q.push(...moreTracks)
            } else {
              nextIdx = 0
            }
          }
        }

        if (stateRef.current.shuffle && q.length > 1) {
          let randIdx = Math.floor(Math.random() * q.length)
          if (randIdx === cur.index) {
            randIdx = (randIdx + 1) % q.length
          }
          nextIdx = randIdx
        }

        // Sequential search-ahead for a valid playable track with stream_url
        let nextTrack = null
        let scanLimit = q.length + 10
        while (scanLimit-- > 0 && nextIdx < q.length) {
          let candidate = q[nextIdx]
          if (candidate) {
            candidate = resolveTrackStream(candidate)
            q[nextIdx] = candidate
            if (candidate && candidate.stream_url) {
              nextTrack = candidate
              break
            }
          }
          nextIdx++
        }

        // If end of queue was hit without finding a stream, pull from continuation pool
        if (!nextTrack) {
          const fresh = findRelatedContinuation(cur.track, q).map(resolveTrackStream)
          for (const cand of fresh) {
            if (cand && cand.stream_url) {
              nextTrack = cand
              q.push(cand)
              nextIdx = q.length - 1
              break
            }
          }
        }

        // Ultimate safety fallback to guarantee continuous playback never stops
        if (!nextTrack && ALL_FALLBACK_TRACKS.length > 0) {
          nextTrack = ALL_FALLBACK_TRACKS[0]
          q.push(nextTrack)
          nextIdx = q.length - 1
        }

        if (nextTrack && nextTrack.stream_url) {
          isTransitioningRef.current = true
          // CRITICAL FIX: Synchronously mutate stateRef.current.current BEFORE setting el.src and calling play().
          // On mobile devices with screen locked or app minimized, React background re-renders are suspended!
          // Updating stateRef.current.current synchronously guarantees that when THIS song ends, the NEXT song
          // will increment from this exact index, continuing track 3, 4, 5... sequentially forever without stopping!
          const nextState = { track: nextTrack, queue: q, index: nextIdx }
          stateRef.current.current = nextState
          setCurrent(nextState)

          el.src = nextTrack.stream_url
          el.currentTime = 0
          try {
            el.load()
          } catch {}

          updateMediaSession(nextTrack, true)

          const playPromise = el.play()
          if (playPromise && playPromise.catch) {
            playPromise.catch((err) => {
              console.warn('Background playback continuation note:', err)
              const onCanPlay = () => {
                el.removeEventListener('canplay', onCanPlay)
                el.removeEventListener('loadeddata', onCanPlay)
                el.play().then(() => { isTransitioningRef.current = false }).catch(() => {})
              }
              el.addEventListener('canplay', onCanPlay, { once: true })
              el.addEventListener('loadeddata', onCanPlay, { once: true })
            })
          }

          // Pre-cache the upcoming song after this one for zero-latency transition
          const futureIdx = nextIdx + 1
          if (futureIdx < q.length && q[futureIdx]) {
            const fut = resolveTrackStream(q[futureIdx])
            if (fut?.stream_url) {
              prefetchTrack(fut.stream_url)
            }
          }
        }
      })

      audioRef.current = el
    }
    return audioRef.current
  }, [prefetchTrack, updateMediaSession])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const playTrack = useCallback(
    async (track, queue = null) => {
      enableAudioKeepAlive()
      const cur = stateRef.current.current
      let q = queue
        ? [...queue]
        : cur?.queue?.some((t) => trackKey(t) === trackKey(track))
        ? [...cur.queue]
        : [track]

      // If queue is single track, automatically append related continuation tracks so it plays continuously!
      if (q.length <= 1) {
        const autoQueue = findRelatedContinuation(track, q).map(resolveTrackStream)
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

      // CRITICAL: Synchronously update stateRef.current.current
      const nextState = { track: activeTrack, queue: q, index: activeIndex }
      stateRef.current.current = nextState
      setCurrent(nextState)

      if (activeTrack.stream_url && el.src !== activeTrack.stream_url) {
        el.src = activeTrack.stream_url
      }

      updateMediaSession(activeTrack, true)

      if (activeTrack.stream_url) {
        el.play()
          .then(() => {
            stateRef.current.playing = true
            setPlaying(true)
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError') {
              setError('Playback paused by browser — tap play button.')
            } else if (err.name === 'AbortError') {
              // Benign: interrupted by another play/pause action
            } else {
              setError(null)
            }
          })

        // Preload upcoming track
        const nextIdx = activeIndex + 1
        if (nextIdx < q.length && q[nextIdx]) {
          const fut = resolveTrackStream(q[nextIdx])
          if (fut?.stream_url) {
            prefetchTrack(fut.stream_url)
          }
        }
      } else {
        setError('Stream URL unavailable right now.')
      }
    },
    [ensureAudio, enableAudioKeepAlive, prefetchTrack, updateMediaSession]
  )

  const toggle = useCallback(() => {
    enableAudioKeepAlive()
    const el = ensureAudio()
    const cur = stateRef.current.current
    if (!cur) return
    if (el.paused) {
      el.play()
        .then(() => {
          stateRef.current.playing = true
          setPlaying(true)
        })
        .catch(() => {})
    } else {
      el.pause()
      stateRef.current.playing = false
      setPlaying(false)
    }
  }, [ensureAudio])

  const _advance = useCallback(
    (dir) => {
      const cur = stateRef.current.current
      if (!cur) return

      let q = cur.queue ? [...cur.queue] : []
      if (!q.length) return

      if (stateRef.current.shuffle && q.length > 1) {
        let randIdx = Math.floor(Math.random() * q.length)
        if (randIdx === cur.index) {
          randIdx = (randIdx + 1) % q.length
        }
        playTrack(q[randIdx], q)
        return
      }

      let nextIdx = cur.index + dir
      if (nextIdx < 0) nextIdx = q.length - 1
      if (nextIdx >= q.length) {
        // Queue expansion on manual skip next
        const more = findRelatedContinuation(cur.track, q).map(resolveTrackStream)
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

  // Mobile background resilience: when user turns on screen or brings tab to foreground,
  // ensure React UI state is synchronized with the actual playing track from background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const el = audioRef.current
        const cur = stateRef.current.current
        if (cur) {
          setCurrent({ ...cur })
        }
        if (el) {
          setPlaying(!el.paused)
          setProgress(el.currentTime)
          setDuration(el.duration || 0)
          if (stateRef.current.playing && el.paused && !el.ended && el.src) {
            el.play().catch(() => {})
          }
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const next = useCallback(() => {
    _advance(1)
  }, [_advance])

  const prev = useCallback(() => {
    const el = audioRef.current
    if (el && el.currentTime > 4) {
      el.currentTime = 0
      return
    }
    _advance(-1)
  }, [_advance])

  const seek = useCallback((t) => {
    if (audioRef.current) audioRef.current.currentTime = t
    setProgress(t)
  }, [])

  const setVol = useCallback((v) => {
    setVolume(v)
    localStorage.setItem('sangeet.vol', String(v))
  }, [])

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => {
      const nextR = r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'
      stateRef.current.repeat = nextR
      return nextR
    })
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const nextS = !s
      stateRef.current.shuffle = nextS
      return nextS
    })
  }, [])

  // Sync with native OS MediaSession (Lock screen, notifications, car Bluetooth, earbuds)
  useEffect(() => {
    const track = current?.track
    if (!track || !('mediaSession' in navigator)) return

    try {
      updateMediaSession(track, playing)

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
        if (audioRef.current) seek(Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + offset))
      })
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10
        if (audioRef.current) seek(Math.max(0, audioRef.current.currentTime - offset))
      })
    } catch (e) {
      console.warn('MediaSession initialization:', e)
    }
  }, [current?.track, playing, next, prev, seek, updateMediaSession])

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
