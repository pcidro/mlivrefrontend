import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMarketplaceAccounts } from '../../marketplace-accounts/hooks/useMarketplaceAccounts'
import { useImports } from '../hooks/useImports'
import { ImportResult } from '../components/ImportResult'
import { ImportHistory } from '../components/ImportHistory'
import { importAccountLabel } from '../services/importPresentation'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input, Select } from '../../../components/ui/Fields'
import { EmptyState, ErrorState, Skeleton } from '../../../components/ui/States'
import { Icon } from '../../../components/ui/Icon'
import { formatDocument, localDateInput } from '../../../lib/utils/format'

export function ImportsPage() {
  const accounts = useMarketplaceAccounts({ includeMagalu: true })
  const imports = useImports()
  const [accountId, setAccountId] = useState('')
  const [dateFrom, setDateFrom] = useState(() => { const date = new Date(); date.setDate(date.getDate() - 7); return localDateInput(date) })
  const [dateTo, setDateTo] = useState(() => localDateInput())
  const [validation, setValidation] = useState('')
  const activeAccounts = accounts.data?.filter((account) => account.isActive) ?? []
  const selected = accountId || (activeAccounts.length === 1 ? activeAccounts[0].id : '')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (imports.processing) return
    const selectedAccount = activeAccounts.find((account) => account.id === selected)
    if (!selectedAccount) { setValidation('Selecione uma conta conectada.'); return }
    if (!dateFrom || !dateTo || dateFrom > dateTo) { setValidation('Informe um período válido para a importação.'); return }
    setValidation('')
    await imports.start({ marketplaceAccountId: selectedAccount.id, platform: selectedAccount.platform, accountName: selectedAccount.name, dateFrom, dateTo })
  }
  return <div className="page-stack"><div className="page-heading"><div><h1>Importações</h1><p>Organize os clientes das suas vendas em um só lugar.</p></div></div>
    <Card className="import-form-card"><div className="section-heading"><div><h2>Nova importação</h2><p>Selecione a conta e o período das vendas no Mercado Livre ou na Magalu.</p></div><span className="summary-icon"><Icon name="download" /></span></div>
      {accounts.loading ? <Skeleton rows={3} /> : accounts.error ? <ErrorState message={accounts.error} onRetry={accounts.reload} /> : !activeAccounts.length
        ? <EmptyState icon="store" title="Conecte uma conta para importar" description="Você precisa de uma conta do Mercado Livre ou da Magalu conectada."
          action={<Link className="button button-primary" to="/marketplace-accounts">Conectar conta</Link>} />
        : <form onSubmit={submit}>
          <fieldset className="import-fields" disabled={imports.processing}><legend className="sr-only">Dados da importação</legend>
            <Select id="import-account" label="Conta integrada" required value={selected} onChange={(event) => setAccountId(event.target.value)}><option value="" disabled>Selecione uma conta</option>
              {activeAccounts.map((account) => <option key={account.id} value={account.id}>{importAccountLabel(account)}{account.cnpj ? ` · ${formatDocument(account.cnpj.replace(/\D/g, ''))}` : ''}</option>)}</Select>
            <Input id="import-from" label="Data inicial" type="date" required value={dateFrom} max={dateTo || localDateInput()} onChange={(event) => setDateFrom(event.target.value)} />
            <Input id="import-to" label="Data final" type="date" required value={dateTo} min={dateFrom} max={localDateInput()} onChange={(event) => setDateTo(event.target.value)} />
          </fieldset>
          {validation && <p className="notice notice-danger" role="alert">{validation}</p>}
          <div className="import-form-footer"><p className="muted caption">Vendas já importadas são atualizadas, sem duplicar pedidos.</p><Button type="submit" disabled={imports.processing}><Icon name="download" />{imports.processing ? 'Importando clientes...' : 'Importar clientes'}</Button></div>
        </form>}
    </Card>
    {imports.processing && <Card className="import-progress" role="status"><span className="spinner" /><div><h2>Importando clientes...</h2><p>Consultando pedidos e notas fiscais. Aguarde o resultado.</p></div></Card>}
    {imports.error && <ErrorState message={imports.error} />}
    {imports.result && <ImportResult result={imports.result} />}
    <ImportHistory history={imports.history} />
  </div>
}
