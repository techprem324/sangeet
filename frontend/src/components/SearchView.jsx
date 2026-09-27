import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import TrackCard from './TrackCard'
import { SearchIcon, MusicIcon } from './icons'

export default function SearchView({ onLyrics }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const text = q.trim()
    if (text.length < 2) {
      setResults(null)
      return
    }
    clearTimeout(timer.current)
    setSearching(true)
    timer.current = setTimeout(async () => {
      try {
        const d = await api.search(text)
        setResults(d.tracks)
      } catch {
        setResults([])
      }
      setSearching(false)
    }, 450)
    return () => clearTimeout(timer.current)
  }, [q])

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8 pb-36 lg:pb-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-medium text-cream">Search anything</h1>
        <p className="mt-1.5 text-sm text-sand-dim">Any song, any artist — play it in 320 kbps instantly.</p>

        <div className="mt-5 flex items-center gap-3 rounded-xl2 border border-edge bg-surface px-4 py-3 transition-colors focus-within:border-ember/50">
          <SearchIcon size={18} className="text-sand-dim" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try “Arijit Singh” or “Tum Hi Ho”…"
            className="input-plain text-[15px]"
            autoFocus
          />
          {searching && <span className="h-4 w-4 animate-spin rounded-full border-2 border-ember border-t-transparent" />}
        </div>

        <div className="mt-5 space-y-2">
          {results === null ? (
            <div className="py-16 text-center">
              <MusicIcon size={30} className="mx-auto text-sand-dim/50" />
              <p className="mt-3 text-sm text-sand-dim">Start typing — results stream in live from JioSaavn.</p>
            </div>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-sand-dim">No results for “{q}”. Try another spelling or artist.</p>
          ) : (
            results.map((t, i) => (
              <TrackCard key={t.id || i} track={t} onLyrics={onLyrics} queue={results} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
