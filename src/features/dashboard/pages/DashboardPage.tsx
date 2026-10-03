import { Link } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { SummaryCards } from '../components/SummaryCards'
import { AccountsSection } from '../../marketplace-accounts/components/AccountsSection'
import { useMarketplaceAccounts } from '../../marketplace-accounts/hooks/useMarketplaceAccounts'
import { CustomersSection } from '../../customers/components/CustomersSection'
import { Card } from '../../../components/ui/Card'
import { ErrorState, Skeleton } from '../../../components/ui/States'
import { Icon } from '../../../components/ui/Icon'

export function DashboardPage() {
  const dashboard = useDashboard()
  const accounts = useMarketplaceAccounts({ includeMagalu: true })
  return <div className="page-stack"><div className="page-heading"><div><h1>Dashboard</h1><p>Uma visão geral dos seus clientes e importações.</p></div><Link className="button button-primary" to="/imports"><Icon name="plus" />Nova importação</Link></div>
    {dashboard.loading ? <div className="summary-grid">{[1, 2, 3, 4].map((key) => <Card className="summary-card" key={key}><Skeleton rows={3} /></Card>)}</div>
      : dashboard.error ? <ErrorState message={dashboard.error} onRetry={dashboard.reload} /> : dashboard.data && <SummaryCards summary={dashboard.data} />}
    <AccountsSection accounts={accounts} />
    <CustomersSection accounts={accounts} />
  </div>
}
