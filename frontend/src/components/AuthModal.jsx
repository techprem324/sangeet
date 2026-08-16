import { useState } from 'react'
import { api, setUser, logoutUser } from '../api'

export default function AuthModal({ user, onAuthChange, onClose }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await api.login(username, password)
        setUser(res.user)
        onAuthChange(res.user)
        onClose()
      } else {
        const res = await api.register(username, email, password, name)
        setUser(res.user)
        onAuthChange(res.user)
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (demoUser, demoPass, demoName) => {
    setError('')
    setLoading(true)
    try {
      try {
        const res = await api.login(demoUser, demoPass)
        setUser(res.user)
        onAuthChange(res.user)
        onClose()
      } catch {
        // Register demo user if not created yet
        const res = await api.register(demoUser, `${demoUser}@sangeet.app`, demoPass, demoName)
        setUser(res.user)
        onAuthChange(res.user)
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logoutUser()
    onAuthChange(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-edge-soft bg-surface p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-sand-dim transition-colors hover:bg-surface-2 hover:text-cream"
        >
          ✕
        </button>

        {user ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ember/20 text-2xl font-bold text-ember border border-ember/30">
              {(user.name || user.username || 'U')[0].toUpperCase()}
            </div>
            <h2 className="mt-3 text-xl font-semibold text-cream">{user.name || user.username}</h2>
            <p className="text-xs text-sand-dim">@{user.username} {user.email ? `• ${user.email}` : ''}</p>

            <div className="mt-4 rounded-xl border border-edge-soft bg-coal/40 p-3 text-xs text-sand-dim leading-relaxed">
              ✨ Signed in — Your custom playlists, saved songs, and AI chat history are synced and accessible anytime.
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 w-full rounded-xl border border-ember/40 bg-ember/10 py-2.5 text-sm font-semibold text-cream transition-all hover:bg-ember/20"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 text-center">
              <h2 className="font-display text-2xl text-cream">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="mt-1 text-xs text-sand-dim">
                {mode === 'login'
                  ? 'Sign in to access your saved playlists and chat history'
                  : 'Join Sangeet to save your favorite songs & custom playlists'}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-sand-dim mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prem Srivastava"
                    className="w-full rounded-xl border border-edge bg-coal/60 px-3.5 py-2.5 text-sm text-cream placeholder-sand-dim/60 outline-none focus:border-ember/60"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-sand-dim mb-1">
                  Username {mode === 'register' ? '' : 'or Email'}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. prem"
                  className="w-full rounded-xl border border-edge bg-coal/60 px-3.5 py-2.5 text-sm text-cream placeholder-sand-dim/60 outline-none focus:border-ember/60"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-sand-dim mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prem@example.com"
                    className="w-full rounded-xl border border-edge bg-coal/60 px-3.5 py-2.5 text-sm text-cream placeholder-sand-dim/60 outline-none focus:border-ember/60"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-sand-dim mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-edge bg-coal/60 px-3.5 py-2.5 text-sm text-cream placeholder-sand-dim/60 outline-none focus:border-ember/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-ember py-2.5 text-sm font-semibold text-ink shadow-glow transition-transform active:scale-98 hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="mt-5 border-t border-edge-soft pt-4">
              <div className="text-center text-[10px] uppercase tracking-widest text-sand-dim mb-2.5">
                Or Quick Demo Access
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('prem', 'prem123', 'Prem Srivastava')}
                  className="rounded-xl border border-edge bg-coal/40 py-2 text-xs font-medium text-sand hover:border-ember/50 hover:text-cream"
                >
                  ⚡ Sign in as Prem
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('alex', 'alex123', 'Alex Morgan')}
                  className="rounded-xl border border-edge bg-coal/40 py-2 text-xs font-medium text-sand hover:border-ember/50 hover:text-cream"
                >
                  🎧 Sign in as Alex
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-sand-dim">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setMode('register')} className="font-medium text-ember underline">
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="font-medium text-ember underline">
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
