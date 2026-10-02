import { useCallback } from 'react'
import { useResource } from '../../../hooks/useResource'
import { customersService } from '../services/customersService'
import { Drawer } from '../../../components/ui/Drawer'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { ErrorState, Skeleton } from '../../../components/ui/States'
import { formatDate, formatDocument, formatPhone } from '../../../lib/utils/format'
import { WhatsAppButton } from './WhatsAppButton'

export function CustomerDetailsDrawer({ id, onClose }: { id: string; onClose(): void }) {
  const load = useCallback((signal: AbortSignal) => customersService.get(id, signal), [id])
  const { data, loading, error, reload } = useResource(load)
  return <Drawer title="Detalhes do cliente" onClose={onClose}>
    <div className="drawer-body">{loading ? <Skeleton rows={6} /> : error ? <ErrorState message={error} onRetry={reload} /> : data && <>
      <div className="customer-identity"><Avatar name={data.name} large /><h2>{data.name ?? 'Nome não informado'}</h2><Badge tone={data.normalizedPhone ? 'success' : 'neutral'}>{data.normalizedPhone ? 'Com telefone' : 'Sem telefone'}</Badge></div>
      <dl className="details-list">
        <div><dt>CPF/CNPJ</dt><dd>{formatDocument(data.document)}</dd></div>
        <div><dt>Telefone</dt><dd>{formatPhone(data.normalizedPhone ?? data.phone)}</dd></div>
        <div><dt>Conta de origem</dt><dd>{data.marketplaceAccount.name}</dd></div>
        {data.marketplaceAccount.cnpj && <div><dt>CNPJ da conta</dt><dd>{formatDocument(data.marketplaceAccount.cnpj.replace(/\D/g, ''))}</dd></div>}
        <div><dt>Pedido</dt><dd>#{data.externalOrderId}</dd></div>
        <div><dt>Data da venda</dt><dd>{formatDate(data.orderDate, true)}</dd></div>
      </dl>
      <WhatsAppButton phone={data.normalizedPhone} full />
      <p className="caption muted drawer-note">A conversa será aberta em uma nova aba.</p>
    </>}</div>
  </Drawer>
}
