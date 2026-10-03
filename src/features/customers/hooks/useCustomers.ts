import { useCallback } from 'react'
import { useResource } from '../../../hooks/useResource'
import { customersService } from '../services/customersService'
import type { CustomerFilters } from '../types/customer'

export function useCustomers(filters: CustomerFilters) {
  const { page, limit, search, platform, marketplaceAccountId, hasPhone, dateFrom, dateTo } = filters
  const load = useCallback((signal: AbortSignal) => customersService.list({
    page, limit, search, platform, marketplaceAccountId, hasPhone, dateFrom, dateTo,
  }, signal), [page, limit, search, platform, marketplaceAccountId, hasPhone, dateFrom, dateTo])
  return useResource(load)
}
