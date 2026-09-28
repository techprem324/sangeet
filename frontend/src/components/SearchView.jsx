import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { useAudio } from '../store/audio'
import TrackCard from './TrackCard'
import { SearchIcon, MusicIcon, XIcon, PlayIcon, PauseIcon, LyricsIcon } from './icons'
import {
  POPULAR_SINGERS,
  POPULAR_GENRES,
  FAMOUS_LYRICS_MAP,
  getSearchPredictions,
} from '../data/searchEngine'

export default function SearchView({ onLyrics }) {
  const audio = useAudio()
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [matchedLyric, setMatchedLyric] = useState(null)
  const [searching, setSearching] = useState(false)
  const timer = useRef(null)

  // Instant predictions while typing
  const predictions = useMemo(() => {
    return q.trim().length >= 1 ? getSearchPredictions(q) : []
  }, [q])

  // Execute search with debouncing
  useEffect(() => {
    const text = q.trim()
    if (text.length < 2) {
      setResults(null)
      setMatchedLyric(null)
      setSearching(false)
      return
    }

    clearTimeout(timer.current)
    setSearching(true)
    timer.current = setTimeout(async () => {
      try {
        const d = await api.search(text)
        setResults(d.tracks || [])
        setMatchedLyric(d.matchedLyric || null)
      } catch {
        setResults([])
      }
      setSearching(false)
    }, 350)

    return () => clearTimeout(timer.current)
  }, [q])

  const handleSelectQuery = (queryText) => {
    setQ(queryText)
  }

  const handleClear = () => {
    setQ('')
    setResults(null)
    setMatchedLyric(null)
  }

  const topTrack = results && results.length > 0 ? results[0] : null
  const isTopPlaying =
    topTrack &&
    audio.current?.track &&
    (audio.current.track.id || audio.current.track.title) === (topTrack.id || topTrack.title) &&
    audio.playing

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8 pb-36 lg:pb-10">
      <div className="mx-auto max-w-4xl">
        {/* Page Title & Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-cream">Search</h1>
            <p className="mt-1 text-sm text-sand-dim">
              Songs, artists, genres, or partial lyrics — predictive 320 kbps discovery.
            </p>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative mt-5">
          <div className="flex items-center gap-3 rounded-2xl border border-edge bg-surface px-4 py-3.5 shadow-soft transition-all duration-200 focus-within:border-ember/70 focus-within:ring-2 focus-within:ring-ember/20 focus-within:bg-coal/90">
            <SearchIcon size={20} className="text-sand-dim shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search songs, artists (Arijit, Atif), genres, or partial lyrics…"
              className="w-full bg-transparent text-sm sm:text-[15px] text-cream placeholder-sand-dim/60 focus:outline-none"
              autoFocus
            />
            {searching && (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-ember border-t-transparent" />
            )}
            {q && !searching && (
              <button
                onClick={handleClear}
                className="icon-btn h-6 w-6 text-sand-dim hover:text-cream shrink-0 transition-colors"
                title="Clear search"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          {/* Instant Autocomplete Suggestions Dropdown/Pills */}
          {predictions.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-sand-dim/80 pl-1">
                Suggestions:
              </span>
              {predictions.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuery(p.query || p.text)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-edge/80 bg-surface px-3 py-1 text-xs text-sand hover:border-ember/60 hover:bg-ember/10 hover:text-cream transition-all"
                >
                  {p.avatar ? (
                    <img src={p.avatar} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                  ) : p.emoji ? (
                    <span className="text-[11px]">{p.emoji}</span>
                  ) : (
                    <SearchIcon size={10} className="text-ember" />
                  )}
                  <span className="font-medium">{p.text}</span>
                  {p.badge && (
                    <span className="rounded bg-surface-2 px-1 text-[9px] text-sand-dim">
                      {p.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Results State */}
        {/* ------------------------------------------------------------- */}
        {results !== null ? (
          results.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-sand-dim">
                <SearchIcon size={24} />
              </div>
              <h3 className="mt-4 text-base font-medium text-cream">No results found for “{q}”</h3>
              <p className="mt-1 text-xs sm:text-sm text-sand-dim max-w-sm mx-auto">
                Try searching by a famous singer like “Arijit Singh”, a genre like “Lo-Fi”, or a lyric phrase.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {['Arijit Singh', 'Atif Aslam', 'Tum Hi Ho', 'Kesariya', 'Romantic Hindi'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelectQuery(s)}
                    className="rounded-full border border-edge bg-surface px-3 py-1.5 text-xs text-sand hover:border-ember/50 hover:text-cream transition-colors"
                  >
                    Try “{s}”
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Lyrics Match Indicator Banner */}
              {matchedLyric && (
                <div className="flex items-center gap-2.5 rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-xs text-sand">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember/20 text-ember font-bold">
                    ✓
                  </span>
                  <span>
                    Detected lyric phrase: <strong className="text-cream">“{matchedLyric}”</strong> — predicted matching track below!
                  </span>
                </div>
              )}

              {/* Spotify-style Top Result Hero Card + Songs List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Top Result Hero Card */}
                {topTrack && (
                  <div className="lg:col-span-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-sand-dim">
                      Top Result
                    </span>
                    <div className="group relative mt-2 flex flex-col justify-between rounded-2xl border border-edge bg-gradient-to-b from-surface-2/90 to-surface/80 p-5 shadow-soft transition-all duration-300 hover:border-ember/40 hover:bg-surface-2">
                      <div className="flex items-start gap-4">
                        <img
                          src={audio.fallbackCover(topTrack)}
                          alt={topTrack.title}
                          className="h-24 w-24 rounded-xl object-cover shadow-md shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="inline-block rounded-full bg-ember/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember">
                            {topTrack._matchReason || 'Best Match'}
                          </span>
                          <h3 className="mt-2 truncate font-display text-xl font-bold text-cream">
                            {topTrack.title}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-sand-dim">{topTrack.artist}</p>
                          <p className="mt-1 truncate text-[11px] text-sand-dim/70">
                            {topTrack.album || 'Single'} · 320 kbps
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between pt-3 border-t border-edge-soft">
                        <button
                          onClick={() => onLyrics && onLyrics(topTrack)}
                          className="flex items-center gap-1.5 rounded-full border border-edge/80 bg-surface px-3 py-1.5 text-xs font-medium text-sand hover:border-ember/40 hover:text-cream transition-colors"
                        >
                          <LyricsIcon size={14} />
                          <span>Lyrics</span>
                        </button>

                        <button
                          onClick={() => audio.playTrack(topTrack, results)}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-ember text-coal shadow-glow transition-transform hover:scale-105 active:scale-95"
                          title={isTopPlaying ? 'Pause' : 'Play'}
                        >
                          {isTopPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} className="translate-x-0.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Popular Matching Songs List */}
                <div className={topTrack ? 'lg:col-span-7' : 'lg:col-span-12'}>
                  <span className="text-xs font-bold uppercase tracking-wider text-sand-dim">
                    Songs ({results.length})
                  </span>
                  <div className="mt-2 space-y-1.5">
                    {results.slice(topTrack ? 1 : 0, 10).map((t, i) => (
                      <TrackCard key={t.id || i} track={t} onLyrics={onLyrics} queue={results} />
                    ))}
                  </div>
                </div>
              </div>

              {/* More Matching Tracks (if > 10) */}
              {results.length > 10 && (
                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sand-dim">
                    More Related Tracks
                  </span>
                  <div className="mt-2 space-y-1.5">
                    {results.slice(10).map((t, i) => (
                      <TrackCard key={t.id || i + 10} track={t} onLyrics={onLyrics} queue={results} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          /* ------------------------------------------------------------- */
          /* Empty / Discovery State (Browsing Hub) */
          /* ------------------------------------------------------------- */
          <div className="mt-8 space-y-9">
            {/* 1. Popular Singers / Artists Grid */}
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-cream">Popular Singers</h2>
                  <p className="text-xs text-sand-dim">Instant top hits from India's greatest voices</p>
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {POPULAR_SINGERS.slice(0, 10).map((singer) => (
                  <button
                    key={singer.id}
                    onClick={() => handleSelectQuery(singer.query)}
                    className="group flex flex-col items-center rounded-2xl border border-edge bg-surface/80 p-3.5 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-ember/50 hover:bg-surface-2"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-edge group-hover:ring-ember/50 transition-all">
                      <img
                        src={singer.avatar}
                        alt={singer.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <span className="mt-2.5 truncate w-full text-xs sm:text-sm font-semibold text-cream group-hover:text-ember transition-colors">
                      {singer.name}
                    </span>
                    <span className="truncate w-full text-[11px] text-sand-dim/80">
                      {singer.role}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Search by Famous Lyrics Fragments */}
            <section className="rounded-2xl border border-edge bg-surface/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-ember">
                <MusicIcon size={16} />
                <h2 className="font-display text-base font-bold text-cream">
                  Search by Partial Lyrics
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-sand-dim">
                Forgot the song name? Tap any famous lyrics line to automatically detect the full song:
              </p>

              <div className="mt-3.5 flex flex-wrap gap-2">
                {FAMOUS_LYRICS_MAP.slice(0, 12).map((item) => (
                  <button
                    key={item.snippet}
                    onClick={() => handleSelectQuery(item.snippet)}
                    className="flex items-center gap-1.5 rounded-xl border border-edge/80 bg-surface px-3 py-1.5 text-xs text-sand hover:border-ember/60 hover:bg-ember/10 hover:text-cream transition-all"
                  >
                    <span className="text-ember font-serif">“</span>
                    <span className="font-medium">{item.snippet}</span>
                    <span className="text-ember font-serif">”</span>
                    <span className="text-[10px] text-sand-dim">→ {item.title}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Browse Genres & Moods */}
            <section>
              <h2 className="font-display text-lg font-bold text-cream">Browse All Genres & Moods</h2>
              <p className="text-xs text-sand-dim">Explore tailored playlists and mood rooms</p>

              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {POPULAR_GENRES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectQuery(g.query)}
                    className={`group relative overflow-hidden rounded-2xl border border-edge bg-gradient-to-br ${g.color} p-4 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 ${g.border}`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <h3 className="mt-2 font-display text-sm sm:text-base font-bold text-cream group-hover:text-ember transition-colors">
                      {g.label}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-sand-dim truncate">{g.tag}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
