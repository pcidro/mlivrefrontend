import type { MarketplaceAccount } from '../../marketplace-accounts/types/marketplaceAccount'
import type { ImportSummary } from '../types/import'
import { marketplacePresentation } from '../../../lib/utils/marketplace.ts'

export function importPlatformLabel(result: Pick<ImportSummary, 'platform'>): string {
  return marketplacePresentation[result.platform ?? 'MERCADO_LIVRE'].label
}

export function importAccountLabel(account: MarketplaceAccount): string {
  return `${marketplacePresentation[account.platform].label} — ${account.name}`
}
