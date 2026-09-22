import { api, type Job, type JobDetail, type JobPage, type JobStatus } from '../api'

// What the job form sends. Numbers and the date leave the form as strings,
// and '' is a field the client left blank - the API turns both into null.
export type JobInput = {
  title: string
  description: string
  location: string
  budget_type: string
  budget_min: string
  budget_max: string
  deadline: string
  skill_ids: number[]
}

// A blank posting, for the form to start from. It lives here rather than in
// JobForm because a module that exports both a component and a constant
// cannot be hot-reloaded.
export const EMPTY_JOB: JobInput = {
  title: '', description: '', location: '',
  budget_type: 'fixed', budget_min: '', budget_max: '', deadline: '', skill_ids: [],
}

type Page = { limit?: number; offset?: number }

const query = ({ limit = 20, offset = 0 }: Page) => `?limit=${limit}&offset=${offset}`

export const jobService = {
  // The board: every open job, whoever posted it.
  board: (page: Page = {}) => api<JobPage>(`/api/jobs${query(page)}`),

  // A client's own postings, in every status - they need to see the
  // cancelled ones too.
  mine: (page: Page = {}) => api<JobPage>(`/api/jobs/mine${query(page)}`),

  // The whole reply, not just the job: what else comes back depends on who
  // is asking, and the pages need it.
  get: (id: number) => api<JobDetail>(`/api/jobs/${id}`),

  create: (input: JobInput) =>
    api<{ job: Job }>('/api/jobs', input, 'POST').then((r) => r.job),

  // A PUT: the form sends the whole posting back, not the parts that changed.
  update: (id: number, input: JobInput) =>
    api<{ job: Job }>(`/api/jobs/${id}`, input, 'PUT').then((r) => r.job),

  setStatus: (id: number, status: JobStatus) =>
    api<{ job: Job }>(`/api/jobs/${id}`, { status }, 'PATCH').then((r) => r.job),

  remove: (id: number) => api<void>(`/api/jobs/${id}`, undefined, 'DELETE'),
}
