import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatPhone, whatsappUrl, dayBoundary, formatDate } from '../src/lib/utils/format.ts'

test('formata telefone sem alterar o destino normalizado do WhatsApp', () => {
  assert.equal(formatPhone('5511999999999'), '(11) 99999-9999')
  assert.equal(formatPhone('551133333333'), '(11) 3333-3333')
  assert.equal(formatPhone(null), 'Sem telefone')
  assert.equal(whatsappUrl('5511999999999'), 'https://wa.me/5511999999999')
  for (const value of [null, '', '11999999999', 'javascript:alert(1)', '5511/999999999']) assert.equal(whatsappUrl(value), null)
})

test('datas ausentes são opcionais e filtros usam início/fim do dia local', () => {
  assert.equal(formatDate(null), 'Não informada')
  assert.equal(formatDate('invalid'), 'Não informada')
  assert.equal(dayBoundary(undefined), undefined)
  assert.equal(new Date(dayBoundary('2026-09-01')!).getHours(), 0)
  const end = new Date(dayBoundary('2026-09-01', true)!)
  assert.equal(end.getHours(), 23)
  assert.equal(end.getMinutes(), 59)
})
