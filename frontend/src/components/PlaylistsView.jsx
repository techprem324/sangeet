import { useEffect, useState } from 'react'
import { api, getUserId } from '../api'
import { useAudio } from '../store/audio'
import TrackCard from './TrackCard'
import {
  PlaylistIcon, PlusIcon, TrashIcon, PlayIcon, ChevronIcon, MusicIcon, XIcon,
} from './icons'

const EMOJIS = ['🎵', '🌙', '🔥', '💔', '❤️', '🌧️', '☕', '🚗', '🏋️', '🎉', '🌿', '🧘', '🪩', '📖']

function CreateModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎵')
  const [busy, setBusy] = useState(false)

  const create = async () => {
    if (!name.trim() || busy) return
    setBusy(true)
    try {
      const d = await api.createPlaylist(name.trim(), emoji)
      onCreated(d.playlist)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="panel relative w-full max-w-sm !bg-coal p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl font-medium text-cream">New playlist</h3>
          <button onClick={onClose} className="icon-btn h-8 w-8"><XIcon size={16} /></button>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && create()}
          placeholder="Name it — e.g. “Rainy Night Drive”"
          className="w-full rounded-xl2 border border-edge bg-surface px-4 py-2.5 text-[15px] text-cream outline-none placeholder:text-sand-dim/70 focus:border-ember/50"
          autoFocus
        />
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-sand-dim">Pick a face</div>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors ${
                  emoji === e ? 'border-ember/60 bg-ember/10' : 'border-edge-soft hover:border-ember/30'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={create}
          disabled={!name.trim() || busy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl2 bg-ember px-4 py-2.5 text-sm font-semibold text-ink transition-all hover:brightness-110 disabled:opacity-40"
        >
          <PlusIcon size={15} /> Create playlist
        </button>
      </div>
    </div>
  )
}

function PlaylistDetail({ playlist, onBack, onLyrics, onChanged }) {
  const audio = useAudio()
  const [busy, setBusy] = useState(false)
  const tracks = playlist.tracks || []

  const removeTrack = async (t) => {
    await api.removePlaylistTrack(playlist._id, t._key)
    onChanged()
  }

  const del = async () => {
    if (!window.confirm(`Delete “${playlist.name}”? This can't be undone.`)) return
    setBusy(true)
    await api.deletePlaylist(playlist._id)
    onChanged()
    onBack()
  }

  const playAll = () => {
    if (tracks.length) audio.playTrack(tracks[0], tracks)
  }

  return (
    <div className="msg-in">
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-xs font-medium text-sand-dim transition-colors hover:text-cream">
        <ChevronIcon size={14} className="rotate-180" /> my playlists
      </button>

      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ember/30 bg-ember/10 text-3xl">
          {playlist.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-2xl font-medium text-cream">{playlist.name}</h2>
          <p className="mt-0.5 text-xs text-sand-dim">{tracks.length} songs · plays in this exact order</p>
        </div>
        <div className="flex items-center gap-2">
          {tracks.length > 0 && (
            <button onClick={playAll} className="flex items-center gap-1.5 rounded-full bg-ember px-3.5 py-2 text-xs font-semibold text-ink transition-transform hover:scale-105">
              <PlayIcon size={13} /> Play all
            </button>
          )}
          <button onClick={del} disabled={busy} title="Delete playlist" className="icon-btn h-9 w-9 text-sand-dim hover:text-rose">
            <TrashIcon size={16} />
          </button>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="py-14 text-center">
          <MusicIcon size={30} className="mx-auto text-sand-dim/40" />
          <p className="mt-3 text-sm text-sand-dim">Empty for now — tap the ➕ on any song and pick this playlist.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tracks.map((t, i) => (
            <div key={t._key || i} className="relative">
              <span className="absolute -left-6 top-1/2 z-10 hidden -translate-y-1/2 text-xs tabular-nums text-sand-dim sm:block">{i + 1}</span>
              <TrackCard track={t} onLyrics={onLyrics} queue={tracks} />
              <button
                onClick={() => removeTrack(t)}
                title="Remove from playlist"
                className="icon-btn absolute right-12 top-1/2 h-7 w-7 -translate-y-1/2 text-sand-dim/60 hover:text-rose"
              >
                <XIcon size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlaylistsView({ onLyrics }) {
  const [playlists, setPlaylists] = useState(null)
  const [open, setOpen] = useState(null)
  const [creating, setCreating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const load = () => api.playlists().then((d) => setPlaylists(d.playlists)).catch(() => setPlaylists([]))

  useEffect(() => { load() }, [refreshKey])

  const openDetail = async (p) => {
    const d = await api.playlist(p._id)
    setOpen(d.playlist)
  }

  if (open) {
    return (
      <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <PlaylistDetail
            playlist={open}
            onBack={() => { setOpen(null); setRefreshKey((n) => n + 1) }}
            onLyrics={onLyrics}
            onChanged={() => api.playlist(open._id).then((d) => setOpen(d.playlist))}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 font-display text-3xl font-medium text-cream">
              <PlaylistIcon size={22} className="text-ember" /> My playlists
            </h1>
            <p className="mt-1.5 text-sm text-sand-dim">Your own mixes — songs play exactly in the order you arranged them.</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-full border border-ember/40 bg-ember/10 px-4 py-2 text-sm font-medium text-ember transition-colors hover:bg-ember/20"
          >
            <PlusIcon size={15} /> New
          </button>
        </div>

        {playlists === null ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-xl2 cover-loading" />)}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {playlists.map((p) => (
              <button
                key={p._id}
                onClick={() => openDetail(p)}
                className="group rounded-xl2 border border-edge-soft bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-ember/40 hover:shadow-card"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-ember/25 bg-ember/[0.08] text-2xl">
                  {p.emoji}
                </div>
                <div className="mt-3 truncate text-sm font-semibold text-cream">{p.name}</div>
                <div className="mt-0.5 text-xs text-sand-dim">{p.count} songs</div>
              </button>
            ))}
            <button
              onClick={() => setCreating(true)}
              className="flex min-h-[104px] items-center justify-center rounded-xl2 border border-dashed border-edge text-sand-dim transition-colors hover:border-ember/40 hover:text-ember"
            >
              <span className="flex items-center gap-1.5 text-sm"><PlusIcon size={15} /> New playlist</span>
            </button>
          </div>
        )}
      </div>

      {creating && <CreateModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); setRefreshKey((n) => n + 1) }} />}
    </div>
  )
}
