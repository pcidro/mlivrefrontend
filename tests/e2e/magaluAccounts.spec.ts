import { test, expect } from '@playwright/test'
import type { MarketplaceAccount } from '../../src/features/marketplace-accounts/types/marketplaceAccount'
import { mockApi } from './fixtures'

const magalu: MarketplaceAccount = {
  id: '00000000-0000-4000-8000-000000000020', platform: 'MAGALU', name: 'Loja Magalu de teste',
  cnpj: '00000000000100', externalAccountId: 'tenant-ficticio', isActive: true,
  createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z',
}
const mercadoLivre: MarketplaceAccount = { ...magalu, id: '00000000-0000-4000-8000-000000000010',
  platform: 'MERCADO_LIVRE', name: 'Loja principal', cnpj: '12345678000190', externalAccountId: '123456' }

test('Contas Integradas diferencia as plataformas e mostra dados disponíveis da conta sanitizada', async ({ page }) => {
  const state = await mockApi(page, { accounts: [mercadoLivre, magalu] })
  await page.goto('/marketplace-accounts')
  const cards = page.locator('.account-card')
  await expect(cards).toHaveCount(2)
  const magaluCard = cards.filter({ has: page.getByRole('heading', { name: magalu.name }) })
  await expect(magaluCard.getByText('Magalu', { exact: true })).toBeVisible()
  await expect(magaluCard.getByText('Conectada', { exact: true })).toBeVisible()
  await expect(magaluCard.getByText('CNPJ 00.000.000/0001-00')).toBeVisible()
  await expect(magaluCard.getByRole('button')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Desconectar conta', exact: true })).toHaveCount(1)
  await page.screenshot({ path: 'test-results/magalu-accounts-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('button', { name: 'Conectar Magalu', exact: true }).first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  await page.screenshot({ path: 'test-results/magalu-accounts-mobile.png', fullPage: true })
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
  expect(state.unexpected).toEqual([])
  expect(state.runtimeErrors).toEqual([])
})

test('sem nome de loja e CNPJ não inventa dados; identificação longa não causa overflow', async ({ page }) => {
  const tenant = `tenant:${'0'.repeat(120)}`
  await mockApi(page, { accounts: [{ ...magalu, name: tenant, externalAccountId: tenant, cnpj: null }] })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/marketplace-accounts')
  await expect(page.getByRole('heading', { name: 'Conta Magalu' })).toBeVisible()
  await expect(page.getByText('Nome da loja não informado.')).toBeVisible()
  await expect(page.getByText(tenant, { exact: true })).toBeVisible()
  await expect(page.locator('.account-cnpj')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
})

test('Conectar Magalu faz navegação à rota OAuth existente do backend', async ({ page }) => {
  const state = await mockApi(page)
  await page.goto('/marketplace-accounts')
  await page.getByRole('button', { name: 'Conectar Magalu', exact: true }).click()
  await expect(page).toHaveURL(/\/api\/marketplace-accounts\/magalu\/connect$/)
  await expect(page.getByRole('heading', { name: 'Autorização Magalu simulada' })).toBeVisible()
  expect(state.oauthNavigation).toBeTruthy()
  expect(state.requests.filter(request => request.path.includes('/magalu/'))).toEqual([
    { path: '/marketplace-accounts/magalu/connect', method: 'GET', search: '' },
  ])
  expect(state.unexpected).toEqual([])
})

for (const result of ['success', 'error'] as const) {
  test(`retorno OAuth Magalu ${result} exibe mensagem e limpa resultado da URL`, async ({ page }) => {
    const state = await mockApi(page, { accounts: result === 'success' ? [magalu] : [] })
    await page.goto(`/marketplace-accounts?magalu=${result}`)
    await expect(page).toHaveURL(/\/marketplace-accounts$/)
    const notice = page.locator(result === 'success' ? '.notice-success' : '.notice-danger')
    await expect(notice).toContainText(result === 'success' ? 'Conta Magalu conectada com sucesso.' : 'Não foi possível conectar a conta Magalu.')
    if (result === 'success') await expect(page.getByRole('heading', { name: magalu.name })).toBeVisible()
    else await expect(page.getByRole('heading', { name: 'Nenhuma conta conectada' })).toBeVisible()
    expect(state.requests.filter(request => request.path.includes('/magalu/'))).toHaveLength(0)
    expect(state.unexpected).toEqual([])
  })
}

test('nenhuma conta mantém as duas opções de conexão', async ({ page }) => {
  await mockApi(page, { empty: true })
  await page.goto('/marketplace-accounts')
  const empty = page.locator('.empty-state')
  await expect(empty.getByRole('heading', { name: 'Nenhuma conta conectada' })).toBeVisible()
  await expect(empty.getByRole('button', { name: 'Conectar Mercado Livre', exact: true })).toBeEnabled()
  await expect(empty.getByRole('button', { name: 'Conectar Magalu', exact: true })).toBeEnabled()
})

test('loading e falha recuperável reutilizam os estados da página', async ({ page }) => {
  let release!: () => void
  const accountsReady = new Promise<void>(resolve => { release = resolve })
  const state = await mockApi(page, { accounts: [magalu], accountsReady })
  state.accountFailures = Infinity
  await page.goto('/marketplace-accounts')
  await expect(page.getByRole('heading', { name: 'Contas Integradas', exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('status', { name: 'Carregando dados' })).toBeVisible()
  release()
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar as contas integradas.')
  state.accountFailures = 0
  const requestsBeforeRetry = state.requests.filter(request => request.path === '/marketplace-accounts').length
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByRole('heading', { name: magalu.name })).toBeVisible()
  expect(state.requests.filter(request => request.path === '/marketplace-accounts')).toHaveLength(requestsBeforeRetry + 1)
  expect(state.unexpected).toEqual([])
})

test('filtros de clientes e Importações permitem contas das duas plataformas', async ({ page }) => {
  const state = await mockApi(page, { accounts: [mercadoLivre, magalu] })
  await page.goto('/customers')
  await expect(page.getByLabel('Conta/CNPJ').getByRole('option', { name: /Loja principal/ })).toHaveCount(1)
  await expect(page.getByLabel('Conta/CNPJ').getByRole('option', { name: /Magalu/ })).toHaveCount(1)
  await page.getByRole('link', { name: 'Importações', exact: true }).click()
  await expect(page.getByLabel('Conta integrada').getByRole('option', { name: /Magalu — Loja Magalu de teste/ })).toHaveCount(1)
  expect(state.unexpected).toEqual([])
})
