import { useCallback } from 'react'
import { useResource } from '../../../hooks/useResource'
import { customersService } from '../services/customersService'
import type { CustomerFilters } from '../types/customer'
import { useImports } from '../../imports/hooks/useImports'

export function useCustomers(filters: CustomerFilters) {
  const { syncs } = useImports()
  const syncProgress = syncs.map(item => `${item.id}:${item.ordersProcessed}:${item.status}`).join('|')
  const { page, limit, search, platform, marketplaceAccountId, hasPhone, dateFrom, dateTo } = filters
  const load = useCallback((signal: AbortSignal) => customersService.list({
    page, limit, search, platform, marketplaceAccountId, hasPhone, dateFrom, dateTo,
  }, signal), [page, limit, search, platform, marketplaceAccountId, hasPhone, dateFrom, dateTo])
  return useResource(load, syncProgress)
}
