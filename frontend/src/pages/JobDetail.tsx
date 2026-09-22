import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import type { Application, JobDetail as JobDetailReply, User } from '../api'
import { jobService } from '../services/jobService'
import { formatBudget, formatDate } from '../format'
import ApplyBox from '../components/ApplyBox'

/**
 * One posting, read by either side.
 *
 * What the page offers depends on who is looking: the client who posted it
 * gets the controls and the applications, a worker gets the way in. The
 * server decides all of this again on every request - this only keeps
 * buttons off a page that cannot use them.
 */
export default function JobDetail() {
  const { id } = useParams()
  const { user } = useOutletContext<{ user: User }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<JobDetailReply | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    jobService.get(Number(id))
      .then(setDetail)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  // Both of these are one-way. Cancelling cannot be undone - a cancelled job
  // cannot be reopened - and deleting takes the posting with it, so neither
  // should happen because a button was under the pointer.
  const cancel = async () => {
    if (!detail) return
    if (!window.confirm('Cancel this job? Workers will no longer see it, and it cannot be reopened.')) return
    setBusy(true)
    setError('')
    try {
      await jobService.setStatus(detail.job.id, 'cancelled')
      // Read the whole reply back rather than patching the job in place: the
      // status change may have altered what else the page is entitled to.
      setDetail(await jobService.get(detail.job.id))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const complete = async () => {
    if (!detail) return
    if (!window.confirm('Mark this job finished?')) return
    setBusy(true)
    setError('')
    try {
      await jobService.setStatus(detail.job.id, 'completed')
      setDetail(await jobService.get(detail.job.id))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!detail) return
    if (!window.confirm('Delete this job for good? This cannot be undone.')) return
    setBusy(true)
    setError('')
    try {
      await jobService.remove(detail.job.id)
      navigate('/client/jobs')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  const onApplicationChange = (application: Application | null) =>
    setDetail((d) => (d === null ? d : { ...d, my_application: application }))

  if (loading) return <main className="page"><p>Loading…</p></main>
  if (!detail) return <main className="page"><p className="error">{error || 'Job not found'}</p></main>

  const { job, my_application: mine, application_count: count } = detail
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

      {user.role === 'worker' && (
        <ApplyBox
          jobId={job.id}
          jobOpen={job.status === 'open'}
          application={mine ?? null}
          onChange={onApplicationChange}
        />
      )}

      {isOwner && (
        <div className="form-actions">
          {count !== undefined && count > 0 && (
            <Link className="btn" to={`/client/jobs/${job.id}/applications`}>
              {count === 1 ? '1 application' : `${count} applications`}
            </Link>
          )}
          {job.status === 'open' && <Link className="btn btn-quiet" to={`/client/jobs/${job.id}/edit`}>Edit</Link>}
          {job.status === 'assigned' && (
            <button className="btn btn-quiet" onClick={complete} disabled={busy}>Mark finished</button>
          )}
          {(job.status === 'open' || job.status === 'assigned') && (
            <button className="btn btn-quiet" onClick={cancel} disabled={busy}>Cancel this job</button>
          )}
          {job.status === 'open' && (
            <button className="btn btn-quiet" onClick={remove} disabled={busy}>Delete</button>
          )}
        </div>
      )}

      {isOwner && count === 0 && job.status === 'open' && (
        <p className="muted">Nobody has applied yet.</p>
      )}
    </main>
  )
}
