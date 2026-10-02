import { useResource } from '../../../hooks/useResource'
import { marketplaceAccountsService } from '../services/marketplaceAccountsService'

export function useMarketplaceAccounts() { return useResource(marketplaceAccountsService.list) }
