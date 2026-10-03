import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApiClient, ApiError } from '../src/lib/api/apiClient.ts'
import { createCustomersService } from '../src/features/customers/services/customersService.ts'
import { createDashboardService } from '../src/features/dashboard/services/dashboardService.ts'

const summary = { totalCustomers: 5, customersWithPhone: 3, customersWithoutPhone: 2, mercadoLivreCustomers: 4, lastImport: null }

test('dashboard usa contagens reais independentes: plataformas podem compartilhar clientes', async () => {
  const paths: string[] = []
  const api = createApiClient('/api', () => {}, async url => {
    const path = String(url); paths.push(path)
    return Response.json(path === '/api/dashboard' ? summary : { data: [], pagination: { page: 1, limit: 1, total: 3, totalPages: 3 } })
  })
  const result = await createDashboardService(api, createCustomersService(api)).get()
  assert.deepEqual(result, { ...summary, magaluCustomers: 3 })
  assert.equal(result.totalCustomers, 5)
  assert.ok(paths.includes('/api/customers?platform=MAGALU&page=1&limit=1'))
})

test('falha da contagem Magalu conserva métricas gerais sem inventar zero', async () => {
  const api = createApiClient('/api', () => {}, async url => String(url) === '/api/dashboard'
    ? Response.json(summary) : Response.json({ error: 'Indisponível' }, { status: 503 }))
  assert.deepEqual(await createDashboardService(api, createCustomersService(api)).get(), { ...summary, magaluCustomers: null })
})

test('falha principal e sessão expirada não viram dashboard com dados fictícios', async () => {
  for (const status of [401, 503]) {
    const api = createApiClient('/api', () => {}, async () => Response.json({ error: 'Indisponível' }, { status }))
    await assert.rejects(createDashboardService(api, createCustomersService(api)).get(), error => error instanceof ApiError && error.status === status)
  }
})

test('401 da consulta complementar também preserva o erro de sessão', async () => {
  const api = createApiClient('/api', () => {}, async url => String(url) === '/api/dashboard'
    ? Response.json(summary) : Response.json({ error: 'Sessão expirada' }, { status: 401 }))
  await assert.rejects(createDashboardService(api, createCustomersService(api)).get(), error => error instanceof ApiError && error.status === 401)
})
