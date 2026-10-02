import { apiClient } from '../../../lib/api/apiClient'
import type { Credentials, User } from '../types/auth'

export const authService = {
  me: (signal?: AbortSignal) => apiClient.get<User>('/auth/me', { signal }),
  login: (credentials: Credentials) => apiClient.post<User>('/auth/login', credentials, { notifyUnauthorized: false }),
  logout: () => apiClient.post<void>('/auth/logout'),
}
