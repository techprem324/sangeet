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
    const plId = playlist._id || playlist.id
    const trackKey = t._key || t.id || t.track_id || t.title
    await api.removePlaylistTrack(plId, trackKey)
    onChanged()
  }

  const del = async () => {
    if (!window.confirm(`Delete “${playlist.name}”? This can't be undone.`)) return
    setBusy(true)
    const plId = playlist._id || playlist.id
    await api.deletePlaylist(plId)
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

      <div className="mb-5 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-ember/30 bg-ember/10 text-2xl sm:text-3xl">
          {playlist.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl sm:text-2xl font-medium text-cream">{playlist.name}</h2>
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
              <TrackCard
                track={t}
                onLyrics={onLyrics}
                queue={tracks}
                onRemove={() => removeTrack(t)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlaylistsView({ user, onLyrics, refreshKey: parentRefresh, onOpenAuth }) {
  const [playlists, setPlaylists] = useState(null)
  const [open, setOpen] = useState(null)
  const [creating, setCreating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const load = () => api.playlists().then((d) => setPlaylists(d.playlists)).catch(() => setPlaylists([]))

  useEffect(() => {
    setOpen(null)
    load()
  }, [refreshKey, parentRefresh, user])

  const openDetail = async (p) => {
    const plId = p._id || p.id
    const d = await api.playlist(plId)
    setOpen(d?.playlist || p)
  }

  if (open) {
    return (
      <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <PlaylistDetail
            playlist={open}
            onBack={() => { setOpen(null); setRefreshKey((n) => n + 1) }}
            onLyrics={onLyrics}
            onChanged={() => {
              const plId = open._id || open.id
              api.playlist(plId).then((d) => setOpen(d?.playlist || open))
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2.5 font-display text-2xl sm:text-3xl font-medium text-cream">
              <PlaylistIcon size={22} className="text-ember" />
              {user ? `${user.name || user.username}’s playlists` : 'My playlists'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-sand-dim">
              {user
                ? 'Your permanent mixes — saved to your account and accessible anytime.'
                : 'Your mixes for this session — sign in to save them permanently to your account.'}
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-full border border-ember/40 bg-ember/10 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-ember transition-colors hover:bg-ember/20"
          >
            <PlusIcon size={14} /> New
          </button>
        </div>

        {!user && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-ember/30 bg-ember/[0.07] px-4 py-3 text-xs sm:text-sm text-sand-dim shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember/20 text-xs text-ember font-bold">👤</span>
              <span>
                <strong className="font-semibold text-cream">Guest Mode:</strong> Playlists created in this session are temporary and won’t be saved for future visits.
              </span>
            </div>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="shrink-0 rounded-full border border-ember/50 bg-ember px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm transition-all hover:brightness-110"
              >
                Sign in to save playlists
              </button>
            )}
          </div>
        )}

        {playlists === null ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 sm:h-32 rounded-xl2 cover-loading" />)}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {playlists.map((p) => {
              const plId = p._id || p.id
              const count = p.count ?? p.tracks?.length ?? 0
              return (
                <button
                  key={plId}
                  onClick={() => openDetail(p)}
                  className="group rounded-xl2 border border-edge-soft bg-surface p-3 sm:p-4 text-left transition-all hover:-translate-y-0.5 hover:border-ember/40 hover:shadow-card"
                >
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border border-ember/25 bg-ember/[0.08] text-xl sm:text-2xl">
                    {p.emoji || '🎵'}
                  </div>
                  <div className="mt-2.5 sm:mt-3 truncate text-sm font-semibold text-cream">{p.name}</div>
                  <div className="mt-0.5 text-xs text-sand-dim">{count} songs</div>
                </button>
              )
            })}
            <button
              onClick={() => setCreating(true)}
              className="flex min-h-[96px] sm:min-h-[104px] items-center justify-center rounded-xl2 border border-dashed border-edge text-sand-dim transition-colors hover:border-ember/40 hover:text-ember p-3 text-center"
            >
              <span className="flex items-center gap-1.5 text-xs sm:text-sm"><PlusIcon size={15} /> New playlist</span>
            </button>
          </div>
        )}
      </div>

      {creating && <CreateModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); setRefreshKey((n) => n + 1) }} />}
    </div>
  )
}
