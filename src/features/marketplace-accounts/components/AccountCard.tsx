import type { MarketplaceAccount } from '../types/marketplaceAccount'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatDate, formatDocument } from '../../../lib/utils/format'
import { MercadoLivreLogo } from '../../../components/ui/Logos'

export function AccountCard({ account, onDisconnect, busy = false, disabled = false, detailed = false }: { account: MarketplaceAccount; onDisconnect?: () => void; busy?: boolean; disabled?: boolean; detailed?: boolean }) {
  return <article className="account-card">
    <div className="account-card-top"><MercadoLivreLogo symbol /><div><h3>{account.name}</h3><span className="caption muted">Mercado Livre</span></div><Badge tone={account.isActive ? 'success' : 'neutral'}>{account.isActive ? 'Conectada' : 'Desconectada'}</Badge></div>
    {account.cnpj && <p className="account-cnpj">CNPJ {formatDocument(account.cnpj.replace(/\D/g, ''))}</p>}
    {detailed && <dl className="account-metadata"><div><dt>Identificação da conta</dt><dd>{account.externalAccountId}</dd></div><div><dt>Conectada em</dt><dd>{formatDate(account.createdAt)}</dd></div></dl>}
    {onDisconnect && <Button variant="danger" className="button-small" disabled={busy || disabled} onClick={onDisconnect}>{busy ? 'Desconectando...' : 'Desconectar conta'}</Button>}
  </article>
}
