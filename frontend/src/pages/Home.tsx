import { useOutletContext } from 'react-router-dom'
import type { User } from '../api'

export default function Home() {
  const { user } = useOutletContext<{ user: User }>()

  return (
    <main className="page">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">{user.email} — {user.role}</p>
    </main>
  )
}
