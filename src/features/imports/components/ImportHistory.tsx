import type { ImportSummary } from '../types/import'
import { Card } from '../../../components/ui/Card'
import { formatDate } from '../../../lib/utils/format'
import { importPlatformLabel } from '../services/importPresentation'
import { ImportStatusBadge } from './ImportStatusBadge'
import { ImportCounters } from './ImportCounters'

export function ImportHistory({ history }: { history: ImportSummary[] }) {
  return <Card className="import-history"><div className="section-heading"><div><h2>Importações desta sessão</h2><p>Execuções realizadas enquanto esta sessão está aberta. A lista é limpa ao recarregar a página.</p></div></div>
    {history.length ? <ol className="import-history-list">{history.map(result => <li key={result.id} className="import-history-entry">
      <div className="section-heading"><div><h3>{importPlatformLabel(result)}{result.accountName ? ` — ${result.accountName}` : ''}</h3><p>{formatDate(result.startedAt, true)}</p></div><ImportStatusBadge status={result.status} /></div>
      <ImportCounters result={result} />
    </li>)}</ol> : <p className="muted caption">Nenhuma importação realizada nesta sessão.</p>}
  </Card>
}
