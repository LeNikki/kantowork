import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { api, getToken, type User } from './api'
import GuestLayout from './layouts/GuestLayout'
import AuthLayout from './layouts/AuthLayout'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Home from './pages/Home'
import './App.css'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  // Only "loading" if there is a token worth checking - with none, we already
  // know the answer and can render the first route immediately.
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    api<{ user: User }>('/api/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <main className="page"><p>Loading…</p></main>

  return (
    <Routes>
      {/* signed out - the layout redirects an authenticated user away */}
      <Route element={<GuestLayout user={user} />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onAuth={setUser} />} />
        <Route path="/signup" element={<Signup onAuth={setUser} />} />
      </Route>

      {/* signed in - the layout redirects an anonymous visitor to /login */}
      <Route element={<AuthLayout user={user} onLogout={() => setUser(null)} />}>
        <Route path="/dashboard" element={<Home />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
