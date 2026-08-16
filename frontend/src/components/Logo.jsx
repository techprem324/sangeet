// The Sangeet mark — a hand-drawn double eighth-note rising like sound
// waves, warm ember on espresso. No third-party branding anywhere.

export function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Sangeet logo">
      <rect width="64" height="64" rx="16" fill="#2c231c" />
      <circle cx="32" cy="32" r="21" fill="none" stroke="#3d3228" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="17.5" fill="none" stroke="#e09a4e" strokeWidth="1" opacity="0.5" />
      {/* double eighth note */}
      <path d="M29.5 16 L43 20 L43 27 L29.5 23 Z" fill="#e09a4e" />
      <rect x="29.4" y="20" width="2.6" height="25" rx="1.3" fill="#e09a4e" />
      <rect x="41.2" y="23.5" width="2.6" height="21.5" rx="1.3" fill="#e09a4e" />
      <circle cx="24.6" cy="45.5" r="5.6" fill="#e09a4e" />
      <circle cx="36.4" cy="45.5" r="5.6" fill="#e09a4e" />
      {/* sparkle accent */}
      <path d="M50 14 l1.1 3.2 3.2 1.1 -3.2 1.1 -1.1 3.2 -1.1 -3.2 -3.2 -1.1 3.2 -1.1 Z" fill="#d97742" />
    </svg>
  )
}

export function Wordmark({ size = 'lg' }) {
  return (
    <div>
      <div className={`font-display leading-none text-cream ${size === 'lg' ? 'text-xl' : 'text-lg'}`}>
        Sangeet
      </div>
      <div className="mt-0.5 text-[11px] tracking-[0.12em] lowercase text-ember/90 font-medium italic">
        dil se zuba tak
      </div>
    </div>
  )
}
