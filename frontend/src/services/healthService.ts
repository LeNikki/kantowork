import { api } from '../api'

export type Health = { status: string; db: string; time: string }

export const healthService = {
  check: () => api<Health>('/api/health'),
}
