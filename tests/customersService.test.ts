import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApiClient, ApiError } from '../src/lib/api/apiClient.ts'
import { createCustomersService } from '../src/features/customers/services/customersService.ts'
import type { CustomerFilters } from '../src/features/customers/types/customer.ts'

const filters: CustomerFilters = { page: 1, limit: 20, search: '', platform: '', marketplaceAccountId: '', hasPhone: '', dateFrom: '', dateTo: '' }
const response = { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }

for (const platform of ['', 'MERCADO_LIVRE', 'MAGALU'] as const) {
  test(`consulta clientes com filtro ${platform || 'Todas'} sem fixar Mercado Livre`, async () => {
    let requested: URL | null = null
    const service = createCustomersService(createApiClient('https://example.test/api', () => {}, async (url, options) => {
      requested = new URL(String(url)); assert.equal(options?.credentials, 'include'); return Response.json(response)
    }))
    await service.list({ ...filters, platform, search: 'Empresa exemplo', marketplaceAccountId: 'account-test', hasPhone: 'false' })
    assert.ok(requested)
    const url: URL = requested
    assert.equal(url.pathname, '/api/customers')
    assert.equal(url.searchParams.get('platform'), platform || null)
    assert.equal(url.searchParams.get('hasPhone'), 'false')
    assert.equal(url.searchParams.get('marketplaceAccountId'), 'account-test')
    assert.equal(url.searchParams.get('search'), 'Empresa exemplo')
  })
}

test('detalhes Magalu usam o mesmo endpoint autenticado e não são rejeitados pela plataforma', async () => {
  const customer = { customerId: 'customer-test', platform: 'MAGALU', normalizedPhone: '5511987654321' }
  const service = createCustomersService(createApiClient('/api', () => {}, async (url, options) => {
    assert.equal(url, '/api/customers/customer-test'); assert.equal(options?.credentials, 'include'); return Response.json(customer)
  }))
  assert.deepEqual(await service.get('customer-test'), customer)
})

test('contagem Magalu usa total do backend com paginação mínima, preservando total zero válido', async () => {
  for (const total of [0, 7]) {
    const service = createCustomersService(createApiClient('https://example.test/api', () => {}, async url => {
      const query = new URL(String(url)).searchParams
      assert.equal(query.get('platform'), 'MAGALU'); assert.equal(query.get('page'), '1'); assert.equal(query.get('limit'), '1')
      return Response.json({ ...response, pagination: { ...response.pagination, total } })
    }))
    assert.equal(await service.count('MAGALU'), total)
  }
})

test('contagem ausente ou inválida não é transformada em zero fictício', async () => {
  for (const total of [undefined, -1, 1.5, '7']) {
    const service = createCustomersService(createApiClient('/api', () => {}, async () => Response.json({ pagination: { total } })))
    await assert.rejects(service.count('MAGALU'), error => error instanceof ApiError && error.status === 502)
  }
})
