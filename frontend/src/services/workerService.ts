import {
  api,
  type PortfolioProject,
  type PublicWorker,
  type ServiceOffering,
  type WorkerProfile,
} from '../api'

// What the profile form sends. Numbers leave the form as strings, and '' is
// how a cleared field arrives - the API turns both into null.
export type WorkerProfileInput = {
  headline: string
  bio: string
  location: string
  years_experience: string
  hourly_rate: string
  phone: string
}

// A service as the form sends it: the rate leaves as a string, and '' means
// the worker did not name a price.
export type ServiceInput = {
  title: string
  description: string
  rate: string
  rate_unit: string
  position?: number
}

// A project with its pictures, which arrive and leave as one set - their
// order in the array is their order on the page.
export type PortfolioInput = {
  title: string
  description: string
  completed_on: string
  images: { url: string; caption: string }[]
  position?: number
}

export const workerService = {
  myProfile: () =>
    api<{ profile: WorkerProfile }>('/api/workers/me/profile').then((r) => r.profile),

  // A PUT replaces the profile, so the form always sends every field.
  saveProfile: (fields: WorkerProfileInput) =>
    api<{ profile: WorkerProfile }>('/api/workers/me/profile', fields, 'PUT').then((r) => r.profile),

  // Likewise the whole skill set, not a change to it.
  saveSkills: (skill_ids: number[]) =>
    api<{ profile: WorkerProfile }>('/api/workers/me/skills', { skill_ids }, 'PUT').then((r) => r.profile),

  publicProfile: (id: number) =>
    api<{ worker: PublicWorker }>(`/api/workers/${id}`).then((r) => r.worker),

  // The services a worker offers. Each is its own row, so these are the
  // ordinary four rather than one replace-everything PUT.
  myServices: () =>
    api<{ services: ServiceOffering[] }>('/api/workers/me/services').then((r) => r.services),

  addService: (input: ServiceInput) =>
    api<{ service: ServiceOffering }>('/api/workers/me/services', input, 'POST')
      .then((r) => r.service),

  saveService: (id: number, input: ServiceInput) =>
    api<{ service: ServiceOffering }>(`/api/workers/me/services/${id}`, input, 'PUT')
      .then((r) => r.service),

  removeService: (id: number) =>
    api<void>(`/api/workers/me/services/${id}`, undefined, 'DELETE'),

  myPortfolio: () =>
    api<{ portfolio: PortfolioProject[] }>('/api/workers/me/portfolio').then((r) => r.portfolio),

  addProject: (input: PortfolioInput) =>
    api<{ project: PortfolioProject }>('/api/workers/me/portfolio', input, 'POST')
      .then((r) => r.project),

  saveProject: (id: number, input: PortfolioInput) =>
    api<{ project: PortfolioProject }>(`/api/workers/me/portfolio/${id}`, input, 'PUT')
      .then((r) => r.project),

  removeProject: (id: number) =>
    api<void>(`/api/workers/me/portfolio/${id}`, undefined, 'DELETE'),
}
