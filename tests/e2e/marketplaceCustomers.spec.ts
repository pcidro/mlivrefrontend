import { test, expect } from '@playwright/test'
import { mockApi } from './fixtures'
import type { Customer } from '../../src/features/customers/types/customer'
import type { MarketplaceAccount } from '../../src/features/marketplace-accounts/types/marketplaceAccount'

const accounts: MarketplaceAccount[] = [
  { id: '00000000-0000-4000-8000-000000000010', platform: 'MERCADO_LIVRE', name: 'Loja ML', cnpj: null,
    externalAccountId: 'ml-test', isActive: true, createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000020', platform: 'MAGALU', name: 'Loja Magalu', cnpj: '00000000000100',
    externalAccountId: 'tenant-test', isActive: true, createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z' },
]
function customer(index: number, patch: Partial<Customer> = {}): Customer {
  return { customerId: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`, name: `Cliente Magalu ${index}`,
    document: '00000000000', documentType: 'CPF', phone: '11911112222', normalizedPhone: '5511987654321', platform: 'MAGALU',
    marketplaceAccount: { id: accounts[1].id, name: accounts[1].name, cnpj: accounts[1].cnpj },
    externalOrderId: `000${index}`, orderDate: '2026-09-20T15:00:00Z', ...patch }
}
const rows: Customer[] = [
  customer(1, { name: 'Cliente Mercado Livre', platform: 'MERCADO_LIVRE', marketplaceAccount: accounts[0], externalOrderId: 'ML-1' }),
  customer(2, { name: 'Maria Magalu' }),
  customer(3, { name: 'Empresa Magalu', document: '00000000000100', documentType: 'CNPJ' }),
  customer(4, { name: 'Cliente sem telefone', normalizedPhone: null }),
  customer(5, { name: null, document: null, documentType: null, phone: null, normalizedPhone: null }),
]

test('Todas exibe clientes de ambas as origens e as oito colunas na ordem solicitada', async ({ page }) => {
  const state = await mockApi(page, { accounts, customers: rows })
  await page.goto('/customers')
  await expect(page.getByRole('columnheader')).toHaveText(['Nome', 'CPF/CNPJ', 'Telefone', 'Plataforma', 'Conta', 'Pedido', 'Data', 'Ação'])
  await expect(page.locator('.customer-table tbody tr')).toHaveCount(5)
  await expect(page.getByLabel('Plataforma', { exact: true })).toHaveValue('')
  await expect(page.locator('.customer-table tbody tr').filter({ hasText: 'Maria Magalu' })).toContainText('Magalu')
  await expect(page.locator('.customer-table tbody tr').filter({ hasText: 'Cliente Mercado Livre' })).toContainText('Mercado Livre')
  await expect(page.getByRole('button', { name: 'Ver detalhes de cliente sem nome' })).toBeVisible()
  expect(state.requests.filter(request => request.path === '/customers').every(request => !new URLSearchParams(request.search).has('platform'))).toBeTruthy()
  expect(state.unexpected).toEqual([])
})

test('filtro de plataforma reinicia paginação, limpa conta incompatível e persiste na URL', async ({ page }) => {
  const many = [...Array.from({ length: 25 }, (_, index) => customer(index + 10)), rows[0]]
  const state = await mockApi(page, { accounts, customers: many })
  await page.goto('/customers?page=2&marketplaceAccountId=' + accounts[1].id)
  await expect(page.getByText('Mostrando 21 a 25 de 25 clientes')).toBeVisible()
  await page.getByLabel('Plataforma', { exact: true }).selectOption('MERCADO_LIVRE')
  await expect(page).toHaveURL(/platform=MERCADO_LIVRE/)
  expect(new URL(page.url()).searchParams.has('page')).toBeFalsy()
  await expect(page.getByLabel('Conta/CNPJ', { exact: true })).toHaveValue('')
  await expect(page.locator('.customer-table tbody tr')).toHaveCount(1)
  await expect(page.getByLabel('Conta/CNPJ').getByRole('option', { name: /Loja Magalu/ })).toHaveCount(0)
  await page.getByLabel('Plataforma', { exact: true }).selectOption('MAGALU')
  await expect(page.getByText('Mostrando 1 a 20 de 25 clientes')).toBeVisible()
  await page.getByRole('button', { name: 'Próxima página' }).click()
  await expect(page.getByText('Mostrando 21 a 25 de 25 clientes')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Plataforma', { exact: true })).toHaveValue('MAGALU')
  await expect(page.getByText('Mostrando 21 a 25 de 25 clientes')).toBeVisible()
  expect(state.requests.filter(request => request.path === '/customers' && new URLSearchParams(request.search).get('page') === '2').at(-1)?.search).toContain('platform=MAGALU')
})

test('filtro Magalu combina telefone, conta, período e busca por documento; Limpar restaura Todas', async ({ page }) => {
  await mockApi(page, { accounts, customers: rows })
  await page.goto('/customers?platform=MAGALU')
  await expect(page.locator('.customer-table tbody tr')).toHaveCount(4)
  await page.getByRole('button', { name: 'Com telefone', exact: true }).click()
  await expect(page.locator('.customer-table tbody tr')).toHaveCount(2)
  await page.getByLabel('Conta/CNPJ').selectOption(accounts[1].id)
  await page.getByLabel('Data inicial', { exact: true }).fill('2026-09-01')
  await page.getByLabel('Data final', { exact: true }).fill('2026-09-30')
  await page.getByLabel('Buscar cliente', { exact: true }).fill('00.000.000/0001-00')
  await expect(page.locator('.customer-table tbody tr')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Ver detalhes de Empresa Magalu' })).toBeVisible()
  await page.getByRole('button', { name: 'Limpar', exact: true }).click()
  await expect(page.getByLabel('Plataforma', { exact: true })).toHaveValue('')
  await expect(page.locator('.customer-table tbody tr')).toHaveCount(5)
})

test('drawer Magalu mostra CPF/CNPJ, origem e pedido; WhatsApp utiliza normalizedPhone', async ({ page }) => {
  const state = await mockApi(page, { accounts, customers: rows })
  await page.goto('/customers?platform=MAGALU')
  const maria = page.locator('.customer-table tbody tr').filter({ hasText: 'Maria Magalu' })
  await expect(maria.getByRole('link', { name: 'WhatsApp', exact: true })).toHaveAttribute('href', 'https://wa.me/5511987654321')
  for (const [name, document, order] of [['Maria Magalu', '000.000.000-00', '#0002'], ['Empresa Magalu', '00.000.000/0001-00', '#0003']]) {
    await page.getByRole('button', { name: `Ver detalhes de ${name}` }).click()
    const drawer = page.getByRole('dialog', { name: 'Detalhes do cliente' })
    await expect(drawer.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(drawer.locator('.details-list > div').filter({ hasText: 'CPF/CNPJ' }).locator('dd')).toHaveText(document)
    await expect(drawer.getByText('Magalu', { exact: true })).toBeVisible()
    await expect(drawer.getByText('Loja Magalu', { exact: true })).toBeVisible()
    await expect(drawer.getByText(order, { exact: true })).toBeVisible()
    await expect(drawer.getByRole('link', { name: 'Abrir no WhatsApp' })).toHaveAttribute('href', 'https://wa.me/5511987654321')
    await expect(drawer.getByRole('link', { name: 'Abrir no WhatsApp' })).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(drawer.getByRole('heading', { name: 'Histórico', exact: true })).toHaveCount(0)
    await page.keyboard.press('Escape')
  }
  expect(state.unexpected).toEqual([])
})

test('sem normalizedPhone mantém WhatsApp desabilitado mesmo quando existe telefone bruto', async ({ page }) => {
  await mockApi(page, { accounts, customers: rows })
  await page.goto('/customers?platform=MAGALU&hasPhone=false')
  await expect(page.locator('.customer-table a[href^="https://wa.me/"]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Ver detalhes de Cliente sem telefone' }).click()
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Sem telefone', exact: true })).toBeDisabled()
})

test('cliente compartilhado preserva no drawer o pedido e a plataforma da linha filtrada', async ({ page }) => {
  const older = { ...rows[0], orderDate: '2026-09-10T15:00:00Z' }
  const newer = { ...older, platform: 'MAGALU' as const, marketplaceAccount: accounts[1], externalOrderId: 'MG-novo', orderDate: '2026-09-20T15:00:00Z' }
  await mockApi(page, { accounts, customers: [older], detailCustomers: [newer] })
  await page.goto('/customers?platform=MERCADO_LIVRE')
  await page.getByRole('button', { name: 'Ver detalhes de Cliente Mercado Livre' }).click()
  const drawer = page.getByRole('dialog')
  await expect(drawer.getByText('Mercado Livre', { exact: true })).toBeVisible()
  await expect(drawer.getByText('#ML-1', { exact: true })).toBeVisible()
  await expect(drawer.getByText('Loja ML', { exact: true })).toBeVisible()
  await expect(drawer.getByText('#MG-novo', { exact: true })).toHaveCount(0)
})

test('dashboard mostra total e contagens reais das duas plataformas sem alterar os quatro cards', async ({ page }) => {
  const state = await mockApi(page, { accounts, customers: rows, dashboard: {
    totalCustomers: 5, customersWithPhone: 3, customersWithoutPhone: 2, mercadoLivreCustomers: 1, lastImport: null,
  } })
  await page.goto('/dashboard')
  await expect(page.locator('.summary-card')).toHaveCount(4)
  await expect(page.locator('.summary-card').first().locator('> strong')).toHaveText('5')
  await expect(page.locator('.summary-platforms > div').filter({ hasText: 'Mercado Livre' }).locator('dd')).toHaveText('1')
  await expect(page.locator('.summary-platforms > div').filter({ hasText: 'Magalu' }).locator('dd')).toHaveText('4')
  await expect(page.getByRole('button', { name: 'Ver detalhes de Maria Magalu' })).toBeVisible()
  await expect(page.locator('.account-card').filter({ hasText: 'Loja Magalu' })).toBeVisible()
  expect(state.requests.some(request => request.path === '/customers' && new URLSearchParams(request.search).get('platform') === 'MAGALU' && new URLSearchParams(request.search).get('limit') === '1')).toBeTruthy()
  await page.screenshot({ path: 'test-results/marketplace-dashboard-desktop.png', fullPage: true })
  expect(state.unexpected).toEqual([])
})

test('falha da contagem complementar Magalu mantém totais e tabela disponíveis', async ({ page }) => {
  const state = await mockApi(page, { accounts, customers: rows })
  state.magaluCountFailures = Infinity
  await page.goto('/dashboard')
  await expect(page.locator('.summary-platforms > div').filter({ hasText: 'Magalu' }).locator('dd')).toHaveText('Indisponível')
  await expect(page.locator('.summary-card').first().locator('> strong')).toHaveText('25')
  await expect(page.getByRole('button', { name: 'Ver detalhes de Maria Magalu' })).toBeVisible()
})

test('clientes de ambas as plataformas mantêm responsividade e drawer no celular/tablet', async ({ page }) => {
  const state = await mockApi(page, { accounts, customers: rows })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/customers')
  await expect(page.getByLabel('Plataforma', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ver detalhes de Maria Magalu' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  await page.screenshot({ path: 'test-results/marketplace-customers-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Ver detalhes de Maria Magalu' }).click()
  await expect(page.getByRole('dialog').getByText('Magalu', { exact: true })).toBeVisible()
  await page.screenshot({ path: 'test-results/marketplace-customer-drawer-mobile.png', fullPage: true })
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 900, height: 1000 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  expect(state.runtimeErrors).toEqual([])
})

test('plataforma desconhecida na URL não é enviada à API como integração suportada', async ({ page }) => {
  const state = await mockApi(page, { accounts, customers: rows })
  await page.goto('/customers?platform=FUTURA')
  await expect(page.getByLabel('Plataforma', { exact: true })).toHaveValue('')
  await expect(page.locator('.customer-table tbody tr')).toHaveCount(5)
  expect(state.requests.filter(request => request.path === '/customers').every(request => !new URLSearchParams(request.search).has('platform'))).toBeTruthy()
})
