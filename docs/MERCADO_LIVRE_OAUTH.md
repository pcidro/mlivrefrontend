# Diagnóstico da conexão com o Mercado Livre

A tela de autorização do Mercado Livre e o retorno ao sistema são etapas diferentes. Autorizar no Mercado Livre ainda exige que o backend valide o retorno, obtenha os tokens, consulte a conta e salve a conexão. A mensagem antiga escondia qualquer erro nessas etapas.

## Configuração de produção

O callback deve ser exatamente o mesmo na variável `MERCADO_LIVRE_REDIRECT_URI` do backend e no aplicativo existente no Mercado Livre:

```text
https://mlivrefrontend.onrender.com/api/marketplace-accounts/mercadolivre/callback
```

O frontend usa `VITE_API_URL=/api` e a regra de **Rewrite**, antes da regra do React:

```text
/api/* → https://sistemamlivre.onrender.com/api/*
/*     → /index.html
```

O código atual usa Authorization Code, com renovação por Refresh Token, e não envia os parâmetros PKCE. Se a aplicação exigir PKCE, será necessário implementar esse fluxo. Confirmado pelo responsável em 02/10/2026: PKCE não está marcado.

Mudanças em variáveis do Render precisam entrar em um novo deploy. Salvar somente a URL de redirect no Mercado Livre não exige deploy, desde que o backend já use aquela URL. Sempre inicie uma nova conexão pelo botão do sistema; não reutilize uma página antiga de autorização.

## Depois de publicar o diagnóstico

Publique backend e frontend. Repita a conexão e procure nos logs do **backend** por `mercadolivre_oauth_callback_failed`. O registro contém apenas `reason`, `upstreamStatus` e `upstreamError`; nunca envia código de autorização, cookie, tokens, dados pessoais ou descrições brutas de erros.

| `reason` | O que verificar |
|---|---|
| `state_missing` | O callback voltou ao domínio do frontend? Foi concluído no mesmo navegador? O cookie foi recebido? |
| `state_invalid` | Tentativa expirada (10 minutos), outra conexão iniciada depois, ou alteração da chave de assinatura entre início e retorno. |
| `authorization_denied` | Autorização não concluída no Mercado Livre. Confirmar conta principal; colaborador não pode autorizar. |
| `callback_invalid` | Faltou código de autorização ou o retorno veio com parâmetros inválidos. |
| `oauth_configuration` | Variáveis OAuth ou configuração de assinatura ausentes/inválidas. |
| `token_exchange_failed` | Consultar `upstreamError`: `invalid_client` aponta para credenciais; `invalid_grant` pode indicar código expirado/reutilizado, redirect diferente ou pendências da conta. |
| `account_lookup_failed` | Tokens recebidos, mas falhou a consulta de `/users/me`, por permissão, indisponibilidade ou resposta inválida. |
| `account_mismatch` | A conta consultada difere da conta indicada pelo token. |
| `user_not_found` | Usuário local que iniciou a conexão não existe mais. |
| `account_already_linked` | A conta do Mercado Livre já pertence a outro usuário **do sistema**, não ao proprietário de outro aplicativo OAuth. |
| `encryption_configuration` | `TOKEN_ENCRYPTION_KEY` precisa conter Base64 canônico de exatamente 32 bytes. Validar o formato; não substituir uma chave válida usada para contas existentes. |
| `persistence_failed` | Falhou o acesso/persistência no banco ou o processamento interno da conexão. |
| `unexpected` | Falha interna no callback fora das etapas classificadas. |

Valores de erro desconhecidos devolvidos pelo Mercado Livre são descartados. Erros de rede podem aparecer sem `upstreamStatus`; respostas recusadas preservam o status HTTP e apenas códigos reconhecidos. O diagnóstico identifica a etapa e não comprova sozinho a causa de um erro anterior.

## Autorizar outra conta

`client_id` e `client_secret` identificam o aplicativo. A conta conectada é a que entra no Mercado Livre e autoriza esse aplicativo. Portanto, não é necessário trocar as chaves do Render para permitir que outra conta principal autorize o mesmo aplicativo.

Para reproduzir sem aproveitar uma sessão da cliente, use uma janela privada, entre no sistema com seu usuário e inicie a conexão. A conta será associada ao usuário local que iniciou o fluxo. O Mercado Livre recomenda usuários de teste para testes de desenvolvimento; não é necessário criar outro aplicativo para usar um usuário de teste.

Não trocar credenciais de produção apenas para mudar a conta autorizadora. Se for necessário testar outro **aplicativo**, prefira uma configuração separada: as autorizações e os tokens pertencem ao aplicativo que os emitiu.

Fontes oficiais:

- [Autenticação e autorização](https://developers.mercadolivre.com.br/pt_br/mensagens-post-venda/autenticacao-e-autorizacao)
- [Realização de testes](https://developers.mercadolivre.com.br/pt_br/realizacao-de-testes/realizacao-de-testes)
