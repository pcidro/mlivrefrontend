import { createContext, useContext } from 'react'
import type { Credentials, User } from '../types/auth'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string
  login(credentials: Credentials): Promise<void>
  logout(): Promise<void>
  reload(): void
}
export const AuthContext = createContext<AuthContextValue | null>(null)
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthProvider ausente')
  return context
}
