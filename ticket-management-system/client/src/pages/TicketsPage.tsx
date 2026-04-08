import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth-context'
import type { Ticket } from '../types'

const TicketsPage = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [raisedBy, setRaisedBy] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    void (async () => {
      const response = await api.get('/tickets', { params: { page, search, status, raisedBy } })
      setTickets(response.data.tickets)
      setTotal(response.data.total)
    })()
  }, [page, raisedBy, search, status])

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Tickets</h1>
          <p className="text-slate-400">Manage tickets and status updates.</p>
        </div>
        {!user?.isAdmin && (
          <Link to="/tickets/new" className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
            Raise ticket
          </Link>
        )}
      </div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none md:max-w-md" placeholder="Search tickets" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none md:w-56">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="closed">Closed</option>
        </select>
        {user?.isAdmin && (
          <input
            value={raisedBy}
            onChange={(e) => setRaisedBy(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none md:w-72"
            placeholder="Filter by raised by email"
          />
        )}
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/90">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
            <tr>
              <th className="px-4 py-4">Subject</th>
              <th className="px-4 py-4">Department</th>
              {user?.isAdmin && <th className="px-4 py-4">Raised by</th>}
              <th className="px-4 py-4">Priority</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="border-b border-slate-800">
                <td className="px-4 py-4">{ticket.subject}</td>
                <td className="px-4 py-4">{ticket.toDepartment}</td>
                {user?.isAdmin && <td className="px-4 py-4">{ticket.createdByEmail}</td>}
                <td className="px-4 py-4 capitalize">{ticket.priority}</td>
                <td className="px-4 py-4 capitalize">{ticket.status}</td>
                <td className="px-4 py-4 space-x-2">
                  {user?.isAdmin ? (
                    <Link className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950" to={`/tickets/${ticket._id}`}>
                      Update
                    </Link>
                  ) : (
                    <Link className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950" to={`/tickets/${ticket._id}`}>
                      View
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
        <span>{`Showing ${tickets.length} of ${total}`}</span>
        <div className="flex gap-2">
          <button className="rounded-2xl border border-slate-700 px-4 py-2" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <button className="rounded-2xl border border-slate-700 px-4 py-2" disabled={page * 10 >= total} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  )
}

export default TicketsPage
