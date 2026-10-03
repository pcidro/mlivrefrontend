import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mercadoLivreConnectionError } from '../src/features/marketplace-accounts/services/mercadoLivreConnectionError.ts'

test('retorno OAuth distingue tentativa expirada, conta vinculada e configuração inválida', () => {
  assert.match(mercadoLivreConnectionError('state_invalid'), /expirou/)
  assert.match(mercadoLivreConnectionError('account_already_linked'), /outro usuário/)
  assert.match(mercadoLivreConnectionError('encryption_configuration'), /configuração/i)
})

test('motivos desconhecidos e nomes herdados não são exibidos como mensagens', () => {
  for (const reason of [null, 'unknown-private-value', 'constructor', '__proto__', 'toString']) {
    assert.equal(mercadoLivreConnectionError(reason), 'Não foi possível conectar a conta. Tente novamente.')
  }
})
