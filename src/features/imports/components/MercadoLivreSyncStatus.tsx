import { Link } from 'react-router-dom'
import { useImports } from '../hooks/useImports'
import { ImportCounters } from './ImportCounters'
import { ImportStatusBadge } from './ImportStatusBadge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { ErrorState } from '../../../components/ui/States'
import type { MarketplaceAccount } from '../../marketplace-accounts/types/marketplaceAccount'

export function MercadoLivreSyncStatus({ accounts }: { accounts: MarketplaceAccount[] }) {
  const imports = useImports()
  const active = accounts.filter(account => account.platform === 'MERCADO_LIVRE' && account.isActive)
  if (!active.length) return null
  return <>
    {imports.syncError && <ErrorState message={`Não foi possível acompanhar a sincronização: ${imports.syncError}`} onRetry={imports.refreshSyncs} />}
    {active.map(account => {
      const summary = imports.syncs.find(item => item.marketplaceAccountId === account.id)
      const running = summary?.status === 'PROCESSING'
      return <Card key={account.id} className="import-sync" aria-live="polite">
        <div className="section-heading"><div><h2>Sincronização — {account.name}</h2>
          <p>{running ? 'Estamos importando seus clientes. Você pode navegar pelo sistema.'
            : summary?.status === 'SUCCESS' ? 'Importação concluída. Os clientes estão disponíveis para consulta.'
              : summary?.status === 'PARTIAL_SUCCESS' ? 'Os clientes processados foram salvos. Tente novamente para completar os pedidos com erro.'
                : summary?.status === 'ERROR' ? 'A sincronização foi interrompida ou apresentou erro. A conta continua conectada.'
                  : 'Conta conectada. Inicie a sincronização para buscar seus clientes.'}</p>
        </div>{summary && <ImportStatusBadge status={summary.status} />}</div>
        {summary && <ImportCounters result={summary} />}
        <div className="account-connect-actions"><Link className="button button-secondary" to="/customers">Consultar clientes</Link>
          <Button disabled={imports.processing} onClick={() => void imports.sync(account.id)}>
            {running ? 'Importando clientes...' : summary?.status === 'ERROR' || summary?.status === 'PARTIAL_SUCCESS' ? 'Tentar sincronização novamente' : 'Sincronizar novos pedidos'}
          </Button></div>
      </Card>
    })}
  </>
}
