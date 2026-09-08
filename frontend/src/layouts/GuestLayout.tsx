import { Link, Navigate, Outlet } from 'react-router-dom'
import type { User } from '../api'

// Wraps everything a signed-out visitor can see. Doubles as the guard:
// an authenticated user has no business on the login or signup forms.
export default function GuestLayout({ user }: { user: User | null }) {
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" to="/">kantowork</Link>
        <nav>
          <Link to="/login">Log in</Link>
          <Link className="btn" to="/signup">Get started</Link>
        </nav>
      </header>

      <Outlet />

      <footer className="footbar">
        <span>© {new Date().getFullYear()} kantowork</span>
      </footer>
    </div>
  )
}
