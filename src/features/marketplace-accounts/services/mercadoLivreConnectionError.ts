const messages: Record<string, string> = {
  state_missing: 'A conexão perdeu a confirmação deste navegador. Clique em Conectar Mercado Livre novamente e conclua no mesmo navegador.',
  state_invalid: 'Esta tentativa de conexão expirou ou foi substituída. Clique em Conectar Mercado Livre novamente.',
  authorization_denied: 'O Mercado Livre não concluiu a autorização. Confira se você está usando a conta principal e tente novamente.',
  callback_invalid: 'O Mercado Livre retornou uma autorização incompleta. Inicie uma nova conexão.',
  oauth_configuration: 'A configuração da integração precisa ser revisada pelo responsável pelo sistema.',
  token_exchange_failed: 'Não foi possível confirmar a autorização com o Mercado Livre. O responsável pelo sistema pode consultar o motivo registrado.',
  account_lookup_failed: 'A autorização foi recebida, mas não foi possível consultar a conta no Mercado Livre.',
  account_mismatch: 'A conta retornada não corresponde à autorização. Inicie uma nova conexão.',
  user_not_found: 'O usuário que iniciou a conexão não foi encontrado. Entre novamente no sistema.',
  account_already_linked: 'Esta conta do Mercado Livre já está vinculada a outro usuário do sistema.',
  encryption_configuration: 'A configuração de proteção da conexão precisa ser revisada pelo responsável pelo sistema.',
  persistence_failed: 'Não foi possível salvar a conexão. O responsável pelo sistema pode consultar o motivo registrado.',
}

export function mercadoLivreConnectionError(reason: string | null): string {
  if (reason && Object.hasOwn(messages, reason)) return messages[reason]!
  return 'Não foi possível conectar a conta. Tente novamente.'
}
