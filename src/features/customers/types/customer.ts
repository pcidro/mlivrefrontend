export interface Customer {
  customerId: string
  name: string | null
  phone: string | null
  normalizedPhone: string | null
  document: string | null
  documentType: 'CPF' | 'CNPJ' | null
  platform: 'MERCADO_LIVRE'
  marketplaceAccount: { id: string; name: string; cnpj: string | null }
  externalOrderId: string
  orderDate: string | null
}
export interface CustomerFilters {
  page: number
  limit: number
  search: string
  marketplaceAccountId: string
  hasPhone: '' | 'true' | 'false'
  dateFrom: string
  dateTo: string
}
