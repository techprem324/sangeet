import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { useAudio } from '../store/audio'
import TrackCard from './TrackCard'
import { SearchIcon, MusicIcon, XIcon, PlayIcon, PauseIcon, LyricsIcon, ShuffleIcon } from './icons'
import {
  POPULAR_SINGERS,
  POPULAR_GENRES,
  FAMOUS_LYRICS_MAP,
  NEW_RELEASES_2025_2026,
  ARTIST_DISCOGRAPHIES,
  getSearchPredictions,
} from '../data/searchEngine'

/**
 * Resilient Artist Avatar that handles loading errors gracefully
 * and displays a stylized glowing gradient badge with initials if an image fails.
 */
function ArtistAvatar({ src, name, size = 'h-16 w-16', textClass = 'text-sm' }) {
  const [imgError, setImgError] = useState(false)
  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={`relative ${size} shrink-0 overflow-hidden rounded-full ring-2 ring-edge bg-surface-2 flex items-center justify-center shadow-md`}
    >
      {!imgError && src ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-ember/40 to-amber-700/50 flex items-center justify-center font-bold text-cream tracking-wider">
          <span className={textClass}>{initials || '♪'}</span>
        </div>
      )}
    </div>
  )
}

export default function SearchView({ onLyrics }) {
  const audio = useAudio()
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [matchedLyric, setMatchedLyric] = useState(null)
  const [searching, setSearching] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [artistTracks, setArtistTracks] = useState([])
  const [artistFilter, setArtistFilter] = useState('all') // all | romantic | sad | hits
  const [loadingArtist, setLoadingArtist] = useState(false)
  const timer = useRef(null)

  // 15+ instant predictions while typing
  const predictions = useMemo(() => {
    return q.trim().length >= 1 ? getSearchPredictions(q) : []
  }, [q])

  // Execute live search with debouncing
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
    }, 320)

    return () => clearTimeout(timer.current)
  }, [q])

  // Load dedicated artist playlist when an artist is selected
  useEffect(() => {
    if (!selectedArtist) {
      setArtistTracks([])
      return
    }

    setLoadingArtist(true)
    api
      .getArtistPlaylist(selectedArtist.id || selectedArtist.name)
      .then((data) => {
        setArtistTracks(data.tracks || [])
        setLoadingArtist(false)
      })
      .catch(() => {
        const fallback = ARTIST_DISCOGRAPHIES[selectedArtist.id] || []
        setArtistTracks(fallback)
        setLoadingArtist(false)
      })
  }, [selectedArtist])

  const handleSelectQuery = (queryText) => {
    setSelectedArtist(null)
    setQ(queryText)
  }

  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist)
    setQ('')
    setResults(null)
    setMatchedLyric(null)
  }

  const handleClear = () => {
    setQ('')
    setResults(null)
    setMatchedLyric(null)
  }

  const handleBackToSearch = () => {
    setSelectedArtist(null)
  }

  // Filtered artist tracks
  const displayedArtistTracks = useMemo(() => {
    if (!artistTracks.length) return []
    if (artistFilter === 'romantic') {
      return artistTracks.filter(
        (t) =>
          (t.title && /tum|tere|kesariya|apna|ishq|chaleya|heeriye|sajni|dil|hawayein|jeene|muskurane/i.test(t.title)) ||
          t.category === 'romantic'
      )
    }
    if (artistFilter === 'sad') {
      return artistTracks.filter(
        (t) =>
          (t.title && /channa|bedardeya|shayad|agar|khairiyat|aadat|alvida|judai|pal/i.test(t.title)) ||
          t.category === 'heartbreak'
      )
    }
    if (artistFilter === 'hits') {
      return artistTracks.slice(0, 12)
    }
    return artistTracks
  }, [artistTracks, artistFilter])

  const handlePlayArtistPlaylist = (shuffleMode = false) => {
    if (!displayedArtistTracks.length) return
    const tracksToPlay = shuffleMode
      ? [...displayedArtistTracks].sort(() => Math.random() - 0.5)
      : displayedArtistTracks
    audio.playTrack(tracksToPlay[0], tracksToPlay)
  }

  const topTrack = results && results.length > 0 ? results[0] : null
  const isTopPlaying =
    topTrack &&
    audio.current?.track &&
    (audio.current.track.id || audio.current.track.title) === (topTrack.id || topTrack.title) &&
    audio.playing

  // Detect if current query matches an artist name for the banner
  const matchedArtistFromQuery = useMemo(() => {
    if (!q.trim()) return null
    const lower = q.trim().toLowerCase()
    return POPULAR_SINGERS.find((a) => a.name.toLowerCase().includes(lower) || lower.includes(a.name.toLowerCase()))
  }, [q])

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8 pb-36 lg:pb-12">
      <div className="mx-auto max-w-5xl">
        {/* ============================================================= */}
        {/* Search Bar Input & Instant Suggestions */}
        {/* ============================================================= */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 mb-4">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-cream">Search</h1>
              <p className="mt-1 text-sm text-sand-dim">
                Instant Spotify-style discovery by artist, song, lyrics, or new release.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-edge bg-surface px-4 py-3.5 shadow-soft transition-all duration-200 focus-within:border-ember/70 focus-within:ring-2 focus-within:ring-ember/20 focus-within:bg-coal/95">
            <SearchIcon size={20} className="text-sand-dim shrink-0" />
            <input
              value={q}
              onChange={(e) => {
                if (selectedArtist) setSelectedArtist(null)
                setQ(e.target.value)
              }}
              placeholder="Search songs, artists (Arijit, Atif), trending releases, or lyrics…"
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

          {/* 15+ Instant Autocomplete Predictions Bar */}
          {predictions.length > 0 && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-sand-dim/90 pl-1">
                Suggestions:
              </span>
              {predictions.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (p.type === 'artist' && p.artistId) {
                      const singerObj = POPULAR_SINGERS.find((s) => s.id === p.artistId)
                      if (singerObj) return handleSelectArtist(singerObj)
                    }
                    handleSelectQuery(p.query || p.text)
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-edge/80 bg-surface px-3 py-1.5 text-xs text-sand hover:border-ember/60 hover:bg-ember/15 hover:text-cream transition-all"
                >
                  {p.avatar ? (
                    <ArtistAvatar src={p.avatar} name={p.text} size="h-4 w-4" textClass="text-[8px]" />
                  ) : p.emoji ? (
                    <span className="text-[11px]">{p.emoji}</span>
                  ) : (
                    <SearchIcon size={11} className="text-ember" />
                  )}
                  <span className="font-medium">{p.text}</span>
                  {p.badge && (
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold text-sand-dim">
                      {p.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================= */}
        {/* CASE A: DEDICATED ARTIST PLAYLIST VIEW */}
        {/* ============================================================= */}
        {selectedArtist ? (
          <div className="mt-6 space-y-6">
            {/* Quick Artist Switcher Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-edge-soft/60">
              <span className="shrink-0 text-xs font-semibold text-sand-dim pr-1">Switch Artist:</span>
              {POPULAR_SINGERS.map((s) => {
                const isSelected = selectedArtist.id === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectArtist(s)}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all ${
                      isSelected
                        ? 'border-ember bg-ember/20 text-cream font-bold'
                        : 'border-edge bg-surface text-sand hover:border-ember/50 hover:text-cream'
                    }`}
                  >
                    <ArtistAvatar src={s.avatar} name={s.name} size="h-5 w-5" textClass="text-[9px]" />
                    <span>{s.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Artist Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-edge bg-gradient-to-r from-surface-2 via-coal to-surface p-6 sm:p-8 shadow-soft">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <ArtistAvatar
                  src={selectedArtist.avatar}
                  name={selectedArtist.name}
                  size="h-28 w-28 sm:h-36 sm:w-36"
                  textClass="text-3xl"
                />

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs">
                      ✓
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-sand-dim">
                      Verified Artist Playlist
                    </span>
                  </div>

                  <h2 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-cream">
                    {selectedArtist.name}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-sand-dim max-w-xl">
                    {selectedArtist.bio || selectedArtist.role}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-sand-dim">
                    <span className="font-semibold text-ember">{selectedArtist.monthlyListeners || '25M+'} Monthly Listeners</span>
                    <span>•</span>
                    <span>{artistTracks.length} Curated Tracks</span>
                    <span>•</span>
                    <span className="rounded bg-ember/15 px-2 py-0.5 text-ember font-medium">Exclusive 320 kbps Flow</span>
                  </div>

                  {/* Play All and Shuffle Buttons */}
                  <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button
                      onClick={() => handlePlayArtistPlaylist(false)}
                      className="flex items-center gap-2 rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-coal shadow-glow transition-transform hover:scale-105 active:scale-95"
                    >
                      <PlayIcon size={16} fill="currentColor" />
                      <span>Play Artist Playlist</span>
                    </button>

                    <button
                      onClick={() => handlePlayArtistPlaylist(true)}
                      className="flex items-center gap-2 rounded-full border border-edge bg-surface px-4 py-2.5 text-sm font-medium text-cream hover:border-ember/50 hover:bg-surface-2 transition-all"
                    >
                      <ShuffleIcon size={16} />
                      <span>Shuffle</span>
                    </button>

                    <button
                      onClick={handleBackToSearch}
                      className="text-xs text-sand-dim hover:text-cream underline pl-2"
                    >
                      ← Back to All Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter Pills inside Artist Playlist */}
            <div className="flex items-center justify-between gap-3 border-b border-edge-soft pb-3">
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: `All Songs (${artistTracks.length})` },
                  { id: 'hits', label: 'Top Hits' },
                  { id: 'romantic', label: 'Romantic Melodies' },
                  { id: 'sad', label: 'Heartbreak & Sad' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setArtistFilter(tab.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      artistFilter === tab.id
                        ? 'bg-ember text-coal shadow-sm'
                        : 'bg-surface border border-edge text-sand hover:text-cream hover:border-ember/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="hidden sm:inline text-xs text-sand-dim">
                Playing locks to <strong className="text-cream">{selectedArtist.name}</strong> only
              </span>
            </div>

            {/* Artist Tracks List */}
            {loadingArtist ? (
              <div className="py-16 text-center">
                <span className="h-6 w-6 inline-block animate-spin rounded-full border-2 border-ember border-t-transparent" />
                <p className="mt-3 text-sm text-sand-dim">Loading complete discography for {selectedArtist.name}…</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {displayedArtistTracks.map((t, idx) => (
                  <TrackCard
                    key={t.id || idx}
                    track={t}
                    onLyrics={onLyrics}
                    queue={displayedArtistTracks}
                  />
                ))}
              </div>
            )}
          </div>
        ) : results !== null ? (
          /* ============================================================= */
          /* CASE B: ACTIVE SEARCH RESULTS (30+ TRACKS + TOP RESULT) */
          /* ============================================================= */
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
              {/* Matched Artist Banner prompt */}
              {matchedArtistFromQuery && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-ember/40 bg-gradient-to-r from-ember/15 via-surface to-surface-2 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <ArtistAvatar
                      src={matchedArtistFromQuery.avatar}
                      name={matchedArtistFromQuery.name}
                      size="h-11 w-11"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-cream">
                        Explore {matchedArtistFromQuery.name}’s Full Playlist
                      </h4>
                      <p className="text-xs text-sand-dim">
                        Listen to all signature hits in a pure single-artist playlist
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectArtist(matchedArtistFromQuery)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-ember px-4 py-1.5 text-xs font-bold text-coal hover:scale-105 active:scale-95 transition-transform"
                  >
                    <span>Open Artist Playlist →</span>
                  </button>
                </div>
              )}

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

                {/* Popular Matching Songs List (First 10) */}
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

              {/* Extended Results (All 30+ Tracks) */}
              {results.length > 10 && (
                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sand-dim">
                    More Matching Tracks ({results.length - 10} more)
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
          /* ============================================================= */
          /* CASE C: EMPTY / DISCOVERY HUB */
          /* ============================================================= */
          <div className="mt-7 space-y-9">
            {/* Quick Choose Artist Playlist Bar */}
            <div className="rounded-2xl border border-edge bg-surface/60 p-3.5">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-sand-dim">
                  Choose Artist Playlist:
                </span>
                <span className="text-[11px] text-ember font-medium">Plays only selected artist</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {POPULAR_SINGERS.map((singer) => (
                  <button
                    key={singer.id}
                    onClick={() => handleSelectArtist(singer)}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-edge/80 bg-surface px-3 py-1.5 text-xs text-sand hover:border-ember/60 hover:bg-ember/15 hover:text-cream transition-all"
                  >
                    <ArtistAvatar src={singer.avatar} name={singer.name} size="h-5 w-5" textClass="text-[9px]" />
                    <span className="font-semibold">{singer.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 1. New Releases & Recent 2024-2026 Trending Chartbusters */}
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                    <span>🔥 New Releases & Trending Hits</span>
                    <span className="rounded-full bg-ember/20 px-2 py-0.5 text-[10px] font-semibold text-ember">
                      2024-2026
                    </span>
                  </h2>
                  <p className="text-xs text-sand-dim">The freshest chartbusters and viral tracks</p>
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {NEW_RELEASES_2025_2026.map((nr) => {
                  const isPlayingThis =
                    audio.current?.track?.title === nr.title && audio.playing
                  return (
                    <div
                      key={nr.id}
                      onClick={() => audio.playTrack(nr, NEW_RELEASES_2025_2026)}
                      className="group cursor-pointer rounded-2xl border border-edge bg-surface/70 p-3 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-ember/50 hover:bg-surface-2"
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-2">
                        <img
                          src={nr.cover}
                          alt={nr.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button
                          className={`absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-ember text-coal shadow-md transition-all ${
                            isPlayingThis
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
                          }`}
                        >
                          {isPlayingThis ? <PauseIcon size={14} /> : <PlayIcon size={14} className="translate-x-0.5" />}
                        </button>
                      </div>
                      <h4 className="mt-2.5 truncate text-xs font-bold text-cream group-hover:text-ember transition-colors">
                        {nr.title}
                      </h4>
                      <p className="truncate text-[11px] text-sand-dim">{nr.artist}</p>
                      <span className="mt-1 inline-block text-[9px] font-semibold text-ember uppercase">
                        {nr.badge}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 2. Popular Singers (Clicking opens dedicated artist playlist!) */}
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-cream">Popular Singers</h2>
                  <p className="text-xs text-sand-dim">Click any singer to open their complete playlist</p>
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {POPULAR_SINGERS.slice(0, 10).map((singer) => (
                  <button
                    key={singer.id}
                    onClick={() => handleSelectArtist(singer)}
                    className="group flex flex-col items-center rounded-2xl border border-edge bg-surface/80 p-3.5 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-ember/50 hover:bg-surface-2"
                  >
                    <ArtistAvatar
                      src={singer.avatar}
                      name={singer.name}
                      size="h-16 w-16"
                      textClass="text-base"
                    />
                    <span className="mt-2.5 truncate w-full text-xs sm:text-sm font-semibold text-cream group-hover:text-ember transition-colors">
                      {singer.name}
                    </span>
                    <span className="truncate w-full text-[11px] text-sand-dim/80">
                      {singer.role}
                    </span>
                    <span className="mt-1.5 rounded-full bg-ember/15 px-2 py-0.5 text-[9px] font-semibold text-ember">
                      Open Playlist →
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Search by Famous Lyrics Fragments */}
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

            {/* 4. Browse Genres & Moods */}
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
