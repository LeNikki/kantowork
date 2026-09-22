import { api, type Skill } from '../api'

export const skillService = {
  // The whole vocabulary in one call - it is twenty rows of reference data,
  // so the forms fetch it and group it themselves.
  list: () => api<{ skills: Skill[] }>('/api/skills').then((r) => r.skills),
}
