import { ApiError, apiClient } from '../../../lib/api/apiClient.ts'
import { dayBoundary } from '../../../lib/utils/format.ts'
import type { Paginated } from '../../../types/api'
import type { Customer, CustomerFilters } from '../types/customer'

export function createCustomersService(client: Pick<typeof apiClient, 'get'> = apiClient) {
  return {
    list: (filters: CustomerFilters, signal?: AbortSignal) => client.get<Paginated<Customer>>('/customers', {
      signal, params: { ...filters, dateFrom: dayBoundary(filters.dateFrom), dateTo: dayBoundary(filters.dateTo, true) },
    }),
    get: (id: string, signal?: AbortSignal) => client.get<Customer>(`/customers/${encodeURIComponent(id)}`, { signal }),
    async count(platform: Customer['platform'], signal?: AbortSignal): Promise<number> {
      const response = await client.get<Paginated<Customer>>('/customers', { signal, params: { platform, page: 1, limit: 1 } })
      const total = response.pagination?.total
      if (!Number.isSafeInteger(total) || total < 0) throw new ApiError('O servidor retornou uma contagem inesperada.', 502)
      return total
    },
  }
}

export const customersService = createCustomersService()
