import { apiClient } from '../../../lib/api/apiClient'
import { dayBoundary } from '../../../lib/utils/format'
import type { ImportInput, ImportSummary } from '../types/import'

// Histórico será integrado quando houver rota de leitura no backend.
export const importCapabilities = { history: false } as const
export const importsService = {
  start: (input: ImportInput) => apiClient.post<ImportSummary>('/imports/mercadolivre', {
    ...input, dateFrom: dayBoundary(input.dateFrom), dateTo: dayBoundary(input.dateTo, true),
  }),
}
