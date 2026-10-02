import type { ImportStatus } from '../../../types/api'
export interface DashboardSummary {
  totalCustomers: number
  customersWithPhone: number
  customersWithoutPhone: number
  mercadoLivreCustomers: number
  lastImport: { startedAt: string; finishedAt: string | null; status: ImportStatus; ordersProcessed: number } | null
}
