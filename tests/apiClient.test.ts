import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError, createApiClient, queryString } from '../src/lib/api/apiClient.ts'

test('query params preservam false, zero, caracteres especiais e omitem ausentes', () => {
  const query = new URLSearchParams(queryString({ search: 'Nome & teste', page: 1, hasPhone: false, zero: 0, empty: '', missing: null }))
  assert.equal(query.get('hasPhone'), 'false')
  assert.equal(query.get('zero'), '0')
  assert.equal(query.get('search'), 'Nome & teste')
  assert.equal(query.has('empty'), false)
})

test('API relativa preserva origem, caminhos, filtros e navegação OAuth pelo proxy', async () => {
  const urls: string[] = []
  const api = createApiClient('/api', () => {}, async (url, options) => {
    urls.push(String(url))
    assert.equal(options?.credentials, 'include')
    return Response.json({ id: 'user-test' })
  })
  await api.post('/auth/login', { email: 'pessoa@example.com', password: 'senha-ficticia' })
  await api.get('/customers', { params: { search: 'Maria', page: 2 } })
  assert.deepEqual(urls, ['/api/auth/login', '/api/customers?search=Maria&page=2'])
  assert.equal(api.url('/marketplace-accounts/mercadolivre/connect'), '/api/marketplace-accounts/mercadolivre/connect')
})

test('cliente HTTP sempre envia cookie, serializa JSON e aceita logout 204', async () => {
  const requests: RequestInit[] = []
  const api = createApiClient('https://example.test/api/', () => {}, async (_url, options) => {
    requests.push(options!)
    return new Response(null, { status: 204 })
  })
  await api.post('/test', { value: 1 })
  await api.post('/auth/logout')
  assert.ok(requests.every((request) => request.credentials === 'include'))
  assert.equal(requests[0]?.body, JSON.stringify({ value: 1 }))
  assert.equal(requests[1]?.body, undefined)
})

test('401 expira sessão centralmente, exceto erro de credenciais no login', async () => {
  let expires = 0
  const api = createApiClient('https://example.test/api', () => { expires++ }, async () => new Response(null, { status: 401 }))
  await assert.rejects(api.get('/customers'), (error) => error instanceof ApiError && error.status === 401)
  assert.equal(expires, 1)
  await assert.rejects(api.post('/auth/login', {}, { notifyUnauthorized: false }), /E-mail ou senha incorretos/)
  assert.equal(expires, 1)
})

test('verificação de sessão pode ignorar cache e não disparar expiração durante o login', async () => {
  let expires = 0
  const api = createApiClient('https://example.test/api', () => { expires++ }, async (_url, options) => {
    assert.equal(options?.credentials, 'include')
    assert.equal(options?.cache, 'no-store')
    return new Response(null, { status: 401 })
  })
  await assert.rejects(api.get('/auth/me', { cache: 'no-store', notifyUnauthorized: false }), (error) => error instanceof ApiError && error.status === 401)
  assert.equal(expires, 0)
})

test('resposta inválida e falha de rede produzem erros tipados sem detalhes internos', async () => {
  const invalid = createApiClient('https://example.test', () => {}, async () => new Response('<html>error</html>'))
  await assert.rejects(invalid.get('/customers'), (error) => error instanceof ApiError && error.status === 502)
  const offline = createApiClient('https://example.test', () => {}, async () => { throw new Error('internal secret') })
  await assert.rejects(offline.get('/customers'), (error) => error instanceof ApiError && error.status === 0 && !error.message.includes('secret'))
})
