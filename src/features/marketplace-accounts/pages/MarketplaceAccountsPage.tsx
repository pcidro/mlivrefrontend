import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMarketplaceAccounts } from '../hooks/useMarketplaceAccounts'
import { marketplaceAccountsService } from '../services/marketplaceAccountsService'
import { mercadoLivreConnectionError } from '../services/mercadoLivreConnectionError'
import type { MarketplaceAccount } from '../types/marketplaceAccount'
import { errorMessage } from '../../../lib/api/apiClient'
import { AccountCard } from '../components/AccountCard'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { EmptyState, ErrorState, Skeleton } from '../../../components/ui/States'
import { useImports } from '../../imports/hooks/useImports'
import { MercadoLivreSyncStatus } from '../../imports/components/MercadoLivreSyncStatus'

export function MarketplaceAccountsPage() {
  const accounts = useMarketplaceAccounts({ includeMagalu: true })
  const { processing } = useImports()
  const [params, setParams] = useSearchParams()
  const [connectionStatus] = useState(() => params.get('mercadolivre'))
  const [connectionError] = useState(() => mercadoLivreConnectionError(params.get('mercadolivre_error')))
  const [magaluStatus] = useState(() => params.get('magalu'))
  const [syncStartFailed] = useState(() => params.has('sync_error'))
  const [connecting, setConnecting] = useState<MarketplaceAccount['platform'] | null>(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  useEffect(() => {
    if (params.has('mercadolivre') || params.has('mercadolivre_error') || params.has('magalu') || params.has('import_id') || params.has('sync_error')) {
      const next = new URLSearchParams(params)
      next.delete('mercadolivre')
      next.delete('mercadolivre_error')
      next.delete('magalu')
      next.delete('import_id')
      next.delete('sync_error')
      setParams(next, { replace: true })
    }
  }, [params, setParams])
  function connect(platform: MarketplaceAccount['platform']) {
    if (connecting || busy || processing) return
    setConnecting(platform)
    setError('')
    try {
      if (platform === 'MAGALU') marketplaceAccountsService.connectMagalu()
      else marketplaceAccountsService.connect()
    } catch (caught) { setError(errorMessage(caught)); setConnecting(null) }
  }
  const connectionButtons = <div className="account-connect-actions">
    <Button onClick={() => connect('MERCADO_LIVRE')} disabled={processing || Boolean(busy) || Boolean(connecting)}><Icon name="plus" />{connecting === 'MERCADO_LIVRE' ? 'Conectando Mercado Livre...' : 'Conectar Mercado Livre'}</Button>
    <Button onClick={() => connect('MAGALU')} disabled={processing || Boolean(busy) || Boolean(connecting)}><Icon name="plus" />{connecting === 'MAGALU' ? 'Conectando Magalu...' : 'Conectar Magalu'}</Button>
  </div>
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
  return <div className="page-stack"><div className="page-heading accounts-page-heading"><div><h1>Contas Integradas</h1><p>Conecte e gerencie suas contas do Mercado Livre e da Magalu.</p></div>{connectionButtons}</div>
    {connectionStatus === 'success' && <p className="notice notice-success" role="status">Conta do Mercado Livre conectada com sucesso.</p>}
    {syncStartFailed && <p className="notice notice-warning" role="status">A conta foi conectada, mas não foi possível iniciar a importação. Use o botão de sincronização abaixo para tentar novamente.</p>}
    {connectionStatus === 'error' && <p className="notice notice-danger" role="alert">{connectionError}</p>}
    {magaluStatus === 'success' && <p className="notice notice-success" role="status">Conta Magalu conectada com sucesso.</p>}
    {magaluStatus === 'error' && <p className="notice notice-danger" role="alert">Não foi possível conectar a conta Magalu. Inicie uma nova conexão e conclua a autorização no mesmo navegador. Se o erro persistir, contate o responsável pelo sistema.</p>}
    {success && <p className="notice notice-success" role="status">{success}</p>}
    {error && <ErrorState message={error} />}
    <Card className="accounts-section">
      {accounts.loading ? <Skeleton rows={3} /> : accounts.error ? <ErrorState message={accounts.error} onRetry={accounts.reload} />
        : accounts.data?.length ? <div className="accounts-grid">{accounts.data.map((account) => <AccountCard key={account.id} account={account} detailed busy={busy === account.id} disabled={Boolean(busy) || processing || Boolean(connecting)} onDisconnect={account.platform === 'MERCADO_LIVRE' ? () => void disconnect(account) : undefined} />)}</div>
          : <EmptyState icon="store" title="Nenhuma conta conectada" description="Conecte uma conta do Mercado Livre ou da Magalu para organizar seus clientes."
            action={connectionButtons} />}
    </Card>
    <MercadoLivreSyncStatus accounts={accounts.data ?? []} />
    <p className="caption muted"><Icon name="lock" className="inline-icon" /> A autorização é feita no site de cada plataforma. Suas credenciais ficam protegidas.</p>
  </div>
}
