import { useState } from 'react'
import type { FormEvent } from 'react'
import { AxiosError } from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

const CreateUserPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await api.post('/users', form)
      navigate('/users')
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      setMessage(error.response?.data?.message || 'Unable to create user')
    }
  }

  return (
    <main className="p-6 lg:p-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Add user</h1>
            <p className="mt-2 text-slate-400">Create a new employee account with default non-admin access.</p>
          </div>
          <Link to="/users" className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-900">
            Back to users
          </Link>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {message && <p className="text-sm text-cyan-300">{message}</p>}
          <button className="w-full rounded-2xl bg-cyan-500 py-3 font-semibold text-slate-950 hover:bg-cyan-400">Create user</button>
        </form>
      </div>
    </main>
  )
}

export default CreateUserPage
