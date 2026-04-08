import { useState } from 'react'
import type { FormEvent } from 'react'
import { AxiosError } from 'axios'
import { useAuth } from '../auth-context'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await login({ email, password })
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      setError(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 text-slate-100">
      <div className="ambient-orb left-[8%] top-[14%] h-72 w-72 bg-cyan-400/18" />
      <div className="ambient-orb right-[10%] top-[22%] h-64 w-64 bg-blue-500/16" />
      <div className="ambient-orb bottom-[6%] left-[28%] h-80 w-80 bg-fuchsia-400/10" />
      <section className="glass-panel relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden min-h-full overflow-hidden border-r border-white/10 p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%)]" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.34em] text-cyan-300">Service Desk</p>
            <h1 className="mt-5 max-w-md text-5xl font-semibold leading-tight text-white">Track requests in a calmer, clearer workspace.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
              Log in to manage employee issues, review open queues, and keep ticket handling moving through a polished internal dashboard.
            </p>
          </div>
        </div>
        <div className="p-8 sm:p-10">
          <h2 className="mb-2 text-3xl font-semibold text-white">Ticket System Login</h2>
          <p className="mb-6 text-sm text-slate-400">Use your account to access the support dashboard.</p>
          <form className="space-y-4" onSubmit={submit}>
            <label className="block space-y-2 text-sm">
              <span className="text-slate-300">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400/70 focus:bg-white/10" type="email" required />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="text-slate-300">Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400/70 focus:bg-white/10" type="password" required />
            </label>
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-sky-400 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:from-cyan-200 hover:to-sky-300">Sign in</button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
