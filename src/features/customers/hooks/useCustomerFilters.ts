import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CustomerFilters } from '../types/customer'

const validDate = (value: string | null) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? value : ''
export function useCustomerFilters() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const hasPhone = params.get('hasPhone')
  const platform = params.get('platform')
  const filters: CustomerFilters = {
    page: Number.isSafeInteger(page) && page > 0 && page <= 100_000 ? page : 1,
    limit: 20,
    search: (params.get('search') ?? '').slice(0, 200),
    platform: platform === 'MERCADO_LIVRE' || platform === 'MAGALU' ? platform : '',
    marketplaceAccountId: params.get('marketplaceAccountId') ?? '',
    hasPhone: hasPhone === 'true' || hasPhone === 'false' ? hasPhone : '',
    dateFrom: validDate(params.get('dateFrom')), dateTo: validDate(params.get('dateTo')),
  }
  function update(patch: Partial<CustomerFilters>, replace = false) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      for (const [key, value] of Object.entries(patch)) {
        if (value === '') next.delete(key)
        else next.set(key, String(value))
      }
      if (!('page' in patch)) next.delete('page')
      return next
    }, { replace })
  }
  return { filters, update, reset: () => setParams({}) }
}

export function useDebouncedSearch(value: string) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), 400)
    return () => clearTimeout(timer)
  }, [value])
  return debounced
}
