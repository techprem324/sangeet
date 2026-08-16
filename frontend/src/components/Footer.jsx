import { LogoMark, Wordmark } from './Logo'

export default function Footer({ onView, onOpenAuth }) {
  return (
    <footer className="mt-16 border-t border-edge-soft/60 bg-coal/40 px-6 py-12 text-sand-dim sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark size={32} />
              <Wordmark />
            </div>
            <p className="mt-3.5 max-w-sm text-xs leading-relaxed text-sand-dim/80">
              Tell Sangeet how you feel in plain words. Powered by hybrid mood-reading NLP and direct 320kbps audio streaming — dil se zuba tak.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface/50 px-3 py-1 text-[11px] font-medium text-cream">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> 320kbps Stream Active
              </span>
            </div>
          </div>

          {/* Features Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream">Features</h4>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li><button onClick={() => onView('chat')} className="hover:text-cream transition-colors">Mood NLP Chat</button></li>
              <li><button onClick={() => onView('browse')} className="hover:text-cream transition-colors">10 Mood Rooms</button></li>
              <li><button onClick={() => onView('search')} className="hover:text-cream transition-colors">Song & Artist Search</button></li>
              <li><span className="text-sand-dim/60">Karaoke Synced Lyrics</span></li>
              <li><span className="text-sand-dim/60">Explainable AI</span></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream">Library</h4>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li><button onClick={() => onView('playlists')} className="hover:text-cream transition-colors">My Playlists</button></li>
              <li><button onClick={() => onView('liked')} className="hover:text-cream transition-colors">Your Songs</button></li>
              <li><button onClick={() => onView('chat')} className="hover:text-cream transition-colors">Chat History</button></li>
              <li><button onClick={onOpenAuth} className="hover:text-cream transition-colors text-ember font-medium">Sign In / Account</button></li>
            </ul>
          </div>

          {/* Socials / Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream">Sangeet</h4>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li><a href="#about" onClick={(e) => { e.preventDefault(); onView('home') }} className="hover:text-cream transition-colors">About Sangeet</a></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); onView('home') }} className="hover:text-cream transition-colors">Privacy & Safety</a></li>
              <li><a href="#terms" onClick={(e) => { e.preventDefault(); onView('home') }} className="hover:text-cream transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-edge-soft/40 pt-6 text-[11px] sm:flex-row">
          <div className="flex flex-wrap gap-4 text-sand-dim/70">
            <span>Legal</span>
            <span>Safety & Privacy</span>
            <span>Privacy Policy</span>
            <span>Cookies</span>
          </div>
          <div className="text-sand-dim/70">
            © 2026 Sangeet • <span className="italic text-sand-dim">dil se zuba tak</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
