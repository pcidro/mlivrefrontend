import { apiClient, ApiError } from '../../../lib/api/apiClient.ts'
import { dayBoundary } from '../../../lib/utils/format.ts'
import type { ImportInput, ImportSummary } from '../types/import'
import type { MarketplaceAccount } from '../../marketplace-accounts/types/marketplaceAccount'

// Consulta do histórico persistido depende de uma rota de leitura no backend.
export const importCapabilities = { history: false } as const
const endpoints: Record<MarketplaceAccount['platform'], string> = {
  MERCADO_LIVRE: '/imports/mercadolivre', MAGALU: '/imports/magalu',
}

export function createImportsService(client: Pick<typeof apiClient, 'post'> = apiClient) {
  return {
    async start(input: ImportInput): Promise<ImportSummary> {
      // Chamadas legadas sem plataforma continuam usando Mercado Livre.
      const platform = input.platform ?? 'MERCADO_LIVRE'
      if (!Object.hasOwn(endpoints, platform)) throw new ApiError('Plataforma de importação não suportada.', 400)
      const dateFrom = dayBoundary(input.dateFrom)
      const dateTo = dayBoundary(input.dateTo, true)
      if (!dateFrom || !dateTo || dateFrom > dateTo) throw new ApiError('Informe um período válido para a importação.', 400)
      const result = await client.post<ImportSummary>(endpoints[platform], {
        marketplaceAccountId: input.marketplaceAccountId, dateFrom, dateTo,
      })
      return { ...result, platform, ...(input.accountName ? { accountName: input.accountName } : {}) }
    },
  }
}

export const importsService = createImportsService()
