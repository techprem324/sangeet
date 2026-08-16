import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { MOOD_PILLS } from '../data/moods'
import MessageBubble from './MessageBubble'
import MoodRadar from './MoodRadar'
import HeroArt from './HeroArt'
import { SendIcon } from './icons'

const STATUS_STEPS = ['reading your mood…', 'mapping valence & energy…', 'asking the brain for matches…', 'unlocking 320kbps streams…']

function Welcome({ onPill }) {
  return (
    <div className="mx-auto max-w-xl px-4 pt-6 text-center">
      <HeroArt className="mx-auto mb-4 w-full max-w-sm" />
      <h1 className="font-display text-4xl font-medium leading-tight text-cream">
        Tell me how you feel.
        <br />
        <span className="italic text-ember">Sangeet will find the song.</span>
      </h1>
      <p className="mx-auto mt-2 text-xs font-medium italic tracking-widest text-ember/90">
        — dil se zuba tak —
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-sand-dim">
        Type a sentence about your mood, situation or the time of night — Sangeet reads it, maps it to
        musical features, and plays a full track in 320 kbps. No premium, no login.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {MOOD_PILLS.map((p) => (
          <button key={p.key} onClick={() => onPill(p)} className="chip">
            {p.emoji} {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TypingIndicator({ step }) {
  return (
    <div className="msg-in flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-ember/10 text-base">
        🎧
      </div>
      <div className="panel flex items-center gap-3 px-4 py-3">
        <span className="flex items-center gap-1">
          <span className="typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="typing-dot" style={{ animationDelay: '150ms' }} />
          <span className="typing-dot" style={{ animationDelay: '300ms' }} />
        </span>
        <span className="text-xs text-sand-dim">{STATUS_STEPS[step % STATUS_STEPS.length]}</span>
      </div>
    </div>
  )
}

function LiveMoodPreview({ mood, visible }) {
  if (!visible || !mood) return null
  return (
    <div className="msg-in panel mx-auto mb-1 flex w-full max-w-xl items-center justify-between gap-3 px-4 py-2.5">
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-sand-dim">live mood read</div>
        <div className="truncate text-sm font-medium text-cream">
          {mood.emoji} {mood.mood_label}
        </div>
      </div>
      <div className="shrink-0 scale-[0.55] origin-right">
        <MoodRadar mood={mood} />
      </div>
    </div>
  )
}

export default function ChatView({ messages, busy, onSend, onLyrics, onPill }) {
  const [draft, setDraft] = useState('')
  const [liveMood, setLiveMood] = useState(null)
  const [showLive, setShowLive] = useState(false)
  const [step, setStep] = useState(0)
  const scrollRef = useRef(null)
  const timerRef = useRef(null)

  // typing status rotation while the backend works
  useEffect(() => {
    if (!busy) return
    const t = setInterval(() => setStep((s) => s + 1), 900)
    return () => clearInterval(t)
  }, [busy])

  // keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, busy])

  // debounced live mood analysis while typing
  useEffect(() => {
    const text = draft.trim()
    if (text.length < 4) {
      setShowLive(false)
      return
    }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const mood = await api.analyze(text)
        setLiveMood(mood)
        setShowLive(true)
      } catch {
        setShowLive(false)
      }
    }, 500)
    return () => clearTimeout(timerRef.current)
  }, [draft])

  const submit = () => {
    const text = draft.trim()
    if (!text || busy) return
    onSend(text)
    setDraft('')
    setShowLive(false)
    setLiveMood(null)
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6 pt-2 sm:px-8">
        {messages.length === 0 && !busy ? (
          <Welcome onPill={onPill} />
        ) : (
          <div className="mx-auto max-w-2xl space-y-7">
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="msg-in flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md border border-ember/25 bg-ember/[0.08] px-4 py-2.5 text-[15px] text-cream">
                    {m.text}
                  </div>
                </div>
              ) : (
                <MessageBubble key={i} msg={m} onLyrics={onLyrics} index={i} />
              )
            )}
            {busy && <TypingIndicator step={step} />}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="border-t border-edge-soft bg-coal/70 px-4 pb-3 pt-2 backdrop-blur sm:px-8">
        <LiveMoodPreview mood={liveMood} visible={showLive} />
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <div className="flex flex-1 items-center rounded-xl2 border border-edge bg-surface px-4 py-2.5 transition-colors focus-within:border-ember/50">
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder="Describe your mood — e.g. “heartbroken and it’s raining at 2am”…"
              className="input-plain max-h-28 min-h-[24px] resize-none text-[15px] leading-relaxed"
            />
          </div>
          <button
            onClick={submit}
            disabled={!draft.trim() || busy}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl2 bg-ember text-ink shadow-glow transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:shadow-none"
            aria-label="Send"
          >
            <SendIcon size={18} />
          </button>
        </div>
        <div className="mx-auto mt-1.5 max-w-2xl text-center text-[10px] text-sand-dim/60">
          space = play/pause · ←/→ = seek · the mood radar reads your words live
        </div>
      </div>
    </div>
  )
}
