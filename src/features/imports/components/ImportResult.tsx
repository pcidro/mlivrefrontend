import { Link } from 'react-router-dom'
import type { ImportSummary } from '../types/import'
import { Card } from '../../../components/ui/Card'
import { formatDate } from '../../../lib/utils/format'
import { importPlatformLabel } from '../services/importPresentation'
import { ImportCounters } from './ImportCounters'
import { ImportStatusBadge } from './ImportStatusBadge'

export function ImportResult({ result }: { result: ImportSummary }) {
  return <Card className="import-result" aria-live="polite"><div className="section-heading"><div><h2>Resultado da importação</h2><p>{importPlatformLabel(result)}{result.accountName ? ` — ${result.accountName}` : ''}</p><p>{formatDate(result.startedAt, true)}{result.finishedAt ? ` · Finalizada em ${formatDate(result.finishedAt, true)}` : ''}</p></div><ImportStatusBadge status={result.status} /></div>
    <ImportCounters result={result} />
    {result.status === 'PARTIAL_SUCCESS' && <p className="notice notice-warning">Os pedidos processados foram salvos. A execução apresentou erros; uma nova importação pode tentar completar os dados.</p>}
    {result.status === 'ERROR' && <p className="notice notice-danger">A importação não foi concluída. Confira a conexão da conta e tente novamente.</p>}
    <Link className="button button-secondary" to="/customers">Consultar clientes</Link>
  </Card>
}
