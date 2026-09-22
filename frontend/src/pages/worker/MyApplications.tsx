import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Application } from '../../api'
import { applicationService } from '../../services/applicationService'
import { formatMoney } from '../../format'

// Everything a worker has applied for, in every state - the rejections are
// part of knowing where you stand.
export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    applicationService.mine()
      .then(setApplications)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <main className="page"><p>Loading…</p></main>

  return (
    <main className="page">
      <h1>Your applications</h1>
      {error && <p className="error">{error}</p>}

      {applications.length === 0
        ? <p className="muted">You have not applied for anything yet. <Link to="/jobs">Find work</Link>.</p>
        : <div className="jobs">
            {applications.map((a) => (
              <article key={a.id} className="job">
                <h2>
                  <Link to={`/jobs/${a.job_id}`}>{a.job_title}</Link>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </h2>
                {a.proposed_amount !== null && (
                  <p className="muted">You offered {formatMoney(a.proposed_amount)}.</p>
                )}
                {a.status === 'accepted' && <p>You were chosen for this job.</p>}
              </article>
            ))}
          </div>}
    </main>
  )
}
