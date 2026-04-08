import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AxiosError } from 'axios'
import api from '../api'
import type { User } from '../types'

interface UserRecord {
  id?: string
  _id?: string
  name: string
  email: string
  isAdmin: boolean
}

const UsersListPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  const normalizeUsers = (items: UserRecord[]): User[] =>
    items.map((user) => ({
      id: user.id || user._id || user.email,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    }))

  useEffect(() => {
    void (async () => {
      try {
        setError('')
        const response = await api.get('/users', { params: { page, search } })
        const payload = response.data
        const items = Array.isArray(payload) ? payload : payload.users || []
        setUsers(normalizeUsers(items))
        setTotal(Array.isArray(payload) ? items.length : payload.total || items.length)
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>
        setUsers([])
        setTotal(0)
        setError(error.response?.data?.message || 'Unable to load users')
      }
    })()
  }, [page, search])

  const adminCount = users.filter((user) => user.isAdmin).length
  const memberCount = users.length - adminCount

  return (
    <main className="p-6 lg:p-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(2,6,23,0.96))] p-8 shadow-2xl shadow-cyan-950/20">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.18),_transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.34em] text-cyan-300">Admin Directory</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">User listing with faster admin control</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Search employee accounts, review role distribution, and move into account creation without leaving the admin workspace.
            </p>
          </div>
          <Link to="/users/new" className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
            Add user
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Visible users</p>
          <p className="mt-4 text-3xl font-semibold text-white">{users.length}</p>
          <p className="mt-2 text-sm text-slate-400">Current page result count</p>
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Admins</p>
          <p className="mt-4 text-3xl font-semibold text-cyan-300">{adminCount}</p>
          <p className="mt-2 text-sm text-slate-400">Admin accounts in this result set</p>
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Employees</p>
          <p className="mt-4 text-3xl font-semibold text-white">{memberCount}</p>
          <p className="mt-2 text-sm text-slate-400">Standard user accounts in this result set</p>
        </article>
      </section>

      <section className="mt-8 rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Directory</h2>
            <p className="mt-2 text-sm text-slate-400">Search by name or email and page through the user directory.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <input
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 sm:min-w-[320px]"
              placeholder="Search users by name or email"
            />
            <Link to="/users/new" className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-900">
              New user
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="transition hover:bg-slate-900/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-sm font-semibold text-cyan-300">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active account</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-300">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${user.isAdmin ? 'bg-cyan-400/15 text-cyan-300' : 'bg-slate-800 text-slate-300'}`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400">
                    No users found for the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>{`Showing ${users.length} users on this page out of ${total}`}</p>
          <div className="flex gap-2">
            <button className="rounded-2xl border border-slate-700 px-4 py-2 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            <button className="rounded-2xl border border-slate-700 px-4 py-2 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50" disabled={page * 8 >= total} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default UsersListPage
