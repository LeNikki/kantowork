import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { PublicWorker } from '../api'
import { workerService } from '../services/workerService'

/**
 * A worker as everyone else sees them: no email, no phone. A worker reaches it
 * from their own profile form to check how it reads; from Phase 3 a client
 * reaches it from an application.
 */
export default function WorkerPublicProfile() {
  const { id } = useParams()
  const [worker, setWorker] = useState<PublicWorker | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    workerService.publicProfile(Number(id))
      .then(setWorker)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <main className="page"><p>Loading…</p></main>
  if (error || !worker) return <main className="page"><p className="error">{error || 'Worker not found'}</p></main>

  // Always two decimal places: it is money, and a bare "450.5" reads as a
  // typo rather than a rate.
  const rate = worker.hourly_rate === null
    ? null
    : `₱${worker.hourly_rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / hour`
  const experience = worker.years_experience === null
    ? null
    : `${worker.years_experience} ${worker.years_experience === 1 ? 'year' : 'years'} of experience`
  // Only the answered ones, joined - an empty profile should not render a row
  // of stray separators.
  const facts = [worker.location, experience, rate].filter(Boolean)

  return (
    <main className="page">
      <h1>{worker.name}</h1>
      {worker.headline && <p className="lead">{worker.headline}</p>}
      {facts.length > 0 && <p className="muted">{facts.join(' · ')}</p>}

      {worker.skills.length > 0 && (
        <div className="skills-list">
          {worker.skills.map((skill) => (
            <span key={skill.id} className="tag tag-static">{skill.name}</span>
          ))}
        </div>
      )}

      {worker.bio && <p className="bio">{worker.bio}</p>}

      {!worker.headline && !worker.bio && facts.length === 0 && worker.skills.length === 0 && (
        <p className="muted">This worker has not filled in their profile yet.</p>
      )}
    </main>
  )
}
