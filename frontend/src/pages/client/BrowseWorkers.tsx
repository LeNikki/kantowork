import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SearchFilters, WorkerSummary } from '../../api'
import { workerService } from '../../services/workerService'
import { formatMoney } from '../../format'
import Pager from '../../components/Pager'
import SearchBar from '../../components/SearchBar'

const PER_PAGE = 20

/**
 * The directory. Until this existed a client could only reach a worker
 * through an application, which meant waiting for one - so a client with work
 * and nobody applying had nowhere to go.
 */
export default function BrowseWorkers() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [workers, setWorkers] = useState<WorkerSummary[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true
    workerService.directory(filters, { limit: PER_PAGE, offset })
      .then((page) => {
        if (!current) return
        setWorkers(page.workers)
        setTotal(page.total)
      })
      .catch((err) => { if (current) setError((err as Error).message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [filters, offset])

  const search = (next: SearchFilters) => {
    setFilters(next)
    setOffset(0)
  }

  const narrowed = Boolean(filters.q || filters.location
    || (filters.skill_ids && filters.skill_ids.length > 0))

  return (
    <main className="page">
      <h1>Find a worker</h1>
      <p className="muted">
        Browse everyone on kantowork, or post a job and let them come to you.
      </p>

      <SearchBar filters={filters} onChange={search} />

      {error && <p className="error">{error}</p>}

      {loading ? <p>Loading…</p> : (
        <>
          {workers.length === 0 && (
            <p className="muted">
              {narrowed
                ? 'Nobody matches that. Try fewer words, or a wider area.'
                : 'There are no workers on kantowork yet.'}
            </p>
          )}

          {workers.length > 0 && (
            <>
              <p className="muted">{total} {total === 1 ? 'worker' : 'workers'}.</p>
              <div className="jobs">
                {workers.map((worker) => {
                  const experience = worker.years_experience === null
                    ? null
                    : `${worker.years_experience} ${worker.years_experience === 1 ? 'year' : 'years'}`
                  const rate = worker.hourly_rate === null
                    ? null
                    : `${formatMoney(worker.hourly_rate)} / hour`
                  const facts = [worker.location, experience, rate].filter(Boolean)

                  return (
                    <article key={worker.user_id} className="job">
                      <h2><Link to={`/workers/${worker.user_id}`}>{worker.name}</Link></h2>
                      {worker.headline
                        ? <p>{worker.headline}</p>
                        : <p className="muted">Has not filled in their profile yet.</p>}
                      {facts.length > 0 && <p className="muted">{facts.join(' · ')}</p>}
                      {worker.skills.length > 0 && (
                        <div className="skills-list">
                          {worker.skills.map((s) => (
                            <span key={s.id} className="tag tag-static">{s.name}</span>
                          ))}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
              <Pager total={total} limit={PER_PAGE} offset={offset} onChange={setOffset} />
            </>
          )}
        </>
      )}
    </main>
  )
}
