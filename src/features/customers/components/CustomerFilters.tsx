import type { CustomerFilters as Filters } from '../types/customer'
import type { MarketplaceAccount } from '../../marketplace-accounts/types/marketplaceAccount'
import { Input, Select } from '../../../components/ui/Fields'
import { Button } from '../../../components/ui/Button'
import { formatDocument } from '../../../lib/utils/format'

export function CustomerFilters({ filters, accounts, update, reset }: { filters: Filters; accounts: MarketplaceAccount[]; update(patch: Partial<Filters>, replace?: boolean): void; reset(): void }) {
  return <div className="customer-filters">
    <div className="search-field"><Input id="customer-search" label="Buscar cliente" type="search" placeholder="Buscar cliente (nome, telefone, CPF/CNPJ ou pedido)..." value={filters.search} maxLength={200} onChange={(event) => update({ search: event.target.value }, true)} /></div>
    <Select id="customer-account" label="Conta/CNPJ" value={filters.marketplaceAccountId} onChange={(event) => update({ marketplaceAccountId: event.target.value })}>
      <option value="">Todas as contas</option>
      {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}{account.cnpj ? ` · ${formatDocument(account.cnpj.replace(/\D/g, ''))}` : ''}</option>)}
      {filters.marketplaceAccountId && !accounts.some((account) => account.id === filters.marketplaceAccountId) && <option value={filters.marketplaceAccountId}>Conta selecionada</option>}
    </Select>
    <Input id="customer-from" label="Data inicial" type="date" value={filters.dateFrom} max={filters.dateTo || undefined} onChange={(event) => update({ dateFrom: event.target.value })} />
    <Input id="customer-to" label="Data final" type="date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(event) => update({ dateTo: event.target.value })} />
    <Button variant="ghost" className="clear-filters" onClick={reset}>Limpar</Button>
  </div>
}
