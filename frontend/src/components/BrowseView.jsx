import { useEffect, useState } from 'react'
import { api } from '../api'
import { moodColor, MOOD_PILLS } from '../data/moods'
import { DEFAULT_CATEGORIES } from '../data/defaultCatalog'
import TrackCard from './TrackCard'
import Footer from './Footer'
import { ChevronIcon, MusicIcon, SparkIcon } from './icons'

function CategoryCard({ cat, onOpen }) {
  const color = moodColor(cat.category)
  const { main } = color
  const emoji = cat.emoji || MOOD_PILLS.find((p) => p.key === cat.category)?.emoji || '🎵'
  return (
    <button
      onClick={() => onOpen(cat)}
      className="group relative overflow-hidden rounded-xl2 border border-edge-soft bg-surface p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/40 hover:shadow-card"
    >
      <div
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.12] blur-2xl transition-opacity group-hover:opacity-25"
        style={{ background: main }}
      />
      <div className="relative">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
          style={{ background: main + '18', border: `1px solid ${main}44` }}
        >
          {emoji}
        </div>
        <h3 className="mt-3 font-display text-lg font-medium text-cream">{cat.label}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-sand-dim">{cat.tagline || cat.description}</p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-sand-dim">
          <MusicIcon size={12} />
          {cat.count}+ hand-picked · expandable live
          <span className="ml-auto text-ember opacity-0 transition-opacity group-hover:opacity-100">open →</span>
        </div>
      </div>
    </button>
  )
}

function PlaylistDetail({ cat, onBack, onLyrics }) {
  const [tracks, setTracks] = useState(null)
  const [exploring, setExploring] = useState(false)
  const color = moodColor(cat.category)
  const { main } = color

  useEffect(() => {
    let alive = true
    setTracks(null)
    api.catalog(cat.category, 20).then((d) => alive && setTracks(d.tracks))
    return () => { alive = false }
  }, [cat.category])

  const explore = async () => {
    if (exploring) return
    setExploring(true)
    try {
      const currentList = tracks || []
      const currentIds = currentList.map((t) => t.id || t.title)
      const d = await api.explore(cat.category, 12, currentList.length, currentIds)
      if (d && Array.isArray(d.tracks) && d.tracks.length > 0) {
        setTracks((prev) => {
          const seen = new Set((prev || []).map((t) => (t.id || t.title).toLowerCase()))
          const fresh = d.tracks.filter((t) => !seen.has((t.id || t.title).toLowerCase()))
          return [...(prev || []), ...fresh]
        })
      }
    } catch { /* ignore */ }
    setExploring(false)
  }

  return (
    <div className="msg-in">
      <button onClick={() => onBack(null)} className="mb-4 flex items-center gap-1.5 text-xs font-medium text-sand-dim transition-colors hover:text-cream">
        <ChevronIcon size={14} className="rotate-180" /> all moods
      </button>

      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl" style={{ background: main + '1a', border: `1px solid ${main}44` }}>
          {cat.emoji}
        </div>
        <div>
          <h2 className="font-display text-3xl font-medium text-cream">{cat.label}</h2>
          <p className="mt-1 max-w-lg text-sm text-sand-dim">{cat.description}</p>
        </div>
      </div>

      {tracks === null ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl2 cover-loading" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {tracks.map((t, i) => (
              <TrackCard key={t.id || i} track={t} moodTag={cat.category} onLyrics={onLyrics} queue={tracks} />
            ))}
          </div>

          <button
            onClick={explore}
            disabled={exploring}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl2 border border-dashed border-ember/40 bg-ember/[0.04] px-4 py-3.5 text-sm font-medium text-ember transition-colors hover:bg-ember/10 disabled:opacity-50"
          >
            <SparkIcon size={15} className={exploring ? 'animate-spin' : ''} />
            {exploring ? 'pulling fresh tracks from JioSaavn…' : `explore more ${cat.label.toLowerCase()} tracks`}
          </button>
          <p className="mt-2 text-center text-[11px] text-sand-dim/70">
            every category is expandable to 500+ real tracks — live from JioSaavn, no fabrication
          </p>
        </>
      )}
    </div>
  )
}

export default function BrowseView({ onOpenCategory, selected, onLyrics }) {
  const [cats, setCats] = useState(DEFAULT_CATEGORIES)

  useEffect(() => {
    api.categories()
      .then((d) => {
        if (d && Array.isArray(d.categories) && d.categories.length > 0) {
          setCats(d.categories)
        }
      })
      .catch(() => setCats(DEFAULT_CATEGORIES))
  }, [])

  if (selected) {
    return (
      <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <PlaylistDetail cat={selected} onBack={onOpenCategory} onLyrics={onLyrics} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto pt-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <h1 className="font-display text-3xl font-medium text-cream">Mood rooms</h1>
        <p className="mt-1.5 max-w-lg text-sm text-sand-dim">
          Ten curated moods, each with hand-picked starters — then expand any room to 500+ real tracks.
        </p>
        {cats === null ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl2 cover-loading" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c) => (
              <CategoryCard key={c.category} cat={c} onOpen={onOpenCategory} />
            ))}
          </div>
        )}
      </div>

      <Footer onView={(v) => onOpenCategory(null)} />
    </div>
  )
}
