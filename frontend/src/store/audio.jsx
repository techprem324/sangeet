import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

// One <audio> element for the whole app — like a real player. The queue,
// repeat modes and shuffle live here so any view can start playback and
// the mini-player always reflects it. Internal state is mirrored into
// refs so the single event listener never reads stale closures.

const AudioContext = createContext(null)

const fallbackCover = (track) =>
  track?.cover ||
  'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#2c231c"/><circle cx="80" cy="84" r="34" fill="none" stroke="#e09a4e" strokeWidth="6"/><circle cx="80" cy="84" r="13" fill="#e09a4e"/></svg>`
    )

const trackKey = (t) => t?.id || `${t?.title || ''}|${t?.artist || ''}`

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
  const stateRef = useRef({ current: null, repeat: 'off', shuffle: false })
  stateRef.current = { current, repeat, shuffle }

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const el = new Audio()
      el.preload = 'metadata'
      el.addEventListener('timeupdate', () => setProgress(el.currentTime))
      el.addEventListener('loadedmetadata', () => setDuration(el.duration || 0))
      el.addEventListener('durationchange', () => setDuration(el.duration || 0))
      el.addEventListener('play', () => setPlaying(true))
      el.addEventListener('pause', () => setPlaying(false))
      el.addEventListener('error', () => {
        setError('This track could not be streamed right now.')
        setPlaying(false)
      })
      el.addEventListener('ended', () => {
        const st = stateRef.current
        const cur = st.current
        if (!cur) return
        if (st.repeat === 'one') {
          el.currentTime = 0
          el.play().catch(() => {})
          return
        }
        const q = cur.queue || []
        if (!q.length) return
        let nextIdx = cur.index + 1
        if (nextIdx >= q.length) {
          if (st.repeat === 'all') nextIdx = 0
          else {
            setPlaying(false)
            setProgress(0)
            return
          }
        }
        if (st.shuffle) nextIdx = Math.floor(Math.random() * q.length)
        const nextTrack = q[nextIdx]
        setCurrent({ track: nextTrack, queue: q, index: nextIdx })
        el.src = nextTrack.stream_url
        el.play().catch(() => {})
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
      const q = queue || (current?.queue?.some((t) => trackKey(t) === trackKey(track)) ? current.queue : [track])
      const index = q.findIndex((t) => trackKey(t) === trackKey(track))
      const el = ensureAudio()
      setError(null)

      let activeTrack = track
      if (!activeTrack.stream_url) {
        try {
          const searchRes = await api.search(`${activeTrack.title} ${activeTrack.artist || ''}`)
          if (searchRes && searchRes[0] && searchRes[0].stream_url) {
            activeTrack = { ...activeTrack, stream_url: searchRes[0].stream_url }
          }
        } catch { /* ignore */ }
      }

      setCurrent({ track: activeTrack, queue: q, index: index >= 0 ? index : 0 })
      if (activeTrack.stream_url && el.src !== activeTrack.stream_url) {
        el.src = activeTrack.stream_url
        el.load()
      }
      if (activeTrack.stream_url) {
        el.play()
          .then(() => setPlaying(true))
          .catch((err) => {
            if (err.name === 'NotAllowedError') {
              setError('Playback paused by browser — tap play button.')
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
      const q = queue || []
      if (!q.length) return
      if (st.shuffle) {
        const nextIdx = Math.floor(Math.random() * q.length)
        const t = q[nextIdx]
        playTrack(t, q)
        return
      }
      let nextIdx = index + dir
      if (nextIdx < 0) nextIdx = q.length - 1
      if (nextIdx >= q.length) nextIdx = 0
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
    [current, playing, progress, duration, volume, repeat, shuffle, error,
     playTrack, toggle, next, prev, seek, setVol, cycleRepeat, toggleShuffle]
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudio() {
  return useContext(AudioContext)
}
