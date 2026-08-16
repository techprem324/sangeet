/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // warm "listening room" palette — no neon
        ink: '#171310',
        coal: '#1d1813',
        surface: '#241d17',
        'surface-2': '#2c231c',
        'surface-3': '#362b22',
        edge: '#3d3228',
        'edge-soft': '#2e251e',
        cream: '#f2e8d8',
        sand: '#cbb9a3',
        'sand-dim': '#9c8b76',
        ember: '#e09a4e',
        'ember-deep': '#c97f3a',
        terra: '#d97742',
        sage: '#a3b189',
        rose: '#d98b7a',
        plum: '#a88bb8',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(0,0,0,0.55)',
        card: '0 4px 24px -8px rgba(0,0,0,0.5)',
        glow: '0 0 0 1px rgba(224,154,78,0.35), 0 8px 30px -8px rgba(224,154,78,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'eq-1': { '0%,100%': { height: '30%' }, '50%': { height: '95%' } },
        'eq-2': { '0%,100%': { height: '75%' }, '50%': { height: '25%' } },
        'eq-3': { '0%,100%': { height: '50%' }, '50%': { height: '90%' } },
        'spin-slow': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'eq-1': 'eq-1 0.9s ease-in-out infinite',
        'eq-2': 'eq-2 1.1s ease-in-out infinite',
        'eq-3': 'eq-3 0.8s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
