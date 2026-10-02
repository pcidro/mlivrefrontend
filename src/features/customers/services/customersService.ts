import { ApiError, apiClient } from '../../../lib/api/apiClient'
import { dayBoundary } from '../../../lib/utils/format'
import type { Paginated } from '../../../types/api'
import type { Customer, CustomerFilters } from '../types/customer'

export const customersService = {
  list: (filters: CustomerFilters, signal?: AbortSignal) => apiClient.get<Paginated<Customer>>('/customers', {
    signal, params: { ...filters, platform: 'MERCADO_LIVRE', dateFrom: dayBoundary(filters.dateFrom), dateTo: dayBoundary(filters.dateTo, true) },
  }),
  async get(id: string, signal?: AbortSignal): Promise<Customer> {
    const customer = await apiClient.get<Customer>(`/customers/${encodeURIComponent(id)}`, { signal })
    if (customer.platform !== 'MERCADO_LIVRE') throw new ApiError('Cliente indisponível nesta integração.', 404)
    return customer
  },
}
