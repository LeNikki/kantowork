import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import JobForm from '../../components/JobForm'
import { jobService, type JobInput } from '../../services/jobService'

export default function EditJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initial, setInitial] = useState<JobInput | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    jobService.get(Number(id))
      .then((job) => setInitial({
        title: job.title,
        description: job.description,
        location: job.location,
        budget_type: job.budget_type,
        // Back to strings: an input's value is text, and null is not.
        budget_min: job.budget_min?.toString() ?? '',
        budget_max: job.budget_max?.toString() ?? '',
        deadline: job.deadline ?? '',
        skill_ids: job.skills.map((s) => s.id),
      }))
      .catch((err) => setError((err as Error).message))
  }, [id])

  const submit = async (input: JobInput) => {
    await jobService.update(Number(id), input)
    navigate(`/jobs/${id}`)
  }

  if (error) return <main className="page"><p className="error">{error}</p></main>
  if (!initial) return <main className="page"><p>Loading…</p></main>

  return (
    <main className="page">
      <h1>Edit this job</h1>
      <JobForm initial={initial} submitLabel="Save changes" onSubmit={submit} />
    </main>
  )
}
