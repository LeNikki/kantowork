import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '../../../api'
import { authService } from '../../../services/authService'

export default function Signup({ onAuth }: { onAuth: (u: User) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      onAuth(await authService.signup(name, email, password))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="card">
      <h1>Sign up</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8)" minLength={8} required />
        <button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="muted">Have an account? <Link to="/login">Log in</Link></p>
    </main>
  )
}
