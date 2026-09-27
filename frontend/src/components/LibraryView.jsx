import { useState } from 'react'
import PlaylistsView from './PlaylistsView'
import LikedView from './LikedView'
import { LibraryIcon, PlaylistIcon, HeartFilledIcon } from './icons'

export default function LibraryView({ user, onLyrics, refreshKey, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('playlists') // 'playlists' | 'liked'

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Library Top Bar with Segmented Toggle & Profile Link */}
      <div className="shrink-0 border-b border-edge-soft bg-coal/60 px-4 py-3 sm:px-8 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember/15 text-ember border border-ember/30">
              <LibraryIcon size={17} />
            </div>
            <div>
              <h2 className="font-display text-lg font-medium text-cream sm:text-xl">Your Library</h2>
              <p className="text-[11px] text-sand-dim">Unified playlists & saved tracks</p>
            </div>
          </div>

          {/* Account Profile Badge inside Library */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-full border border-edge/80 bg-surface px-2.5 py-1 text-xs font-medium text-cream shadow-sm hover:border-ember/40 hover:bg-surface-2 transition-colors"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ember/20 text-[10px] font-bold text-ember border border-ember/30">
              {user ? (user.name || user.username || 'U')[0].toUpperCase() : '👤'}
            </span>
            <span className="max-w-[100px] truncate text-[11px]">
              {user ? user.name || user.username : 'Sign In'}
            </span>
          </button>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="mx-auto mt-3 flex max-w-4xl items-center gap-2">
          <button
            onClick={() => setActiveTab('playlists')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'playlists'
                ? 'bg-ember text-ink font-semibold shadow-glow'
                : 'bg-surface border border-edge/60 text-sand-dim hover:text-cream hover:bg-surface-2'
            }`}
          >
            <PlaylistIcon size={14} />
            <span>Playlists</span>
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'liked'
                ? 'bg-rose text-white font-semibold shadow-glow'
                : 'bg-surface border border-edge/60 text-sand-dim hover:text-cream hover:bg-surface-2'
            }`}
          >
            <HeartFilledIcon size={14} className={activeTab === 'liked' ? 'text-white' : 'text-rose'} />
            <span>Liked Songs</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === 'playlists' ? (
          <PlaylistsView
            user={user}
            onLyrics={onLyrics}
            refreshKey={refreshKey}
            onOpenAuth={onOpenAuth}
          />
        ) : (
          <LikedView
            user={user}
            onLyrics={onLyrics}
            refreshKey={refreshKey}
            onOpenAuth={onOpenAuth}
          />
        )}
      </div>
    </div>
  )
}
