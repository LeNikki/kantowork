import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, setToken, type AuthResponse, type User } from '../api'

export default function Login({ onAuth }: { onAuth: (u: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const d = await api<AuthResponse>('/api/auth/login', { email, password })
      setToken(d.token)
      onAuth(d.user)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="card">
      <h1>Log in</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="muted">No account? <Link to="/signup">Sign up</Link></p>
    </main>
  )
}
