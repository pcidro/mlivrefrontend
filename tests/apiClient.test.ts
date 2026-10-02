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

test('resposta inválida e falha de rede produzem erros tipados sem detalhes internos', async () => {
  const invalid = createApiClient('https://example.test', () => {}, async () => new Response('<html>error</html>'))
  await assert.rejects(invalid.get('/customers'), (error) => error instanceof ApiError && error.status === 502)
  const offline = createApiClient('https://example.test', () => {}, async () => { throw new Error('internal secret') })
  await assert.rejects(offline.get('/customers'), (error) => error instanceof ApiError && error.status === 0 && !error.message.includes('secret'))
})
