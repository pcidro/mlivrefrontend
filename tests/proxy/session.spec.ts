import { createServer } from 'node:http'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { createServer as createViteServer } from 'vite'
import type { ViteDevServer } from 'vite'

const user = { id: 'proxy-user', name: 'Pessoa Fictícia', username: 'pessoa', email: 'pessoa@example.com', role: 'USER', avatarUrl: null, createdAt: '2026-10-01T12:00:00Z', updatedAt: '2026-10-01T12:00:00Z' }
const callbackPath = '/api/marketplace-accounts/mercadolivre/callback'
let upstream: Server | undefined
let vite: ViteDevServer | undefined
let frontendOrigin = ''
let authorizationOrigin = ''
let oauthCookieValidated = false

test.beforeAll(async () => {
  // API fictícia via HTTP real: nenhuma interceptação de fetch, banco ou marketplace.
  upstream = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://fixture.test')
    const cookie = req.headers.cookie || ''
    const authenticated = cookie.split(';').some((value) => value.trim() === 'auth_token=fixture-session')
    res.setHeader('Cache-Control', 'private, no-store')
    const json = (body: unknown, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
    }
    const redirect = (location: string) => { res.writeHead(302, { Location: location }); res.end() }
    if (url.pathname === '/api/auth/login' && req.method === 'POST') {
      let body = ''
      for await (const chunk of req) body += String(chunk)
      const credentials = JSON.parse(body)
      if (credentials.email !== user.email || credentials.password !== 'senha-ficticia') return json({ error: 'Credenciais incorretas' }, 401)
      res.setHeader('Set-Cookie', 'auth_token=fixture-session; Path=/; HttpOnly; SameSite=Lax')
      return json(user)
    }
    if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
      res.setHeader('Set-Cookie', 'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
      res.writeHead(204)
      return res.end()
    }
    if (url.pathname === '/authorize') return redirect(`${frontendOrigin}${callbackPath}?code=fixture-code&state=fixture-state`)
    if (url.pathname === callbackPath) {
      oauthCookieValidated = cookie.split(';').some((value) => value.trim() === 'ml_oauth_state=fixture-state') && url.searchParams.get('state') === 'fixture-state'
      res.setHeader('Set-Cookie', `ml_oauth_state=; Path=${callbackPath}; HttpOnly; SameSite=Lax; Max-Age=0`)
      return redirect(`${frontendOrigin}/?mercadolivre=${oauthCookieValidated ? 'success' : 'error'}`)
    }
    if (!authenticated) return json({ error: 'Sessão ausente' }, 401)
    if (url.pathname === '/api/auth/me') return json(user)
    if (url.pathname === '/api/marketplace-accounts/mercadolivre/connect') {
      res.setHeader('Set-Cookie', `ml_oauth_state=fixture-state; Path=${callbackPath}; HttpOnly; SameSite=Lax`)
      return redirect(`${authorizationOrigin}/authorize`)
    }
    if (url.pathname === '/api/dashboard') return json({ totalCustomers: 0, customersWithPhone: 0, customersWithoutPhone: 0, mercadoLivreCustomers: 0, lastImport: null })
    if (url.pathname === '/api/customers') return json({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })
    if (url.pathname === '/api/marketplace-accounts') return json({ data: [] })
    return json({ error: 'Rota inexistente na API fictícia' }, 404)
  })
  await new Promise<void>((resolve) => upstream!.listen(0, '127.0.0.1', resolve))
  const port = (upstream.address() as AddressInfo).port
  // A autorização simula um site externo; o callback precisa voltar ao frontend.
  authorizationOrigin = `http://localhost:${port}`
  const previousTarget = process.env.API_PROXY_TARGET
  process.env.API_PROXY_TARGET = `http://127.0.0.1:${port}`
  try {
    vite = await createViteServer({
      mode: 'test',
      server: { host: '127.0.0.1', port: 0, strictPort: false },
      define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/api') },
    })
    await vite.listen()
    frontendOrigin = `http://127.0.0.1:${(vite.httpServer!.address() as AddressInfo).port}`
  } finally {
    if (previousTarget === undefined) delete process.env.API_PROXY_TARGET
    else process.env.API_PROXY_TARGET = previousTarget
  }
})

test.afterAll(async () => {
  await vite?.close()
  upstream?.closeAllConnections()
  if (upstream?.listening) await new Promise<void>((resolve, reject) => upstream!.close((error) => error ? reject(error) : resolve()))
})

async function login(page: Page) {
  await page.goto(`${frontendOrigin}/login`)
  await page.getByLabel('E-mail', { exact: true }).fill(user.email)
  await page.getByLabel('Senha', { exact: true }).fill('senha-ficticia')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(`${frontendOrigin}/dashboard`)
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
}

test('cookie real atravessa o proxy, permanece após recarregar e é removido no logout', async ({ page, context }) => {
  const apiOrigins = new Set<string>()
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api/')) apiOrigins.add(url.origin)
  })
  await login(page)
  const cookie = (await context.cookies()).find((value) => value.name === 'auth_token')
  expect(cookie?.httpOnly).toBe(true)
  expect(await page.evaluate(() => document.cookie)).not.toContain('auth_token')
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
  const session = await page.request.get(`${frontendOrigin}/api/auth/me`)
  expect(session.status()).toBe(200)
  expect(session.headers()['cache-control']).toBe('private, no-store')
  expect(await session.json()).not.toHaveProperty('token')
  await page.goto(`${frontendOrigin}/settings`)
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page).toHaveURL(`${frontendOrigin}/login`)
  expect((await context.cookies()).some((value) => value.name === 'auth_token')).toBe(false)
  expect((await page.request.get(`${frontendOrigin}/api/auth/me`)).status()).toBe(401)
  expect([...apiOrigins]).toEqual([frontendOrigin])
})

test('cookie OAuth volta pelo callback do frontend e preserva a sessão', async ({ page, context }) => {
  oauthCookieValidated = false
  await login(page)
  await page.goto(`${frontendOrigin}/api/marketplace-accounts/mercadolivre/connect`)
  await expect(page).toHaveURL(/\/marketplace-accounts(?:\?|$)/)
  expect(oauthCookieValidated).toBe(true)
  expect((await context.cookies()).some((value) => value.name === 'ml_oauth_state')).toBe(false)
  expect((await page.request.get(`${frontendOrigin}/api/auth/me`)).status()).toBe(200)
})

test('retorno OAuth mantém o motivo do erro ao navegar e remove os parâmetros da URL', async ({ page }) => {
  await login(page)
  await page.goto(`${frontendOrigin}/?mercadolivre=error&mercadolivre_error=state_missing`)
  await expect(page.getByRole('alert')).toContainText('mesmo navegador')
  await expect(page).toHaveURL(`${frontendOrigin}/marketplace-accounts`)
  await page.goto(`${frontendOrigin}/?mercadolivre=error&mercadolivre_error=account_already_linked`)
  await expect(page.getByRole('alert')).toContainText('outro usuário do sistema')
  await expect(page).toHaveURL(`${frontendOrigin}/marketplace-accounts`)
})
