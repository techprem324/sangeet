// Thin API client. Vite proxies /api -> http://127.0.0.1:5000 in dev.

const USER_ID_KEY = 'sargam.user_id'
const USER_KEY = 'sangeet_user'

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

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const url = API_BASE ? `${API_BASE}/api${path}` : `/api${path}`
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export const api = {
  // Auth
  register: (username, email, password, name = '') =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, name }),
    }),

  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Core & Music
  chat: (prompt, moodHint = '') =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, user_id: getUserId(), mood_hint: moodHint }),
    }),

  analyze: (prompt, moodHint = '') =>
    request('/mood', {
      method: 'POST',
      body: JSON.stringify({ prompt, mood_hint: moodHint }),
    }),

  categories: () => request('/categories'),
  catalog: (category, limit = 30) =>
    request(`/catalog?category=${encodeURIComponent(category)}&limit=${limit}`),
  explore: (category, count = 24) =>
    request('/explore', { method: 'POST', body: JSON.stringify({ category, count }) }),

  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  lyrics: (track) =>
    request(`/lyrics?title=${encodeURIComponent(track.title || '')}&artist=${encodeURIComponent(track.artist || '')}&id=${encodeURIComponent(track.id || '')}`),

  // Playlists
  playlists: () => request(`/playlists?user_id=${getUserId()}`),
  playlist: (id) => request(`/playlists/${id}?user_id=${getUserId()}`),
  createPlaylist: (name, emoji = '🎵') =>
    request('/playlists', { method: 'POST', body: JSON.stringify({ user_id: getUserId(), name, emoji }) }),
  addPlaylistTrack: (id, track) =>
    request(`/playlists/${id}/tracks`, { method: 'POST', body: JSON.stringify({ user_id: getUserId(), track }) }),
  removePlaylistTrack: (id, trackKey) =>
    request(`/playlists/${id}/tracks/${encodeURIComponent(trackKey)}?user_id=${getUserId()}`, { method: 'DELETE' }),
  deletePlaylist: (id) =>
    request(`/playlists/${id}?user_id=${getUserId()}`, { method: 'DELETE' }),

  history: () => request(`/history?user_id=${getUserId()}`),
  liked: () => request(`/liked?user_id=${getUserId()}`),
  like: (track, moodTag = '') =>
    request('/liked', {
      method: 'POST',
      body: JSON.stringify({ user_id: getUserId(), track, mood_tag: moodTag }),
    }),
  unlike: (trackId) => request(`/liked/${encodeURIComponent(trackId)}?user_id=${getUserId()}`, { method: 'DELETE' }),
}
