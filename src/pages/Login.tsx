import { useState } from 'react'
import { Dumbbell, Lock, User } from 'lucide-react'
import { api } from '../api'

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    try { await api.login(username, password); onSuccess() }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not sign in'); setPassword('') }
    finally { setBusy(false) }
  }

  const box: React.CSSProperties = { position: 'relative' }
  const icon: React.CSSProperties = { position: 'absolute', left: 11, top: 12, color: '#8aa0a8' }
  const field: React.CSSProperties = { paddingLeft: 34, height: 42, fontSize: 14 }
  const label: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#47616a', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(160deg,#eaf6f1 0%,#f6f8fa 55%)', padding: 16 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 380, background: '#fff', border: '1px solid #dfe7e9', borderRadius: 16, padding: 28, boxShadow: '0 12px 40px #1d3b4a14' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div className="brand-mark"><Dumbbell size={22} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#182b35' }}>FitZone</div>
            <div style={{ fontSize: 11, letterSpacing: 1.2, color: '#7b9099' }}>ADMIN SIGN IN</div>
          </div>
        </div>

        <label style={label} htmlFor="u">Username</label>
        <div style={{ ...box, marginBottom: 14 }}>
          <User size={16} style={icon} />
          <input id="u" className="input" style={field} autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>

        <label style={label} htmlFor="p">Password</label>
        <div style={{ ...box, marginBottom: 16 }}>
          <Lock size={16} style={icon} />
          <input id="p" type="password" className="input" style={field} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
        </div>

        {error && <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%', height: 42, fontSize: 14 }}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p style={{ fontSize: 12, color: '#7b9099', textAlign: 'center', margin: '16px 0 0' }}>Authorised staff only.</p>
      </form>
    </div>
  )
}
