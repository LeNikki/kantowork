import { api, type User } from '../api'

export const userService = {
  // Backend returns 501 for now.
  list: () => api<User[]>('/api/users'),
}
