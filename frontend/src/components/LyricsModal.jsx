import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { useAudio } from '../store/audio'
import { XIcon, MusicIcon } from './icons'

// Karaoke-style lyrics: when the backend returns timed lines (from lrclib),
// the active line is highlighted and auto-scrolled into view as the song
// plays — just like Spotify. Falls back to a static scrollable text.

export default function LyricsModal({ track, onClose }) {
  const audio = useAudio()
  const [data, setData] = useState(null) // {synced, lines, text}
  const [loading, setLoading] = useState(true)
  const activeRef = useRef(null)
  const scrollRef = useRef(null)
  const progress = audio.progress

  useEffect(() => {
    let alive = true
    setLoading(true)
    setData(null)
    api.lyrics(track)
      .then((d) => { if (alive) setData(d) })
      .catch(() => alive && setData({ synced: false, lines: [], text: '' }))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [track?.id, track?.title])

  const synced = data?.synced && (data?.lines?.length || 0) > 0
  const lines = data?.lines || []

  // current line index from playback progress
  const activeIdx = useMemo(() => {
    if (!synced) return -1
    let idx = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].t <= progress + 0.05) idx = i
      else break
    }
    return idx
  }, [synced, lines, progress])

  // keep the active line centered-ish
  useEffect(() => {
    if (synced && activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [activeIdx, synced])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="panel relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden !bg-coal">
        <div className="flex items-center justify-between border-b border-edge-soft px-5 py-3.5">
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-medium text-cream">{track?.title}</div>
            <div className="truncate text-xs text-sand-dim">{track?.artist} {synced && '· synced'}</div>
          </div>
          <button onClick={onClose} className="icon-btn h-9 w-9"><XIcon size={18} /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3.5 rounded cover-loading" style={{ width: `${60 + ((i * 37) % 35)}%` }} />
              ))}
            </div>
          ) : synced ? (
            <div className="space-y-3.5 py-2">
              {lines.map((ln, i) => {
                const active = i === activeIdx
                const past = i < activeIdx
                return (
                  <p
                    key={i}
                    ref={active ? activeRef : null}
                    className={`text-[16px] leading-7 transition-all duration-300 ${
                      active
                        ? 'scale-[1.02] font-semibold text-cream'
                        : past
                          ? 'text-sand-dim/50'
                          : 'text-sand-dim'
                    }`}
                  >
                    {active && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-ember align-middle" />}
                    {ln.text}
                  </p>
                )
              })}
            </div>
          ) : data?.text ? (
            <p className="whitespace-pre-line text-[15px] leading-7 text-sand">{data.text}</p>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <MusicIcon size={28} className="text-sand-dim" />
              <p className="text-sm text-sand-dim">Lyrics aren't available for this track right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
