import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatDocument } from '../src/lib/utils/formatDocument.ts'

test('formata CPF e CNPJ apenas na apresentação, preservando zeros', () => {
  assert.equal(formatDocument('12345678900'), '123.456.789-00')
  assert.equal(formatDocument('12345678000190'), '12.345.678/0001-90')
  assert.equal(formatDocument('00123456789'), '001.234.567-89')
})

test('documento ausente ou inválido aparece como Não informado', () => {
  for (const value of [null, undefined, '', '123', 'ABC12345678900']) {
    assert.equal(formatDocument(value), 'Não informado')
  }
})
