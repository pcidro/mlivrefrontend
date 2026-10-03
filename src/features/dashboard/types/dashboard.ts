import type { ImportStatus } from '../../../types/api'
export interface DashboardSummary {
  totalCustomers: number
  customersWithPhone: number
  customersWithoutPhone: number
  mercadoLivreCustomers: number
  magaluCustomers: number | null
  lastImport: { startedAt: string; finishedAt: string | null; status: ImportStatus; ordersProcessed: number } | null
}
