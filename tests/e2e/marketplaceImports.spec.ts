import { test, expect } from '@playwright/test'
import { mockApi } from './fixtures'
import type { MarketplaceAccount } from '../../src/features/marketplace-accounts/types/marketplaceAccount'

const accounts: MarketplaceAccount[] = [
  { id: '00000000-0000-4000-8000-000000000010', platform: 'MERCADO_LIVRE', name: 'Loja A', cnpj: '12345678000190',
    externalAccountId: 'account-ml', isActive: true, createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000020', platform: 'MAGALU', name: 'Loja B', cnpj: null,
    externalAccountId: 'tenant-magalu', isActive: true, createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z' },
]

test('seleção identifica plataforma e conta, exclui inativas e não escolhe arbitrariamente entre contas', async ({ page }) => {
  const state = await mockApi(page, { accounts: [...accounts, { ...accounts[1], id: 'inactive', name: 'Inativa', isActive: false }] })
  await page.goto('/imports')
  const select = page.getByLabel('Conta integrada')
  await expect(select.getByRole('option', { name: /Mercado Livre — Loja A/ })).toHaveCount(1)
  await expect(select.getByRole('option', { name: 'Magalu — Loja B', exact: true })).toHaveCount(1)
  await expect(select.getByRole('option', { name: /Inativa/ })).toHaveCount(0)
  await expect(select).toHaveValue('')
  await expect(page.getByText('Nenhuma importação realizada nesta sessão.')).toBeVisible()
  expect(state.unexpected).toEqual([])
})

for (const [index, label, endpoint] of [[0, 'Mercado Livre', 'mercadolivre'], [1, 'Magalu', 'magalu']] as const) {
  test(`selecionar ${label} usa endpoint correto e mostra os mesmos cinco contadores`, async ({ page }) => {
    const state = await mockApi(page, { accounts })
    await page.goto('/imports')
    await page.getByLabel('Conta integrada').selectOption(accounts[index].id)
    await page.getByLabel('Data inicial', { exact: true }).fill('2026-09-01')
    await page.getByLabel('Data final', { exact: true }).fill('2026-09-30')
    const requestPromise = page.waitForRequest(request => request.url().endsWith(`/api/imports/${endpoint}`))
    await page.getByRole('button', { name: 'Importar clientes', exact: true }).click()
    const request = await requestPromise
    expect(request.method()).toBe('POST')
    const payload = request.postDataJSON()
    expect(Object.keys(payload).sort()).toEqual(['dateFrom', 'dateTo', 'marketplaceAccountId'])
    expect(payload.marketplaceAccountId).toBe(accounts[index].id)
    expect(payload.dateFrom).toMatch(/^2026-09-01T\d{2}:00:00.000Z$/)
    expect(payload.dateTo).toMatch(/^2026-(09-30|10-01)T\d{2}:59:59.999Z$/)
    const result = page.locator('.import-result')
    await expect(result).toContainText(`${label} — ${accounts[index].name}`)
    await expect(result.getByText('Concluída com erros', { exact: true })).toBeVisible()
    for (const [name, value] of [['Pedidos encontrados', '4'], ['Pedidos processados', '3'], ['Clientes com telefone', '2'], ['Clientes sem telefone', '1'], ['Erros', '1']]) {
      await expect(result.locator('.import-counters > div').filter({ has: page.getByText(name, { exact: true }) }).locator('dd')).toHaveText(value)
    }
    await expect(page.locator('.import-history-entry').getByRole('heading', { name: `${label} — ${accounts[index].name}` })).toBeVisible()
    expect(state.requests.filter(request => request.path.startsWith('/imports/'))).toHaveLength(1)
    expect(state.unexpected).toEqual([])
  })
}

test('histórico conserva Mercado Livre ao importar Magalu e permanece durante navegação', async ({ page }) => {
  const state = await mockApi(page, { accounts, importDelay: 600 })
  await page.goto('/imports')
  await page.getByLabel('Conta integrada').selectOption(accounts[0].id)
  await page.getByRole('button', { name: 'Importar clientes', exact: true }).click()
  await expect(page.locator('.import-result')).toBeVisible()
  await page.getByLabel('Conta integrada').selectOption(accounts[1].id)
  await page.getByRole('button', { name: 'Importar clientes', exact: true }).click()
  await expect(page.getByLabel('Conta integrada')).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Importando clientes...', exact: true })).toBeDisabled()
  await expect(page.locator('.import-history-entry')).toHaveCount(1)
  await page.getByRole('link', { name: 'Clientes', exact: true }).click()
  await page.getByRole('link', { name: 'Importações', exact: true }).click()
  const entries = page.locator('.import-history-entry')
  await expect(entries).toHaveCount(2)
  await expect(entries.first()).toContainText('Magalu — Loja B')
  await expect(entries.last()).toContainText('Mercado Livre — Loja A')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  await page.screenshot({ path: 'test-results/marketplace-imports-mobile.png', fullPage: true })
  expect(state.requests.filter(request => request.path.startsWith('/imports/'))).toHaveLength(2)
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
  expect(state.unexpected).toEqual([])
  expect(state.runtimeErrors).toEqual([])
})

test('Magalu como única conta é selecionada automaticamente', async ({ page }) => {
  await mockApi(page, { accounts: [accounts[1]], importStatus: 'SUCCESS' })
  await page.goto('/imports')
  await expect(page.getByLabel('Conta integrada')).toHaveValue(accounts[1].id)
  await page.getByRole('button', { name: 'Importar clientes', exact: true }).click()
  await expect(page.locator('.import-result').getByText('Concluída com sucesso', { exact: true })).toBeVisible()
  await expect(page.locator('.import-result')).toContainText('Magalu — Loja B')
})

test('falha HTTP não apaga histórico anterior nem inventa uma execução concluída', async ({ page }) => {
  const state = await mockApi(page, { accounts })
  await page.goto('/imports')
  await page.getByLabel('Conta integrada').selectOption(accounts[0].id)
  await page.getByRole('button', { name: 'Importar clientes', exact: true }).click()
  await expect(page.locator('.import-history-entry')).toHaveCount(1)
  state.importFailures = 1
  await page.getByLabel('Conta integrada').selectOption(accounts[1].id)
  await page.getByRole('button', { name: 'Importar clientes', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Não foi possível iniciar a importação.')
  await expect(page.locator('.import-history-entry')).toHaveCount(1)
  await expect(page.locator('.import-history-entry')).toContainText('Mercado Livre — Loja A')
  await expect(page.getByRole('button', { name: 'Importar clientes', exact: true })).toBeEnabled()
  expect(state.unexpected).toEqual([])
})

test('resultado ERROR da Magalu mantém contadores e status no histórico', async ({ page }) => {
  await mockApi(page, { accounts: [accounts[1]], importStatus: 'ERROR' })
  await page.goto('/imports')
  await page.getByRole('button', { name: 'Importar clientes', exact: true }).click()
  await expect(page.locator('.import-result').getByText('Não concluída', { exact: true })).toBeVisible()
  await expect(page.locator('.import-history-entry').getByText('Não concluída', { exact: true })).toBeVisible()
  await expect(page.locator('.import-result .import-counters > div').filter({ hasText: 'Pedidos processados' }).locator('dd')).toHaveText('0')
})

test('sem contas mostra acesso a Contas Integradas para conectar qualquer plataforma', async ({ page }) => {
  await mockApi(page, { empty: true })
  await page.goto('/imports')
  await expect(page.getByRole('heading', { name: 'Conecte uma conta para importar' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Conectar conta', exact: true })).toHaveAttribute('href', '/marketplace-accounts')
})
