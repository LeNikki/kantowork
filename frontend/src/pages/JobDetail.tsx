import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import type { Job, User } from '../api'
import { jobService } from '../services/jobService'
import { formatBudget, formatDate } from '../format'

/**
 * One posting, read by either side. A worker sees what the job is; the client
 * who posted it also sees what they can do about it.
 *
 * Applying is Phase 3, so a worker has nothing to press here yet.
 */
export default function JobDetail() {
  const { id } = useParams()
  const { user } = useOutletContext<{ user: User }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    jobService.get(Number(id))
      .then(setJob)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  // Both of these are one-way. Cancelling cannot be undone - a cancelled job
  // cannot be reopened - and deleting takes the posting with it, so neither
  // should happen because a button was under the pointer.
  const cancel = async () => {
    if (!job) return
    if (!window.confirm('Cancel this job? Workers will no longer see it, and it cannot be reopened.')) return
    setBusy(true)
    setError('')
    try {
      setJob(await jobService.setStatus(job.id, 'cancelled'))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!job) return
    if (!window.confirm('Delete this job for good? This cannot be undone.')) return
    setBusy(true)
    setError('')
    try {
      await jobService.remove(job.id)
      navigate('/client/jobs')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  if (loading) return <main className="page"><p>Loading…</p></main>
  if (!job) return <main className="page"><p className="error">{error || 'Job not found'}</p></main>

  // Whose job it is decides what is on the page. The server decides it again
  // on every request - this only keeps buttons off a page that cannot use them.
  const isOwner = user.id === job.client_id
  const facts = [job.location, formatBudget(job)].filter(Boolean)

  return (
    <main className="page">
      <h1>
        {job.title}
        {job.status !== 'open' && <span className={`badge badge-${job.status}`}>{job.status}</span>}
      </h1>
      <p className="muted">
        Posted by {job.client_name}
        {facts.length > 0 && ` · ${facts.join(' · ')}`}
        {job.deadline && ` · to finish by ${formatDate(job.deadline)}`}
      </p>

      {job.skills.length > 0 && (
        <div className="skills-list">
          {job.skills.map((s) => <span key={s.id} className="tag tag-static">{s.name}</span>)}
        </div>
      )}

      <p className="bio">{job.description}</p>

      {error && <p className="error">{error}</p>}

      {isOwner && job.status === 'open' && (
        <div className="form-actions">
          <Link className="btn" to={`/client/jobs/${job.id}/edit`}>Edit</Link>
          <button className="btn btn-quiet" onClick={cancel} disabled={busy}>
            Cancel this job
          </button>
          <button className="btn btn-quiet" onClick={remove} disabled={busy}>
            Delete
          </button>
        </div>
      )}

      {isOwner && job.status !== 'open' && (
        <p className="muted">
          A {job.status} job cannot be edited. Post a new one if the work is still needed.
        </p>
      )}
    </main>
  )
}
