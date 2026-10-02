import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMarketplaceAccounts } from '../hooks/useMarketplaceAccounts'
import { marketplaceAccountsService } from '../services/marketplaceAccountsService'
import type { MarketplaceAccount } from '../types/marketplaceAccount'
import { errorMessage } from '../../../lib/api/apiClient'
import { AccountCard } from '../components/AccountCard'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { EmptyState, ErrorState, Skeleton } from '../../../components/ui/States'
import { useImports } from '../../imports/hooks/useImports'

export function MarketplaceAccountsPage() {
  const accounts = useMarketplaceAccounts()
  const { processing } = useImports()
  const [params, setParams] = useSearchParams()
  const [connectionStatus] = useState(() => params.get('mercadolivre'))
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  useEffect(() => {
    if (params.has('mercadolivre')) { const next = new URLSearchParams(params); next.delete('mercadolivre'); setParams(next, { replace: true }) }
  }, [params, setParams])
  async function disconnect(account: MarketplaceAccount) {
    if (busy || !window.confirm(`Desconectar a conta "${account.name}"? Os clientes já importados serão preservados.`)) return
    setBusy(account.id)
    setError('')
    setSuccess('')
    try {
      await marketplaceAccountsService.disconnect(account.id)
      setSuccess('Conta desconectada com sucesso.')
      accounts.reload()
    } catch (caught) { setError(errorMessage(caught)) }
    finally { setBusy('') }
  }
  return <div className="page-stack"><div className="page-heading"><div><h1>Contas Integradas</h1><p>Conecte e gerencie suas contas do Mercado Livre.</p></div><Button onClick={marketplaceAccountsService.connect} disabled={processing}><Icon name="plus" />Conectar Mercado Livre</Button></div>
    {connectionStatus === 'success' && <p className="notice notice-success" role="status">Conta do Mercado Livre conectada com sucesso.</p>}
    {connectionStatus === 'error' && <p className="notice notice-danger" role="alert">Não foi possível conectar a conta. Tente novamente.</p>}
    {success && <p className="notice notice-success" role="status">{success}</p>}
    {error && <ErrorState message={error} />}
    <Card className="accounts-section">
      {accounts.loading ? <Skeleton rows={3} /> : accounts.error ? <ErrorState message={accounts.error} onRetry={accounts.reload} />
        : accounts.data?.length ? <div className="accounts-grid">{accounts.data.map((account) => <AccountCard key={account.id} account={account} detailed busy={busy === account.id} disabled={Boolean(busy) || processing} onDisconnect={() => void disconnect(account)} />)}</div>
          : <EmptyState icon="store" title="Conecte sua conta do Mercado Livre" description="Importe suas vendas e organize os contatos dos seus clientes."
            action={<Button onClick={marketplaceAccountsService.connect} disabled={processing}><Icon name="plus" />Conectar Mercado Livre</Button>} />}
    </Card><p className="caption muted"><Icon name="lock" className="inline-icon" /> A autorização é feita no site do Mercado Livre. Suas credenciais ficam protegidas.</p>
  </div>
}
