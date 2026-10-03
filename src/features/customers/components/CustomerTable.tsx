import type { Customer } from '../types/customer'
import { formatDate, formatDocument, formatPhone } from '../../../lib/utils/format'
import { Avatar } from '../../../components/ui/Avatar'
import { WhatsAppButton } from './WhatsAppButton'
import { MarketplaceBadge } from '../../../components/ui/MarketplaceBadge'

export function CustomerTable({ customers, selectedId, onSelect }: { customers: Customer[]; selectedId: string | null; onSelect(customer: Customer): void }) {
  return <div className="table-scroll" role="region" tabIndex={0} aria-label="Tabela de clientes">
    <table className="customer-table"><thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Plataforma</th><th>Conta</th><th>Pedido</th><th>Data</th><th>Ação</th></tr></thead>
      <tbody>{customers.map((customer) => <tr key={customer.customerId} className={selectedId === customer.customerId ? 'selected' : undefined}>
        <td><button className="customer-name" onClick={() => onSelect(customer)} aria-label={`Ver detalhes de ${customer.name ?? 'cliente sem nome'}`}><Avatar name={customer.name} /><span>{customer.name ?? 'Nome não informado'}</span></button></td>
        <td className="nowrap muted">{formatDocument(customer.document)}</td>
        <td className={`nowrap${customer.normalizedPhone ? '' : ' muted'}`}>{formatPhone(customer.normalizedPhone ?? customer.phone)}</td>
        <td><MarketplaceBadge platform={customer.platform} /></td>
        <td><span className="account-tag">{customer.marketplaceAccount.name}</span></td>
        <td><span className="order-reference">#{customer.externalOrderId}</span></td>
        <td className="nowrap muted">{formatDate(customer.orderDate)}</td>
        <td><WhatsAppButton phone={customer.normalizedPhone} /></td>
      </tr>)}</tbody>
    </table>
  </div>
}
