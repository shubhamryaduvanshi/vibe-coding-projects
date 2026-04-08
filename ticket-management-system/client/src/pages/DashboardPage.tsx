import { useEffect, useState } from 'react'
import api from '../api'
import type { Ticket, TicketSummaryItem } from '../types'

const DashboardPage = () => {
  const [summary, setSummary] = useState<TicketSummaryItem[]>([])
  const [recent, setRecent] = useState<Ticket[]>([])

  useEffect(() => {
    api.get('/tickets/summary').then((res) => {
      setSummary(res.data.summary)
      setRecent(res.data.recent)
    })
  }, [])

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-100">Ticket overview</h1>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item._id} className="rounded-3xl bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase text-slate-500">{item._id}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-100">{item.count}</p>
          </div>
        ))}
      </div>
      <section className="rounded-3xl bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
        <h2 className="mb-4 text-xl font-semibold text-slate-100">Recent tickets</h2>
        <div className="space-y-4">
          {recent.map((ticket) => (
            <article key={ticket._id} className="rounded-3xl border border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-100">{ticket.subject}</h3>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">{ticket.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{ticket.description.slice(0, 120)}{ticket.description.length > 120 ? '...' : ''}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
