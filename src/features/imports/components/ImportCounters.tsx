import type { ImportSummary } from '../types/import'
import { formatNumber } from '../../../lib/utils/format'

export function ImportCounters({ result }: { result: ImportSummary }) {
  const counters = [
    ['Pedidos encontrados', result.ordersFound], ['Pedidos processados', result.ordersProcessed],
    ['Clientes com telefone', result.customersWithPhone], ['Clientes sem telefone', result.customersWithoutPhone],
    ['Erros', result.errorsCount],
  ] as const
  return <dl className="import-counters">{counters.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{formatNumber(value)}</dd></div>)}</dl>
}
