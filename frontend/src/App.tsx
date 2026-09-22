import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom'
import { getToken, type User } from './api'
import { authService } from './services/authService'
import GuestLayout from './layouts/GuestLayout'
import AuthLayout from './layouts/AuthLayout'
import RoleGuard from './layouts/RoleGuard'
import Landing from './pages/Landing'
import Login from './pages/user/auth/Login'
import Signup from './pages/user/auth/Signup'
import WorkerDashboard from './pages/worker/Dashboard'
import WorkerProfileEdit from './pages/worker/ProfileEdit'
import ClientDashboard from './pages/client/Dashboard'
import ClientProfileEdit from './pages/client/ProfileEdit'
import WorkerPublicProfile from './pages/WorkerPublicProfile'
import JobBoard from './pages/JobBoard'
import JobDetail from './pages/JobDetail'
import MyJobs from './pages/client/MyJobs'
import PostJob from './pages/client/PostJob'
import EditJob from './pages/client/EditJob'
import './App.css'

/**
 * /dashboard belongs to whichever side you signed up as. Keeping one shared
 * URL means nothing else - the top bar, a redirect after login - has to know
 * the caller's role to link somewhere sensible.
 */
function DashboardHome() {
  const { user } = useOutletContext<{ user: User }>()
  return <Navigate to={user.role === 'worker' ? '/worker' : '/client'} replace />
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  // Only "loading" if there is a token worth checking - with none, we already
  // know the answer and can render the first route immediately.
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    authService.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <main className="page"><p>Loading…</p></main>

  return (
    <Routes>
      {/* signed out - the layout redirects an authenticated user away */}
      <Route element={<GuestLayout user={user} />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onAuth={setUser} />} />
        <Route path="/signup" element={<Signup onAuth={setUser} />} />
      </Route>

      {/* signed in - the layout redirects an anonymous visitor to /login */}
      <Route element={<AuthLayout user={user} onLogout={() => setUser(null)} />}>
        <Route path="/dashboard" element={<DashboardHome />} />

        {/* either role may look: the board, a posting, a worker's profile */}
        <Route path="/workers/:id" element={<WorkerPublicProfile />} />
        <Route path="/jobs" element={<JobBoard />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* the worker's side - a client who comes here is sent back */}
        <Route element={<RoleGuard allow={['worker']} />}>
          <Route path="/worker" element={<WorkerDashboard />} />
          <Route path="/worker/profile" element={<WorkerProfileEdit />} />
        </Route>

        {/* the client's side - a worker who comes here is sent back */}
        <Route element={<RoleGuard allow={['client']} />}>
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/client/profile" element={<ClientProfileEdit />} />
          <Route path="/client/jobs" element={<MyJobs />} />
          <Route path="/client/jobs/new" element={<PostJob />} />
          <Route path="/client/jobs/:id/edit" element={<EditJob />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
