import { useResource } from '../../../hooks/useResource'
import { marketplaceAccountsService } from '../services/marketplaceAccountsService'

export function useMarketplaceAccounts({ includeMagalu = false }: { includeMagalu?: boolean } = {}) {
  return useResource(includeMagalu ? marketplaceAccountsService.listIntegrated : marketplaceAccountsService.list)
}
