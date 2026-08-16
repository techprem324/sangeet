import { useState } from 'react'
import { moodColor } from '../data/moods'
import TrackCard from './TrackCard'
import MoodRadar from './MoodRadar'
import { SparkIcon, ChevronIcon } from './icons'

// One AI reply: empathy text + mood radar + a row of playable track cards
// + expandable "why these songs" reasoning.

export default function MessageBubble({ msg, onLyrics, index }) {
  const [showWhy, setShowWhy] = useState(false)
  const color = moodColor(msg.mood?.mood)
  const tracks = msg.tracks || []

  return (
    <div className="msg-in space-y-3">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-lg"
          style={{ borderColor: color.main + '55', background: color.main + '14' }}
        >
          {msg.mood?.emoji || '🎵'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: color.main }}>
              Sangeet
            </span>
            {msg.mood?.mood_label && (
              <span className="chip chip-active" style={{ borderColor: color.main + '66' }}>
                {msg.mood.emoji} {msg.mood.mood_label}
              </span>
            )}
            {msg.source === 'catalog' && (
              <span className="chip !border-edge">curated pick</span>
            )}
            {msg.source === 'spotify-brained' && (
              <span className="chip !border-edge">spotify-brained</span>
            )}
          </div>

          <p className="whitespace-pre-line text-[15px] leading-relaxed text-cream/95">{msg.reply}</p>

          {msg.mood && (
            <div className="mt-3 rounded-xl2 border border-edge-soft bg-coal/70 p-3.5">
              <MoodRadar mood={msg.mood} />
            </div>
          )}

          {/* why these songs */}
          {msg.why_this_song?.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowWhy((s) => !s)}
                className="flex items-center gap-1.5 text-xs font-medium text-sand-dim transition-colors hover:text-cream"
              >
                <SparkIcon size={13} />
                Why these songs?
                <ChevronIcon size={12} className={`transition-transform ${showWhy ? 'rotate-90' : ''}`} />
              </button>
              {showWhy && (
                <ul className="mt-2 space-y-1.5 rounded-xl2 border border-edge-soft bg-coal/60 p-3">
                  {msg.why_this_song.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-sand">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color.main }} />
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {tracks.length > 0 && (
        <div className="space-y-2 pl-12">
          {tracks.map((t, i) => (
            <TrackCard key={t.id || i} track={t} moodTag={msg.mood?.mood || ''} onLyrics={onLyrics} queue={tracks} />
          ))}
        </div>
      )}

      <div className="pl-12 text-[10px] text-sand-dim/60">
        message {index + 1} · full 320 kbps stream · no premium needed
      </div>
    </div>
  )
}
