import { test, expect } from '@playwright/test'
import { mockApi } from './fixtures'

test('no celular, senha aceita sem sessão mantém o login e explica a falha', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const state = await mockApi(page, { authenticated: false })
  await page.route('http://127.0.0.1:4173/api/auth/me', (route) => route.fulfill({
    status: 401, contentType: 'application/json', body: '{"error":"Sessão ausente"}',
  }))
  const navigations: string[] = []
  page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) navigations.push(frame.url()) })
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('paula@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('senha-ficticia')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Sua senha foi aceita, mas não foi possível manter a sessão')
  await expect(page).toHaveURL(/\/login$/)
  expect(navigations.some((url) => url.includes('/dashboard'))).toBe(false)
  expect(state.requests.some((request) => request.path === '/dashboard')).toBe(false)
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeEnabled()
  expect(state.runtimeErrors).toEqual([])
  expect(state.unexpected).toEqual([])
})

test('no celular, só abre o dashboard após confirmar a sessão e permanece autenticado após recarregar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const state = await mockApi(page, { authenticated: false })
  let release = () => {}
  const pending = new Promise<void>((resolve) => { release = resolve })
  await page.route('http://127.0.0.1:4173/api/auth/me', async (route) => {
    if (state.authenticated) await pending
    await route.fallback()
  })
  try {
    await page.goto('/login')
    await page.getByLabel('E-mail', { exact: true }).fill('paula@example.com')
    await page.getByLabel('Senha', { exact: true }).fill('senha-ficticia')
    const confirmation = page.waitForRequest((request) => request.url().endsWith('/auth/me') && state.authenticated)
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await confirmation
    await expect(page.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
    await expect(page).toHaveURL(/\/login$/)
    expect(state.requests.some((request) => request.path === '/dashboard')).toBe(false)
    release()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
    expect(state.requests.filter((request) => request.path === '/auth/login')).toHaveLength(1)
    expect(state.runtimeErrors).toEqual([])
    expect(state.unexpected).toEqual([])
  } finally { release() }
})

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
