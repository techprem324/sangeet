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
import LibraryView from './components/LibraryView'
import MiniPlayer from './components/MiniPlayer'
import BottomNav from './components/BottomNav'
import LyricsModal from './components/LyricsModal'
import AuthModal from './components/AuthModal'

import { LogoMark } from './components/Logo'

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
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <Sidebar
          view={view}
          onView={setView}
          onPill={handlePill}
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
        />

        <main className="flex min-w-0 flex-1 flex-col bg-ink/40">
          {/* Mobile top header: Logo on left, Profile avatar on right (clean & uncrowded) */}
          <header className="border-b border-edge-soft bg-coal/85 backdrop-blur-md lg:hidden shrink-0">
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <button
                onClick={() => setView('home')}
                className="flex items-center gap-2 text-left focus:outline-none"
              >
                <LogoMark size={26} />
                <span className="font-display text-lg font-medium tracking-tight text-cream">Sangeet</span>
                <span className="hidden text-[10px] italic text-ember/80 sm:inline">— dil se zuba tak</span>
              </button>

              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-edge/80 bg-surface px-2.5 py-1 text-xs font-medium text-cream shadow-sm hover:border-ember/40 hover:bg-surface-2 transition-colors"
                aria-label="Account Settings"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ember/20 text-[10px] font-bold text-ember border border-ember/30">
                  {user ? (user.name || user.username || 'U')[0].toUpperCase() : '👤'}
                </span>
                <span className="max-w-[90px] truncate text-[11px]">
                  {user ? user.name || user.username : 'Sign In'}
                </span>
              </button>
            </div>
          </header>

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

            {/* Desktop & Mobile Library Views */}
            {view === 'playlists' && (
              <div className="h-full">
                <div className="hidden lg:block h-full">
                  <PlaylistsView
                    user={user}
                    onLyrics={openLyrics}
                    refreshKey={likedRefresh}
                    onOpenAuth={() => setShowAuthModal(true)}
                  />
                </div>
                <div className="lg:hidden h-full">
                  <LibraryView
                    user={user}
                    onLyrics={openLyrics}
                    refreshKey={likedRefresh}
                    onOpenAuth={() => setShowAuthModal(true)}
                  />
                </div>
              </div>
            )}
            {view === 'liked' && (
              <div className="h-full">
                <div className="hidden lg:block h-full">
                  <LikedView
                    user={user}
                    onLyrics={openLyrics}
                    refreshKey={likedRefresh}
                    onOpenAuth={() => setShowAuthModal(true)}
                  />
                </div>
                <div className="lg:hidden h-full">
                  <LibraryView
                    user={user}
                    onLyrics={openLyrics}
                    refreshKey={likedRefresh}
                    onOpenAuth={() => setShowAuthModal(true)}
                  />
                </div>
              </div>
            )}
            {view === 'library' && (
              <LibraryView
                user={user}
                onLyrics={openLyrics}
                refreshKey={likedRefresh}
                onOpenAuth={() => setShowAuthModal(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Audio Player (Desktop bottom dock + Mobile floating mini-player & expanded player) */}
      <MiniPlayer onLyrics={openLyrics} onLikedChange={() => setLikedRefresh((n) => n + 1)} />

      {/* Spotify-Style Fixed Bottom Navigation Bar (Mobile / Tablet Only) */}
      <BottomNav view={view} onView={setView} />

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
