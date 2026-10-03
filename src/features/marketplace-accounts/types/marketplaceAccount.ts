export interface MarketplaceAccount {
  id: string
  platform: 'MERCADO_LIVRE' | 'MAGALU'
  name: string
  cnpj: string | null
  externalAccountId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
