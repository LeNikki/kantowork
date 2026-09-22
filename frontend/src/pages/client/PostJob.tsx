import { useNavigate } from 'react-router-dom'
import JobForm from '../../components/JobForm'
import { EMPTY_JOB, jobService, type JobInput } from '../../services/jobService'

export default function PostJob() {
  const navigate = useNavigate()

  // Straight to the posting once it exists, so the client sees what a worker
  // will see rather than an empty form and a message.
  const submit = async (input: JobInput) => {
    const job = await jobService.create(input)
    navigate(`/jobs/${job.id}`)
  }

  return (
    <main className="page">
      <h1>Post a job</h1>
      <p className="muted">Describe the work. Workers apply, and you choose.</p>
      <JobForm initial={EMPTY_JOB} submitLabel="Post the job" onSubmit={submit} />
    </main>
  )
}
