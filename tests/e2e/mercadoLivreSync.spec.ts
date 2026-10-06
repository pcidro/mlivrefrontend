import { test, expect } from '@playwright/test'
import { mockApi, accountId } from './fixtures'

const importId = '00000000-0000-4000-8000-000000000030'
const initial = { id: importId, marketplaceAccountId: accountId, status: 'PROCESSING',
  startedAt: '2026-10-06T12:00:00Z', finishedAt: null, ordersFound: 4, ordersProcessed: 1,
  customersWithPhone: 1, customersWithoutPhone: 0, errorsCount: 0 }

test('OAuth mostra conectado/importando, retoma polling e atualiza clientes durante execução', async ({ page }) => {
  const state = await mockApi(page)
  let record = { ...initial }
  let statusReads = 0
  await page.route('**/api/imports', route => route.fulfill({ json: [record] }))
  await page.route(`**/api/imports/${importId}`, route => { statusReads++; return route.fulfill({ json: record }) })
  await page.goto(`/marketplace-accounts?mercadolivre=success&import_id=${importId}`)
  await expect(page.getByText('Conta do Mercado Livre conectada com sucesso.')).toBeVisible()
  await expect(page.getByText('Estamos importando seus clientes.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Importando clientes...' })).toBeDisabled()
  await page.screenshot({ path: 'test-results/mercadolivre-sync-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  await page.screenshot({ path: 'test-results/mercadolivre-sync-mobile.png', fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.reload()
  await expect(page.getByText('Estamos importando seus clientes.', { exact: false })).toBeVisible()
  await page.getByRole('link', { name: 'Consultar clientes', exact: true }).click()
  await expect(page.getByText('Maria Fictícia').first()).toBeVisible()
  const customerReads = state.requests.filter(request => request.path === '/customers').length
  record = { ...record, ordersProcessed: 3, customersWithPhone: 2, customersWithoutPhone: 1 }
  await expect.poll(() => state.requests.filter(request => request.path === '/customers').length).toBeGreaterThan(customerReads)
  record = { ...record, status: 'SUCCESS' }
  await page.getByRole('link', { name: 'Contas Integradas', exact: true }).click()
  await expect(page.getByText('Importação concluída. Os clientes estão disponíveis para consulta.')).toBeVisible()
  const completedReads = statusReads
  await page.waitForTimeout(3500)
  expect(statusReads).toBe(completedReads)
  expect(state.runtimeErrors).toEqual([])
  expect(state.unexpected).toEqual([])
})

test('erro parcial preserva conexão e permite retry em segundo plano', async ({ page }) => {
  const state = await mockApi(page)
  let record = { ...initial, status: 'PARTIAL_SUCCESS', errorsCount: 1 }
  await page.route('**/api/imports', route => route.fulfill({ json: [record] }))
  await page.route('**/api/imports/mercadolivre/sync', route => {
    expect(route.request().postDataJSON()).toEqual({ marketplaceAccountId: accountId })
    record = { ...initial }
    return route.fulfill({ status: 202, json: record })
  })
  await page.route(`**/api/imports/${importId}`, route => route.fulfill({ json: record }))
  await page.goto('/marketplace-accounts')
  await expect(page.getByText('Conectada', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Tentar sincronização novamente' }).click()
  await expect(page.getByText('Estamos importando seus clientes.', { exact: false })).toBeVisible()
  expect(state.runtimeErrors).toEqual([])
  expect(state.unexpected).toEqual([])
})
