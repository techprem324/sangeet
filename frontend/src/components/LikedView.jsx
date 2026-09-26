import { useEffect, useState } from 'react'
import { api } from '../api'
import TrackCard from './TrackCard'
import { HeartFilledIcon } from './icons'

export default function LikedView({ user, onLyrics, refreshKey, onOpenAuth }) {
  const [liked, setLiked] = useState(null)

  useEffect(() => {
    let alive = true
    api.liked()
      .then((d) => {
        if (!alive) return
        const raw = (d && (d.liked || d.tracks)) || (Array.isArray(d) ? d : [])
        const clean = Array.isArray(raw)
          ? raw.map((item) => ({
              ...item,
              id: item.track_id || item.id || item.title,
            }))
          : []
        setLiked(clean)
      })
      .catch(() => alive && setLiked([]))
    return () => {
      alive = false
    }
  }, [refreshKey, user])

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="flex items-center gap-3 font-display text-2xl sm:text-3xl font-medium text-cream">
          <HeartFilledIcon size={24} className="text-rose" />
          {user ? `${user.name || user.username}’s songs` : 'Your songs'}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-sand-dim">
          {user
            ? 'Your favourite songs — permanently saved to your account and synced across devices.'
            : 'Songs you hearted during this session — sign in to save your favourites permanently.'}
        </p>

        {!user && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-rose/30 bg-rose/[0.07] px-4 py-3 text-xs sm:text-sm text-sand-dim shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose/20 text-xs text-rose font-bold">❤️</span>
              <span>
                <strong className="font-semibold text-cream">Guest Mode:</strong> Songs hearted in this session are temporary and won’t be saved for future visits.
              </span>
            </div>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="shrink-0 rounded-full border border-rose/40 bg-rose/15 px-3.5 py-1.5 text-xs font-semibold text-rose transition-all hover:bg-rose/25 hover:text-cream"
              >
                Sign in to save songs
              </button>
            )}
          </div>
        )}

        {liked === null ? (
          <div className="mt-5 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl2 cover-loading" />
            ))}
          </div>
        ) : liked.length === 0 ? (
          <div className="mt-12 text-center">
            <HeartFilledIcon size={34} className="mx-auto text-sand-dim/40" />
            <p className="mt-3 text-sm text-sand-dim">
              {user
                ? 'Nothing saved yet — tap the heart on any track and it will be saved to your account.'
                : 'Nothing saved yet in this session — tap the heart on any track to add it now, or sign in to load your account’s favourites.'}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {liked.map((t, i) => (
              <TrackCard key={t.track_id || t.id || i} track={t} onLyrics={onLyrics} queue={liked} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
