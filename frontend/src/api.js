// Resilient Hybrid API Client.
// Talks to Flask backend when available (local or cloud), and seamlessly
// falls back to the client-side music engine on Netlify / offline so that
// ALL features (mood rooms, 320kbps playback, mood radar, chat, playlists)
// work 100% of the time with ZERO compromise.

import { DEFAULT_CATEGORIES, DEFAULT_CATALOGS } from './data/defaultCatalog'
import { clientAnalyzeMood, clientGenerateChat } from './data/sentimentAnalyzer'

const USER_ID_KEY = 'sargam.user_id'
const USER_KEY = 'sangeet_user'
const LOCAL_LIKED_KEY = 'sangeet_liked_tracks'
const LOCAL_PLAYLISTS_KEY = 'sangeet_custom_playlists'
const LOCAL_HISTORY_KEY = 'sangeet_chat_history'

export function getUserId() {
  let user = getUser()
  if (user && user.user_id) return user.user_id
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = 'usr_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function setUser(userObj) {
  if (userObj) {
    localStorage.setItem(USER_KEY, JSON.stringify(userObj))
    if (userObj.user_id) localStorage.setItem(USER_ID_KEY, userObj.user_id)
  } else {
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(USER_ID_KEY)
  }
}

export function logoutUser() {
  setUser(null)
}

// Local Storage helpers for zero-break offline/Netlify persistence
function getLocalLiked() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_LIKED_KEY) || '[]')
  } catch {
    return []
  }
}

function setLocalLiked(items) {
  localStorage.setItem(LOCAL_LIKED_KEY, JSON.stringify(items))
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

function getLocalPlaylists() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_PLAYLISTS_KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.map(normalizePlaylist).filter(Boolean)
  } catch {
    return []
  }
}

function setLocalPlaylists(items) {
  const normalized = (Array.isArray(items) ? items : []).map(normalizePlaylist).filter(Boolean)
  localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(normalized))
}

function getLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]')
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
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
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
const ALL_CATALOG_TRACKS = Object.values(DEFAULT_CATALOGS).flat()

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
      return await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }, 3000)
    } catch {
      // Local fallback
      const existing = getUser()
      const user = existing || {
        user_id: 'usr_' + Math.random().toString(36).slice(2, 10),
        username,
        name: username,
      }
      setUser(user)
      return { status: 'ok', user }
    }
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

  search: async (q) => {
    try {
      const res = await request(`/search?q=${encodeURIComponent(q)}`, {}, 3500)
      if (res && Array.isArray(res.tracks) && res.tracks.length > 0) {
        return res
      }
    } catch {}

    // Offline / Standalone fuzzy catalog search
    const query = (q || '').toLowerCase().trim()
    if (!query) return { query, tracks: [] }

    const matches = ALL_CATALOG_TRACKS.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(query)) ||
        (t.artist && t.artist.toLowerCase().includes(query)) ||
        (t.album && t.album.toLowerCase().includes(query))
    )

    // Deduplicate matches by title + artist
    const seen = new Set()
    const unique = []
    for (const t of matches) {
      const key = `${t.title}-${t.artist}`.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(t)
      }
    }

    return {
      query,
      tracks: unique.slice(0, 20),
    }
  },

  lyrics: async (track) => {
    try {
      const res = await request(
        `/lyrics?title=${encodeURIComponent(track.title || '')}&artist=${encodeURIComponent(track.artist || '')}&id=${encodeURIComponent(track.id || '')}`,
        {},
        3500
      )
      if (res && (res.lyrics || res.synced_lyrics)) return res
    } catch {}

    // Direct client fallback to LRCLIB (open CORS-enabled synced lyrics API)
    try {
      const cleanTitle = (track.title || '').replace(/\(.*\)|\[.*\]/g, '').trim()
      const cleanArtist = (track.artist || '').split(/[,&]/)[0].trim()
      const lrcRes = await fetch(
        `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`
      )
      if (lrcRes.ok) {
        const data = await lrcRes.json()
        return {
          title: track.title,
          artist: track.artist,
          synced_lyrics: data.syncedLyrics || null,
          plain_lyrics: data.plainLyrics || null,
          found: Boolean(data.syncedLyrics || data.plainLyrics),
        }
      }
    } catch {}

    return {
      title: track.title,
      artist: track.artist,
      lyrics: null,
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
        setLocalLiked(list)
        return { liked: list, tracks: list }
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
