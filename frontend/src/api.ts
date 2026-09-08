const TOKEN_KEY = 'kantowork.token'

export type User = { id: number; name: string; email: string; role: string }
export type AuthResponse = { message: string; user: User; token: string; expiresIn: string }

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
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
