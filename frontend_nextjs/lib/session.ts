export type User = { id: number; name: string; email: string; role: string };

export const USER_COOKIE = "kantowork.user";

// Matches the lifetime of the token cookie, which mirrors JWT_EXPIRES_IN ("7d"
// in Backend/config/jwt.js).
const MAX_AGE = 7 * 24 * 60 * 60;

// Kept separate from lib/auth.ts: that module is "use client" and touches
// localStorage, so a Server Component cannot import from it. This one has to
// stay importable on the server.
export function serializeUser(user: User) {
  return encodeURIComponent(JSON.stringify(user));
}

export function buildUserCookie(user: User) {
  return `${USER_COOKIE}=${serializeUser(user)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function buildExpiredUserCookie() {
  return `${USER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Read the signed-in user from the request cookie. Returns null when the
 * cookie is absent or malformed rather than throwing, so a tampered cookie
 * degrades to "no user" instead of a 500.
 *
 * NOTE: this cookie is unsigned. It is trustworthy only as a display
 * convenience - never gate real authorization on it. That belongs to
 * requireAuth on the backend.
 */
export function readUserCookie(value: string | undefined): User | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (!parsed?.id || !parsed?.email) return null;
    return parsed as User;
  } catch {
    return null;
  }
}