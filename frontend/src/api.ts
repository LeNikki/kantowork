const TOKEN_KEY = 'kantowork.token'

// Mirrors the CHECK constraint on kantowork.users.role. 'admin' cannot be
// chosen at signup - only a worker or a client can be.
export type Role = 'worker' | 'client' | 'admin'
export type SignupRole = Extract<Role, 'worker' | 'client'>

export type User = { id: number; name: string; email: string; role: Role }
export type AuthResponse = { message: string; user: User; token: string; expiresIn: string }

export type Skill = { id: number; name: string; category: string }

// Field names are the API's, which are the database's. Nothing translates
// between the two, so there is nothing to keep in step.
export type WorkerProfile = {
  user_id: number
  name: string
  email: string
  headline: string
  bio: string
  location: string
  years_experience: number | null
  hourly_rate: number | null
  phone: string
  skills: Skill[]
}

// How a trade quotes: by the job, the hour, the day, or the square metre.
export type RateUnit = 'job' | 'hour' | 'day' | 'sqm'

// One thing a worker offers, priced. The API calls these services, which is
// the word a worker uses.
export type ServiceOffering = {
  id: number
  worker_id: number
  title: string
  description: string
  rate: number | null
  rate_unit: RateUnit
  position: number
}

// A picture is a web address, not a file: nothing here uploads anything, so
// a worker points at an image hosted elsewhere.
export type PortfolioImage = { id: number; url: string; caption: string }

export type PortfolioProject = {
  id: number
  worker_id: number
  title: string
  description: string
  completed_on: string | null
  position: number
  images: PortfolioImage[]
}

/**
 * What /api/workers/:id returns: the profile with the contact details left
 * out - a worker gives those out once they are chosen - and with everything
 * that speaks for them added. This is the page a client decides on.
 */
export type PublicWorker = Omit<WorkerProfile, 'email' | 'phone'> & {
  services: ServiceOffering[]
  portfolio: PortfolioProject[]
}

export type JobStatus = 'open' | 'assigned' | 'completed' | 'cancelled'
export type BudgetType = 'fixed' | 'hourly'

export type Job = {
  id: number
  client_id: number
  client_name: string
  title: string
  description: string
  location: string
  budget_type: BudgetType
  budget_min: number | null
  budget_max: number | null
  status: JobStatus
  assigned_worker_id: number | null
  // An ISO date (YYYY-MM-DD), not a timestamp: a deadline is a day, and
  // carrying a time with it only invites it to shift by one.
  deadline: string | null
  created_at: string
  skills: Skill[]
}

export type JobPage = { jobs: Job[]; total: number; limit: number; offset: number }

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export type Application = {
  id: number
  job_id: number
  job_title: string
  job_status: JobStatus
  worker_id: number
  worker_name: string
  worker_headline: string
  cover_message: string
  proposed_amount: number | null
  status: ApplicationStatus
  created_at: string
}

/**
 * A posting plus whichever extra the caller is entitled to: a worker gets
 * their own application (null if they have not applied), the client who
 * posted it gets how many are waiting. Neither field is present for the
 * other side, so both are optional here.
 */
export type JobDetail = {
  job: Job
  my_application?: Application | null
  application_count?: number
}

export type ClientProfile = {
  user_id: number
  name: string
  email: string
  company: string
  about: string
  location: string
  phone: string
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

/**
 * The method is inferred - a body means POST, no body means GET - which covers
 * auth. Pass it explicitly for the rest: editing a profile is a PUT, changing
 * an application's status a PATCH, and a DELETE carries no body at all.
 */
export async function api<T>(path: string, body?: unknown, method?: Method): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // A rejected token is never going to start working - drop it so we stop
  // sending a dead credential on every subsequent request.
  if (res.status === 401 && token) clearToken()

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? data.errors?.[0]?.msg ?? `Request failed (${res.status})`)
  }

  return res.status === 204 ? (undefined as T) : res.json()
}
