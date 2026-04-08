import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './api'
import { AuthContext } from './auth-context'
import type { LoginPayload } from './auth-context'
import type { User } from './types'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth')
    return saved ? (JSON.parse(saved) as User) : null
  })
  const navigate = useNavigate()

  const login = async (payload: LoginPayload) => {
    const response = await api.post('/auth/login', payload)
    const { token, user: userData } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('auth', JSON.stringify(userData as User))
    setUser(userData as User)
    navigate('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('auth')
    setUser(null)
    navigate('/login')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
