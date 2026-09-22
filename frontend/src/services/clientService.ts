import { api, type ClientProfile } from '../api'

export type ClientProfileInput = {
  company: string
  about: string
  location: string
  phone: string
}

export const clientService = {
  myProfile: () =>
    api<{ profile: ClientProfile }>('/api/clients/me/profile').then((r) => r.profile),

  saveProfile: (fields: ClientProfileInput) =>
    api<{ profile: ClientProfile }>('/api/clients/me/profile', fields, 'PUT').then((r) => r.profile),
}
