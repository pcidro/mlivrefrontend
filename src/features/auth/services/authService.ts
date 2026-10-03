import { ApiError, apiClient } from '../../../lib/api/apiClient'
import type { Credentials, User } from '../types/auth'

export const authService = {
  me: (signal?: AbortSignal) => apiClient.get<User>('/auth/me', { signal, cache: 'no-store' }),
  login: async (credentials: Credentials): Promise<User> => {
    await apiClient.post<User>('/auth/login', credentials, { notifyUnauthorized: false })
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      return await apiClient.get<User>('/auth/me', {
        signal: controller.signal, cache: 'no-store', notifyUnauthorized: false,
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new ApiError('Sua senha foi aceita, mas não foi possível manter a sessão neste navegador. Tente novamente ou contate o responsável pelo sistema.', 401)
      }
      if (controller.signal.aborted) {
        throw new ApiError('A confirmação do login demorou mais que o esperado. Tente novamente.', 0)
      }
      throw error
    } finally { clearTimeout(timer) }
  },
  logout: () => apiClient.post<void>('/auth/logout'),
}
