import { Link, Navigate, Outlet } from 'react-router-dom'
import type { User } from '../api'
import { authService } from '../services/authService'

// Wraps every signed-in page, and guards them: no user, no entry.
// The user is passed down through the outlet context so child pages get a
// non-null User without each one re-checking.
export default function AuthLayout({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  if (!user) return <Navigate to="/login" replace />

  // No manual navigate here: clearing the user makes the guard above fire on
  // the next render and send us to /login. Navigating by hand races that and
  // bounces through /dashboard on the way.
  const logout = async () => {
    await authService.logout()
    onLogout()
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" to="/dashboard">kantowork</Link>
        <nav>
          <span className="muted">{user.name}</span>
          <button className="btn btn-quiet" onClick={logout}>Log out</button>
        </nav>
      </header>

      <Outlet context={{ user }} />

      <footer className="footbar">
        <span>© {new Date().getFullYear()} kantowork</span>
      </footer>
    </div>
  )
}
