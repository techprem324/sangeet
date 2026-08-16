import { useCallback, useRef, useState, useEffect } from 'react'
import { api, getUser } from './api'
import { VIEWS } from './data/moods'
import Sidebar from './components/Sidebar'
import HomeView from './components/HomeView'
import ChatView from './components/ChatView'
import BrowseView from './components/BrowseView'
import SearchView from './components/SearchView'
import PlaylistsView from './components/PlaylistsView'
import LikedView from './components/LikedView'
import MiniPlayer from './components/MiniPlayer'
import LyricsModal from './components/LyricsModal'
import AuthModal from './components/AuthModal'

export default function App() {
  const [view, setView] = useState('home')
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const [lyricsTrack, setLyricsTrack] = useState(null)
  const [selectedCat, setSelectedCat] = useState(null)
  const [likedRefresh, setLikedRefresh] = useState(0)
  const [user, setUserState] = useState(getUser())
  const [showAuthModal, setShowAuthModal] = useState(false)
  const busyRef = useRef(false)

  const sendChat = useCallback(async (text, moodHint = '') => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setMessages((m) => [...m, { role: 'user', text }])
    setView('chat')
    try {
      const data = await api.chat(text, moodHint)
      setMessages((m) => [...m, { role: 'ai', ...data }])
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          reply: `Something went wrong: ${err.message}. Is the backend running on :5000?`,
          tracks: [],
          mood: null,
        },
      ])
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [])

  const handlePill = useCallback(
    (pill) => {
      sendChat(pill.prompt, pill.key)
    },
    [sendChat]
  )

  const openLyrics = useCallback((track) => setLyricsTrack(track), [])

  const handleAuthChange = (newUser) => {
    setUserState(newUser)
    setLikedRefresh((n) => n + 1)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <Sidebar
          view={view}
          onView={setView}
          onPill={handlePill}
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
        />

        <main className="flex min-w-0 flex-1 flex-col bg-ink/40">
          {/* mobile top nav (sidebar is hidden below lg) */}
          <nav className="flex items-center justify-between border-b border-edge-soft bg-coal/70 px-3 py-2 lg:hidden">
            <div className="flex items-center gap-1 overflow-x-auto">
              {VIEWS.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    view === v.key ? 'bg-ember/15 text-cream' : 'text-sand-dim hover:text-cream'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="ml-2 flex shrink-0 items-center justify-center rounded-full bg-ember/20 px-2.5 py-1 text-xs font-bold text-ember border border-ember/30"
            >
              {user ? (user.name || user.username || 'U')[0].toUpperCase() : '👤'}
            </button>
          </nav>

          <div className="min-h-0 flex-1">
            {view === 'home' && (
              <HomeView
                onView={setView}
                onSend={sendChat}
                onPill={handlePill}
                user={user}
                onOpenAuth={() => setShowAuthModal(true)}
              />
            )}
            {view === 'chat' && (
              <ChatView messages={messages} busy={busy} onSend={sendChat} onLyrics={openLyrics} onPill={handlePill} />
            )}
            {view === 'browse' && (
              <BrowseView
                selected={selectedCat}
                onOpenCategory={(cat) => {
                  if (!cat || typeof cat !== 'object' || !cat.category) {
                    setSelectedCat(null)
                  } else {
                    setSelectedCat(cat)
                  }
                  setView('browse')
                }}
                onLyrics={openLyrics}
              />
            )}
            {view === 'search' && <SearchView onLyrics={openLyrics} />}
            {view === 'playlists' && <PlaylistsView onLyrics={openLyrics} />}
            {view === 'liked' && <LikedView onLyrics={openLyrics} refreshKey={likedRefresh} />}
          </div>
        </main>
      </div>

      <MiniPlayer onLyrics={openLyrics} onLikedChange={() => setLikedRefresh((n) => n + 1)} />

      {lyricsTrack && <LyricsModal track={lyricsTrack} onClose={() => setLyricsTrack(null)} />}
      {showAuthModal && (
        <AuthModal
          user={user}
          onAuthChange={handleAuthChange}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}
