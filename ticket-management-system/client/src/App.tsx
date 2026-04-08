import type { ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import { useAuth } from './auth-context'
import ProtectedRoute from './ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RaiseTicketPage from './pages/RaiseTicketPage'
import TicketsPage from './pages/TicketsPage'
import TicketDetailPage from './pages/TicketDetailPage'
import UsersListPage from './pages/UsersListPage'
import CreateUserPage from './pages/CreateUserPage'

const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth()

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100 lg:grid lg:grid-cols-[300px_1fr]">
      <div className="ambient-orb left-[-8rem] top-[3rem] h-72 w-72 bg-cyan-400/18" />
      <div className="ambient-orb right-[-5rem] top-[8rem] h-64 w-64 bg-blue-500/16" />
      <div className="ambient-orb bottom-[-6rem] left-[38%] h-72 w-72 bg-fuchsia-400/10" />
      <aside className="glass-panel relative border-b px-6 py-6 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Ticket Management</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">{user?.name}</h1>
            <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
          </div>
          <nav className="mt-8 grid gap-3">
            <Link className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10" to="/">Dashboard</Link>
            <Link className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10" to="/tickets">Tickets</Link>
            {!user?.isAdmin && (
              <Link className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10" to="/tickets/new">
                Raise Ticket
              </Link>
            )}
            {user?.isAdmin && (
              <Link className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10" to="/users">
                User Listing
              </Link>
            )}
            {user?.isAdmin && (
              <Link className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10" to="/users/new">
                Add User
              </Link>
            )}
          </nav>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400 backdrop-blur-xl">
            <p className="text-slate-200">{user?.isAdmin ? 'Admin access' : 'Employee access'}</p>
            <p className="mt-2">Use the menu to track tickets, review updates, and keep work moving.</p>
          </div>
          <button className="mt-auto rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-rose-950/30" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="relative min-w-0 px-4 py-6 lg:px-8">{children}</main>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <AppShell>
              <TicketsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <ProtectedRoute>
            <AppShell>
              <RaiseTicketPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <TicketDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute adminOnly>
            <AppShell>
              <UsersListPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute adminOnly>
            <AppShell>
              <CreateUserPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
