import { apiClient } from '../../../lib/api/apiClient'
import type { DashboardSummary } from '../types/dashboard'
export const dashboardService = { get: (signal?: AbortSignal) => apiClient.get<DashboardSummary>('/dashboard', { signal }) }
