import { Navigate, Outlet, useOutletContext } from 'react-router-dom'
import type { Role, User } from '../api'

/**
 * Sits inside AuthLayout, which has already established there IS a user, and
 * narrows further: only these roles get through. A client who types a worker
 * URL lands back on their own dashboard rather than a broken page.
 *
 * This is a convenience, not a security boundary - the browser can be told
 * anything. Every endpoint behind it is gated server-side by requireRole.
 */
export default function RoleGuard({ allow }: { allow: Role[] }) {
  const { user } = useOutletContext<{ user: User }>()

  if (!allow.includes(user.role)) return <Navigate to="/dashboard" replace />

  // Pass the context straight through, so pages below read `user` exactly as
  // they would directly under AuthLayout.
  return <Outlet context={{ user }} />
}
