import { Link, useOutletContext } from 'react-router-dom'
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

      <p className="form-actions">
        <Link className="btn" to="/client/jobs/new">Post a job</Link>
        <Link className="btn btn-quiet" to="/client/jobs">Your jobs</Link>
        <Link className="btn btn-quiet" to="/client/workers">Find a worker</Link>
        <Link className="btn btn-quiet" to="/client/profile">Edit your profile</Link>
      </p>
    </main>
  )
}
