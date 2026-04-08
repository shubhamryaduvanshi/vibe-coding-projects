import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import api from '../api'
import { useAuth } from '../auth-context'

const RaiseTicketPage = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({ subject: '', description: '', toDepartment: '', priority: 'medium', attachment: '' })
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await api.post('/tickets', form)
      setMessage('Ticket created successfully')
      setForm({ subject: '', description: '', toDepartment: '', priority: 'medium', attachment: '' })
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      setMessage(error.response?.data?.message || 'Unable to create ticket')
    }
  }

  if (user?.isAdmin) return <Navigate to="/tickets" replace />

  return (
    <main className="p-6 lg:p-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <h1 className="mb-4 text-2xl font-semibold text-slate-100">Raise a ticket</h1>
        <form className="space-y-5" onSubmit={submit}>
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <textarea className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} required />
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" placeholder="To Department" value={form.toDepartment} onChange={(e) => setForm({ ...form, toDepartment: e.target.value })} required />
          <select className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" placeholder="Attachment path" value={form.attachment} onChange={(e) => setForm({ ...form, attachment: e.target.value })} />
          {message && <p className="text-sm text-cyan-300">{message}</p>}
          <button className="w-full rounded-2xl bg-cyan-500 py-3 font-semibold text-slate-950 hover:bg-cyan-400">Create ticket</button>
        </form>
      </div>
    </main>
  )
}

export default RaiseTicketPage
