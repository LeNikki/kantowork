import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { api, getToken, clearToken, type User } from './api'
import Login from './pages/Login'
import Signup from './pages/Signup'
import './App.css'

function Home({ user, onLogout }: { user: User; onLogout: () => void }) {
  const logout = async () => {
    await api('/api/auth/logout', {}).catch(() => {})
    clearToken()
    onLogout()
  }

  return (
    <main className="card">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">{user.email} — {user.role}</p>
      <button onClick={logout}>Log out</button>
    </main>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  // Only "loading" if there is a token worth checking - with none, we already
  // know the answer and can render the login route on the first pass.
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    api<{ user: User }>('/api/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <main className="card"><p>Loading…</p></main>

  return (
    <Routes>
      <Route path="/login"  element={user ? <Navigate to="/" replace /> : <Login onAuth={setUser} />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup onAuth={setUser} />} />
      <Route path="/"       element={user ? <Home user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
