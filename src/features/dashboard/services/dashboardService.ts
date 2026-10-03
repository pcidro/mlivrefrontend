import { apiClient, ApiError } from '../../../lib/api/apiClient.ts'
import type { DashboardSummary } from '../types/dashboard'
import { customersService } from '../../customers/services/customersService.ts'

export function createDashboardService(client: Pick<typeof apiClient, 'get'> = apiClient, customers = customersService) {
  return { async get(signal?: AbortSignal): Promise<DashboardSummary> {
    const [summary, magalu] = await Promise.allSettled([
      client.get<Omit<DashboardSummary, 'magaluCustomers'>>('/dashboard', { signal }),
      customers.count('MAGALU', signal),
    ])
    if (summary.status === 'rejected') throw summary.reason
    if (magalu.status === 'rejected' && magalu.reason instanceof ApiError && magalu.reason.status === 401) throw magalu.reason
    return { ...summary.value, magaluCustomers: magalu.status === 'fulfilled' ? magalu.value : null }
  } }
}

export const dashboardService = createDashboardService()
