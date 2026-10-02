import { Link } from 'react-router-dom'
import type { ImportSummary } from '../types/import'
import { Card } from '../../../components/ui/Card'
import { formatDate, formatNumber } from '../../../lib/utils/format'
import { ImportStatusBadge } from './ImportStatusBadge'

export function ImportResult({ result }: { result: ImportSummary }) {
  const counters = [
    ['Pedidos encontrados', result.ordersFound], ['Pedidos processados', result.ordersProcessed],
    ['Clientes com telefone', result.customersWithPhone], ['Clientes sem telefone', result.customersWithoutPhone],
    ['Erros', result.errorsCount],
  ] as const
  return <Card className="import-result" aria-live="polite"><div className="section-heading"><div><h2>Resultado da importação</h2><p>{formatDate(result.startedAt, true)}{result.finishedAt ? ` · Finalizada em ${formatDate(result.finishedAt, true)}` : ''}</p></div><ImportStatusBadge status={result.status} /></div>
    <div className="import-counters">{counters.map(([label, value]) => <div key={label}><strong>{formatNumber(value)}</strong><span>{label}</span></div>)}</div>
    {result.status === 'PARTIAL_SUCCESS' && <p className="notice notice-warning">Os pedidos processados foram salvos. Alguns pedidos não puderam ser importados.</p>}
    {result.status === 'ERROR' && <p className="notice notice-danger">A importação não foi concluída. Confira a conexão da conta e tente novamente.</p>}
    <Link className="button button-secondary" to="/customers">Consultar clientes</Link>
  </Card>
}
