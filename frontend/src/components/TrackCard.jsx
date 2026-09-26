import { useEffect, useRef, useState } from 'react'
import { useAudio } from '../store/audio'
import { api } from '../api'
import {
  HeartIcon, HeartFilledIcon, LyricsIcon, MusicIcon, PlayIcon, PauseIcon,
  QueueIcon, PlaylistIcon, PlusIcon, DotsIcon, TrashIcon,
} from './icons'

function fmtTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// A song row used everywhere (chat replies, playlists, search, liked).
export default function TrackCard({ track, moodTag = '', onLyrics, queue, showPlaylist = true, onRemove }) {
  const audio = useAudio()
  const [liked, setLiked] = useState(null)
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [plMode, setPlMode] = useState(false)
  const [playlists, setPlaylists] = useState(null)
  const [plAdded, setPlAdded] = useState('')
  const menuRef = useRef(null)

  const isCurrent = audio.current?.track && (audio.current.track.id || audio.current.track.title) === (track.id || track.title)
  const isPlaying = isCurrent && audio.playing
  const cover = audio.fallbackCover(track)

  useEffect(() => {
    let alive = true
    api.liked()
      .then((data) => {
        if (!alive) return
        const ids = new Set(data.liked.map((l) => l.track_id))
        setLiked(ids.has(track.id || track.title))
      })
      .catch(() => alive && setLiked(false))
    return () => { alive = false }
  }, [track.id, track.title])

  // close the overflow menu on outside click / escape
  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  const toggleLike = async (e) => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      if (liked) { await api.unlike(track.id || track.title); setLiked(false) }
      else { await api.like(track, moodTag); setLiked(true) }
    } catch { /* ignore */ }
    setBusy(false)
  }

  const addToQueue = () => {
    const q = audio.current?.queue ? [...audio.current.queue, track] : [audio.current?.track, track].filter(Boolean)
    if (audio.current?.track) audio.playTrack(audio.current.track, q)
    else audio.playTrack(track, q)
    setMenuOpen(false)
  }

  const openMenu = () => {
    setMenuOpen((s) => !s)
    setPlMode(false)
  }

  const openPlaylists = async () => {
    setPlMode(true)
    try { setPlaylists((await api.playlists()).playlists || []) } catch { setPlaylists([]) }
  }

  const addToPlaylist = async (pl) => {
    const plId = pl._id || pl.id
    await api.addPlaylistTrack(plId, track)
    setPlAdded(pl.name)
    setTimeout(() => { setPlAdded(''); setMenuOpen(false) }, 900)
  }

  const quickCreate = async () => {
    const name = window.prompt('Name your new playlist:')
    if (!name) return
    const d = await api.createPlaylist(name)
    const plId = d?.playlist?._id || d?.playlist?.id
    if (plId) {
      await api.addPlaylistTrack(plId, track)
    }
    setPlAdded(name)
    setTimeout(() => { setPlAdded(''); setMenuOpen(false) }, 900)
  }

  const play = () => {
    audio.playTrack(track, queue || audio.current?.queue || [track])
  }

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl2 border px-3 py-2.5 transition-colors duration-150 ${
        isCurrent ? 'border-ember/40 bg-ember/[0.07]' : 'border-edge-soft bg-surface/60 hover:bg-surface-2/70'
      }`}
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
        {cover.startsWith('data:') || !cover ? (
          <div className="flex h-full w-full items-center justify-center bg-surface-3 text-sand-dim"><MusicIcon size={18} /></div>
        ) : (
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}
        <button
          onClick={play}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="absolute inset-0 flex items-center justify-center bg-black/45 text-cream opacity-0 transition-opacity group-hover:opacity-100"
        >
          {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </button>
        {isPlaying && (
          <div className="absolute bottom-1 right-1 flex items-end gap-[2px]">
            <span className="eq-bar h-2.5" style={{ animation: 'eq-1 0.9s ease-in-out infinite' }} />
            <span className="eq-bar h-2.5" style={{ animation: 'eq-2 1.1s ease-in-out infinite' }} />
            <span className="eq-bar h-2.5" style={{ animation: 'eq-3 0.8s ease-in-out infinite' }} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 cursor-pointer select-none" onClick={play} role="button" tabIndex={0}>
        <div className="truncate text-sm font-semibold text-cream transition-colors group-hover:text-ember">{track.title}</div>
        <div className="truncate text-xs text-sand-dim">{track.artist}</div>
      </div>

      <button
        onClick={toggleLike}
        title={liked ? 'Remove from your songs' : 'Save to your songs'}
        className={`icon-btn h-8 w-8 shrink-0 ${liked ? 'text-rose' : ''}`}
      >
        {liked ? <HeartFilledIcon size={16} /> : <HeartIcon size={16} />}
      </button>

      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          title="Remove from playlist"
          className="icon-btn h-8 w-8 shrink-0 text-sand-dim/60 hover:text-rose"
        >
          <TrashIcon size={14} />
        </button>
      )}

      {track.duration > 0 && <span className="hidden w-10 text-right text-xs tabular-nums text-sand-dim md:block shrink-0">{fmtTime(track.duration)}</span>}

      {showPlaylist && track.stream_url && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={openMenu}
            aria-label="More actions"
            title="More actions"
            className={`icon-btn h-8 w-8 ${menuOpen ? 'text-ember' : ''}`}
          >
            <DotsIcon size={17} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-40 w-52 max-w-[calc(100vw-2.5rem)] rounded-xl2 border border-edge bg-coal p-2 shadow-soft">
              {!plMode ? (
                <>
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-sand-dim">Actions</div>
                  {onLyrics && (
                    <button
                      onClick={() => { setMenuOpen(false); onLyrics(track) }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-xs text-sand transition-colors hover:bg-surface-2 hover:text-cream"
                    >
                      <LyricsIcon size={15} /> Lyrics
                    </button>
                  )}
                  <button
                    onClick={addToQueue}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-xs text-sand transition-colors hover:bg-surface-2 hover:text-cream"
                  >
                    <QueueIcon size={15} /> Add to queue
                  </button>
                  <button
                    onClick={openPlaylists}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-xs text-sand transition-colors hover:bg-surface-2 hover:text-cream"
                  >
                    <PlaylistIcon size={15} /> Add to playlist
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-sand-dim">
                      {plAdded ? `Added ✓` : 'Choose playlist'}
                    </span>
                    <button onClick={openMenu} className="icon-btn h-5 w-5 text-sand-dim"><DotsIcon size={12} /></button>
                  </div>
                  <div className="max-h-44 space-y-0.5 overflow-y-auto">
                    {playlists?.map((pl) => {
                      const plId = pl._id || pl.id
                      const count = pl.count ?? pl.tracks?.length ?? 0
                      return (
                        <button
                          key={plId}
                          onClick={() => addToPlaylist(pl)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-sand transition-colors hover:bg-surface-2 hover:text-cream"
                        >
                          <span>{pl.emoji || '🎵'}</span>
                          <span className="min-w-0 flex-1 truncate">{pl.name}</span>
                          <span className="text-sand-dim">{count}</span>
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={quickCreate}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-edge-soft px-2 py-2 text-xs font-medium text-ember transition-colors hover:bg-surface-2"
                  >
                    <PlusIcon size={13} /> New playlist
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
