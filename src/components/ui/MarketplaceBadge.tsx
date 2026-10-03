import { Badge } from './Badge'
import type { MarketplaceAccount } from '../../features/marketplace-accounts/types/marketplaceAccount'
import { marketplacePresentation } from '../../lib/utils/marketplace'

export function MarketplaceBadge({ platform }: { platform: MarketplaceAccount['platform'] }) {
  const { label, tone } = marketplacePresentation[platform]
  return <Badge tone={tone}>{label}</Badge>
}
