import type { MarketplaceAccount } from '../../features/marketplace-accounts/types/marketplaceAccount'

export const marketplacePresentation = {
  MERCADO_LIVRE: { label: 'Mercado Livre', tone: 'neutral' },
  MAGALU: { label: 'Magalu', tone: 'primary' },
} as const satisfies Record<MarketplaceAccount['platform'], { label: string; tone: 'neutral' | 'primary' }>
