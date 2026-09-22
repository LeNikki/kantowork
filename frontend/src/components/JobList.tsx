import { Link } from 'react-router-dom'
import type { Job } from '../api'
import { formatBudget, formatDate } from '../format'

// One job as a row in a list. The same summary serves the board and a
// client's own list; only the status badge is conditional, because on the
// board every job is open and saying so adds nothing.
export function JobSummary({ job, showStatus = false }: { job: Job; showStatus?: boolean }) {
  const facts = [job.location, formatBudget(job)].filter(Boolean)

  return (
    <article className="job">
      <h2>
        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
        {showStatus && <span className={`badge badge-${job.status}`}>{job.status}</span>}
      </h2>
      <p className="muted">
        {job.client_name} · {facts.join(' · ')}
        {job.deadline && ` · by ${formatDate(job.deadline)}`}
      </p>
      {job.skills.length > 0 && (
        <div className="skills-list">
          {job.skills.map((s) => <span key={s.id} className="tag tag-static">{s.name}</span>)}
        </div>
      )}
    </article>
  )
}

export default function JobList({ jobs, showStatus = false }: { jobs: Job[]; showStatus?: boolean }) {
  return (
    <div className="jobs">
      {jobs.map((job) => <JobSummary key={job.id} job={job} showStatus={showStatus} />)}
    </div>
  )
}
