import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { SignupRole, User } from '../../../api'
import { authService } from '../../../services/authService'

export default function Signup({ onAuth }: { onAuth: (u: User) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // No default: the two sides see different things once inside, so this is a
  // real decision and not a box to click past.
  const [role, setRole] = useState<SignupRole | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!role) return setError('Pick how you want to use kantowork')
    setError('')
    setBusy(true)
    try {
      onAuth(await authService.signup(name, email, password, role))
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
        <fieldset className="choices">
          <legend>How will you use kantowork?</legend>

          <label className={role === 'worker' ? 'choice choice-on' : 'choice'}>
            <input
              type="radio"
              name="role"
              value="worker"
              checked={role === 'worker'}
              onChange={() => setRole('worker')}
            />
            <span className="choice-title">I have a skill to offer</span>
            <span className="muted">Show your work and apply for jobs clients post.</span>
          </label>

          <label className={role === 'client' ? 'choice choice-on' : 'choice'}>
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === 'client'}
              onChange={() => setRole('client')}
            />
            <span className="choice-title">I need work done</span>
            <span className="muted">Post a job and choose from the workers who apply.</span>
          </label>
        </fieldset>

        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8)" minLength={8} required />
        <button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="muted">Have an account? <Link to="/login">Log in</Link></p>
    </main>
  )
}
