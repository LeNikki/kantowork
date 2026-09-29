import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, setToken, type AuthResponse, type User } from '../api'

export default function Signup({ onAuth }: { onAuth: (u: User) => void }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userRole: '',
  })

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setBusy(true)

    try {
      const d = await api<AuthResponse>('/api/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
        userRole: form.userRole,
      })

      console.log(form)

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
      <h1>Sign up</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={submit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="First Name"
          required
        />

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />

        <div className="password-field">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            placeholder="Password (min 8)"
            minLength={8}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="password-field">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <select
          name="userRole"
          value={form.userRole}
          onChange={handleChange}
          required
        >
          <option value="">Select User Role</option>
          <option value="employer">Employer</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <button type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Sign up'}
        </button>
      </form>

      <p className="muted">
        Have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  )
}
