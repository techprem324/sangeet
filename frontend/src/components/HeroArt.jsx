// A creative animated listening room with floating musical bubbles,
// spinning vinyl record, glowing moon, animated rain, and floating musical notes.

export default function HeroArt({ className = '' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Dynamic ambient glow aura behind illustration */}
      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-ember/25 via-sand-dim/15 to-ember/20 blur-3xl opacity-70 animate-pulse pointer-events-none" />

      <svg
        viewBox="0 0 340 220"
        className="relative z-10 w-full overflow-visible drop-shadow-xl"
        role="img"
        aria-label="Dynamic animated Sangeet music scene"
      >
        <defs>
          <style>{`
            @keyframes floatBubble1 {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-12px) rotate(6deg); }
            }
            @keyframes floatBubble2 {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-16px) scale(1.08); }
            }
            @keyframes floatBubble3 {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              50% { transform: translateY(-18px) translateX(8px); }
            }
            @keyframes floatBubble4 {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-10px) scale(0.95); }
            }
            @keyframes spinRecord {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes pulseMoon {
              0%, 100% { opacity: 0.85; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.06); }
            }
            @keyframes wavePulse {
              0%, 100% { transform: scale(0.92); opacity: 0.25; }
              50% { transform: scale(1.18); opacity: 0.75; }
            }
            @keyframes rainDrop {
              0% { transform: translateY(-4px); opacity: 0.2; }
              50% { opacity: 0.7; }
              100% { transform: translateY(16px); opacity: 0.15; }
            }
            @keyframes bubbleFloatHover {
              0% { transform: scale(1) translateY(0px) rotate(0deg); }
              25% { transform: scale(1.18) translateY(-8px) rotate(-6deg); }
              50% { transform: scale(1.25) translateY(-14px) rotate(6deg); }
              75% { transform: scale(1.18) translateY(-6px) rotate(-3deg); }
              100% { transform: scale(1.22) translateY(-12px) rotate(4deg); }
            }
            .b-anim-1 { animation: floatBubble1 4.8s ease-in-out infinite; }
            .b-anim-2 { animation: floatBubble2 4.2s ease-in-out infinite 0.7s; }
            .b-anim-3 { animation: floatBubble3 5.6s ease-in-out infinite 1.4s; }
            .b-anim-4 { animation: floatBubble4 4.5s ease-in-out infinite 2.1s; }
            .b-anim-5 { animation: floatBubble2 5.2s ease-in-out infinite 1.2s; }
            .vinyl-spin { transform-origin: 234px 128px; animation: spinRecord 10s linear infinite; }
            .moon-pulse { transform-origin: 265px 44px; animation: pulseMoon 4s ease-in-out infinite; }
            .wave-ring { transform-origin: 234px 128px; animation: wavePulse 3.2s ease-in-out infinite; }
            .rain-drop { animation: rainDrop 1.8s linear infinite; }

            .bubble-icon {
              cursor: pointer;
              transform-box: fill-box;
              transform-origin: center;
              transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
            }
            .bubble-icon:hover {
              animation: bubbleFloatHover 1.2s ease-in-out infinite alternate !important;
              filter: drop-shadow(0 0 12px rgba(224, 154, 78, 0.85)) brightness(1.25);
            }
          `}</style>

          <radialGradient id="bubbleGrad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e09a4e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2c231c" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="bubbleGrad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d97742" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#2c231c" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="bubbleGrad3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8aa8c9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#171310" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Floating Creative Musical Bubbles floating around screen */}
        <g className="b-anim-1 bubble-icon">
          <circle cx="42" cy="46" r="20" fill="url(#bubbleGrad3)" />
          <circle cx="42" cy="46" r="16" fill="none" stroke="#8aa8c9" strokeWidth="0.8" opacity="0.5" strokeDasharray="3 3" />
          <path d="M39 49 l2.5-5 2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 z" fill="#8aa8c9" opacity="0.9" />
        </g>

        <g className="b-anim-3 bubble-icon">
          <circle cx="304" cy="36" r="24" fill="url(#bubbleGrad1)" />
          <circle cx="304" cy="36" r="19" fill="none" stroke="#e09a4e" strokeWidth="1" opacity="0.6" />
          <text x="296" y="42" fill="#e09a4e" fontSize="16" fontWeight="bold">🎵</text>
        </g>

        <g className="b-anim-2 bubble-icon">
          <circle cx="162" cy="24" r="18" fill="url(#bubbleGrad2)" />
          <circle cx="162" cy="24" r="14" fill="none" stroke="#d97742" strokeWidth="0.8" opacity="0.7" />
          <text x="155" y="29" fill="#d97742" fontSize="13">🎶</text>
        </g>

        <g className="b-anim-4 bubble-icon">
          <circle cx="22" cy="144" r="22" fill="url(#bubbleGrad1)" />
          <circle cx="22" cy="144" r="17" fill="none" stroke="#e09a4e" strokeWidth="0.8" opacity="0.5" />
          <text x="15" y="150" fill="#e09a4e" fontSize="15">🎧</text>
        </g>

        <g className="b-anim-5 bubble-icon">
          <circle cx="318" cy="148" r="20" fill="url(#bubbleGrad2)" />
          <circle cx="318" cy="148" r="16" fill="none" stroke="#d97742" strokeWidth="0.9" opacity="0.6" />
          <path d="M315 150 l2-5 2 5 5 2-5 2-2 5-2-5-5-2 z" fill="#e09a4e" opacity="0.95" />
        </g>

        {/* Glowing Moon */}
        <g className="moon-pulse bubble-icon">
          <circle cx="265" cy="44" r="20" fill="#e09a4e" opacity="0.18" />
          <circle cx="265" cy="44" r="14" fill="#e9d8b8" opacity="0.95" />
          <circle cx="271" cy="40" r="11" fill="#171310" />
        </g>

        {/* Rainy Window Frame */}
        <rect x="24" y="24" width="150" height="110" rx="12" fill="#171310" stroke="#3d3228" strokeWidth="3" />
        <path d="M99 24v110M24 79h150" stroke="#3d3228" strokeWidth="2.5" />

        {/* Animated Rain Drops */}
        <g className="rain-drop">
          {[36, 54, 72, 90, 108, 126, 144].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1={32 + ((i * 7) % 30)}
              x2={x - 4}
              y2={46 + ((i * 7) % 30)}
              stroke="#8aa8c9"
              strokeOpacity="0.45"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
          {[44, 62, 80, 98, 116, 134].map((x, i) => (
            <line
              key={`b${x}`}
              x1={x}
              y1={58 + ((i * 9) % 36)}
              x2={x - 4}
              y2={72 + ((i * 9) % 36)}
              stroke="#8aa8c9"
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </g>
        <rect x="32" y="32" width="60" height="40" rx="6" fill="#8aa8c9" opacity="0.06" />

        {/* Listening Table */}
        <rect x="156" y="142" width="164" height="9" rx="4.5" fill="#2c231c" stroke="#3d3228" strokeWidth="1" />
        <rect x="170" y="151" width="9" height="32" rx="2" fill="#241d17" />
        <rect x="296" y="151" width="9" height="32" rx="2" fill="#241d17" />

        {/* Dynamic Soundwaves expanding around vinyl */}
        <circle cx="234" cy="128" r="32" fill="none" stroke="#e09a4e" strokeWidth="1" className="wave-ring" />
        <circle
          cx="234"
          cy="128"
          r="42"
          fill="none"
          stroke="#d97742"
          strokeWidth="0.7"
          className="wave-ring"
          style={{ animationDelay: '1.2s' }}
        />

        {/* Spinning Record Player */}
        <g className="vinyl-spin bubble-icon">
          <circle cx="234" cy="128" r="26" fill="#171310" stroke="#3d3228" strokeWidth="2.5" />
          <circle cx="234" cy="128" r="20" fill="none" stroke="#3a2f26" strokeWidth="0.8" />
          <circle cx="234" cy="128" r="14" fill="none" stroke="#3a2f26" strokeWidth="0.8" />
          <circle cx="234" cy="128" r="7.5" fill="#e09a4e" />
          <circle cx="234" cy="128" r="2.6" fill="#171310" />
        </g>
        {/* Tonearm */}
        <path d="M248 128 q 9 -22 -5 -30" fill="none" stroke="#cbb9a3" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="242" cy="98" r="3" fill="#cbb9a3" />

        {/* Bobbing Headphones */}
        <g className="b-anim-1 bubble-icon">
          <path d="M280 106 a 15 15 0 0 1 30 0" fill="none" stroke="#cbb9a3" strokeWidth="3.4" strokeLinecap="round" />
          <rect x="272" y="104" width="11" height="18" rx="5.5" fill="#d97742" stroke="#e09a4e" strokeWidth="0.8" />
          <rect x="307" y="104" width="11" height="18" rx="5.5" fill="#d97742" stroke="#e09a4e" strokeWidth="0.8" />
        </g>

        {/* Floating Musical Notes & Sparkle Stars */}
        <g className="b-anim-2 bubble-icon">
          <g fill="#e09a4e" opacity="0.9">
            <circle cx="196" cy="52" r="5" />
            <rect x="200" y="24" width="2.6" height="28" rx="1.3" />
            <path d="M200 24 q 11 -3 11 9 l -3 -1 q 1 -4 -6 -3 z" />
          </g>
        </g>
        <g className="b-anim-4 bubble-icon">
          <g fill="#d97742" opacity="0.85">
            <circle cx="224" cy="38" r="4.5" />
            <rect x="227.5" y="17" width="2.2" height="22" rx="1.1" />
            <path d="M227.5 17 q 9 -2 9 8 l -2.5 -1 q 1 -3 -4.5 -2.5 z" />
          </g>
        </g>
        <g className="b-anim-1 bubble-icon">
          <path d="M168 68 l1.4 3.8 3.8 1.4 -3.8 1.4 -1.4 3.8 -1.4 -3.8 -3.8 -1.4 3.8 -1.4 Z" fill="#e09a4e" />
        </g>
        <g className="b-anim-3 bubble-icon">
          <path d="M255 22 l1.1 3 3 1.1 -3 1.1 -1.1 3 -1.1 -3 -3 -1.1 3 -1.1 Z" fill="#8aa8c9" />
        </g>
      </svg>
    </div>
  )
}
