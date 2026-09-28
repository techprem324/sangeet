import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { useAudio } from '../store/audio'
import TrackCard from './TrackCard'
import { SearchIcon, MusicIcon, XIcon, PlayIcon, PauseIcon, LyricsIcon, ShuffleIcon } from './icons'
import {
  POPULAR_SINGERS,
  POPULAR_GENRES,
  FEATURED_PLAYLISTS,
  FAMOUS_LYRICS_MAP,
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

  // Active collection hub: null | { type: 'artist' | 'genre' | 'playlist', data: obj }
  const [activeHub, setActiveHub] = useState(null)
  const [hubTracks, setHubTracks] = useState([])
  const [loadingHub, setLoadingHub] = useState(false)
  const [hubFilter, setHubFilter] = useState('all') // all | hits | romantic | sad
  const [generatingMore, setGeneratingMore] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

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

  // Load dedicated collection when activeHub changes
  useEffect(() => {
    if (!activeHub) {
      setHubTracks([])
      return
    }

    setLoadingHub(true)
    setHubFilter('all')

    if (activeHub.type === 'artist') {
      api
        .getArtistPlaylist(activeHub.data.id || activeHub.data.name)
        .then((data) => {
          setHubTracks(data.tracks || [])
          setLoadingHub(false)
        })
        .catch(() => {
          const fallback = ARTIST_DISCOGRAPHIES[activeHub.data.id] || []
          setHubTracks(fallback)
          setLoadingHub(false)
        })
    } else if (activeHub.type === 'genre') {
      api
        .getGenrePlaylist(activeHub.data.id)
        .then((data) => {
          setHubTracks(data.tracks || [])
          setLoadingHub(false)
        })
        .catch(() => {
          setHubTracks([])
          setLoadingHub(false)
        })
    } else if (activeHub.type === 'playlist') {
      api
        .getFeaturedPlaylist(activeHub.data.id)
        .then((data) => {
          setHubTracks(data.tracks || [])
          setLoadingHub(false)
        })
        .catch(() => {
          setHubTracks([])
          setLoadingHub(false)
        })
    }
  }, [activeHub])

  const handleSelectQuery = (queryText) => {
    setActiveHub(null)
    setQ(queryText)
  }

  const handleSelectArtist = (artist) => {
    setActiveHub({ type: 'artist', data: artist })
    setQ('')
    setResults(null)
    setMatchedLyric(null)
  }

  const handleSelectGenre = (genre) => {
    setActiveHub({ type: 'genre', data: genre })
    setQ('')
    setResults(null)
    setMatchedLyric(null)
  }

  const handleSelectPlaylist = (playlist) => {
    setActiveHub({ type: 'playlist', data: playlist })
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
    setActiveHub(null)
  }

  // Quick play a full featured playlist directly from card
  const handleQuickPlayPlaylist = async (pl) => {
    try {
      const data = await api.getFeaturedPlaylist(pl.id)
      if (data && data.tracks && data.tracks.length > 0) {
        audio.playTrack(data.tracks[0], data.tracks)
      }
    } catch {
      // ignore
    }
  }

  // Dynamic track generator (adds 10-15+ fresh songs on demand)
  const handleGenerateMore = async () => {
    if (!activeHub || generatingMore) return
    setGeneratingMore(true)
    try {
      const currentIds = hubTracks.map((t) => t.id || t.title)
      const hubName = activeHub.data.name || activeHub.data.title || activeHub.data.label
      const res = await api.generateMoreTracks({
        type: activeHub.type,
        id: activeHub.data.id,
        name: hubName,
        seenIds: currentIds,
      })

      if (res && Array.isArray(res.tracks) && res.tracks.length > 0) {
        setHubTracks((prev) => [...prev, ...res.tracks])
        setToastMessage(`✨ Added ${res.tracks.length} fresh songs to ${hubName}!`)
        setTimeout(() => setToastMessage(''), 3500)
      } else {
        setToastMessage(`✨ All available fresh tracks are already in this playlist!`)
        setTimeout(() => setToastMessage(''), 3000)
      }
    } catch (err) {
      console.warn('Generate more failed:', err)
    } finally {
      setGeneratingMore(false)
    }
  }

  // Filtered tracks in the active hub
  const displayedHubTracks = useMemo(() => {
    if (!hubTracks.length) return []
    if (hubFilter === 'romantic') {
      return hubTracks.filter(
        (t) =>
          (t.title &&
            /tum|tere|kesariya|apna|ishq|chaleya|heeriye|sajni|dil|hawayein|jeene|muskurane|romance|pyaar|chahne/i.test(
              t.title
            )) ||
          t.category === 'romantic' ||
          t.category === 'chill_sunday'
      )
    }
    if (hubFilter === 'sad') {
      return hubTracks.filter(
        (t) =>
          (t.title &&
            /channa|bedardeya|shayad|agar|khairiyat|aadat|alvida|judai|pal|dard|sad|bewaffa|adhuri|barbaad/i.test(
              t.title
            )) ||
          t.category === 'heartbreak'
      )
    }
    if (hubFilter === 'hits') {
      return hubTracks.slice(0, 15)
    }
    return hubTracks
  }, [hubTracks, hubFilter])

  const handlePlayHubPlaylist = (shuffleMode = false) => {
    if (!displayedHubTracks.length) return
    const tracksToPlay = shuffleMode
      ? [...displayedHubTracks].sort(() => Math.random() - 0.5)
      : displayedHubTracks
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
    return POPULAR_SINGERS.find(
      (a) => a.name.toLowerCase().includes(lower) || lower.includes(a.name.toLowerCase())
    )
  }, [q])

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8 pb-36 lg:pb-12">
      <div className="mx-auto max-w-5xl">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 rounded-full border border-emerald-500/50 bg-emerald-950/95 backdrop-blur-md px-5 py-2 text-xs font-semibold text-emerald-200 shadow-2xl flex items-center gap-2 animate-bounce-short">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ============================================================= */}
        {/* Search Bar Input & Instant Suggestions */}
        {/* ============================================================= */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 mb-4">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-cream">Search</h1>
              <p className="mt-1 text-sm text-sand-dim">
                Instant Spotify-style discovery by playlist, genre, artist, song, or lyrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-edge bg-surface px-4 py-3.5 shadow-soft transition-all duration-200 focus-within:border-ember/70 focus-within:ring-2 focus-within:ring-ember/20 focus-within:bg-coal/95">
            <SearchIcon size={20} className="text-sand-dim shrink-0" />
            <input
              value={q}
              onChange={(e) => {
                if (activeHub) setActiveHub(null)
                setQ(e.target.value)
              }}
              placeholder="Search playlists, genres, artists (Arijit, Atif), or lyrics…"
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

          {/* Autocomplete Predictions Dropdown */}
          {predictions.length > 0 && !activeHub && (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-2xl border border-edge bg-coal/95 p-2 shadow-2xl backdrop-blur-xl">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sand-dim">
                Suggested Predictions ({predictions.length})
              </div>
              {predictions.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (p.type === 'artist' && p.singerObj) {
                      handleSelectArtist(p.singerObj)
                    } else {
                      handleSelectQuery(p.text)
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs text-sand hover:bg-surface hover:text-cream transition-colors"
                >
                  {p.avatar ? (
                    <ArtistAvatar src={p.avatar} name={p.text} size="h-5 w-5" textClass="text-[9px]" />
                  ) : p.emoji ? (
                    <span className="text-[12px]">{p.emoji}</span>
                  ) : (
                    <SearchIcon size={12} className="text-ember" />
                  )}
                  <span className="font-medium flex-1 truncate">{p.text}</span>
                  {p.badge && (
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold text-sand-dim shrink-0">
                      {p.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================= */}
        {/* CASE A: DEDICATED HUB VIEW (PLAYLIST, GENRE, OR ARTIST) */}
        {/* ============================================================= */}
        {activeHub ? (
          <div className="mt-6 space-y-6">
            {/* Quick Switcher Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-edge-soft/60">
              <span className="shrink-0 text-xs font-semibold text-sand-dim pr-1">
                {activeHub.type === 'artist'
                  ? 'Switch Artist:'
                  : activeHub.type === 'genre'
                  ? 'Switch Genre:'
                  : 'Switch Playlist:'}
              </span>

              {activeHub.type === 'artist' &&
                POPULAR_SINGERS.map((s) => {
                  const isSelected = activeHub.data.id === s.id
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

              {activeHub.type === 'genre' &&
                POPULAR_GENRES.map((g) => {
                  const isSelected = activeHub.data.id === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => handleSelectGenre(g)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${
                        isSelected
                          ? 'border-ember bg-ember/20 text-cream font-bold'
                          : 'border-edge bg-surface text-sand hover:border-ember/50 hover:text-cream'
                      }`}
                    >
                      <span>{g.emoji}</span>
                      <span>{g.label}</span>
                    </button>
                  )
                })}

              {activeHub.type === 'playlist' &&
                FEATURED_PLAYLISTS.map((pl) => {
                  const isSelected = activeHub.data.id === pl.id
                  return (
                    <button
                      key={pl.id}
                      onClick={() => handleSelectPlaylist(pl)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${
                        isSelected
                          ? 'border-ember bg-ember/20 text-cream font-bold'
                          : 'border-edge bg-surface text-sand hover:border-ember/50 hover:text-cream'
                      }`}
                    >
                      <span>🔥</span>
                      <span>{pl.title}</span>
                    </button>
                  )
                })}
            </div>

            {/* Universal Collection Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-edge bg-gradient-to-r from-surface-2 via-coal to-surface p-6 sm:p-8 shadow-soft">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Artwork */}
                {activeHub.type === 'artist' ? (
                  <ArtistAvatar
                    src={activeHub.data.avatar}
                    name={activeHub.data.name}
                    size="h-28 w-28 sm:h-36 sm:w-36"
                    textClass="text-3xl"
                  />
                ) : (
                  <div className="relative h-28 w-28 sm:h-36 sm:w-36 shrink-0 overflow-hidden rounded-2xl border border-edge/80 shadow-2xl bg-surface-3">
                    <img
                      src={activeHub.data.cover || audio.fallbackCover(null)}
                      alt={activeHub.data.title || activeHub.data.label}
                      onError={(e) => {
                        e.currentTarget.src = audio.fallbackCover(null)
                      }}
                      className="h-full w-full object-cover"
                    />
                    {activeHub.data.emoji && (
                      <div className="absolute top-2 left-2 rounded-lg bg-coal/75 backdrop-blur-md px-2 py-1 text-base sm:text-lg">
                        {activeHub.data.emoji}
                      </div>
                    )}
                  </div>
                )}

                {/* Info & Actions */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs">
                      ✓
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-sand-dim">
                      {activeHub.type === 'artist'
                        ? 'Verified Artist Playlist'
                        : activeHub.type === 'genre'
                        ? 'Verified Genre Playlist'
                        : 'Featured Curated Playlist'}
                    </span>
                  </div>

                  <h2 className="mt-1 font-display text-2xl sm:text-4xl font-extrabold text-cream">
                    {activeHub.data.name || activeHub.data.title || activeHub.data.label}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-sand-dim max-w-xl">
                    {activeHub.data.description ||
                      activeHub.data.bio ||
                      activeHub.data.subtitle ||
                      activeHub.data.role}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-sand-dim">
                    <span className="font-semibold text-ember">
                      {activeHub.data.monthlyListeners
                        ? `${activeHub.data.monthlyListeners} Monthly Listeners`
                        : `${hubTracks.length} Curated Tracks`}
                    </span>
                    <span>•</span>
                    <span>{hubTracks.length} Tracks Ready</span>
                    <span>•</span>
                    <span className="rounded bg-ember/15 px-2 py-0.5 text-ember font-medium">
                      Exclusive 320 kbps Flow
                    </span>
                  </div>

                  {/* Play, Shuffle, and Generate More Buttons */}
                  <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button
                      onClick={() => handlePlayHubPlaylist(false)}
                      className="flex items-center gap-2 rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-coal shadow-glow transition-transform hover:scale-105 active:scale-95"
                    >
                      <PlayIcon size={16} fill="currentColor" />
                      <span>
                        Play{' '}
                        {activeHub.type === 'artist'
                          ? 'Artist Playlist'
                          : activeHub.type === 'genre'
                          ? 'Genre Playlist'
                          : 'Playlist'}
                      </span>
                    </button>

                    <button
                      onClick={() => handlePlayHubPlaylist(true)}
                      className="flex items-center gap-2 rounded-full border border-edge bg-surface px-4 py-2.5 text-sm font-medium text-cream hover:border-ember/50 hover:bg-surface-2 transition-all"
                    >
                      <ShuffleIcon size={16} />
                      <span>Shuffle</span>
                    </button>

                    <button
                      onClick={handleGenerateMore}
                      disabled={generatingMore}
                      className="flex items-center gap-2 rounded-full border border-ember/60 bg-ember/15 px-4 py-2.5 text-sm font-semibold text-ember hover:bg-ember/25 transition-all disabled:opacity-50"
                      title="Pull more related songs from JioSaavn"
                    >
                      {generatingMore ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ember border-t-transparent" />
                          <span>Generating fresh tracks…</span>
                        </>
                      ) : (
                        <>
                          <span>✨ Generate More Songs</span>
                        </>
                      )}
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

            {/* Category Filter Pills inside Hub */}
            <div className="flex items-center justify-between gap-3 border-b border-edge-soft pb-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: `All Songs (${hubTracks.length})` },
                  { id: 'hits', label: 'Top Hits' },
                  { id: 'romantic', label: 'Romantic Melodies' },
                  { id: 'sad', label: 'Heartbreak & Sad' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setHubFilter(tab.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      hubFilter === tab.id
                        ? 'bg-ember text-coal shadow-sm'
                        : 'bg-surface border border-edge text-sand hover:text-cream hover:border-ember/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="hidden sm:inline text-xs text-sand-dim shrink-0">
                Playing locks to{' '}
                <strong className="text-cream">
                  {activeHub.data.name || activeHub.data.title || activeHub.data.label}
                </strong>
              </span>
            </div>

            {/* Tracks List */}
            {loadingHub ? (
              <div className="py-16 text-center">
                <span className="h-6 w-6 inline-block animate-spin rounded-full border-2 border-ember border-t-transparent" />
                <p className="mt-3 text-sm text-sand-dim">
                  Loading complete tracklist for{' '}
                  {activeHub.data.name || activeHub.data.title || activeHub.data.label}…
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {displayedHubTracks.map((t, idx) => (
                  <TrackCard
                    key={t.id || idx}
                    track={t}
                    onLyrics={onLyrics}
                    queue={displayedHubTracks}
                  />
                ))}
              </div>
            )}

            {/* Bottom "Generate More Songs" callout */}
            {!loadingHub && displayedHubTracks.length > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-edge bg-gradient-to-r from-surface-2 via-coal to-surface p-5">
                <div>
                  <h4 className="font-display text-sm sm:text-base font-bold text-cream">
                    Want more songs in this{' '}
                    {activeHub.type === 'artist'
                      ? 'artist playlist'
                      : activeHub.type === 'genre'
                      ? 'genre'
                      : 'playlist'}
                    ?
                  </h4>
                  <p className="text-xs text-sand-dim mt-0.5">
                    Instantly pull fresh streaming tracks from JioSaavn and expand this playlist
                    dynamically.
                  </p>
                </div>
                <button
                  onClick={handleGenerateMore}
                  disabled={generatingMore}
                  className="flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-xs font-bold text-coal shadow-glow transition-all hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50"
                >
                  {generatingMore ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-coal border-t-transparent" />
                      <span>Pulling fresh tracks…</span>
                    </>
                  ) : (
                    <>
                      <span>✨ Generate 12+ Fresh Songs</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : results !== null ? (
          /* ============================================================= */
          /* CASE B: ACTIVE SEARCH RESULTS (30+ TRACKS + TOP RESULT) */
          /* ============================================================= */
          <div className="mt-6 space-y-6">
            {/* Quick Matched Artist Header if query matches singer */}
            {matchedArtistFromQuery && (
              <div className="flex items-center justify-between rounded-2xl border border-ember/30 bg-ember/10 p-4">
                <div className="flex items-center gap-3">
                  <ArtistAvatar
                    src={matchedArtistFromQuery.avatar}
                    name={matchedArtistFromQuery.name}
                    size="h-12 w-12"
                    textClass="text-sm"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ember">
                      Artist Found
                    </span>
                    <h3 className="font-display text-base font-bold text-cream">
                      {matchedArtistFromQuery.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectArtist(matchedArtistFromQuery)}
                  className="flex items-center gap-1.5 rounded-full bg-ember px-4 py-1.5 text-xs font-bold text-coal shadow-sm transition-transform hover:scale-105"
                >
                  <span>Open Artist Playlist</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* Matched Lyric Line Banner */}
            {matchedLyric && (
              <div className="flex items-center gap-2.5 rounded-xl border border-edge bg-surface/80 px-4 py-2.5 text-xs text-sand">
                <span className="font-semibold text-ember">Matched Lyric:</span>
                <span className="italic text-cream">“{matchedLyric}”</span>
              </div>
            )}

            {/* Top Result + Songs List Grid */}
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
                        onError={(e) => {
                          e.currentTarget.src = audio.fallbackCover(null)
                        }}
                        className="h-24 w-24 rounded-xl object-cover shadow-md shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded-full bg-ember/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember">
                          {topTrack._matchReason || 'Best Match'}
                        </span>
                        <h3 className="mt-2 truncate font-display text-xl font-bold text-cream">
                          {topTrack.title}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-sand-dim">
                          {topTrack.artist}
                        </p>
                        {topTrack.album && (
                          <p className="mt-1 truncate text-[11px] text-sand-dim/80">
                            Album · {topTrack.album}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-edge-soft">
                      <button
                        onClick={() => onLyrics && onLyrics(topTrack)}
                        className="flex items-center gap-1.5 text-xs font-medium text-sand hover:text-ember transition-colors"
                      >
                        <LyricsIcon size={14} />
                        <span>Lyrics</span>
                      </button>

                      <button
                        onClick={() => audio.playTrack(topTrack, results)}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-ember text-coal shadow-glow transition-transform hover:scale-105 active:scale-95"
                        title={isTopPlaying ? 'Pause' : 'Play'}
                      >
                        {isTopPlaying ? (
                          <PauseIcon size={18} />
                        ) : (
                          <PlayIcon size={18} className="translate-x-0.5" />
                        )}
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
                    <TrackCard
                      key={t.id || i + 10}
                      track={t}
                      onLyrics={onLyrics}
                      queue={results}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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

            {/* 1. Featured Curated Playlists (Resolving user request: "should be playlists contains songs not a single song") */}
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <h2 className="font-display text-lg font-bold text-cream">
                      Featured Trending Playlists
                    </h2>
                    <span className="rounded-full bg-ember/20 px-2 py-0.5 text-[10px] font-semibold text-ember">
                      2024-2026
                    </span>
                  </div>
                  <p className="text-xs text-sand-dim">
                    Curated playlists packed with 20+ viral chartbusters & modern anthems
                  </p>
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                {FEATURED_PLAYLISTS.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => handleSelectPlaylist(pl)}
                    className="group relative cursor-pointer rounded-2xl border border-edge bg-surface/75 p-3.5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-ember/50 hover:bg-surface-2"
                  >
                    <div className="relative aspect-video sm:aspect-square w-full overflow-hidden rounded-xl bg-surface-2 shadow-md">
                      <img
                        src={pl.cover}
                        alt={pl.title}
                        onError={(e) => {
                          e.currentTarget.src = audio.fallbackCover(null)
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      
                      {/* Track count pill */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                        <span className="rounded-full bg-coal/85 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-cream border border-edge/60">
                          {pl.trackCount}
                        </span>
                      </div>

                      {/* Badge */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="inline-block rounded-full bg-ember/90 px-2.5 py-0.5 text-[10px] font-bold text-coal uppercase tracking-wider">
                          {pl.badge}
                        </span>
                      </div>

                      {/* Quick Play Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuickPlayPlaylist(pl)
                        }}
                        title="Play Playlist"
                        className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-ember text-coal shadow-glow transition-all opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:scale-110 active:scale-95"
                      >
                        <PlayIcon size={16} fill="currentColor" className="translate-x-0.5" />
                      </button>
                    </div>

                    <h4 className="mt-3 truncate text-sm font-bold text-cream group-hover:text-ember transition-colors">
                      {pl.title}
                    </h4>
                    <p className="mt-0.5 line-clamp-1 text-xs text-sand-dim">
                      {pl.subtitle}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-ember font-semibold pt-2 border-t border-edge-soft/60">
                      <span>Explore 20+ Songs</span>
                      <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Popular Singers (Clicking opens dedicated artist playlist!) */}
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-cream">Popular Singers</h2>
                  <p className="text-xs text-sand-dim">
                    Click any singer to open their complete playlist with continuous playback
                  </p>
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

            {/* 4. Browse All Genres & Moods (Resolving user request: "all should have at least 15 songs") */}
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-cream">
                    Browse All Genres & Moods
                  </h2>
                  <p className="text-xs text-sand-dim">
                    Explore tailored playlists with 25+ curated songs & generate more options
                  </p>
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {POPULAR_GENRES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGenre(g)}
                    className={`group relative overflow-hidden rounded-2xl border border-edge bg-gradient-to-br ${g.color} p-4 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 ${g.border}`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <h3 className="mt-2 font-display text-sm sm:text-base font-bold text-cream group-hover:text-ember transition-colors">
                      {g.label}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-sand-dim truncate">{g.tag}</p>
                    <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-ember">
                      <span>Explore 25+ Songs</span>
                      <span>→</span>
                    </div>
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
