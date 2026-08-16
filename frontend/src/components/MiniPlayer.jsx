import { useEffect, useState } from 'react'
import { useAudio } from '../store/audio'
import {
  PauseIcon, PlayIcon, NextIcon, PrevIcon, QueueIcon, LyricsIcon, MusicIcon,
  VolumeIcon, XIcon, RepeatIcon, RepeatOneIcon, ShuffleIcon,
} from './icons'

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`
}

// A little vinyl record: cover art as the label, grooves around it.
// It rotates slowly while a song plays — the tiny "this is playing" joy.
function Vinyl({ cover, playing }) {
  const art = cover
    ? cover
    : 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#2c231c"/><circle cx="80" cy="84" r="34" fill="none" stroke="#e09a4e" strokeWidth="6"/><circle cx="80" cy="84" r="13" fill="#e09a4e"/></svg>'
      )
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
        <img src={art} alt="" className="h-full w-full object-cover" />
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
    <div className="absolute bottom-full right-2 mb-3 w-80 rounded-xl2 border border-edge bg-coal p-3 shadow-soft">
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

export default function MiniPlayer({ onLyrics }) {
  const audio = useAudio()
  const [showQueue, setShowQueue] = useState(false)
  const [hover, setHover] = useState(false)

  const { current, playing, progress, duration, volume, repeat, shuffle,
          toggle, next, prev, seek, setVol, cycleRepeat, toggleShuffle, error } = audio
  const track = current?.track
  const pct = duration ? Math.min(100, (progress / duration) * 100) : 0
  const onSeek = (e) => seek(Number(e.target.value))

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
    <div className="relative border-t border-edge-soft bg-coal/90 backdrop-blur">
      {error && (
        <div className="mx-4 mt-2 rounded-lg border border-terra/40 bg-terra/10 px-3 py-1.5 text-xs text-rose">
          {error} <button onClick={() => audio.setError(null)} className="underline">dismiss</button>
        </div>
      )}
      {showQueue && current?.queue?.length > 0 && (
        <QueuePanel queue={current.queue} current={current} onClose={() => setShowQueue(false)} />
      )}

      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <Vinyl cover={track.cover} playing={playing} />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-cream">{track.title}</div>
          <div className="truncate text-xs text-sand-dim">{track.artist}</div>
        </div>

        {/* controls — always visible */}
        <div className="flex items-center gap-1">
          <button onClick={prev} title="Previous" className="icon-btn h-9 w-9"><PrevIcon size={18} /></button>
          <button
            onClick={toggle}
            className="mx-1 flex h-10 w-10 items-center justify-center rounded-full bg-ember text-ink shadow-glow transition-transform hover:scale-105 active:scale-95"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
          <button onClick={next} title="Next" className="icon-btn h-9 w-9"><NextIcon size={18} /></button>
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
  )
}
