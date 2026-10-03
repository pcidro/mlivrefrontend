import { apiClient } from '../../../lib/api/apiClient'
import type { MarketplaceAccount } from '../types/marketplaceAccount'

async function listIntegrated(signal?: AbortSignal): Promise<MarketplaceAccount[]> {
  const response = await apiClient.get<{ data: MarketplaceAccount[] }>('/marketplace-accounts', { signal })
  return response.data.filter((account) => account.platform === 'MERCADO_LIVRE' || account.platform === 'MAGALU')
}

export const marketplaceAccountsService = {
  async list(signal?: AbortSignal): Promise<MarketplaceAccount[]> {
    return (await listIntegrated(signal)).filter((account) => account.platform === 'MERCADO_LIVRE')
  },
  listIntegrated,
  connect() { window.location.assign(apiClient.url('/marketplace-accounts/mercadolivre/connect')) },
  connectMagalu() { window.location.assign(apiClient.url('/marketplace-accounts/magalu/connect')) },
  disconnect: (id: string) => apiClient.delete(`/marketplace-accounts/mercadolivre/${encodeURIComponent(id)}`),
}
