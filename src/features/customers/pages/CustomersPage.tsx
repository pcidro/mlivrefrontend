import { Link } from 'react-router-dom'
import { CustomersSection } from '../components/CustomersSection'
import { Icon } from '../../../components/ui/Icon'
import { useMarketplaceAccounts } from '../../marketplace-accounts/hooks/useMarketplaceAccounts'
export function CustomersPage() {
  const accounts = useMarketplaceAccounts({ includeMagalu: true })
  return <div className="page-stack"><div className="page-heading"><div><h1>Seus clientes</h1><p>Encontre contatos e consulte os dados de cada venda.</p></div><Link className="button button-primary" to="/imports"><Icon name="download" />Importar clientes</Link></div><CustomersSection accounts={accounts} /></div>
}
