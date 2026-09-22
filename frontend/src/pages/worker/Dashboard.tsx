import { Link, useOutletContext } from 'react-router-dom'
import type { User } from '../../api'

export default function WorkerDashboard() {
  const { user } = useOutletContext<{ user: User }>()

  return (
    <main className="page">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">{user.email} — skilled worker</p>
      <p>
        This is your side of kantowork: your profile and portfolio live here,
        and this is where you will find jobs to apply for.
      </p>

      <p>
        <Link className="btn" to="/worker/profile">Edit your profile</Link>
      </p>
    </main>
  )
}
