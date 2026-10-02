import { apiClient } from '../../../lib/api/apiClient'
import type { MarketplaceAccount } from '../types/marketplaceAccount'

export const marketplaceAccountsService = {
  async list(signal?: AbortSignal): Promise<MarketplaceAccount[]> {
    const response = await apiClient.get<{ data: MarketplaceAccount[] }>('/marketplace-accounts', { signal })
    return response.data.filter((account) => account.platform === 'MERCADO_LIVRE')
  },
  connect() { window.location.assign(apiClient.url('/marketplace-accounts/mercadolivre/connect')) },
  disconnect: (id: string) => apiClient.delete(`/marketplace-accounts/mercadolivre/${encodeURIComponent(id)}`),
}
