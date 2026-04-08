import { createContext, useContext } from 'react'
import type { User } from './types'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthContextValue {
  user: User | null
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

export const initialAuthValue: AuthContextValue = {
  user: null,
  login: async () => {},
  logout: () => {},
}

export const AuthContext = createContext<AuthContextValue>(initialAuthValue)

export const useAuth = () => useContext(AuthContext)
