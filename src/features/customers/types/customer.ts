import type { MarketplaceAccount } from '../../marketplace-accounts/types/marketplaceAccount'

export interface Customer {
  customerId: string
  name: string | null
  phone: string | null
  normalizedPhone: string | null
  document: string | null
  documentType: 'CPF' | 'CNPJ' | null
  platform: MarketplaceAccount['platform']
  marketplaceAccount: { id: string; name: string; cnpj: string | null }
  externalOrderId: string
  orderDate: string | null
}
export interface CustomerFilters {
  page: number
  limit: number
  search: string
  platform: '' | MarketplaceAccount['platform']
  marketplaceAccountId: string
  hasPhone: '' | 'true' | 'false'
  dateFrom: string
  dateTo: string
}
