import type { ImportStatus } from '../../../types/api'
export interface ImportInput { marketplaceAccountId: string; dateFrom: string; dateTo: string }
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
}
