import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Job } from '../../api'
import { jobService } from '../../services/jobService'
import JobList from '../../components/JobList'
import Pager from '../../components/Pager'

const PER_PAGE = 20

export default function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Paging quickly can leave two requests in flight, and they need not come
    // back in order. Whichever one is still wanted is the one that lands.
    let current = true
    jobService.mine({ limit: PER_PAGE, offset })
      .then((page) => {
        if (!current) return
        setJobs(page.jobs)
        setTotal(page.total)
      })
      .catch((err) => { if (current) setError((err as Error).message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [offset])

  if (loading) return <main className="page"><p>Loading…</p></main>

  return (
    <main className="page">
      <h1>Your jobs</h1>
      {error && <p className="error">{error}</p>}

      <p><Link className="btn" to="/client/jobs/new">Post a job</Link></p>

      {jobs.length === 0
        ? <p className="muted">You have not posted anything yet.</p>
        // Status matters here in a way it does not on the board: this list
        // holds cancelled jobs too.
        : <>
            <JobList jobs={jobs} showStatus />
            <Pager total={total} limit={PER_PAGE} offset={offset} onChange={setOffset} />
          </>}
    </main>
  )
}
