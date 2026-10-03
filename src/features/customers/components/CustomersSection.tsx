import { useState } from 'react'
import { useCustomers } from '../hooks/useCustomers'
import { useCustomerFilters, useDebouncedSearch } from '../hooks/useCustomerFilters'
import type { useMarketplaceAccounts } from '../../marketplace-accounts/hooks/useMarketplaceAccounts'
import { CustomerFilters } from './CustomerFilters'
import { CustomerTable } from './CustomerTable'
import { CustomerDetailsDrawer } from './CustomerDetailsDrawer'
import { Card } from '../../../components/ui/Card'
import { EmptyState, ErrorState, Skeleton } from '../../../components/ui/States'
import { Pagination } from '../../../components/ui/Pagination'
import type { Customer } from '../types/customer'

export function CustomersSection({ accounts }: { accounts: ReturnType<typeof useMarketplaceAccounts> }) {
  const { filters, update, reset } = useCustomerFilters()
  const search = useDebouncedSearch(filters.search)
  const customers = useCustomers({ ...filters, search })
  const [selected, setSelected] = useState<Customer | null>(null)
  const invalidPeriod = Boolean(filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo)
  return <Card className="customers-section">
    <div className="section-heading"><div><h2>Clientes</h2><p>Contatos obtidos das notas fiscais e dos dados disponíveis no Mercado Livre e na Magalu.</p></div></div>
    <CustomerFilters filters={filters} accounts={accounts.data ?? []} update={update} reset={reset} />
    {accounts.error && <div className="filter-error"><ErrorState message="Não foi possível carregar as contas do filtro." onRetry={accounts.reload} /></div>}
    <div className="customer-tabs" role="group" aria-label="Filtrar por telefone">
      {([['', 'Todos'], ['true', 'Com telefone'], ['false', 'Sem telefone']] as const).map(([value, label]) =>
        <button key={value} className={filters.hasPhone === value ? 'active' : ''} aria-pressed={filters.hasPhone === value} onClick={() => update({ hasPhone: value })}>{label}</button>)}
    </div>
    {invalidPeriod ? <ErrorState message="A data inicial deve ser anterior ou igual à data final." />
      : customers.loading || search !== filters.search ? <div className="table-loading"><Skeleton rows={6} /></div>
        : customers.error ? <ErrorState message={customers.error} onRetry={customers.reload} />
          : customers.data && <>
            {customers.data.data.length ? <CustomerTable customers={customers.data.data} selectedId={selected?.customerId ?? null} onSelect={setSelected} />
              : <EmptyState title="Nenhum cliente encontrado" description="Faça uma importação ou altere os filtros para encontrar seus clientes." />}
            <Pagination pagination={customers.data.pagination} onPage={(page) => update({ page })} />
          </>}
    {selected && <CustomerDetailsDrawer id={selected.customerId} origin={selected} onClose={() => setSelected(null)} />}
  </Card>
}
