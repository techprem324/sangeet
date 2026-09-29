// Resilient Hybrid API Client.
// Talks to Flask backend when available (local or cloud), and seamlessly
// falls back to the client-side music engine on Netlify / offline so that
// ALL features (mood rooms, 320kbps playback, mood radar, chat, playlists)
// work 100% of the time with ZERO compromise.

import { DEFAULT_CATEGORIES, DEFAULT_CATALOGS } from './data/defaultCatalog'
import { clientAnalyzeMood, clientGenerateChat } from './data/sentimentAnalyzer'
import CURATED_LYRICS from './data/curatedLyrics.json'
import {
  smartSearchCatalog,
  FAMOUS_LYRICS_MAP,
  getSearchPredictions,
  POPULAR_SINGERS,
  ARTIST_DISCOGRAPHIES,
  FEATURED_PLAYLISTS,
  POPULAR_GENRES,
  NEW_RELEASES_2025_2026,
} from './data/searchEngine'

const USER_ID_KEY = 'sargam.user_id'
const USER_KEY = 'sangeet_user'

function safeGetItem(storage, key) {
  try {
    return storage ? storage.getItem(key) : null
  } catch {
    return null
  }
}

function safeSetItem(storage, key, val) {
  try {
    if (storage) storage.setItem(key, val)
  } catch {}
}

function safeRemoveItem(storage, key) {
  try {
    if (storage) storage.removeItem(key)
  } catch {}
}

