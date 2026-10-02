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
  NEW_RELEASES_2025_2026,
  getSearchPredictions,
  detectMoodOrGenre,
  detectArtist,
} from '../data/searchEngine'

/**
 * Resilient Artist Avatar that handles loading errors gracefully
 * and displays a stylized glowing gradient badge with initials if an image fails.
 */
function ArtistAvatar({ src, name, size = 'h-16 w-16', textClass = 'text-sm' }) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [src])

  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={`relative ${size} shrink-0 overflow-hidden rounded-full ring-2 ring-edge/70 group-hover:ring-ember/70 bg-surface-2 flex items-center justify-center shadow-md transition-all duration-300`}
    >
      {!imgError && src ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-ember/35 via-surface-3 to-coal flex items-center justify-center font-bold text-cream tracking-wider shadow-inner">
          <span className={textClass}>{initials || '♪'}</span>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '3:20'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export default function SearchView({ onLyrics, resetTrigger }) {
  const audio = useAudio()
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [matchedLyric, setMatchedLyric] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Active collection hub: null | { type: 'artist' | 'genre' | 'playlist', data: obj, originGenre?: obj }
  const [activeHub, setActiveHub] = useState(null)
  const [hubTracks, setHubTracks] = useState([])
  const [genreArtists, setGenreArtists] = useState([])
  const [genrePlaylists, setGenrePlaylists] = useState([])
  const [loadingHub, setLoadingHub] = useState(false)
  const [hubFilter, setHubFilter] = useState('all') // all | hits | romantic | sad | custom subtag
  const [generatingMore, setGeneratingMore] = useState(false)
  const [autoReleasing, setAutoReleasing] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const timer = useRef(null)
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchBarWrapperRef = useRef(null)

  // Close suggestions dropdown when user taps/clicks outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBarWrapperRef.current && !searchBarWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // When user clicks the "Search" navigation menu (in sidebar or mobile bottom nav),
  // directly reset any active playlist/artist/genre view, scroll smoothly to the top of the search bar, and focus input.
  useEffect(() => {
    if (resetTrigger > 0) {
      setActiveHub(null)
      setQ('')
      setResults(null)
      setMatchedLyric(null)
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
    }
  }, [resetTrigger])

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
      setGenreArtists([])
      setGenrePlaylists([])
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
          setGenreArtists(data.artists || [])
          setGenrePlaylists(data.playlists || [])
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
    setShowSuggestions(false)
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
    setActiveHub(null)
    setQ(queryText)
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSelectGenre = (genre) => {
    setShowSuggestions(false)
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
    setActiveHub({ type: 'genre', data: genre })
    setQ('')
    setResults(null)
    setMatchedLyric(null)
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSelectArtist = (artist, originGenre = null) => {
    setShowSuggestions(false)
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
    const parentGenre = originGenre || (activeHub?.type === 'genre' ? activeHub.data : null)
    setActiveHub({ type: 'artist', data: artist, originGenre: parentGenre })
    setQ('')
    setResults(null)
    setMatchedLyric(null)
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSelectPlaylist = (playlist, originGenre = null) => {
    setShowSuggestions(false)
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
    const parentGenre = originGenre || (activeHub?.type === 'genre' ? activeHub.data : null)
    setActiveHub({ type: 'playlist', data: playlist, originGenre: parentGenre })
    setQ('')
    setResults(null)
    setMatchedLyric(null)
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleClear = () => {
    setQ('')
    setResults(null)
    setMatchedLyric(null)
    setShowSuggestions(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const handleBackToSearch = () => {
    if (activeHub?.originGenre) {
      // Return to parent genre view if we navigated from one
      setActiveHub({ type: 'genre', data: activeHub.originGenre })
    } else {
      setActiveHub(null)
      setQ('')
      setResults(null)
      setMatchedLyric(null)
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
    }
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
    if (hubFilter === 'all') return hubTracks
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
    // Subtag filter
    const cleanFilter = hubFilter.toLowerCase().replace(/[^a-z]/g, '')
    return hubTracks.filter((t) => {
      const full = `${t.title || ''} ${t.artist || ''} ${t.album || ''}`.toLowerCase()
      return full.includes(cleanFilter)
    })
  }, [hubTracks, hubFilter])

  const handlePlayHubPlaylist = (shuffleMode = false) => {
    if (!displayedHubTracks.length) return
    const tracksToPlay = shuffleMode
      ? [...displayedHubTracks].sort(() => Math.random() - 0.5)
      : displayedHubTracks
    audio.playTrack(tracksToPlay[0], tracksToPlay)
  }

  const handlePlayTrackInHub = (t, index) => {
    audio.playTrack(t, displayedHubTracks)
  }

  const handleAutoRelease = async () => {
    setAutoReleasing(true)
    try {
      const fresh = await api.autoReleaseNewSongs()
      setToastMessage(`⚡ Auto-released ${fresh.length || 'new'} fresh songs to your library!`)
      setTimeout(() => setToastMessage(''), 3500)
    } catch {
      setToastMessage('Auto-release radar up to date!')
      setTimeout(() => setToastMessage(''), 2500)
    }
    setAutoReleasing(false)
  }

  const topTrack = results && results.length > 0 ? results[0] : null
  const isTopPlaying =
    topTrack &&
    audio.current?.track &&
    (audio.current.track.id || audio.current.track.title) === (topTrack.id || topTrack.title) &&
    audio.playing

  // AI Mood & Artist Intent Recognition
  const aiMoodMatch = useMemo(() => detectMoodOrGenre(q), [q])
  const aiArtistMatch = useMemo(() => detectArtist(q), [q])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto px-4 py-6 sm:px-8 pb-36 lg:pb-12">
      <div className="mx-auto max-w-5xl">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 rounded-full border border-ember/50 bg-coal/95 backdrop-blur-md px-5 py-2 text-xs font-semibold text-cream shadow-glow flex items-center gap-2 animate-bounce-short">
            <span className="text-ember font-bold">✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ============================================================= */}
        {/* Top Search Bar */}
        {/* ============================================================= */}
        <div ref={searchBarWrapperRef} className="relative mb-6">
          <div className="flex items-center gap-3 rounded-full border border-edge/80 bg-surface-2 hover:bg-surface-3 px-4 py-3 sm:py-3.5 shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-ember/70 focus-within:bg-surface-2">
            <SearchIcon size={20} className="text-sand-dim shrink-0" />
            <input
              ref={searchInputRef}
              value={q}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                if (activeHub) setActiveHub(null)
                setQ(e.target.value)
                setShowSuggestions(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false)
                  searchInputRef.current?.blur()
                }
              }}
              placeholder="What do you want to play? (e.g. sad songs, Arijit, romantic, lo-fi…)"
              className="w-full bg-transparent text-sm sm:text-base font-normal text-cream placeholder-sand-dim/70 focus:outline-none"
              autoFocus
            />
            {searching && (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-ember border-t-transparent" />
            )}
            {q && !searching && (
              <button
                onClick={handleClear}
                className="icon-btn h-6 w-6 text-sand-dim hover:text-white shrink-0 transition-colors"
                title="Clear search"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete Predictions Dropdown */}
          {showSuggestions && predictions.length > 0 && !activeHub && (
            <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-edge bg-surface-2/95 p-2 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sand-dim border-b border-edge/40">
                <span>AI Predictions ({predictions.length})</span>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-xs text-sand-dim hover:text-white px-1"
                >
                  ✕
                </button>
              </div>
              {predictions.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowSuggestions(false)
                    if (searchInputRef.current) {
                      searchInputRef.current.blur()
                    }
                    if (p.type === 'artist' && p.singerObj) {
                      handleSelectArtist(p.singerObj)
                    } else if (p.type === 'artist_playlist' && p.singerObj) {
                      handleSelectArtist(p.singerObj)
                    } else if (p.type === 'genre' && p.genreObj) {
                      handleSelectGenre(p.genreObj)
                    } else if (p.type === 'playlist' && p.genreObj) {
                      handleSelectGenre(p.genreObj)
                    } else {
                      handleSelectQuery(p.query || p.text)
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs text-sand hover:bg-surface-3 hover:text-white transition-colors"
                >
                  {p.avatar ? (
                    <ArtistAvatar src={p.avatar} name={p.text} size="h-6 w-6" textClass="text-[9px]" />
                  ) : p.emoji ? (
                    <span className="text-[14px]">{p.emoji}</span>
                  ) : (
                    <SearchIcon size={13} className="text-ember shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-cream block truncate">{p.text}</span>
                    {p.subtitle && (
                      <span className="text-[10px] text-sand-dim block truncate">{p.subtitle}</span>
                    )}
                  </div>
                  {p.badge && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-sand-dim shrink-0">
                      {p.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================= */}
        {/* CASE 1: GENRE VIEW */}
        {/* ============================================================= */}
        {activeHub && activeHub.type === 'genre' ? (
          <div className="space-y-6">
            {/* Top Navigation & Back Button */}
            <div className="flex items-center justify-between gap-3 pb-2 pt-0.5 border-b border-edge/60">
              <button
                onClick={handleBackToSearch}
                className="group inline-flex items-center gap-2 rounded-full border border-edge bg-surface-2 px-4 py-2 text-xs font-semibold text-cream shadow-sm hover:border-ember/60 hover:bg-surface-3 hover:text-ember active:scale-95 transition-all"
                title="Return to Browse all"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/80 group-hover:bg-ember/20 group-hover:text-ember transition-colors">
                  ←
                </span>
                <span>Browse all</span>
              </button>

              <span className="text-xs text-sand-dim hidden sm:inline">
                Viewing category: <strong className="text-white">{activeHub.data.label}</strong>
              </span>
            </div>

            {/* Giant Bold Spotify Category Hero (Screenshot 2) */}
            <div
              className="relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300 border border-white/10"
              style={{
                background: `linear-gradient(180deg, ${activeHub.data.bgColor || '#1E3264'} 0%, rgba(18, 18, 18, 0.95) 100%)`,
              }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">Category</span>
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mt-1">
                {activeHub.data.label}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
                {activeHub.data.description}
              </p>

              {/* Sub-genre Pill Chips with Chevron (Screenshot 2) */}
              {activeHub.data.subtags && activeHub.data.subtags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-5">
                  {activeHub.data.subtags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const tagClean = tag.replace('>', '').trim()
                        setHubFilter(tagClean)
                      }}
                      className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white hover:bg-white/20 hover:border-white/40 transition-all active:scale-95 shadow-sm"
                    >
                      {tag}
                    </button>
                  ))}
                  {hubFilter !== 'all' && (
                    <button
                      onClick={() => setHubFilter('all')}
                      className="rounded-full bg-white/20 px-3 py-1.5 text-xs text-white/80 hover:text-white"
                    >
                      ✕ Clear filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SECTION A: Popular [Genre] Artists (SCREENSHOT 2 -> CLICK GOES TO ARTIST ALL SONGS) */}
            {genreArtists.length > 0 && (
              <section className="pt-2">
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                    Popular {activeHub.data.label} Artists
                  </h2>
                  <span className="text-xs text-sand-dim">Click artist for all songs</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {genreArtists.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => handleSelectArtist(artist, activeHub.data)}
                      className="group flex flex-col items-center rounded-2xl border border-edge/60 bg-surface p-3.5 sm:p-4 text-center cursor-pointer shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-ember/40 hover:bg-surface-2"
                    >
                      <ArtistAvatar
                        src={artist.avatar}
                        name={artist.name}
                        size="h-24 w-24 sm:h-28 sm:w-28"
                        textClass="text-2xl"
                      />
                      <h4 className="mt-3 font-display text-sm sm:text-base font-bold text-cream truncate w-full group-hover:text-ember transition-colors">
                        {artist.name}
                      </h4>
                      <span className="text-xs text-sand-dim mt-0.5">Artist</span>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-ember/15 border border-ember/30 px-2.5 py-0.5 text-[10px] font-bold text-ember">
                        All Songs →
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION B: Popular [Genre] Playlists */}
            {genrePlaylists.length > 0 && (
              <section className="pt-2">
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-cream">
                    Popular {activeHub.data.label} Playlists
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {genrePlaylists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => handleSelectPlaylist(pl, activeHub.data)}
                      className="group flex items-center gap-3.5 rounded-2xl border border-edge/60 bg-surface p-3 cursor-pointer shadow-soft transition-all duration-200 hover:border-ember/40 hover:bg-surface-2"
                    >
                      <img
                        src={pl.cover}
                        alt={pl.title}
                        className="h-16 w-16 rounded-xl object-cover shadow-md shrink-0 ring-1 ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-sm font-bold text-cream truncate group-hover:text-ember transition-colors">
                          {pl.title}
                        </h4>
                        <p className="text-xs text-sand-dim truncate mt-0.5">{pl.subtitle}</p>
                        <span className="text-[10px] text-ember font-semibold mt-1 inline-block">
                          {pl.trackCount || '25+ Songs'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION C: Popular [Genre] Tracks List */}
            <section className="pt-4">
              <div className="flex items-center justify-between mb-4 border-b border-edge/60 pb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlayHubPlaylist(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-ember hover:bg-ember-deep text-coal shadow-glow hover:scale-105 active:scale-95 transition-all"
                    title={`Play all ${activeHub.data.label} songs`}
                  >
                    <PlayIcon size={20} fill="currentColor" className="translate-x-0.5" />
                  </button>
                  <button
                    onClick={() => handlePlayHubPlaylist(true)}
                    className="flex items-center gap-1.5 rounded-full border border-edge bg-surface-2 px-3 py-1.5 text-xs font-semibold text-cream hover:bg-surface-3 transition-all"
                  >
                    <ShuffleIcon size={14} />
                    <span>Shuffle</span>
                  </button>
                </div>
                <span className="text-xs text-sand-dim">
                  {displayedHubTracks.length} Curated Tracks
                </span>
              </div>

              {loadingHub ? (
                <div className="py-16 text-center">
                  <span className="h-6 w-6 inline-block animate-spin rounded-full border-2 border-ember border-t-transparent" />
                  <p className="mt-3 text-sm text-sand-dim">Loading {activeHub.data.label} tracks…</p>
                </div>
              ) : (
                <div className="space-y-1">
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
            </section>
          </div>
        ) : activeHub && (activeHub.type === 'artist' || activeHub.type === 'playlist') ? (
          /* ============================================================= */
          /* CASE 2: ARTIST / PLAYLIST VIEW (SCREENSHOT 3) */
          /* ============================================================= */
          <div className="space-y-6">
            {/* Top Navigation & Back Button */}
            <div className="flex items-center justify-between gap-3 pb-2 pt-0.5 border-b border-edge/60">
              <button
                onClick={handleBackToSearch}
                className="group inline-flex items-center gap-2 rounded-full border border-edge bg-surface-2 px-4 py-2 text-xs font-semibold text-cream shadow-sm hover:border-ember/60 hover:bg-surface-3 hover:text-ember active:scale-95 transition-all"
                title={activeHub.originGenre ? `Return to ${activeHub.originGenre.label}` : 'Return to Search'}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/80 group-hover:bg-ember/20 group-hover:text-ember transition-colors">
                  ←
                </span>
                <span>
                  {activeHub.originGenre ? `Back to ${activeHub.originGenre.label}` : 'Back to Search & All Songs'}
                </span>
              </button>

              <span className="text-xs text-sand-dim hidden sm:inline">
                {activeHub.type === 'artist' ? 'Verified Artist' : 'Public Playlist'}
              </span>
            </div>

            {/* Acoustic Sangeet Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-edge/70 bg-gradient-to-b from-surface-3 via-surface-2 to-coal p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {/* Artwork */}
                <div className="relative h-32 w-32 sm:h-44 sm:w-44 shrink-0 overflow-hidden rounded-2xl shadow-2xl bg-surface-3 ring-2 ring-edge">
                  <img
                    src={activeHub.data.avatar || activeHub.data.cover || audio.fallbackCover(null)}
                    alt={activeHub.data.name || activeHub.data.title}
                    onError={(e) => {
                      e.currentTarget.src = audio.fallbackCover(null)
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ember/20 text-ember font-bold text-xs">
                      ✓
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-sand-dim">
                      {activeHub.type === 'artist' ? 'Verified Artist' : 'Public Playlist'}
                    </span>
                  </div>

                  <h1 className="mt-1 font-display text-3xl sm:text-5xl font-black text-white tracking-tight truncate">
                    {activeHub.data.name || activeHub.data.title}
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-sand-dim max-w-xl line-clamp-2">
                    {activeHub.data.bio ||
                      activeHub.data.description ||
                      activeHub.data.subtitle ||
                      activeHub.data.role}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs text-sand-dim">
                    <span className="font-bold text-cream">
                      {activeHub.data.monthlyListeners
                        ? `${activeHub.data.monthlyListeners} monthly listeners`
                        : 'Sangeet Curated'}
                    </span>
                    <span>•</span>
                    <span>{displayedHubTracks.length} songs</span>
                    <span>•</span>
                    <span className="rounded bg-ember/15 text-ember font-semibold px-2 py-0.5">
                      Master 320 kbps
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar (Big Warm Ember Play, Shuffle, Generate More) */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-edge/60 pb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handlePlayHubPlaylist(false)}
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-ember hover:bg-ember-deep text-coal shadow-glow hover:scale-105 active:scale-95 transition-all"
                  title="Play"
                >
                  <PlayIcon size={24} fill="currentColor" className="translate-x-0.5" />
                </button>

                <button
                  onClick={() => handlePlayHubPlaylist(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-surface-2 text-sand-dim hover:text-white hover:bg-surface-3 transition-colors"
                  title="Shuffle"
                >
                  <ShuffleIcon size={18} />
                </button>

                <button
                  onClick={handleGenerateMore}
                  disabled={generatingMore}
                  className="flex items-center gap-2 rounded-full border border-ember/50 bg-ember/10 px-4 py-2 text-xs font-bold text-ember hover:bg-ember/20 transition-all disabled:opacity-50"
                  title="Add more songs"
                >
                  {generatingMore ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-ember border-t-transparent" />
                      <span>Adding songs…</span>
                    </>
                  ) : (
                    <>
                      <span>✨ Generate More Songs</span>
                    </>
                  )}
                </button>
              </div>

              <span className="text-xs text-sand-dim hidden sm:inline">
                {displayedHubTracks.length} tracks ready
              </span>
            </div>

            {/* Song Table */}
            {loadingHub ? (
              <div className="py-16 text-center">
                <span className="h-6 w-6 inline-block animate-spin rounded-full border-2 border-ember border-t-transparent" />
                <p className="mt-3 text-sm text-[#b3b3b3]">Loading tracks…</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Table Header Row */}
                <div className="grid grid-cols-12 items-center px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-sand-dim border-b border-edge/40">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-7 sm:col-span-6">Title</div>
                  <div className="hidden sm:block sm:col-span-3">Album</div>
                  <div className="col-span-4 sm:col-span-2 text-right pr-2">Duration</div>
                </div>

                {/* Track Rows */}
                {displayedHubTracks.map((t, idx) => {
                  const isCurrent =
                    audio.current?.track &&
                    (audio.current.track.id || audio.current.track.title) === (t.id || t.title)
                  const isPlaying = isCurrent && audio.playing

                  return (
                    <div
                      key={t.id || idx}
                      onClick={() => handlePlayTrackInHub(t, idx)}
                      className={`group grid grid-cols-12 items-center rounded-xl px-3 sm:px-4 py-2.5 text-xs cursor-pointer transition-colors ${
                        isCurrent ? 'bg-ember/15 text-ember' : 'hover:bg-surface-2 text-sand'
                      }`}
                    >
                      {/* # Index or Play State */}
                      <div className="col-span-1 flex items-center justify-center font-medium">
                        {isPlaying ? (
                          <span className="h-3.5 w-3.5 flex items-center justify-center text-ember font-bold">
                            ▶
                          </span>
                        ) : (
                          <>
                            <span className="group-hover:hidden text-sand-dim">{idx + 1}</span>
                            <span className="hidden group-hover:inline text-ember">▶</span>
                          </>
                        )}
                      </div>

                      {/* Title & Cover & Artist */}
                      <div className="col-span-7 sm:col-span-6 flex items-center gap-3 min-w-0 pr-2">
                        <img
                          src={audio.fallbackCover(t)}
                          alt={t.title}
                          className="h-10 w-10 rounded-md object-cover shadow-sm shrink-0 ring-1 ring-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate font-semibold text-xs sm:text-sm ${
                              isCurrent ? 'text-ember font-bold' : 'text-cream group-hover:underline'
                            }`}
                          >
                            {t.title}
                          </p>
                          <p className="truncate text-[11px] text-sand-dim">{t.artist}</p>
                        </div>
                      </div>

                      {/* Album (Hidden on mobile) */}
                      <div className="hidden sm:block sm:col-span-3 truncate text-sand-dim pr-2">
                        {t.album || 'Single'}
                      </div>

                      {/* Duration */}
                      <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-2 pr-2 text-sand-dim">
                        {t.has_lyrics && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onLyrics && onLyrics(t)
                            }}
                            className="text-sand-dim hover:text-ember p-1 transition-colors"
                            title="Lyrics"
                          >
                            <LyricsIcon size={13} />
                          </button>
                        )}
                        <span>{formatTime(t.duration)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : results !== null ? (
          /* ============================================================= */
          /* CASE 3: ACTIVE SEARCH RESULTS (WHEN USER TYPES IN SEARCH BOX) */
          /* ============================================================= */
          <div className="space-y-6">
            {/* 1. AI Mood & Genre Match Banner (e.g., "sad songs", "romantic", "party", "lo-fi") */}
            {aiMoodMatch && (
              <div
                className={`relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r ${
                  aiMoodMatch.gradient || 'from-surface-2 via-surface-3 to-coal'
                } p-4 sm:p-5 shadow-2xl animate-fade-in`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-2xl shadow-md">
                      {aiMoodMatch.genreObj?.emoji || '✨'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-ember/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ember">
                          {aiMoodMatch.badge || 'AI Mood Match'}
                        </span>
                        <span className="text-xs text-white/70 hidden xs:inline">
                          {aiMoodMatch.playlistTitle}
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                        {aiMoodMatch.label}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-1 max-w-xl mt-0.5">
                        {aiMoodMatch.description}
                      </p>

                      {/* Matching Top Artists for this Mood */}
                      {aiMoodMatch.artists && aiMoodMatch.artists.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-white/60">Top Artists:</span>
                          {aiMoodMatch.artists.map((art) => (
                            <button
                              key={art.id}
                              onClick={() => handleSelectArtist(art)}
                              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 hover:bg-ember hover:text-coal hover:border-ember px-2 py-0.5 text-[11px] font-medium text-white transition-all active:scale-95"
                            >
                              <span>{art.name}</span>
                              <span className="text-[9px] opacity-70">→</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {results && results.length > 0 && (
                      <button
                        onClick={() => audio.playTrack(results[0], results)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ember hover:bg-ember-deep text-coal px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
                      >
                        <PlayIcon size={14} fill="currentColor" />
                        <span>Play All ({results.length})</span>
                      </button>
                    )}
                    {aiMoodMatch.genreObj && (
                      <button
                        onClick={() => handleSelectGenre(aiMoodMatch.genreObj)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white transition-all active:scale-95"
                      >
                        <span>Open Mood Hub</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. AI Verified Artist & Full Discography Playlist Banner */}
            {aiArtistMatch && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border border-edge/80 bg-gradient-to-r from-surface-2 to-surface-3 p-4 shadow-lg animate-fade-in">
                <div className="flex items-center gap-3.5">
                  <ArtistAvatar
                    src={aiArtistMatch.artist.avatar}
                    name={aiArtistMatch.artist.name}
                    size="h-14 w-14"
                    textClass="text-base"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-ember/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ember">
                        Artist Discography
                      </span>
                      <span className="text-[11px] text-sand-dim">
                        {aiArtistMatch.tracks?.length || '30+'} Songs Available
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-cream mt-0.5">
                      {aiArtistMatch.artist.name}
                    </h3>
                    <p className="text-xs text-sand-dim line-clamp-1">
                      {aiArtistMatch.artist.role || aiArtistMatch.artist.bio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {aiArtistMatch.tracks && aiArtistMatch.tracks.length > 0 && (
                    <button
                      onClick={() => audio.playTrack(aiArtistMatch.tracks[0], aiArtistMatch.tracks)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ember hover:bg-ember-deep text-coal px-3.5 py-1.5 text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
                    >
                      <PlayIcon size={13} fill="currentColor" />
                      <span>Play Artist ({aiArtistMatch.tracks.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleSelectArtist(aiArtistMatch.artist)}
                    className="inline-flex items-center gap-1 rounded-full border border-edge bg-surface px-3.5 py-1.5 text-xs font-semibold text-cream hover:text-ember hover:border-ember/40 transition-all active:scale-95"
                  >
                    <span>Open Playlist</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Matched Lyric Line Banner */}
            {matchedLyric && (
              <div className="flex items-center gap-2.5 rounded-xl border border-edge/70 bg-surface-2 px-4 py-2.5 text-xs text-sand">
                <span className="font-semibold text-ember">Matched Lyric:</span>
                <span className="italic text-white">“{matchedLyric}”</span>
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
                  <div className="group relative mt-2 flex flex-col justify-between rounded-2xl border border-edge/70 bg-surface p-5 shadow-soft transition-all duration-300 hover:bg-surface-2">
                    <div className="flex items-start gap-4">
                      <img
                        src={audio.fallbackCover(topTrack)}
                        alt={topTrack.title}
                        onError={(e) => {
                          e.currentTarget.src = audio.fallbackCover(null)
                        }}
                        className="h-24 w-24 rounded-xl object-cover shadow-md shrink-0 ring-1 ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded-full bg-ember/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember">
                          {topTrack._matchReason || 'Best Match'}
                        </span>
                        <h3 className="mt-2 truncate font-display text-xl font-bold text-cream">
                          {topTrack.title}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-sand-dim">{topTrack.artist}</p>
                        {topTrack.album && (
                          <p className="mt-1 truncate text-[11px] text-sand-dim/80">
                            Album · {topTrack.album}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-edge/50">
                      <button
                        onClick={() => onLyrics && onLyrics(topTrack)}
                        className="flex items-center gap-1.5 text-xs font-medium text-sand hover:text-ember transition-colors"
                      >
                        <LyricsIcon size={14} />
                        <span>Lyrics</span>
                      </button>

                      <button
                        onClick={() => audio.playTrack(topTrack, results)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-ember hover:bg-ember-deep text-coal shadow-glow transition-all hover:scale-110 active:scale-95"
                        title={isTopPlaying ? 'Pause' : 'Play'}
                      >
                        {isTopPlaying ? (
                          <PauseIcon size={16} fill="currentColor" />
                        ) : (
                          <PlayIcon size={16} fill="currentColor" className="translate-x-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Matching Songs List */}
              <div className={topTrack ? 'lg:col-span-7' : 'lg:col-span-12'}>
                <span className="text-xs font-bold uppercase tracking-wider text-sand-dim">
                  Songs ({results.length})
                </span>
                <div className="mt-2 space-y-1.5">
                  {results.slice(0, 10).map((t, i) => (
                    <TrackCard key={t.id || i} track={t} onLyrics={onLyrics} queue={results} />
                  ))}
                </div>
              </div>
            </div>

            {/* Extended Results */}
            {results.length > 10 && (
              <div className="mt-6">
                <span className="text-xs font-bold uppercase tracking-wider text-sand-dim">
                  More Results
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
          /* CASE 4: "BROWSE ALL" GRID */
          /* ============================================================= */
          <div className="space-y-8">
            {/* Auto-Release Radar Banner - Mobile Optimized & Compact */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-ember/25 bg-gradient-to-r from-surface via-surface-2 to-surface-3 px-3 py-2 sm:px-4 sm:py-2.5 shadow-soft flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-ember/15 border border-ember/30 text-ember text-sm sm:text-base shadow-sm">
                  ⚡
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-ember/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-ember">
                      Auto Release
                    </span>
                    <span className="text-[10px] text-sand-dim hidden xs:inline sm:inline">
                      2026 Drops
                    </span>
                  </div>
                  <h3 className="mt-0.5 font-display text-xs sm:text-sm font-bold text-cream truncate">
                    Fresh Music Drops & Chartbusters
                  </h3>
                  <p className="text-[11px] text-sand-dim hidden md:block truncate">
                    New tracks auto-detected in ultra 320 kbps.
                  </p>
                </div>
              </div>
              <button
                onClick={handleAutoRelease}
                disabled={autoReleasing}
                className="shrink-0 inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-ember/50 bg-ember/15 hover:bg-ember text-ember hover:text-coal px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {autoReleasing ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="hidden sm:inline">Scanning…</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span className="hidden sm:inline">Check New Drops</span>
                    <span className="sm:hidden">Check Drops</span>
                  </>
                )}
              </button>
            </div>

            <section>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4 sm:mb-6">
                Browse all
              </h1>

              {/* 2-Column Mobile / 5-Column Desktop Category Grid with 25deg Tilted Covers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
                {POPULAR_GENRES.map((genre) => (
                  <div
                    key={genre.id}
                    onClick={() => handleSelectGenre(genre)}
                    className="group relative h-28 sm:h-36 md:h-44 rounded-xl overflow-hidden cursor-pointer select-none p-3.5 sm:p-4 shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    style={{ backgroundColor: genre.bgColor || '#4A1E17' }}
                  >
                    <span className="font-display font-extrabold text-white text-base sm:text-xl md:text-2xl leading-tight block max-w-[70%] drop-shadow-sm">
                      {genre.label}
                    </span>

                    {/* Signature 25deg Tilted Cover Art at Bottom-Right Corner */}
                    <img
                      src={genre.cover}
                      alt={genre.label}
                      loading="lazy"
                      className="absolute -bottom-2 -right-3 w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-md shadow-2xl object-cover rotate-[25deg] pointer-events-none transform origin-bottom-right transition-transform duration-300 group-hover:rotate-[22deg] group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Popular Artists Shelf */}
            <section className="pt-2">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-cream">Popular Artists</h2>
                  <p className="text-xs text-sand-dim">
                    Click any artist to open their complete discography
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {POPULAR_SINGERS.slice(0, 12).map((singer) => (
                  <button
                    key={singer.id}
                    onClick={() => handleSelectArtist(singer)}
                    className="group flex flex-col items-center rounded-2xl border border-edge/60 bg-surface p-3 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-ember/40 hover:bg-surface-2"
                  >
                    <ArtistAvatar
                      src={singer.avatar}
                      name={singer.name}
                      size="h-16 w-16 sm:h-20 sm:w-20"
                      textClass="text-base"
                    />
                    <span className="mt-2.5 truncate w-full text-xs sm:text-sm font-semibold text-cream group-hover:text-ember transition-colors">
                      {singer.name}
                    </span>
                    <span className="text-[10px] text-sand-dim mt-0.5">Artist</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Search by Partial Famous Lyrics */}
            <section className="rounded-2xl border border-edge/70 bg-surface p-4 sm:p-5">
              <div className="flex items-center gap-2 text-ember">
                <MusicIcon size={16} />
                <h2 className="font-display text-base font-bold text-cream">Search by Partial Lyrics</h2>
              </div>
              <p className="mt-0.5 text-xs text-sand-dim">
                Forgot the song name? Tap any famous lyrics line to automatically detect the full song:
              </p>

              <div className="mt-3.5 flex flex-wrap gap-2">
                {FAMOUS_LYRICS_MAP.slice(0, 12).map((item) => (
                  <button
                    key={item.snippet}
                    onClick={() => handleSelectQuery(item.snippet)}
                    className="flex items-center gap-1.5 rounded-xl border border-edge bg-surface-2 px-3 py-1.5 text-xs text-sand hover:border-ember/60 hover:bg-surface-3 hover:text-white transition-all"
                  >
                    <span className="text-ember font-serif">“</span>
                    <span className="font-medium">{item.snippet}</span>
                    <span className="text-ember font-serif">”</span>
                    <span className="text-[10px] text-sand-dim">→ {item.title}</span>
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
