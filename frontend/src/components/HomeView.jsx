import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { MOOD_PILLS } from '../data/moods'
import HeroArt from './HeroArt'
import MoodRadar from './MoodRadar'
import Footer from './Footer'
import { SendIcon } from './icons'

export default function HomeView({ onView, onSend, onPill, onOpenAuth, user }) {
  const [draft, setDraft] = useState('')
  const [liveMood, setLiveMood] = useState(null)
  const [showLive, setShowLive] = useState(false)
  const timerRef = useRef(null)

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
    }, 450)
    return () => clearTimeout(timerRef.current)
  }, [draft])

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
    setShowLive(false)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto pt-6">
      {/* Top Header Row with Account Badge (visible on desktop where mobile header is hidden) */}
      <div className="hidden lg:flex items-center justify-end px-6 sm:px-12">
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 rounded-full border border-edge bg-surface-2/70 px-3.5 py-1.5 text-xs font-medium text-cream transition-colors hover:border-ember/50 hover:bg-surface-2"
        >
          <span>{user ? '✨' : '👤'}</span>
          <span>{user ? user.name || user.username : 'Sign In / Register'}</span>
        </button>
      </div>

      <div className="mx-auto my-auto max-w-2xl text-center px-4 py-6 sm:px-8">
        {/* Dynamic Animated Creative Hero Artwork */}
        <HeroArt className="mx-auto mb-4 w-full max-w-xs sm:max-w-md" />

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-tight text-cream">
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

        {/* Live mood indicator preview */}
        {showLive && liveMood && (
          <div className="msg-in panel mx-auto mt-6 flex w-full max-w-lg items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-sand-dim">live mood read</div>
              <div className="truncate text-sm font-medium text-cream">
                {liveMood.emoji} {liveMood.mood_label}
              </div>
            </div>
            <div className="shrink-0 scale-[0.55] origin-right">
              <MoodRadar mood={liveMood} />
            </div>
          </div>
        )}

        {/* Interactive prompt input right on Home page */}
        <div className="mt-6 mx-auto flex max-w-xl items-end gap-2">
          <div className="flex flex-1 items-center rounded-xl2 border border-edge bg-surface px-4 py-2.5 shadow-card transition-colors focus-within:border-ember/60">
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
            disabled={!draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl2 bg-ember text-ink shadow-glow transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:shadow-none"
            aria-label="Send"
          >
            <SendIcon size={18} />
          </button>
        </div>

        {/* Quick Mood Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {MOOD_PILLS.map((p) => (
            <button key={p.key} onClick={() => onPill(p)} className="chip">
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customized Sangeet Footer */}
      <Footer onView={onView} onOpenAuth={onOpenAuth} />
    </div>
  )
}
