import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, errorMessage, SESSION_EXPIRED_EVENT } from '../../lib/api/apiClient'
import { authService } from '../../features/auth/services/authService'
import { AuthContext } from '../../features/auth/hooks/useAuth'
import type { User } from '../../features/auth/types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function restore() {
      const timeout = new AbortController()
      const timer = setTimeout(() => timeout.abort(), 10_000)
      setLoading(true)
      setError('')
      try {
        const current = await authService.me(AbortSignal.any([controller.signal, timeout.signal]))
        if (!controller.signal.aborted) setUser(current)
      } catch (caught) {
        if (!controller.signal.aborted && !(caught instanceof ApiError && caught.status === 401)) {
          setError(timeout.signal.aborted ? 'A verificação da sessão demorou mais que o esperado. Tente novamente.' : errorMessage(caught))
        }
      } finally {
        clearTimeout(timer)
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    const expire = () => { setUser(null); setError('') }
    window.addEventListener(SESSION_EXPIRED_EVENT, expire)
    void restore()
    return () => { controller.abort(); window.removeEventListener(SESSION_EXPIRED_EVENT, expire) }
  }, [revision])
  return <AuthContext.Provider value={{
    user, loading, error,
    login: async (credentials) => { setUser(await authService.login(credentials)); setError('') },
    logout: async () => { await authService.logout(); setUser(null); setError('') },
    reload: () => setRevision((value) => value + 1),
  }}>{children}</AuthContext.Provider>
}
