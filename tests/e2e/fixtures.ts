import type { Page } from '@playwright/test'
import type { MarketplaceAccount } from '../../src/features/marketplace-accounts/types/marketplaceAccount'
import type { ImportStatus } from '../../src/types/api'
import type { Customer } from '../../src/features/customers/types/customer'
import type { DashboardSummary } from '../../src/features/dashboard/types/dashboard'

export const accountId = '00000000-0000-4000-8000-000000000010'
export const customerId = '00000000-0000-4000-8000-000000000001'
const user = { id: 'user-test', name: 'Paula Fictícia', username: 'paula', email: 'paula@example.com', avatarUrl: null, role: 'USER', createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z' }
const account = { id: accountId, platform: 'MERCADO_LIVRE' as const, name: 'Loja principal', cnpj: '12345678000190', externalAccountId: '123456', isActive: true, createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z' }
const customers: Customer[] = Array.from({ length: 25 }, (_, index) => ({
  customerId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  name: index === 0 ? 'Maria Fictícia' : index === 1 ? 'Ana Fictícia' : index === 2 ? 'Empresa Exemplo' : `Cliente de teste ${index + 1}`,
  phone: index % 2 === 0 ? '5511999999999' : null,
  normalizedPhone: index % 2 === 0 ? '5511999999999' : null,
  document: index === 0 ? '12345678900' : index === 2 ? '12345678000190' : null,
  documentType: index === 0 ? 'CPF' : index === 2 ? 'CNPJ' : null,
  platform: 'MERCADO_LIVRE', marketplaceAccount: { id: accountId, name: account.name, cnpj: account.cnpj },
  externalOrderId: `ML-${10234 + index}`, orderDate: '2026-09-29T14:21:00Z',
}))

export async function mockApi(page: Page, options: { authenticated?: boolean; empty?: boolean; importDelay?: number; sessionUnavailable?: boolean; accounts?: MarketplaceAccount[]; accountsReady?: Promise<void>; importStatus?: ImportStatus; customers?: Customer[]; detailCustomers?: Customer[]; dashboard?: Omit<DashboardSummary, 'magaluCustomers'> } = {}) {
  const state = { authenticated: options.authenticated ?? true, sessionUnavailable: options.sessionUnavailable ?? false, customerFailures: 0, magaluCountFailures: 0, accountFailures: 0, importFailures: 0, expired: false, disconnected: false, oauthNavigation: false, requests: [] as { path: string; method: string; search: string }[], unexpected: [] as string[], runtimeErrors: [] as string[] }
  page.on('pageerror', (error) => state.runtimeErrors.push(error.message))
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    return url.origin === 'http://127.0.0.1:4173' ? route.continue() : route.abort()
  })
  await page.route('http://127.0.0.1:4173/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace('/api', '')
    state.requests.push({ path, method: request.method(), search: url.search })
    const json = (data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    if (path === '/auth/me') {
      if (state.sessionUnavailable) return route.abort('failed')
      return json(state.authenticated ? user : { error: 'Sessão ausente' }, state.authenticated ? 200 : 401)
    }
    if (path === '/auth/login') { state.authenticated = true; return json(user) }
    if (path === '/auth/logout') { state.authenticated = false; return route.fulfill({ status: 204 }) }
    if (state.expired || !state.authenticated) return json({ error: 'Sessão expirada' }, 401)
    if (path === '/marketplace-accounts' && request.method() === 'GET') {
      if (options.accountsReady) await options.accountsReady
      if (state.accountFailures > 0) { state.accountFailures--; return json({ error: 'Não foi possível carregar as contas integradas.' }, 503) }
      return json({ data: options.empty || state.disconnected ? [] : options.accounts ?? [account] })
    }
    if (path === `/marketplace-accounts/mercadolivre/${accountId}` && request.method() === 'DELETE') { state.disconnected = true; return route.fulfill({ status: 204 }) }
    if (path === '/marketplace-accounts/mercadolivre/connect') {
      state.oauthNavigation = request.isNavigationRequest()
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<h1>Autorização simulada</h1>' })
    }
    if (path === '/marketplace-accounts/magalu/connect') {
      state.oauthNavigation = request.isNavigationRequest()
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<h1>Autorização Magalu simulada</h1>' })
    }
    if (path === '/dashboard') return json(options.dashboard ?? { totalCustomers: options.empty ? 0 : 25, customersWithPhone: options.empty ? 0 : 13, customersWithoutPhone: options.empty ? 0 : 12, mercadoLivreCustomers: options.empty ? 0 : 25,
      lastImport: options.empty ? null : { startedAt: '2026-09-30T13:42:00Z', finishedAt: '2026-09-30T13:43:00Z', status: 'SUCCESS', ordersProcessed: 25 } })
    if (path === '/customers') {
      if (state.customerFailures > 0) { state.customerFailures--; return json({ error: 'Não foi possível consultar os clientes' }, 503) }
      if (url.searchParams.get('platform') === 'MAGALU' && url.searchParams.get('limit') === '1' && state.magaluCountFailures > 0) {
        state.magaluCountFailures--; return json({ error: 'Contagem indisponível' }, 503)
      }
      let rows = options.empty ? [] : options.customers ?? customers
      const search = (url.searchParams.get('search') ?? '').toLowerCase()
      const digits = search.replace(/\D/g, '')
      if (search) rows = rows.filter((row) => row.name?.toLowerCase().includes(search) || row.externalOrderId.toLowerCase().includes(search) || Boolean(digits && (row.document?.includes(digits) || row.phone?.includes(digits))))
      const platform = url.searchParams.get('platform')
      if (platform) rows = rows.filter(row => row.platform === platform)
      const selectedAccount = url.searchParams.get('marketplaceAccountId')
      if (selectedAccount) rows = rows.filter(row => row.marketplaceAccount.id === selectedAccount)
      const dateFrom = url.searchParams.get('dateFrom')
      const dateTo = url.searchParams.get('dateTo')
      if (dateFrom) rows = rows.filter(row => row.orderDate && Date.parse(row.orderDate) >= Date.parse(dateFrom))
      if (dateTo) rows = rows.filter(row => row.orderDate && Date.parse(row.orderDate) <= Date.parse(dateTo))
      const hasPhone = url.searchParams.get('hasPhone')
      if (hasPhone) rows = rows.filter((row) => Boolean(row.normalizedPhone) === (hasPhone === 'true'))
      const pageNumber = Number(url.searchParams.get('page') || 1)
      const limit = Number(url.searchParams.get('limit') || 20)
      return json({ data: rows.slice((pageNumber - 1) * limit, pageNumber * limit), pagination: { page: pageNumber, limit, total: rows.length, totalPages: Math.ceil(rows.length / limit) } })
    }
    if (path.startsWith('/customers/')) return json((options.detailCustomers ?? options.customers ?? customers).find((row) => row.customerId === path.split('/').at(-1)))
    if (['/imports/mercadolivre', '/imports/magalu'].includes(path) && request.method() === 'POST') {
      if (options.importDelay) await new Promise((resolve) => setTimeout(resolve, options.importDelay))
      if (state.importFailures > 0) { state.importFailures--; return json({ error: 'Não foi possível iniciar a importação.' }, 503) }
      const status = options.importStatus ?? 'PARTIAL_SUCCESS'
      return json({ id: `import-test-${state.requests.filter(request => request.method === 'POST' && request.path.startsWith('/imports/')).length}`,
        marketplaceAccountId: request.postDataJSON().marketplaceAccountId, status, startedAt: '2026-10-01T12:00:00Z', finishedAt: '2026-10-01T12:01:00Z',
        ordersFound: 4, ordersProcessed: status === 'ERROR' ? 0 : 3, customersWithPhone: status === 'ERROR' ? 0 : 2,
        customersWithoutPhone: status === 'ERROR' ? 0 : 1, errorsCount: status === 'SUCCESS' ? 0 : 1 })
    }
    state.unexpected.push(`${request.method()} ${path}`)
    return json({ error: 'Endpoint inesperado no teste' }, 404)
  })
  return state
}
