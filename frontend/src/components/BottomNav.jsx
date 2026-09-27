import { HomeIcon, ChatIcon, CompassIcon, SearchIcon, LibraryIcon } from './icons'

export default function BottomNav({ view, onView }) {
  const tabs = [
    {
      key: 'home',
      label: 'Home',
      icon: HomeIcon,
      isActive: view === 'home',
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: ChatIcon,
      isActive: view === 'chat',
    },
    {
      key: 'browse',
      label: 'Mood Rooms',
      icon: CompassIcon,
      isActive: view === 'browse',
    },
    {
      key: 'search',
      label: 'Search',
      icon: SearchIcon,
      isActive: view === 'search',
    },
    {
      key: 'library',
      label: 'Library',
      icon: LibraryIcon,
      isActive: view === 'library' || view === 'playlists' || view === 'liked',
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-edge-soft/80 bg-coal/95 backdrop-blur-xl lg:hidden shadow-2xl pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5"
      role="navigation"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = tab.isActive
          return (
            <button
              key={tab.key}
              onClick={() => onView(tab.key)}
              className={`flex flex-col items-center justify-center py-1 transition-all select-none ${
                active
                  ? 'text-ember font-semibold scale-105'
                  : 'text-sand-dim hover:text-cream active:scale-95'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  active ? 'bg-ember/15 text-ember' : 'text-current'
                }`}
              >
                <Icon size={19} />
              </div>
              <span className="mt-0.5 text-[10px] tracking-tight truncate max-w-[62px]">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
