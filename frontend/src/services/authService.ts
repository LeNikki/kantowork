import { api, setToken, clearToken, type AuthResponse, type User } from '../api'

/**
 * Every /api/auth endpoint, in one place.
 *
 * Token handling lives here too: logging in or signing up stores the token,
 * logging out clears it, so no page has to remember to do it.
 */
export const authService = {
  signup: async (name: string, email: string, password: string) => {
    const res = await api<AuthResponse>('/api/auth/signup', { name, email, password })
    setToken(res.token)
    return res.user
  },

  login: async (email: string, password: string) => {
    const res = await api<AuthResponse>('/api/auth/login', { email, password })
    setToken(res.token)
    return res.user
  },

  // The server cannot revoke a JWT, so logging out is really just discarding
  // our copy. The request is a courtesy; a failure must not strand the user.
  logout: async () => {
    await api<void>('/api/auth/logout', {}).catch(() => {})
    clearToken()
  },

  me: async () => {
    const res = await api<{ user: User }>('/api/auth/me')
    return res.user
  },

  forgotPassword: (email: string) =>
    api<{ message: string }>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api<{ message: string }>('/api/auth/reset-password', { token, password }),
}
