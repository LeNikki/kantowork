const TOKEN_KEY = 'kantowork.token'

// Mirrors the CHECK constraint on kantowork.users.role. 'admin' cannot be
// chosen at signup - only a worker or a client can be.
export type Role = 'worker' | 'client' | 'admin'
export type SignupRole = Extract<Role, 'worker' | 'client'>

export type User = { id: number; name: string; email: string; role: Role }
export type AuthResponse = { message: string; user: User; token: string; expiresIn: string }

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
