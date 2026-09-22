import { api, type Application } from '../api'

export type ApplicationInput = {
  cover_message: string
  proposed_amount: string
}

export const applicationService = {
  // A worker puts themselves forward for one job.
  apply: (jobId: number, input: ApplicationInput) =>
    api<{ application: Application }>(`/api/jobs/${jobId}/applications`, input, 'POST')
      .then((r) => r.application),

  // Everyone who applied - only the client who posted the job may ask.
  forJob: (jobId: number) =>
    api<{ applications: Application[] }>(`/api/jobs/${jobId}/applications`)
      .then((r) => r.applications),

  mine: () =>
    api<{ applications: Application[] }>('/api/applications/me').then((r) => r.applications),

  // Accepting also assigns the job and turns down everyone else, which the
  // server does in one transaction.
  decide: (id: number, status: 'accepted' | 'rejected') =>
    api<{ application: Application }>(`/api/applications/${id}`, { status }, 'PATCH')
      .then((r) => r.application),

  // A POST rather than a DELETE: withdrawing leaves the record behind.
  withdraw: (id: number) =>
    api<{ application: Application }>(`/api/applications/${id}/withdraw`, {}, 'POST')
      .then((r) => r.application),
}
