import { useOutletContext } from 'react-router-dom'
import type { User } from '../../api'

export default function ClientDashboard() {
  const { user } = useOutletContext<{ user: User }>()

  return (
    <main className="page">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">{user.email} — client</p>
      <p>
        This is your side of kantowork: post the work you need doing, and
        review the skilled workers who apply for it.
      </p>
    </main>
  )
}
