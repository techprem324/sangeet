import { VIEWS } from '../data/moods'
import { LogoMark, Wordmark } from './Logo'
import { PlaylistIcon } from './icons'

export default function Sidebar({ view, onView, onPill, user, onOpenAuth }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-edge-soft bg-coal/60 lg:flex">
      <button
        onClick={() => onView('home')}
        className="flex items-center gap-2.5 px-5 pb-4 pt-5 text-left transition-transform active:scale-98 focus:outline-none group"
        title="Sangeet Home"
      >
        <LogoMark size={36} />
        <Wordmark />
      </button>

      <nav className="px-3">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => onView(v.key)}
            className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              view === v.key ? 'bg-ember/12 font-semibold text-cream' : 'text-sand hover:bg-surface-2 hover:text-cream'
            }`}
          >
            {v.key === 'playlists' ? (
              <PlaylistIcon size={15} className="text-sand-dim" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            )}
            {v.label}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Replaced sidebar bottom section with User Account & Active Session Widget */}
      <div className="border-t border-edge-soft px-4 py-3">
        <button
          onClick={onOpenAuth}
          className="flex w-full items-center gap-2.5 rounded-xl border border-edge/60 bg-surface-2/40 p-2.5 text-left transition-colors hover:border-ember/40 hover:bg-surface-2"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember/15 text-xs font-bold text-ember border border-ember/30">
            {user ? (user.name || user.username || 'U')[0].toUpperCase() : '👤'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-cream">
              {user ? user.name || user.username : 'Sign In / Account'}
            </div>
            <div className="text-[10px] text-sand-dim">
              {user ? 'Synced Library' : 'Save Playlists'}
            </div>
          </div>
        </button>
      </div>
    </aside>
  )
}
