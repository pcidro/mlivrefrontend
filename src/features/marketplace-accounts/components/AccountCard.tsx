import type { MarketplaceAccount } from '../types/marketplaceAccount'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatDate, formatDocument } from '../../../lib/utils/format'
import { MercadoLivreLogo } from '../../../components/ui/Logos'
import { MarketplaceBadge } from '../../../components/ui/MarketplaceBadge'
import { marketplacePresentation } from '../../../lib/utils/marketplace'

export function AccountCard({ account, onDisconnect, busy = false, disabled = false, detailed = false }: { account: MarketplaceAccount; onDisconnect?: () => void; busy?: boolean; disabled?: boolean; detailed?: boolean }) {
  const isMagalu = account.platform === 'MAGALU'
  const platformName = marketplacePresentation[account.platform].label
  const hasStoreName = Boolean(account.name.trim()) && (!isMagalu || account.name !== account.externalAccountId)
  return <article className="account-card">
    <div className="account-card-top">{isMagalu ? <span className="marketplace-monogram" aria-hidden="true">M</span> : <MercadoLivreLogo symbol />}<div><h3>{hasStoreName ? account.name : `Conta ${platformName}`}</h3><MarketplaceBadge platform={account.platform} /></div><Badge tone={account.isActive ? 'success' : 'neutral'}>{account.isActive ? 'Conectada' : 'Desconectada'}</Badge></div>
    {!hasStoreName && <p className="caption muted account-name-note">Nome da loja não informado.</p>}
    {account.cnpj && <p className="account-cnpj">CNPJ {formatDocument(account.cnpj.replace(/\D/g, ''))}</p>}
    {detailed && <dl className="account-metadata"><div><dt>Identificação da conta</dt><dd>{account.externalAccountId}</dd></div><div><dt>Conectada em</dt><dd>{formatDate(account.createdAt)}</dd></div></dl>}
    {onDisconnect && !isMagalu && <Button variant="danger" className="button-small" disabled={busy || disabled} onClick={onDisconnect}>{busy ? 'Desconectando...' : 'Desconectar conta'}</Button>}
  </article>
}
