import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Application } from '../../api'
import { applicationService } from '../../services/applicationService'
import { jobService } from '../../services/jobService'
import { formatMoney } from '../../format'

/**
 * Everyone who put themselves forward for one job, for the client deciding.
 *
 * Accepting is the consequential one: it takes the job off the board, assigns
 * it, and turns everyone else down in the same breath. The page says so before
 * it happens rather than after.
 */
export default function JobApplications() {
  const { id } = useParams()
  const jobId = Number(id)
  const [applications, setApplications] = useState<Application[]>([])
  const [jobTitle, setJobTitle] = useState('')
  const [jobOpen, setJobOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () =>
    Promise.all([applicationService.forJob(jobId), jobService.get(jobId)])
      .then(([list, detail]) => {
        setApplications(list)
        setJobTitle(detail.job.title)
        setJobOpen(detail.job.status === 'open')
      })

  useEffect(() => {
    load()
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
    // load is recreated each render, and the id is what actually decides
    // which job is being read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId])

  const decide = async (application: Application, status: 'accepted' | 'rejected') => {
    const question = status === 'accepted'
      ? `Give this job to ${application.worker_name}? Everyone else still waiting will be turned down.`
      : `Turn down ${application.worker_name}? They will not be able to apply again.`
    if (!window.confirm(question)) return

    setBusy(true)
    setError('')
    try {
      await applicationService.decide(application.id, status)
      // Accepting changes every other application too, so the whole list is
      // read back rather than the one row patched in place.
      await load()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <main className="page"><p>Loading…</p></main>

  return (
    <main className="page">
      <h1>Applications</h1>
      <p className="muted">
        For <Link to={`/jobs/${jobId}`}>{jobTitle}</Link>
      </p>

      {error && <p className="error">{error}</p>}

      {applications.length === 0 && <p className="muted">Nobody has applied yet.</p>}

      <div className="jobs">
        {applications.map((a) => (
          <article key={a.id} className="job">
            <h2>
              <Link to={`/workers/${a.worker_id}`}>{a.worker_name}</Link>
              <span className={`badge badge-${a.status}`}>{a.status}</span>
            </h2>
            {a.worker_headline && <p className="muted">{a.worker_headline}</p>}
            {a.proposed_amount !== null && <p>Asking {formatMoney(a.proposed_amount)}.</p>}
            {a.cover_message && <p className="bio">{a.cover_message}</p>}

            {/* Only while the job is still open and this one is undecided. */}
            {jobOpen && a.status === 'pending' && (
              <div className="form-actions">
                <button className="btn" onClick={() => decide(a, 'accepted')} disabled={busy}>
                  Give them the job
                </button>
                <button className="btn btn-quiet" onClick={() => decide(a, 'rejected')} disabled={busy}>
                  Turn down
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}
