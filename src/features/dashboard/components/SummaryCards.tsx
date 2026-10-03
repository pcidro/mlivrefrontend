import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { formatDate, formatNumber } from '../../../lib/utils/format'
import { ImportStatusBadge } from '../../imports/components/ImportStatusBadge'
import type { DashboardSummary } from '../types/dashboard'

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return <div className="summary-grid">
    <Card className="summary-card"><div className="summary-top"><span className="summary-icon"><Icon name="users" /></span><span>Clientes importados</span></div><strong>{formatNumber(summary.totalCustomers)}</strong><p>Total de contatos centralizados</p>
      <dl className="summary-platforms"><div><dt>Mercado Livre</dt><dd>{formatNumber(summary.mercadoLivreCustomers)}</dd></div><div><dt>Magalu</dt><dd>{summary.magaluCustomers === null ? 'Indisponível' : formatNumber(summary.magaluCustomers)}</dd></div></dl>
      <p>Um cliente pode ter compras nas duas plataformas.</p>
    </Card>
    <Card className="summary-card"><div className="summary-top"><span className="summary-icon"><Icon name="phone" /></span><span>Com telefone</span></div><strong>{formatNumber(summary.customersWithPhone)}</strong><p>Telefone disponível</p></Card>
    <Card className="summary-card"><div className="summary-top"><span className="summary-icon icon-neutral"><Icon name="phoneOff" /></span><span>Sem telefone</span></div><strong>{formatNumber(summary.customersWithoutPhone)}</strong><p>Telefone não informado na origem</p></Card>
    <Card className="summary-card"><div className="summary-top"><span className="summary-icon"><Icon name="clock" /></span><span>Última importação</span></div>
      <strong className="summary-date">{summary.lastImport ? formatDate(summary.lastImport.startedAt, true) : 'Nenhuma ainda'}</strong>
      {summary.lastImport ? <ImportStatusBadge status={summary.lastImport.status} /> : <p>Comece importando seus clientes</p>}
    </Card>
  </div>
}
