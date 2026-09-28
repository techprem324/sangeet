import { useEffect, useState } from 'react'
import { useAudio } from '../store/audio'
import { api } from '../api'
import {
  PauseIcon, PlayIcon, NextIcon, PrevIcon, QueueIcon, LyricsIcon, MusicIcon,
  VolumeIcon, XIcon, RepeatIcon, RepeatOneIcon, ShuffleIcon, ChevronDownIcon,
  HeartIcon, HeartFilledIcon,
} from './icons'

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`
}

const DEFAULT_COVER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#2c231c"/><circle cx="80" cy="84" r="34" fill="none" stroke="#e09a4e" strokeWidth="6"/><circle cx="80" cy="84" r="13" fill="#e09a4e"/></svg>'
  )

// A little vinyl record: cover art as the label, grooves around it.
// It rotates slowly while a song plays — the tiny "this is playing" joy.
function Vinyl({ cover, playing }) {
  const art = cover || DEFAULT_COVER
  return (
    <div className="relative h-12 w-12 shrink-0 select-none">
      <svg viewBox="0 0 48 48" className={`h-full w-full ${playing ? 'animate-spin-slow' : ''}`}>
        <circle cx="24" cy="24" r="23" fill="#171310" />
        {[17, 19, 21].map((r) => (
          <circle key={r} cx="24" cy="24" r={r} fill="none" stroke="#3a2f26" strokeWidth="0.6" />
        ))}
        <circle cx="24" cy="24" r="22" fill="none" stroke="#241d17" strokeWidth="1.5" />
      </svg>
      <div className="absolute inset-[5px] overflow-hidden rounded-full">
        <img
          src={art}
          alt=""
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_COVER) {
              e.currentTarget.src = DEFAULT_COVER
            }
          }}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="h-[7px] w-[7px] rounded-full bg-coal ring-1 ring-edge" />
      </div>
    </div>
  )
}

function QueuePanel({ queue, current, onClose }) {
  const audio = useAudio()
  return (
    <div className="absolute bottom-full right-2 mb-3 w-[calc(100vw-1rem)] sm:w-80 max-w-sm rounded-xl2 border border-edge bg-coal p-3 shadow-soft z-50">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-sand-dim">Up next · {queue.length}</span>
        <button onClick={onClose} className="icon-btn h-6 w-6"><XIcon size={14} /></button>
      </div>
      <div className="max-h-56 space-y-1 overflow-y-auto">
        {queue.map((t, i) => {
          const active = current?.index === i
          return (
            <button
              key={t.id || i}
              onClick={() => audio.playTrack(t, queue)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${active ? 'bg-ember/10 text-cream' : 'text-sand hover:bg-surface-2'}`}
            >
              {active ? <PauseIcon size={12} className="text-ember" /> : <span className="w-3 text-sand-dim">{i + 1}</span>}
              <span className="min-w-0 flex-1 truncate">{t.title}</span>
              <span className="shrink-0 text-sand-dim">{t.artist}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function MiniPlayer({ onLyrics, onLikedChange }) {
  const audio = useAudio()
  const [showQueue, setShowQueue] = useState(false)
  const [hover, setHover] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const { current, playing, progress, duration, volume, repeat, shuffle,
          toggle, next, prev, seek, setVol, cycleRepeat, toggleShuffle, error } = audio
  const track = current?.track
  const pct = duration ? Math.min(100, (progress / duration) * 100) : 0
  const onSeek = (e) => seek(Number(e.target.value))

  const cover = track ? audio.fallbackCover(track) : ''

  useEffect(() => {
    if (!track) return
    let alive = true
    api.liked()
      .then((data) => {
        if (!alive) return
        const ids = new Set((data?.liked || []).map((l) => l.track_id || l.id || l.title))
        setIsLiked(ids.has(track.id || track.title) || (track.track_id && ids.has(track.track_id)))
      })
      .catch(() => alive && setIsLiked(false))
    return () => { alive = false }
  }, [track?.id, track?.title, track?.track_id])

  const toggleLiked = async (e) => {
    e.stopPropagation()
    if (!track) return
    try {
      if (isLiked) {
        await api.unlike(track.id || track.title)
        setIsLiked(false)
      } else {
        await api.like(track)
        setIsLiked(true)
      }
      if (onLikedChange) onLikedChange()
    } catch {}
  }

  useEffect(() => {
    if (!track) return
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') { e.preventDefault(); toggle() }
      if (e.code === 'ArrowRight') seek(Math.min(duration, progress + 10))
      if (e.code === 'ArrowLeft') seek(Math.max(0, progress - 10))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [track, toggle, seek, duration, progress])

  if (!track) return null

  const repeatTitle = repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat off'

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP PLAYER (100% UNTOUCHED ORIGINAL LAYOUT ON LG SCREENS)           */}
      {/* ========================================================================= */}
      <div className="hidden lg:block relative border-t border-edge-soft bg-coal/90 backdrop-blur">
        {error && (
          <div className="mx-4 mt-2 rounded-lg border border-terra/40 bg-terra/10 px-3 py-1.5 text-xs text-rose">
            {error} <button onClick={() => audio.setError(null)} className="underline">dismiss</button>
          </div>
        )}
        {showQueue && current?.queue?.length > 0 && (
          <QueuePanel queue={current.queue} current={current} onClose={() => setShowQueue(false)} />
        )}

        <div className="flex items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
          <Vinyl cover={track.cover} playing={playing} />

          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-cream sm:text-sm">{track.title}</div>
            <div className="truncate text-[11px] text-sand-dim sm:text-xs">{track.artist}</div>
          </div>

          {/* controls — always visible */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button onClick={prev} title="Previous" className="icon-btn h-8 w-8 sm:h-9 sm:w-9"><PrevIcon size={16} /></button>
            <button
              onClick={toggle}
              className="mx-0.5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-ember text-ink shadow-glow transition-transform hover:scale-105 active:scale-95"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
            </button>
            <button onClick={next} title="Next" className="icon-btn h-8 w-8 sm:h-9 sm:w-9"><NextIcon size={16} /></button>
          </div>

          {/* seek */}
          <div className="hidden w-36 items-center gap-2 md:flex lg:w-60" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <span className="w-9 text-right text-[11px] tabular-nums text-sand-dim">{fmt(progress)}</span>
            <input
              type="range" min={0} max={duration || 0} step={1}
              value={Math.min(progress, duration || 0)}
              onChange={onSeek}
              className="warm-range w-full"
              style={{ '--pct': `${hover ? (progress / duration) * 100 : pct}%` }}
            />
            <span className="w-9 text-[11px] tabular-nums text-sand-dim">{fmt(duration)}</span>
          </div>

          {/* repeat + shuffle + volume */}
          <div className="hidden items-center gap-0.5 sm:flex">
            <button
              onClick={toggleShuffle}
              title={shuffle ? 'Shuffle on' : 'Shuffle off'}
              className={`icon-btn h-8 w-8 ${shuffle ? 'text-ember' : ''}`}
            >
              <ShuffleIcon size={15} />
            </button>
            <button
              onClick={cycleRepeat}
              title={repeatTitle}
              className={`icon-btn h-8 w-8 ${repeat !== 'off' ? 'text-ember' : ''}`}
            >
              {repeat === 'one' ? <RepeatOneIcon size={15} /> : <RepeatIcon size={15} />}
            </button>
            <button onClick={() => setVol(volume > 0 ? 0 : 0.8)} title="Mute" className="icon-btn h-8 w-8">
              <VolumeIcon size={16} />
            </button>
            <input
              type="range" min={0} max={1} step={0.01} value={volume}
              onChange={(e) => setVol(Number(e.target.value))}
              className="warm-range hidden w-20 xl:block"
              style={{ '--pct': `${volume * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-0.5">
            <button onClick={() => onLyrics(track)} title="Lyrics" className="icon-btn h-8 w-8"><LyricsIcon size={16} /></button>
            <button onClick={() => setShowQueue((s) => !s)} title="Queue" className={`icon-btn h-8 w-8 ${showQueue ? 'text-ember' : ''}`}>
              <QueueIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE AUDIO PLAYER ADAPTATION (DOCKED ABOVE BOTTOM NAV ON MOBILE)      */}
      {/* ========================================================================= */}
      <div className="lg:hidden">
        {/* State A: Compact Floating Mini-Player (Tappable to expand) */}
        {!expanded && (
          <div
            className="fixed left-2 right-2 bottom-[60px] z-40 rounded-xl border border-edge/80 bg-coal/95 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-200"
            role="region"
            aria-label="Mini Audio Player"
          >
            {/* Slim top progress scrub bar */}
            <div
              className="relative h-1 w-full bg-edge-soft/60 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                const rect = e.currentTarget.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const newPct = Math.max(0, Math.min(1, clickX / rect.width))
                seek(newPct * (duration || 0))
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-ember to-amber-300 transition-all duration-100"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2">
              {/* Tap left area to expand */}
              <div
                onClick={() => setExpanded(true)}
                className="flex min-w-0 flex-1 items-center gap-2.5 cursor-pointer select-none"
                role="button"
                tabIndex={0}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-edge/50 bg-surface-3">
                  <img
                    src={cover || DEFAULT_COVER}
                    alt=""
                    onError={(e) => {
                      if (e.currentTarget.src !== DEFAULT_COVER) {
                        e.currentTarget.src = DEFAULT_COVER
                      }
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-cream">{track.title}</div>
                  <div className="truncate text-[10px] text-sand-dim">{track.artist}</div>
                </div>
              </div>

              {/* Quick Compact Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={toggleLiked}
                  className={`icon-btn h-8 w-8 ${isLiked ? 'text-rose' : 'text-sand-dim'}`}
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  {isLiked ? <HeartFilledIcon size={16} /> : <HeartIcon size={16} />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggle()
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ember text-ink shadow-glow transition-transform active:scale-95"
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  {playing ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  className="icon-btn h-8 w-8 text-sand hover:text-cream"
                  title="Next track"
                >
                  <NextIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State B: Fullscreen Expanded Player (All controls vertically stacked) */}
        {expanded && (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-2xl px-5 pb-8 pt-safe overflow-y-auto animate-fade-in text-cream select-none"
            role="dialog"
            aria-modal="true"
            aria-label="Expanded Audio Player"
          >
            {/* Top Bar with Collapse & Queue */}
            <div className="flex items-center justify-between pb-3 pt-3">
              <button
                onClick={() => setExpanded(false)}
                className="icon-btn h-10 w-10 text-sand-dim hover:text-cream"
                aria-label="Collapse player"
              >
                <ChevronDownIcon size={24} />
              </button>

              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest font-semibold text-sand-dim">Playing from Sangeet</div>
                <div className="text-xs font-medium text-ember truncate max-w-[190px]">{track.album || '320kbps Lossless'}</div>
              </div>

              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`icon-btn h-10 w-10 ${showQueue ? 'text-ember' : 'text-sand-dim hover:text-cream'}`}
                aria-label="Toggle queue"
              >
                <QueueIcon size={20} />
              </button>
            </div>

            {/* Large Responsive Artwork */}
            <div className="flex-1 flex items-center justify-center py-4 min-h-[220px]">
              <div className="relative w-64 h-64 max-w-[70vw] max-h-[70vw] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-edge/60">
                <img
                  src={cover || DEFAULT_COVER}
                  alt=""
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_COVER) {
                      e.currentTarget.src = DEFAULT_COVER
                    }
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Track Info & Like */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-cream truncate">{track.title}</h2>
                <p className="text-xs text-sand-dim truncate mt-0.5">{track.artist}</p>
              </div>
              <button
                onClick={toggleLiked}
                className={`icon-btn h-10 w-10 shrink-0 ${isLiked ? 'text-rose' : 'text-sand-dim hover:text-rose'}`}
              >
                {isLiked ? <HeartFilledIcon size={22} /> : <HeartIcon size={22} />}
              </button>
            </div>

            {/* Draggable Timeline Slider */}
            <div className="pt-4">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={1}
                value={Math.min(progress, duration || 0)}
                onChange={onSeek}
                className="warm-range w-full cursor-pointer h-2"
                style={{ '--pct': `${pct}%` }}
              />
              <div className="flex justify-between text-[11px] tabular-nums text-sand-dim mt-1.5 font-medium">
                <span>{fmt(progress)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            {/* Primary Controls Row */}
            <div className="flex items-center justify-between px-2 pt-4">
              <button
                onClick={toggleShuffle}
                className={`icon-btn h-10 w-10 ${shuffle ? 'text-ember' : 'text-sand-dim'}`}
                title={shuffle ? 'Shuffle on' : 'Shuffle off'}
              >
                <ShuffleIcon size={18} />
              </button>

              <button
                onClick={prev}
                className="icon-btn h-12 w-12 text-sand hover:text-cream"
                title="Previous"
              >
                <PrevIcon size={24} />
              </button>

              <button
                onClick={toggle}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-ember text-ink shadow-glow text-2xl transition-transform active:scale-95"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
              </button>

              <button
                onClick={next}
                className="icon-btn h-12 w-12 text-sand hover:text-cream"
                title="Next"
              >
                <NextIcon size={24} />
              </button>

              <button
                onClick={cycleRepeat}
                className={`icon-btn h-10 w-10 ${repeat !== 'off' ? 'text-ember' : 'text-sand-dim'}`}
                title={repeatTitle}
              >
                {repeat === 'one' ? <RepeatOneIcon size={18} /> : <RepeatIcon size={18} />}
              </button>
            </div>

            {/* Secondary Utility Controls: Lyrics, Volume, Queue */}
            <div className="flex items-center justify-between gap-3 pt-5 border-t border-edge-soft/60 mt-4">
              <button
                onClick={() => {
                  onLyrics(track)
                  setExpanded(false)
                }}
                className="flex items-center gap-1.5 rounded-full border border-edge/80 bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-cream hover:border-ember/40 transition-colors"
              >
                <LyricsIcon size={15} />
                <span>Lyrics</span>
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                <button
                  onClick={() => setVol(volume > 0 ? 0 : 0.8)}
                  className="icon-btn h-8 w-8 text-sand-dim hover:text-cream shrink-0"
                >
                  <VolumeIcon size={16} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVol(Number(e.target.value))}
                  className="warm-range w-full"
                  style={{ '--pct': `${volume * 100}%` }}
                />
              </div>
            </div>

            {/* Queue Panel overlay inside expanded view */}
            {showQueue && current?.queue?.length > 0 && (
              <div className="mt-4 rounded-xl2 border border-edge bg-coal/95 p-3 shadow-soft max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-edge-soft">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sand-dim">Up Next ({current.queue.length})</span>
                  <button onClick={() => setShowQueue(false)} className="icon-btn h-6 w-6"><XIcon size={14} /></button>
                </div>
                <div className="space-y-1">
                  {current.queue.map((t, i) => {
                    const active = current?.index === i
                    return (
                      <button
                        key={t.id || i}
                        onClick={() => audio.playTrack(t, current.queue)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                          active ? 'bg-ember/15 text-cream font-semibold' : 'text-sand hover:bg-surface-2'
                        }`}
                      >
                        {active ? <PauseIcon size={12} className="text-ember" /> : <span className="w-4 text-sand-dim text-[11px]">{i + 1}</span>}
                        <span className="min-w-0 flex-1 truncate">{t.title}</span>
                        <span className="shrink-0 text-[11px] text-sand-dim">{t.artist}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
