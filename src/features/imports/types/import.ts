import type { ImportStatus } from '../../../types/api'
import type { MarketplaceAccount } from '../../marketplace-accounts/types/marketplaceAccount'
export interface ImportInput {
  marketplaceAccountId: string
  dateFrom: string
  dateTo: string
  platform?: MarketplaceAccount['platform']
  accountName?: string
}
export interface ImportSummary {
  id: string
  marketplaceAccountId: string
  status: ImportStatus
  startedAt: string
  finishedAt: string | null
  ordersFound: number
  ordersProcessed: number
  customersWithPhone: number
  customersWithoutPhone: number
  errorsCount: number
  // Metadados da conta selecionada; opcionais para resultados antigos do Mercado Livre.
  platform?: MarketplaceAccount['platform']
  accountName?: string
}
