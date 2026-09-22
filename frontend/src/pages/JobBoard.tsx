import { useEffect, useState } from 'react'
import type { Job } from '../api'
import { jobService } from '../services/jobService'
import JobList from '../components/JobList'
import Pager from '../components/Pager'

const PER_PAGE = 20

// Every open job, whoever posted it. A worker's way in; a client may read it
// too, which is how they judge what to offer.
export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Paging quickly can leave two requests in flight, and they need not come
    // back in order. Whichever one is still wanted is the one that lands.
    let current = true
    jobService.board({ limit: PER_PAGE, offset })
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
      <h1>Jobs</h1>
      {error && <p className="error">{error}</p>}

      {jobs.length === 0
        // Not "nothing has been posted" - jobs that are taken or finished are
        // off this board, and saying otherwise would be wrong.
        ? <p className="muted">No jobs are open right now. Check back soon.</p>
        : <>
            <p className="muted">{total} open {total === 1 ? 'job' : 'jobs'}.</p>
            <JobList jobs={jobs} />
            <Pager total={total} limit={PER_PAGE} offset={offset} onChange={setOffset} />
          </>}
    </main>
  )
}
