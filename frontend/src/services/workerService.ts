import { api, type PublicWorker, type WorkerProfile } from '../api'

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
}
