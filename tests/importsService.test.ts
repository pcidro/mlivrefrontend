import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApiClient, ApiError } from '../src/lib/api/apiClient.ts'
import { dayBoundary } from '../src/lib/utils/format.ts'
import { createImportsService } from '../src/features/imports/services/importsService.ts'
import { importAccountLabel, importPlatformLabel } from '../src/features/imports/services/importPresentation.ts'
import type { ImportInput, ImportSummary } from '../src/features/imports/types/import.ts'

const summary: ImportSummary = { id: 'import-test', marketplaceAccountId: 'account-test', status: 'SUCCESS',
  startedAt: '2026-10-01T12:00:00Z', finishedAt: '2026-10-01T12:01:00Z', ordersFound: 3, ordersProcessed: 3,
  customersWithPhone: 2, customersWithoutPhone: 1, errorsCount: 0 }
const input: ImportInput = { marketplaceAccountId: summary.marketplaceAccountId, dateFrom: '2026-09-01', dateTo: '2026-09-30' }

for (const [platform, path] of [['MERCADO_LIVRE', 'mercadolivre'], ['MAGALU', 'magalu']] as const) {
  test(`service direciona ${platform}, envia somente contrato aceito pelo backend e preserva contadores`, async () => {
    const calls: { url: string; options: RequestInit }[] = []
    const service = createImportsService(createApiClient('/api', () => {}, async (url, options) => {
      calls.push({ url: String(url), options: options! }); return Response.json(summary)
    }))
    const result = await service.start({ ...input, platform, accountName: 'Loja fictícia' })
    assert.equal(calls[0]?.url, `/api/imports/${path}`)
    assert.equal(calls[0]?.options.method, 'POST')
    assert.equal(calls[0]?.options.credentials, 'include')
    assert.deepEqual(JSON.parse(String(calls[0]?.options.body)), {
      marketplaceAccountId: input.marketplaceAccountId, dateFrom: dayBoundary(input.dateFrom), dateTo: dayBoundary(input.dateTo, true),
    })
    assert.deepEqual(result, { ...summary, platform, accountName: 'Loja fictícia' })
    assert.deepEqual(input, { marketplaceAccountId: 'account-test', dateFrom: '2026-09-01', dateTo: '2026-09-30' })
  })
}

test('chamada antiga sem plataforma mantém endpoint e identificação Mercado Livre', async () => {
  let path = ''
  const service = createImportsService(createApiClient('/api', () => {}, async url => {
    path = String(url); return Response.json(summary)
  }))
  assert.equal((await service.start(input)).platform, 'MERCADO_LIVRE')
  assert.equal(path, '/api/imports/mercadolivre')
  assert.equal(importPlatformLabel(summary), 'Mercado Livre')
})

test('rótulos distinguem contas homônimas sem condicionais nos componentes', () => {
  const account = { id: 'account', name: 'Loja A', cnpj: null, externalAccountId: 'tenant', isActive: true, createdAt: '', updatedAt: '' }
  assert.equal(importAccountLabel({ ...account, platform: 'MAGALU' }), 'Magalu — Loja A')
  assert.equal(importAccountLabel({ ...account, platform: 'MERCADO_LIVRE' }), 'Mercado Livre — Loja A')
  assert.equal(importPlatformLabel({ platform: 'MAGALU' }), 'Magalu')
})

test('plataforma inválida não cai silenciosamente no Mercado Livre e não consulta API', async () => {
  let calls = 0
  const service = createImportsService(createApiClient('/api', () => {}, async () => { calls++; return Response.json(summary) }))
  for (const platform of ['FUTURA', '__proto__', 'constructor']) {
    await assert.rejects(service.start({ ...input, platform } as ImportInput), error => error instanceof ApiError && error.status === 400)
  }
  assert.equal(calls, 0)
})

test('período inválido é recusado antes de enviar importação', async () => {
  let calls = 0
  const service = createImportsService(createApiClient('/api', () => {}, async () => { calls++; return Response.json(summary) }))
  for (const dates of [{ dateFrom: '', dateTo: input.dateTo }, { dateFrom: 'inválida', dateTo: input.dateTo },
    { dateFrom: input.dateTo, dateTo: input.dateFrom }]) {
    await assert.rejects(service.start({ ...input, ...dates }), error => error instanceof ApiError && error.status === 400)
  }
  assert.equal(calls, 0)
})

test('falha HTTP mantém erro tipado sem inventar execução ou status', async () => {
  const service = createImportsService(createApiClient('/api', () => {}, async () => Response.json({ error: 'Serviço indisponível' }, { status: 503 })))
  await assert.rejects(service.start({ ...input, platform: 'MAGALU' }), error => error instanceof ApiError && error.status === 503)
})
