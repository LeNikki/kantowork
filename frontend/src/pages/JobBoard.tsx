import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { Job, SearchFilters, User } from '../api'
import { jobService } from '../services/jobService'
import JobList from '../components/JobList'
import Pager from '../components/Pager'
import SearchBar from '../components/SearchBar'

const PER_PAGE = 20

/**
 * Every open job, whoever posted it, with a way to narrow it down.
 *
 * A worker can ask for only the jobs asking for a skill they have listed. It
 * is the server that decides what matches, from their saved skills - this page
 * just asks.
 */
export default function JobBoard() {
  const { user } = useOutletContext<{ user: User }>()
  const [filters, setFilters] = useState<SearchFilters>({})
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [noSkills, setNoSkills] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Paging or searching quickly leaves two requests in flight, and they
    // need not come back in order. Whichever is still wanted is the one that
    // lands.
    let current = true
    jobService.board(filters, { limit: PER_PAGE, offset })
      .then((page) => {
        if (!current) return
        setJobs(page.jobs)
        setTotal(page.total)
        setNoSkills(page.no_skills_listed)
      })
      .catch((err) => { if (current) setError((err as Error).message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [filters, offset])

  // A new search starts at the first page - staying on page three of a
  // different set of results would be meaningless.
  const search = (next: SearchFilters) => {
    setFilters(next)
    setOffset(0)
  }

  const narrowed = Boolean(filters.q || filters.location
    || (filters.skill_ids && filters.skill_ids.length > 0) || filters.mine)

  return (
    <main className="page">
      <h1>Jobs</h1>

      <SearchBar filters={filters} onChange={search}>
        {user.role === 'worker' && (
          <label className="switch">
            <input
              type="checkbox"
              checked={filters.mine === true}
              onChange={(e) => search({ ...filters, mine: e.target.checked })}
            />
            Only work I can do
          </label>
        )}
      </SearchBar>

      {error && <p className="error">{error}</p>}

      {loading ? <p>Loading…</p> : (
        <>
          {/* Three different empty lists, three different reasons. */}
          {jobs.length === 0 && noSkills && (
            <p className="muted">
              You have not listed any skills yet, so there is nothing to match against.{' '}
              <Link to="/worker/profile">Add your skills</Link> and this will fill up.
            </p>
          )}
          {jobs.length === 0 && !noSkills && narrowed && (
            <p className="muted">Nothing matches that. Try fewer words, or a wider area.</p>
          )}
          {jobs.length === 0 && !noSkills && !narrowed && (
            <p className="muted">No jobs are open right now. Check back soon.</p>
          )}

          {jobs.length > 0 && (
            <>
              <p className="muted">
                {total} {total === 1 ? 'job' : 'jobs'}
                {filters.mine ? ' matching your skills' : ' open'}.
              </p>
              <JobList jobs={jobs} />
              <Pager total={total} limit={PER_PAGE} offset={offset} onChange={setOffset} />
            </>
          )}
        </>
      )}
    </main>
  )
}
