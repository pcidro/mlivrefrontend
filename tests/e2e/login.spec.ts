import { test, expect } from '@playwright/test'
import { mockApi } from './fixtures'

test('falha de conexão na sessão mantém o login visível e permite recuperar a página solicitada', async ({ page }) => {
  const state = await mockApi(page, { authenticated: false, sessionUnavailable: true })
  await page.goto('/customers')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Entrar na sua conta' })).toBeVisible()
  await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Senha', { exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('Não foi possível acessar o servidor')
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeEnabled()
  state.sessionUnavailable = false
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByLabel('E-mail', { exact: true }).fill('paula@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('senha-ficticia')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/customers$/)
  await expect(page.getByRole('heading', { name: 'Seus clientes', exact: true })).toBeVisible()
  expect(state.runtimeErrors).toEqual([])
  expect(state.unexpected).toEqual([])
})

test('a raiz exibe o login durante a verificação e libera o formulário quando ela excede o limite', async ({ page }) => {
  await mockApi(page, { authenticated: false })
  await page.clock.install()
  let release = () => {}
  const pending = new Promise<void>((resolve) => { release = resolve })
  await page.route('http://127.0.0.1:4173/api/auth/me', async (route) => {
    await pending
    await route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Sessão ausente"}' })
  })
  try {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Verificando sessão...' })).toBeDisabled()
    await page.clock.fastForward(10_001)
    await expect(page.getByRole('alert')).toContainText('A verificação da sessão demorou mais que o esperado')
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeEnabled()
  } finally { release() }
})