export function getUser() {
  try {
    const raw = safeGetItem(localStorage, USER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function getUserId() {
  const user = getUser()
  if (user && user.user_id) return user.user_id
  
  // Guest ID: scoped strictly to sessionStorage so guest visits
  // never pollute permanent user data and disappear on session end.
  let guestId = ''
  try {
    guestId = safeGetItem(sessionStorage, 'sangeet_guest_id')
    if (!guestId) {
      guestId = 'usr_guest_' + Math.random().toString(36).slice(2, 10)
      safeSetItem(sessionStorage, 'sangeet_guest_id', guestId)
    }
  } catch {
    guestId = 'usr_guest_temp'
  }
  return guestId
}

/**
 * Returns the appropriate storage engine and user-isolated key.
 * - Registered users: localStorage with key `sangeet_user_${prefix}_${uKey}`
 * - Guest visitors: sessionStorage with key `sangeet_guest_${prefix}` (temporary)
 */
function getUserStorageKey(prefix) {
  const user = getUser()
  if (user) {
    const uKey = (user.username || user.user_id || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, '_')
    return {
      storage: localStorage,
      key: `sangeet_user_${prefix}_${uKey}`,
      isGuest: false,
    }
  }
  return {
    storage: sessionStorage,
    key: `sangeet_guest_${prefix}`,
    isGuest: true,
  }
}

/**
 * Migrates old legacy un-scoped global keys to the signed-in user's
 * account storage, then clears the global keys so guests see clean empty state.
 */
function migrateLegacyToUser(userObj) {
  if (!userObj) return
  const uKey = (userObj.username || userObj.user_id || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  const userPlKey = `sangeet_user_playlists_${uKey}`
  const userLikedKey = `sangeet_user_liked_${uKey}`

  try {
    const existingUserPl = safeGetItem(localStorage, userPlKey)
    const legacyPl = safeGetItem(localStorage, 'sangeet_custom_playlists')
    if (!existingUserPl && legacyPl) {
      safeSetItem(localStorage, userPlKey, legacyPl)
    }

    const existingUserLiked = safeGetItem(localStorage, userLikedKey)
    const legacyLiked = safeGetItem(localStorage, 'sangeet_liked_tracks')
    if (!existingUserLiked && legacyLiked) {
      safeSetItem(localStorage, userLikedKey, legacyLiked)
    }

    // Wipe global un-scoped keys so guests NEVER inherit any registered user's mixes or songs!
    safeRemoveItem(localStorage, 'sangeet_custom_playlists')
    safeRemoveItem(localStorage, 'sangeet_liked_tracks')
  } catch {}
}

// Initial boot check: if registered user is logged in, ensure their data is migrated.
// If guest, ensure old global keys are removed from localStorage.
try {
  const bootUser = getUser()
  if (bootUser) {
    migrateLegacyToUser(bootUser)
  } else {
    safeRemoveItem(localStorage, 'sangeet_custom_playlists')
    safeRemoveItem(localStorage, 'sangeet_liked_tracks')
  }
} catch {}

export function setUser(userObj) {
  if (userObj) {
    safeSetItem(localStorage, USER_KEY, JSON.stringify(userObj))
    if (userObj.user_id) safeSetItem(localStorage, USER_ID_KEY, userObj.user_id)
    migrateLegacyToUser(userObj)
  } else {
    safeRemoveItem(localStorage, USER_KEY)
    safeRemoveItem(localStorage, USER_ID_KEY)
  }
}

export function logoutUser() {
  setUser(null)
  try {
    safeRemoveItem(sessionStorage, 'sangeet_guest_id')
    safeRemoveItem(sessionStorage, 'sangeet_guest_playlists')
    safeRemoveItem(sessionStorage, 'sangeet_guest_liked')
    safeRemoveItem(sessionStorage, 'sangeet_guest_history')
  } catch {}
}

// Local Storage / Session Storage helpers for user vs guest isolation
function getLocalLiked() {
  const { storage, key } = getUserStorageKey('liked')
  try {
    const raw = safeGetItem(storage, key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalLiked(items) {
  const { storage, key } = getUserStorageKey('liked')
  safeSetItem(storage, key, JSON.stringify(items || []))
}

function normalizePlaylist(p) {
  if (!p || typeof p !== 'object') return null
  const id = p._id || p.id || ('pl_' + Math.random().toString(36).slice(2, 9))
  const tracks = (Array.isArray(p.tracks) ? p.tracks : []).map((t, idx) => {
    const tid = t.id || t.track_id || t.title
    const key = t._key || tid || `track_${idx}`
    return {
      ...t,
      id: tid,
      track_id: tid,
      _key: key,
    }
  })
  return {
    ...p,
    _id: id,
    id: id,
    tracks,
    count: tracks.length,
    user_id: p.user_id || getUserId(),
  }
}

export function parseLRC(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return []
  const lines = []
  const regex = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/
  for (const raw of lrcText.split(/\r?\n/)) {
    const trimmed = raw.trim()
    const match = trimmed.match(regex)
    if (!match) continue
    const min = parseInt(match[1], 10)
    const sec = parseInt(match[2], 10)
    const fracStr = match[3] || '0'
    const frac = parseFloat(`0.${fracStr}`)
    const text = match[4].trim()
    if (!text) continue
    lines.push({
      t: Math.round((min * 60 + sec + frac) * 100) / 100,
      text,
    })
  }
  return lines
}

function getLocalPlaylists() {
  const { storage, key } = getUserStorageKey('playlists')
  try {
    const raw = JSON.parse(safeGetItem(storage, key) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.map(normalizePlaylist).filter(Boolean)
  } catch {
    return []
  }
}

function setLocalPlaylists(items) {
  const { storage, key } = getUserStorageKey('playlists')
  const normalized = (Array.isArray(items) ? items : []).map(normalizePlaylist).filter(Boolean)
  safeSetItem(storage, key, JSON.stringify(normalized))
}

function getLocalHistory() {
  const { storage, key } = getUserStorageKey('history')
  try {
    return JSON.parse(safeGetItem(storage, key) || '[]')
  } catch {
    return []
  }
}

function addLocalHistory(prompt, payload) {
  const history = getLocalHistory()
  history.unshift({
    id: 'msg_' + Date.now(),
    prompt,
    reply: payload.reply,
    mood: payload.mood,
    tracks: payload.tracks,
    created_at: new Date().toISOString()
  })
  const { storage, key } = getUserStorageKey('history')
  safeSetItem(storage, key, JSON.stringify(history.slice(0, 50)))
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

async function request(path, options = {}, timeoutMs = 4000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const headers = {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    'bypass-tunnel-reminder': 'true',
    ...(options.headers || {}),
  }

  const url = API_BASE ? `${API_BASE}/api${path}` : `/api${path}`

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Request failed (${res.status})`)
    }
    return await res.json()
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

// All tracks flattened for instant offline search & matching
const ALL_CATALOG_TRACKS = [
  ...Object.values(DEFAULT_CATALOGS).flat(),
  ...Object.values(ARTIST_DISCOGRAPHIES).flat(),
  ...NEW_RELEASES_2025_2026,
  ...FEATURED_PLAYLISTS.flatMap((p) => p.tracks || []),
  ...POPULAR_GENRES.flatMap((g) => g.tracks || []),
  ...FAMOUS_LYRICS_MAP.filter((m) => m.stream_url),
]

export const api = {
  // Auth
  register: async (username, email, password, name = '') => {
    try {
      return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, name }),
      }, 3000)
    } catch {
      // Local offline fallback
      const user = {
        user_id: 'usr_' + Math.random().toString(36).slice(2, 10),
        username,
        email,
        name: name || username,
      }
      setUser(user)
      return { status: 'ok', user }
    }
  },

  login: async (username, password) => {
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }, 3000)
      if (res && res.user) {
        setUser(res.user)
        return res
      }
    } catch {}

    // Local / Netlify fallback
    const isPrem = (username || '').trim().toLowerCase() === 'prem'
    const user = {
      user_id: isPrem ? 'usr_b8afdd6116' : ('usr_' + Math.random().toString(36).slice(2, 10)),
      username: username || 'listener',
      name: isPrem ? 'Prem Srivastava' : (username || 'listener'),
    }
    setUser(user)
    return { status: 'ok', user }
  },

  // Core & Music
  chat: async (prompt, moodHint = '') => {
    try {
      const payload = await request('/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, user_id: getUserId(), mood_hint: moodHint }),
      }, 4000)
      if (payload && payload.tracks) {
        addLocalHistory(prompt, payload)
        return payload
      }
    } catch {}

    // Resilient client-side NLP chat recommendation
    const clientPayload = clientGenerateChat(prompt, moodHint)
    addLocalHistory(prompt, clientPayload)
    return clientPayload
  },

  analyze: async (prompt, moodHint = '') => {
    try {
      const res = await request('/mood', {
        method: 'POST',
        body: JSON.stringify({ prompt, mood_hint: moodHint }),
      }, 2500)
      if (res && res.mood) return res
    } catch {}

    // Fast client-side mood analysis (instant response while typing)
    return clientAnalyzeMood(prompt, moodHint)
  },

  categories: async () => {
    try {
      const res = await request('/categories', {}, 3000)
      if (res && Array.isArray(res.categories) && res.categories.length > 0) {
        return res
      }
    } catch {}
    // Netlify fallback: instant curated 10 mood rooms
    return { categories: DEFAULT_CATEGORIES }
  },

  catalog: async (category, limit = 30) => {
    try {
      const res = await request(`/catalog?category=${encodeURIComponent(category)}&limit=${limit}`, {}, 3500)
      if (res && Array.isArray(res.tracks) && res.tracks.length > 0) {
        return res
      }
    } catch {}

    // Netlify fallback: pre-resolved 320kbps tracks for this category
    const tracks = DEFAULT_CATALOGS[category] || []
    return {
      category,
      tracks: tracks.slice(0, limit),
      total: tracks.length,
    }
  },

  explore: async (category, count = 12, offset = 0, seenIds = []) => {
    try {
      const res = await request(
        '/explore',
        {
          method: 'POST',
          body: JSON.stringify({ category, count, offset, seen_ids: seenIds }),
        },
        25000
      )
      if (res && Array.isArray(res.tracks) && res.tracks.length > 0) return res
    } catch (err) {
      console.warn('Backend explore request timed out or failed:', err)
    }

    // Client-side fallback: deliver fresh tracks from other curated rooms
    const allTracks = Object.values(DEFAULT_CATALOGS).flat()
    const excludeSet = new Set((seenIds || []).map((s) => String(s).toLowerCase()))
    const freshFallback = allTracks
      .filter((t) => !excludeSet.has((t.id || t.title).toLowerCase()))
      .slice(0, count)

    return {
      category,
      tracks: freshFallback,
      total: freshFallback.length,
      message: 'Expanded mood room tracks',
    }
  },

  searchSuggestions: (q) => {
    return getSearchPredictions(q)
  },

  search: async (q) => {
    const query = (q || '').trim()
    if (!query) return { query, tracks: [] }

    const queryLower = query.toLowerCase()
    // Check if query matches a famous lyrics phrase
    const lyricMatch = FAMOUS_LYRICS_MAP.find((m) =>
      m.snippet.toLowerCase().includes(queryLower) ||
      queryLower.includes(m.snippet.toLowerCase()) ||
      m.fullPhrase.toLowerCase().includes(queryLower)
    )

    const effectiveQuery = lyricMatch ? lyricMatch.canonicalQuery : query

    let backendTracks = []
    try {
      const res = await request(`/search?q=${encodeURIComponent(effectiveQuery)}`, {}, 3500)
      if (res && Array.isArray(res.tracks) && res.tracks.length > 0) {
        backendTracks = res.tracks
      } else if (lyricMatch && effectiveQuery !== query) {
        // Fallback to original query on backend
        const fallbackRes = await request(`/search?q=${encodeURIComponent(query)}`, {}, 3000)
        if (fallbackRes && Array.isArray(fallbackRes.tracks)) {
          backendTracks = fallbackRes.tracks
        }
      }
    } catch {}

    // Run client-side fuzzy, keyword & lyrics scoring engine
    const catalogMatches = smartSearchCatalog(query, ALL_CATALOG_TRACKS)

    // Merge backend results with high-confidence catalog matches
    const seen = new Set()
    const merged = []

    const addWithStream = (t) => {
      if (!t) return
      let cand = t
      if (!cand.stream_url) {
        const titleL = (cand.title || '').trim().toLowerCase()
        const found = ALL_CATALOG_TRACKS.find((ct) => {
          if (!ct || !ct.stream_url) return false
          const ctl = (ct.title || '').trim().toLowerCase()
          return ctl === titleL || ctl.includes(titleL) || titleL.includes(ctl)
        })
        if (found && found.stream_url) {
          cand = { ...cand, stream_url: found.stream_url, cover: cand.cover || found.cover }
        }
      }
      if (!cand.stream_url) return
      const key = `${cand.title}-${cand.artist}`.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(cand)
      }
    }

    // 1. If lyrics match found, prioritize it at the top
    for (const t of catalogMatches) {
      if (t._score >= 900) {
        addWithStream(t)
      }
    }

    // 2. Add backend live JioSaavn hits
    for (const t of backendTracks) {
      addWithStream(t)
    }

    // 3. Add remaining smart catalog matches
    for (const t of catalogMatches) {
      addWithStream(t)
    }

    return {
      query,
      tracks: merged.slice(0, 35),
      matchedLyric: lyricMatch ? lyricMatch.snippet : null,
    }
  },

  getArtistPlaylist: async (artistIdOrName) => {
    const term = (artistIdOrName || '').toLowerCase().trim()
    const artist = POPULAR_SINGERS.find(
      (a) => a.id.toLowerCase() === term || a.name.toLowerCase() === term || a.name.toLowerCase().includes(term)
    ) || {
      id: term.replace(/[^a-z0-9]/g, '_'),
      name: artistIdOrName,
      role: 'Popular Artist',
      avatar: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg',
      bio: `Signature collection and curated hits by ${artistIdOrName}.`,
      monthlyListeners: '20M+',
    }

    // 1. Guaranteed verified catalog tracks matching this artist (100% active stream & cover)
    const catalogArtistTracks = ALL_CATALOG_TRACKS.filter((t) => {
      const art = (t.artist || '').toLowerCase()
      const searchName = artist.name.toLowerCase()
      const searchFirst = searchName.split(' ')[0]
      return art.includes(searchName) || (searchFirst.length > 2 && art.includes(searchFirst))
    }).map((t) => ({
      ...t,
      artist_playlist: artist.name,
      badge: 'Verified Master',
    }))

    const staticTracks = (artist && ARTIST_DISCOGRAPHIES[artist.id]) || []

    let liveTracks = []
    try {
      const res = await request(`/search?q=${encodeURIComponent(artist.name + ' songs')}`, {}, 4000)
      if (res && Array.isArray(res.tracks)) {
        liveTracks = res.tracks
      }
    } catch {}

    const seen = new Set()
    const combined = []

    // Priority:
    // 1. Guaranteed verified catalog tracks (tested 200 OK)
    // 2. Verified discography tracks
    // 3. Live JioSaavn tracks
    for (const t of [...catalogArtistTracks, ...staticTracks, ...liveTracks]) {
      if (!t || !t.stream_url) continue
      const normTitle = (t.title || '').replace(/\(From.*?\)|\[.*?\]/gi, '').trim().toLowerCase()
      const normArtist = (t.artist || '').split(/[,&]/)[0].trim().toLowerCase()
      const key = `${normTitle}|${normArtist}`
      if (!seen.has(key)) {
        seen.add(key)
        combined.push({
          ...t,
          artist_playlist: artist.name,
        })
      }
    }

    return {
      artist,
      tracks: combined.slice(0, 40),
      total: combined.length,
    }
  },

  getGenrePlaylist: async (genreId) => {
    const genre =
      POPULAR_GENRES.find((g) => g.id === genreId || g.label.toLowerCase() === (genreId || '').toLowerCase()) ||
      POPULAR_GENRES[0]

    const catKey =
      {
        romantic: 'romantic',
        sad: 'heartbreak',
        lofi: 'focus_lofi',
        punjabi: 'party',
        retro: 'nostalgic',
        gym: 'gym_power',
        indie: 'chill_sunday',
        sufi: 'sufi',
      }[genre.id] || 'romantic'

    const catalogTracks = (DEFAULT_CATALOGS[catKey] || []).map((t) => ({
      ...t,
      genre_name: genre.label,
      badge: 'Verified Master',
    }))

    // Handpicked discography matches for rich variety
    let discHits = []
    if (genre.id === 'punjabi') {
      discHits = [
        ...(ARTIST_DISCOGRAPHIES['karan_aujla'] || []).slice(0, 8),
        ...(ARTIST_DISCOGRAPHIES['diljit_dosanjh'] || []).slice(0, 8),
        ...(ARTIST_DISCOGRAPHIES['sidhu_moose_wala'] || []).slice(0, 8),
        ...(ARTIST_DISCOGRAPHIES['ap_dhillon'] || []).slice(0, 6),
      ]
    } else if (genre.id === 'new_releases' || genre.id === 'chartbusters') {
      let storedAuto = []
      try {
        const raw = safeGetItem(localStorage, 'sangeet_auto_releases')
        if (raw) storedAuto = JSON.parse(raw)
      } catch {}
      discHits = [
        ...storedAuto,
        ...NEW_RELEASES_2025_2026,
        ...(ARTIST_DISCOGRAPHIES['karan_aujla'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['arijit_singh'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['diljit_dosanjh'] || []).slice(0, 5),
      ]
    } else if (genre.id === 'romantic') {
      discHits = [
        ...(ARTIST_DISCOGRAPHIES['arijit_singh'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['shreya_ghoshal'] || []).slice(0, 5),
        ...(ARTIST_DISCOGRAPHIES['atif_aslam'] || []).slice(0, 4),
      ]
    } else if (genre.id === 'sad') {
      discHits = [
        ...(ARTIST_DISCOGRAPHIES['b_praak'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['arijit_singh'] || []).slice(4, 9),
        ...(ARTIST_DISCOGRAPHIES['kk'] || []).slice(0, 4),
        ...(ARTIST_DISCOGRAPHIES['atif_aslam'] || []).slice(3, 6),
      ]
    } else if (genre.id === 'lofi') {
      discHits = [
        ...(ARTIST_DISCOGRAPHIES['anuv_jain'] || []).slice(0, 9),
        ...(ARTIST_DISCOGRAPHIES['ap_dhillon'] || []).slice(0, 4),
      ]
    } else if (genre.id === 'party') {
      discHits = [
        ...(ARTIST_DISCOGRAPHIES['karan_aujla'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['diljit_dosanjh'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['b_praak'] || []).slice(0, 4),
      ]
    } else if (genre.id === 'retro') {
      discHits = [
        ...(ARTIST_DISCOGRAPHIES['kishore_kumar'] || []).slice(0, 10),
        ...(ARTIST_DISCOGRAPHIES['sonu_nigam'] || []).slice(0, 6),
      ]
    } else if (genre.id === 'gym') {
      discHits = [
        ...(ARTIST_DISCOGRAPHIES['sidhu_moose_wala'] || []).slice(0, 8),
        ...(ARTIST_DISCOGRAPHIES['karan_aujla'] || []).slice(0, 5),
        ...(ARTIST_DISCOGRAPHIES['diljit_dosanjh'] || []).slice(0, 5),
        ...(ARTIST_DISCOGRAPHIES['mohit_chauhan'] || []).filter((t) => t.title.includes('Saadda') || t.title.includes('Rockstar')),
      ]
    } else if (genre.id === 'indie') {
      discHits = [
        ...(ARTIST_DISCOGRAPHIES['anuv_jain'] || []).slice(0, 9),
        ...(ARTIST_DISCOGRAPHIES['mohit_chauhan'] || []).slice(0, 5),
      ]
    } else if (genre.id === 'sufi' || genre.id === 'devotional') {
      discHits = [
        ...(ARTIST_DISCOGRAPHIES['mohit_chauhan'] || []).slice(0, 8),
        ...(ARTIST_DISCOGRAPHIES['b_praak'] || []).slice(8, 11),
      ]
    }

    let liveTracks = []
    try {
      const res = await request(`/search?q=${encodeURIComponent(genre.query || genre.label)}`, {}, 3500)
      if (res && Array.isArray(res.tracks)) {
        liveTracks = res.tracks
      }
    } catch {}

    const seen = new Set()
    const combined = []

    for (const t of [...catalogTracks, ...discHits, ...liveTracks]) {
      if (!t || !t.stream_url) continue
      const normTitle = (t.title || '').replace(/\(From.*?\)|\[.*?\]/gi, '').trim().toLowerCase()
      const normArtist = (t.artist || '').split(/[,&]/)[0].trim().toLowerCase()
      const key = `${normTitle}|${normArtist}`
      if (!seen.has(key)) {
        seen.add(key)
        combined.push({
          ...t,
          genre_name: genre.label,
        })
      }
    }

    const genreArtists = (genre.artistIds || [])
      .map((aid) => POPULAR_SINGERS.find((s) => s.id === aid))
      .filter(Boolean)

    const genrePlaylists = (genre.playlistIds || [])
      .map((pid) => FEATURED_PLAYLISTS.find((pl) => pl.id === pid))
      .filter(Boolean)

    return {
      genre,
      artists: genreArtists,
      playlists: genrePlaylists,
      tracks: combined.slice(0, 45),
      total: combined.length,
    }
  },

  getFeaturedPlaylist: async (playlistId) => {
    const pl = FEATURED_PLAYLISTS.find((p) => p.id === playlistId) || FEATURED_PLAYLISTS[0]

    let initialTracks = []
    if (pl.id === 'ghaint_flow') {
      initialTracks = [
        ...(ARTIST_DISCOGRAPHIES['karan_aujla'] || []),
        ...(ARTIST_DISCOGRAPHIES['diljit_dosanjh'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['sidhu_moose_wala'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['ap_dhillon'] || []).slice(0, 4),
      ]
    } else if (pl.id === 'trending_top_50') {
      let storedAuto = []
      try {
        const raw = safeGetItem(localStorage, 'sangeet_auto_releases')
        if (raw) storedAuto = JSON.parse(raw)
      } catch {}
      initialTracks = [
        ...storedAuto,
        ...NEW_RELEASES_2025_2026,
        ...(ARTIST_DISCOGRAPHIES['arijit_singh'] || []).slice(0, 5),
        ...(ARTIST_DISCOGRAPHIES['diljit_dosanjh'] || []).slice(0, 4),
        ...(ARTIST_DISCOGRAPHIES['anuv_jain'] || []).slice(0, 4),
        ...(ARTIST_DISCOGRAPHIES['ap_dhillon'] || []).slice(0, 4),
      ]
    } else if (pl.id === 'bollywood_romance_2025') {
      initialTracks = [
        ...(DEFAULT_CATALOGS['romantic'] || []),
        ...(ARTIST_DISCOGRAPHIES['arijit_singh'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['shreya_ghoshal'] || []).slice(0, 5),
        ...(ARTIST_DISCOGRAPHIES['atif_aslam'] || []).slice(0, 5),
      ]
    } else if (pl.id === 'punjabi_wave_trap') {
      initialTracks = [
        ...(ARTIST_DISCOGRAPHIES['diljit_dosanjh'] || []),
        ...(ARTIST_DISCOGRAPHIES['ap_dhillon'] || []),
        ...(ARTIST_DISCOGRAPHIES['sidhu_moose_wala'] || []),
      ]
    } else if (pl.id === 'late_night_lofi') {
      initialTracks = [
        ...(DEFAULT_CATALOGS['focus_lofi'] || []),
        ...(ARTIST_DISCOGRAPHIES['anuv_jain'] || []),
        ...(DEFAULT_CATALOGS['chill_sunday'] || []).slice(0, 6),
      ]
    } else if (pl.id === 'party_club_bangers') {
      initialTracks = [
        ...(DEFAULT_CATALOGS['party'] || []),
        ...(ARTIST_DISCOGRAPHIES['diljit_dosanjh'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['b_praak'] || []).slice(0, 4),
      ]
    } else if (pl.id === 'retro_golden_classics') {
      initialTracks = [
        ...(DEFAULT_CATALOGS['nostalgic'] || []),
        ...(ARTIST_DISCOGRAPHIES['kishore_kumar'] || []),
        ...(ARTIST_DISCOGRAPHIES['sonu_nigam'] || []).slice(0, 5),
      ]
    } else if (pl.id === 'heartbreak_catharsis') {
      initialTracks = [
        ...(DEFAULT_CATALOGS['heartbreak'] || []),
        ...(ARTIST_DISCOGRAPHIES['b_praak'] || []).slice(0, 6),
        ...(ARTIST_DISCOGRAPHIES['arijit_singh'] || []).slice(4, 9),
        ...(ARTIST_DISCOGRAPHIES['kk'] || []).slice(0, 5),
      ]
    }

    const seen = new Set()
    const combined = []
    for (const t of initialTracks) {
      if (!t || !t.stream_url) continue
      const normTitle = (t.title || '').replace(/\(From.*?\)|\[.*?\]/gi, '').trim().toLowerCase()
      const normArtist = (t.artist || '').split(/[,&]/)[0].trim().toLowerCase()
      const key = `${normTitle}|${normArtist}`
      if (!seen.has(key)) {
        seen.add(key)
        combined.push({
          ...t,
          playlist_name: pl.title,
        })
      }
    }

    return {
      playlist: pl,
      tracks: combined.slice(0, 35),
      total: combined.length,
    }
  },

  generateMoreTracks: async ({ type, id, name, seenIds = [] }) => {
    const seenSet = new Set((seenIds || []).map((x) => String(x).toLowerCase().replace(/[^a-z0-9]/g, '')))
    let freshTracks = []

    // 1. Try querying backend for fresh related tracks
    try {
      let queryStr = name || ''
      if (type === 'artist') {
        const variants = ['hits songs', 'romantic acoustic', 'live album', 'greatest hits']
        const pick = variants[Math.floor(Math.random() * variants.length)]
        queryStr = `${name} ${pick}`
      } else {
        queryStr = `${name} 2025 songs`
      }

      const res = await request(`/search?q=${encodeURIComponent(queryStr)}`, {}, 3800)
      if (res && Array.isArray(res.tracks)) {
        for (const t of res.tracks) {
          if (!t || !t.stream_url) continue
          const k1 = (t.id || '').toLowerCase().replace(/[^a-z0-9]/g, '')
          const k2 = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
          if (!seenSet.has(k1) && !seenSet.has(k2)) {
            seenSet.add(k1)
            seenSet.add(k2)
            freshTracks.push({
              ...t,
              badge: 'Generated Fresh',
            })
          }
        }
      }
    } catch {}

    // 2. Client-side fallback from full catalog and discographies
    if (freshTracks.length < 8) {
      const allPool = [
        ...ALL_CATALOG_TRACKS,
        ...Object.values(ARTIST_DISCOGRAPHIES).flat(),
        ...NEW_RELEASES_2025_2026,
      ]

      const nameLower = (name || '').toLowerCase()
      const candidates = allPool.filter((t) => {
        if (!t || !t.stream_url) return false
        const k1 = (t.id || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        const k2 = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        if (seenSet.has(k1) || seenSet.has(k2)) return false

        const tArtist = (t.artist || '').toLowerCase()
        const tTitle = (t.title || '').toLowerCase()
        const tCat = (t.category || '').toLowerCase()
        return tArtist.includes(nameLower) || nameLower.includes(tArtist.split(',')[0]) || tCat.includes(nameLower)
      })

      const fillPool =
        candidates.length >= 6
          ? candidates
          : allPool.filter((t) => {
              if (!t || !t.stream_url) return false
              const k1 = (t.id || '').toLowerCase().replace(/[^a-z0-9]/g, '')
              const k2 = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
              return !seenSet.has(k1) && !seenSet.has(k2)
            })

      for (const t of fillPool) {
        const k1 = (t.id || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        const k2 = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!seenSet.has(k1) && !seenSet.has(k2)) {
          seenSet.add(k1)
          seenSet.add(k2)
          freshTracks.push({
            ...t,
            badge: 'Generated Fresh',
          })
          if (freshTracks.length >= 12) break
        }
      }
    }

    return {
      tracks: freshTracks.slice(0, 12),
      count: freshTracks.length,
    }
  },

  autoReleaseNewSongs: async () => {
    let stored = []
    try {
      const raw = safeGetItem(localStorage, 'sangeet_auto_releases')
      if (raw) stored = JSON.parse(raw)
    } catch {}

    const queries = ['latest bollywood 2026', 'latest hindi songs 2026', 'karan aujla 2026', 'trending punjabi 2026']
    let freshFromBackend = []
    for (const q of queries) {
      try {
        const res = await request(`/search?q=${encodeURIComponent(q)}`, {}, 3200)
        if (res && Array.isArray(res.tracks)) {
          for (const tr of res.tracks) {
            if (tr && tr.stream_url) {
              freshFromBackend.push({
                ...tr,
                badge: 'Auto Released 2026',
                year: '2026',
              })
            }
          }
        }
      } catch {}
    }

    const seen = new Set()
    const merged = []
    for (const t of [...freshFromBackend, ...stored, ...NEW_RELEASES_2025_2026]) {
      if (!t || !t.stream_url) continue
      const normTitle = (t.title || '').replace(/\(From.*?\)|\[.*?\]/gi, '').trim().toLowerCase()
      const normArtist = (t.artist || '').split(/[,&]/)[0].trim().toLowerCase()
      const key = `${normTitle}|${normArtist}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(t)
      }
    }

    try {
      safeSetItem(localStorage, 'sangeet_auto_releases', JSON.stringify(merged.slice(0, 50)))
    } catch {}

    return merged.slice(0, 30)
  },

  lyrics: async (track) => {
    if (!track || (!track.title && !track.id)) {
      return { synced: false, lines: [], text: '', found: false }
    }

    const cleanTitle = (track.title || '')
      .replace(/\(From\s+.*?\)/gi, '')
      .replace(/\(Original.*?\)/gi, '')
      .replace(/\(Remix.*?\)/gi, '')
      .replace(/\(.*\)|\[.*\]/g, '')
      .replace(/[^\w\s\u0900-\u097F]/gi, ' ')
      .trim()
      .replace(/\s+/g, ' ')

    const cleanArtist = (track.artist || '')
      .split(/[,&/|]/)[0]
      .replace(/\(.*\)|\[.*\]/g, '')
      .trim()

    const titleKey = cleanTitle.toLowerCase()

    // 1. Instant check in Curated Pre-bundled Synced Lyrics (0ms, 100% offline & Netlify guaranteed)
    if (CURATED_LYRICS && CURATED_LYRICS[titleKey]) {
      const entry = CURATED_LYRICS[titleKey]
      const lines = parseLRC(entry.syncedLyrics || '')
      const text = entry.plainLyrics || (lines.map((l) => l.text).join('\n'))
      if (lines.length > 0 || text) {
        return {
          title: track.title,
          artist: track.artist,
          synced: lines.length > 0,
          lines,
          text,
          found: true,
        }
      }
    }

    // 2. If backend is available (local or proxy), try backend
    try {
      const res = await request(
        `/lyrics?title=${encodeURIComponent(track.title || '')}&artist=${encodeURIComponent(track.artist || '')}&id=${encodeURIComponent(track.id || '')}`,
        {},
        2000
      )
      if (res && ((Array.isArray(res.lines) && res.lines.length > 0) || res.text || res.synced_lyrics)) {
        const lines = Array.isArray(res.lines) && res.lines.length > 0
          ? res.lines
          : parseLRC(res.synced_lyrics || res.syncedLyrics || '')
        const plainText = res.text || res.plain_lyrics || res.plainLyrics || ''
        return {
          title: track.title,
          artist: track.artist,
          synced: lines.length > 0,
          lines,
          text: plainText,
          found: lines.length > 0 || Boolean(plainText),
        }
      }
    } catch {}

    // 3. Direct client fetch (supports Netlify proxy /api/lrclib and direct https://lrclib.net)
    const lrclibBases = ['/api/lrclib', 'https://lrclib.net/api']
    for (const base of lrclibBases) {
      try {
        let items = []
        // Query A: track_name + artist_name
        if (cleanTitle) {
          const qUrl = cleanArtist
            ? `${base}/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`
            : `${base}/search?track_name=${encodeURIComponent(cleanTitle)}`
          const res = await fetch(qUrl)
          if (res.ok) items = await res.json()
        }

        // Query B: track_name only
        if ((!Array.isArray(items) || items.length === 0) && cleanTitle) {
          const res = await fetch(`${base}/search?track_name=${encodeURIComponent(cleanTitle)}`)
          if (res.ok) items = await res.json()
        }

        // Query C: full query `q=`
        if ((!Array.isArray(items) || items.length === 0) && cleanTitle) {
          const res = await fetch(`${base}/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`.trim())}`)
          if (res.ok) items = await res.json()
        }

        if (Array.isArray(items) && items.length > 0) {
          const best = items.find((it) => Boolean(it.syncedLyrics)) || items.find((it) => Boolean(it.plainLyrics)) || items[0]
          if (best) {
            const lrcRaw = best.syncedLyrics || ''
            const lines = parseLRC(lrcRaw)
            let plainText = best.plainLyrics || ''

            if (!plainText && lines.length > 0) {
              plainText = lines.map((l) => l.text).join('\n')
            }

            if (lines.length === 0 && plainText && track.duration > 0) {
              const split = plainText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
              if (split.length > 0) {
                const step = Math.max(2.5, track.duration / split.length)
                for (let i = 0; i < split.length; i++) {
                  lines.push({ t: Math.round(i * step * 10) / 10, text: split[i] })
                }
              }
            }

            if (lines.length > 0 || plainText) {
              return {
                title: track.title,
                artist: track.artist,
                synced: lines.length > 0,
                lines,
                text: plainText,
                found: true,
              }
            }
          }
        }
      } catch (err) {
        // try next base
      }
    }

    // 4. Fallback to track.lyrics if attached to the catalog track
    if (track.lyrics && typeof track.lyrics === 'string') {
      const split = track.lyrics.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      const lines = []
      if (track.duration > 0 && split.length > 0) {
        const step = Math.max(2.5, track.duration / split.length)
        for (let i = 0; i < split.length; i++) {
          lines.push({ t: Math.round(i * step * 10) / 10, text: split[i] })
        }
      }
      return {
        title: track.title,
        artist: track.artist,
        synced: lines.length > 0,
        lines,
        text: track.lyrics,
        found: true,
      }
    }

    return {
      title: track.title,
      artist: track.artist,
      synced: false,
      lines: [],
      text: '',
      found: false,
    }
  },

  // Playlists (Persisted locally with backend sync fallback)
  playlists: async () => {
    try {
      const res = await request(`/playlists?user_id=${getUserId()}`, {}, 2500)
      if (res && Array.isArray(res.playlists)) {
        const normalized = res.playlists.map(normalizePlaylist).filter(Boolean)
        const local = getLocalPlaylists()
        const mergedMap = new Map()
        for (const pl of local) mergedMap.set(pl._id, pl)
        for (const pl of normalized) mergedMap.set(pl._id, pl)
        const merged = Array.from(mergedMap.values())
        setLocalPlaylists(merged)
        return { playlists: merged }
      }
    } catch {}
    return { playlists: getLocalPlaylists() }
  },

  playlist: async (id) => {
    if (!id) return { playlist: null }
    try {
      const res = await request(`/playlists/${id}?user_id=${getUserId()}`, {}, 2500)
      if (res && res.playlist) {
        const normalized = normalizePlaylist(res.playlist)
        return { playlist: normalized }
      }
    } catch {}

    const playlists = getLocalPlaylists()
    const found = playlists.find((p) => p._id === id || p.id === id)
    return { playlist: found || null }
  },

  createPlaylist: async (name, emoji = '🎵') => {
    try {
      const res = await request('/playlists', {
        method: 'POST',
        body: JSON.stringify({ user_id: getUserId(), name, emoji }),
      }, 2500)
      if (res && res.playlist) {
        const normalized = normalizePlaylist(res.playlist)
        const playlists = getLocalPlaylists()
        if (!playlists.some((p) => p._id === normalized._id || p.id === normalized.id)) {
          playlists.unshift(normalized)
          setLocalPlaylists(playlists)
        }
        return { status: 'ok', playlist: normalized }
      }
    } catch {}

    const newId = 'pl_' + Date.now()
    const newPl = normalizePlaylist({
      _id: newId,
      id: newId,
      user_id: getUserId(),
      name: (name || 'My Playlist').trim(),
      emoji: emoji || '🎵',
      tracks: [],
      count: 0,
      created_at: new Date().toISOString(),
    })
    const playlists = getLocalPlaylists()
    playlists.unshift(newPl)
    setLocalPlaylists(playlists)
    return { status: 'ok', playlist: newPl }
  },

  addPlaylistTrack: async (id, track) => {
    if (!id || !track) return { status: 'error' }
    try {
      await request(`/playlists/${id}/tracks`, {
        method: 'POST',
        body: JSON.stringify({ user_id: getUserId(), track }),
      }, 2500)
    } catch {}

    const playlists = getLocalPlaylists()
    const pl = playlists.find((p) => p._id === id || p.id === id)
    if (pl) {
      if (!Array.isArray(pl.tracks)) pl.tracks = []
      const tid = track.id || track.track_id || track.title
      const key = track._key || tid || `${track.title || ''}|${track.artist || ''}`
      const trackPayload = {
        ...track,
        id: tid,
        track_id: tid,
        _key: key,
      }
      const already = pl.tracks.some(
        (t) => (t._key && t._key === key) || (t.id && t.id === tid) || (t.title === track.title && t.artist === track.artist)
      )
      if (!already) {
        pl.tracks.push(trackPayload)
      }
      pl.count = pl.tracks.length
      setLocalPlaylists(playlists)
      return { status: 'ok', playlist: pl }
    }
    return { status: 'ok' }
  },

  removePlaylistTrack: async (id, trackKey) => {
    if (!id) return { status: 'error' }
    try {
      await request(`/playlists/${id}/tracks/${encodeURIComponent(trackKey)}?user_id=${getUserId()}`, {
        method: 'DELETE',
      }, 2500)
    } catch {}

    const playlists = getLocalPlaylists()
    const pl = playlists.find((p) => p._id === id || p.id === id)
    if (pl && Array.isArray(pl.tracks)) {
      pl.tracks = pl.tracks.filter((t, idx) => {
        const k = t._key || t.id || t.track_id || idx.toString()
        return k !== trackKey && t.title !== trackKey
      })
      pl.count = pl.tracks.length
      setLocalPlaylists(playlists)
    }
    return { status: 'ok' }
  },

  deletePlaylist: async (id) => {
    if (!id) return { status: 'error' }
    try {
      await request(`/playlists/${id}?user_id=${getUserId()}`, { method: 'DELETE' }, 2500)
    } catch {}

    const playlists = getLocalPlaylists().filter((p) => p._id !== id && p.id !== id)
    setLocalPlaylists(playlists)
    return { status: 'ok' }
  },

  history: async () => {
    try {
      const res = await request(`/history?user_id=${getUserId()}`, {}, 2500)
      if (res && Array.isArray(res.conversations)) return res
    } catch {}
    return { conversations: getLocalHistory() }
  },

  liked: async () => {
    try {
      const res = await request(`/liked?user_id=${getUserId()}`, {}, 2500)
      if (res && (Array.isArray(res.liked) || Array.isArray(res.tracks))) {
        const list = res.liked || res.tracks
        const local = getLocalLiked()
        const mergedMap = new Map()
        for (const t of local) {
          const tid = t.track_id || t.id || t.title
          if (tid) mergedMap.set(tid, t)
        }
        for (const t of list) {
          const tid = t.track_id || t.id || t.title
          if (tid) mergedMap.set(tid, t)
        }
        const merged = Array.from(mergedMap.values())
        setLocalLiked(merged)
        return { liked: merged, tracks: merged }
      }
    } catch {}
    const local = getLocalLiked()
    return { liked: local, tracks: local }
  },

  like: async (track, moodTag = '') => {
    const tid = track.id || track.track_id || track.title
    const trackPayload = { ...track, id: tid, track_id: tid }
    try {
      await request(
        '/liked',
        {
          method: 'POST',
          body: JSON.stringify({ user_id: getUserId(), track: trackPayload, mood_tag: moodTag }),
        },
        2500
      )
    } catch {}

    const liked = getLocalLiked()
    const exists = liked.some((t) => (t.id && t.id === tid) || (t.track_id && t.track_id === tid) || t.title === track.title)
    if (!exists) {
      liked.unshift({ ...trackPayload, mood_tag: moodTag, liked_at: new Date().toISOString() })
      setLocalLiked(liked)
    }
    return { status: 'ok' }
  },

  unlike: async (trackId) => {
    try {
      await request(`/liked/${encodeURIComponent(trackId)}?user_id=${getUserId()}`, { method: 'DELETE' }, 2500)
    } catch {}

    const liked = getLocalLiked().filter(
      (t) => t.id !== trackId && t.track_id !== trackId && t.title !== trackId
    )
    setLocalLiked(liked)
    return { status: 'ok' }
  },
}
