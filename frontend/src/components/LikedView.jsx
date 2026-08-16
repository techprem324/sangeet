import { useEffect, useState } from 'react'
import { api } from '../api'
import TrackCard from './TrackCard'
import { HeartFilledIcon } from './icons'

export default function LikedView({ onLyrics, refreshKey }) {
  const [liked, setLiked] = useState(null)

  useEffect(() => {
    api.liked().then((d) => setLiked(d.liked)).catch(() => setLiked([]))
  }, [refreshKey])

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="flex items-center gap-3 font-display text-3xl font-medium text-cream">
          <HeartFilledIcon size={24} className="text-rose" /> Your songs
        </h1>
        <p className="mt-1.5 text-sm text-sand-dim">Everything you hearted across chats, moods and searches lives here.</p>

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
              Nothing saved yet — tap the heart on any track and it shows up here.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {liked.map((t, i) => (
              <TrackCard key={t.track_id || i} track={t} onLyrics={onLyrics} queue={liked} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
