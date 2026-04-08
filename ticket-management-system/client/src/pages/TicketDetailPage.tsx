import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import api from '../api'
import { useAuth } from '../auth-context'
import type { Ticket, TicketComment } from '../types'

const TicketDetailPage = () => {
  const { user } = useAuth()
  const { id } = useParams()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [status, setStatus] = useState('open')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const isClosed = ticket?.status === 'closed'

  const load = async () => {
    const response = await api.get(`/tickets/${id}`)
    setTicket(response.data)
    setStatus(response.data.status)
  }

  useEffect(() => {
    if (!id) return

    void (async () => {
      const response = await api.get(`/tickets/${id}`)
      setTicket(response.data)
      setStatus(response.data.status)
    })()
  }, [id])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const payload = { status, comment }
      await api.put(`/tickets/${id}`, payload)
      setMessage('Update saved')
      setComment('')
      load()
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      setMessage(error.response?.data?.message || 'Unable to save update')
    }
  }

  if (!ticket) return <div className="p-6 text-slate-300">Loading ticket...</div>

  return (
    <main className="p-6 lg:p-10">
      <div className="mx-auto max-w-4xl space-y-6 rounded-3xl bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">{ticket.subject}</h1>
            <p className="text-sm text-slate-400">{ticket.toDepartment} · {ticket.priority} · {ticket.status}</p>
          </div>
          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm uppercase tracking-[0.2em] text-slate-400">{ticket.status}</span>
        </div>
        {user?.isAdmin ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-300">
            <p>{ticket.description}</p>
            <p className="mt-4 text-sm text-slate-500">Raised by {ticket.createdByEmail}</p>
          </div>
        ) : (
          <section className="space-y-4 rounded-3xl border border-slate-700 bg-slate-900 p-6">
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Subject</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-80"
                value={ticket.subject}
                disabled
                readOnly
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Description</span>
              <textarea
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-80"
                value={ticket.description}
                disabled
                readOnly
                rows={6}
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Department</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-80"
                value={ticket.toDepartment}
                disabled
                readOnly
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Priority</span>
              <select
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-80"
                value={ticket.priority}
                disabled
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Status</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-80"
                value={ticket.status}
                disabled
                readOnly
              />
            </label>
          </section>
        )}
        <section className="space-y-3 rounded-3xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Comments</h2>
          {ticket.comments?.length ? (
            ticket.comments.map((entry: TicketComment, index: number) => (
              <article key={index} className="rounded-3xl border border-slate-800 p-4">
                <p className="text-slate-100">{entry.text}</p>
                <p className="mt-2 text-xs text-slate-500">{entry.author} · {new Date(entry.createdAt).toLocaleString()}</p>
              </article>
            ))
          ) : (
            <p className="text-slate-400">No comments yet.</p>
          )}
        </section>
        {user?.isAdmin ? (
          <form className="space-y-4" onSubmit={submit}>
            {isClosed ? (
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-400">
                This ticket is closed and can no longer be updated by admin.
              </div>
            ) : (
              <>
                <select
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In progress</option>
                  <option value="closed">Closed</option>
                </select>
                <textarea className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" placeholder="Add admin comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
              </>
            )}
            {message && <p className="text-sm text-cyan-300">{message}</p>}
            {!isClosed && (
              <button className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
                Save update
              </button>
            )}
          </form>
        ) : null}
      </div>
    </main>
  )
}

export default TicketDetailPage
