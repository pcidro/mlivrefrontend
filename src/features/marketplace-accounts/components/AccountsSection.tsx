import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { EmptyState, ErrorState, Skeleton } from '../../../components/ui/States'
import type { useMarketplaceAccounts } from '../hooks/useMarketplaceAccounts'
import { AccountCard } from './AccountCard'

export function AccountsSection({ accounts }: { accounts: ReturnType<typeof useMarketplaceAccounts> }) {
  return <Card className="accounts-section"><div className="section-heading"><div><h2>Contas integradas</h2><p>Gerencie suas contas conectadas ao Mercado Livre e à Magalu.</p></div>
    <Link className="text-link" to="/marketplace-accounts">Gerenciar contas<Icon name="chevron" /></Link></div>
    {accounts.loading ? <Skeleton rows={2} /> : accounts.error ? <ErrorState message={accounts.error} onRetry={accounts.reload} />
      : accounts.data?.length ? <div className="accounts-grid">{accounts.data.map((account) => <AccountCard account={account} key={account.id} />)}</div>
        : <EmptyState icon="store" title="Nenhuma conta conectada" description="Conecte uma conta para começar a importar seus clientes."
          action={<Link className="button button-primary" to="/marketplace-accounts"><Icon name="plus" />Conectar conta</Link>} />}
  </Card>
}
