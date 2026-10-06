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

### `invalid_client` mesmo após recopiar as credenciais

O HTTP 400 com `invalid_client` é a resposta da API do Mercado Livre à troca do código. Recopiar do histórico da conversa não confirma que o Secret continua vigente. Compare as credenciais atuais dentro do **mesmo aplicativo** que aparece na tela de autorização com as variáveis do backend.

Nesse caso, o log inclui `credentialCheck`: ID público do aplicativo utilizado, tamanho do Secret e indicadores de espaços internos, aspas, máscara e caracteres fora de ASCII. Não inclui o Secret, partes dele ou hashes. `clientId` só é registrado quando tem formato numérico; um texto colado por engano nesse campo é omitido. Indicadores `false` não comprovam que as credenciais são válidas; somente descartam esses problemas de formatação.

O erro `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` é separado: o Express recebia cabeçalhos do proxy com `trust proxy` desabilitado. O backend agora detecta o Render pela variável padrão `RENDER=true` e confia em um hop, antes dos limitadores. Fora do Render, os cabeçalhos encaminhados continuam sem confiança. A configuração considera o proxy mais próximo; uma cadeia adicional pode agrupar clientes e precisa ser verificada na infraestrutura antes de ampliar essa confiança.

Publique o backend para ativar a correção do proxy e esse diagnóstico. No backend, `npm run test:proxy` verifica a confiança limitada e o funcionamento do rate limit; os testes usam apenas endereços fictícios.

### Comparar o ambiente local com o Render sem revelar chaves

No backend, foi adicionado um diagnóstico de configuração:

```sh
npm run diagnose:mercadolivre
```

Ele não chama APIs nem modifica contas. Retorna o ID público do aplicativo, indicadores de formatação do Secret, presença das variáveis e verificações do callback. Não imprime Secret, token, URL arbitrária ou fingerprint. Para a arquitetura atual, `callbackUsesFrontendOrigin`, `callbackUsesExpectedPath` e `callbackUsesHttps` devem ser `true`; `callbackHasQueryOrFragment` e `callbackHasUrlCredentials` devem ser `false`.

Para fazer **uma chamada** de diagnóstico ao endpoint oficial `/oauth/token` com código propositalmente fictício:

```sh
npm run diagnose:mercadolivre -- --probe
```

O comando usa as credenciais do ambiente onde é executado, não depende de cookies do navegador e não utiliza uma autorização real. A chamada tem timeout de 15 segundos, não segue redirecionamentos e não persiste tokens. Se ocorrer uma resposta de sucesso inesperada, descarta as credenciais recebidas e exibe apenas `unexpectedAcceptance`.

#### Render gratuito: executar pelo Start Command

O plano gratuito não oferece Shell/SSH. Não é necessário fazer upgrade para esse diagnóstico. Depois de publicar o backend atualizado (build normal com `npm run build`), abra **Render → `sistemamlivre` → Settings → Start Command** e substitua temporariamente `npm run start` por:

```sh
npm run start:diagnose:mercadolivre
```

Salve e faça o deploy. A inicialização executa uma chamada de diagnóstico com código fictício, imprime uma linha `mercadolivre_oauth_diagnostic` nos **Logs** e inicia o backend. Uma recusa esperada da API é registrada e não impede a inicialização. O timeout de 15 segundos limita a espera. A chamada usa as mesmas variáveis que o servidor iniciado em seguida.

Copie somente a linha `mercadolivre_oauth_diagnostic` para comparar com o teste local. Depois da coleta, volte o **Start Command** para `npm run start` e salve. Enquanto estiver selecionado o comando de diagnóstico, cada reinicialização executará uma nova chamada.

O script e a entrada `start:diagnose:mercadolivre` precisam estar no código publicado; alterar apenas o Start Command com uma versão antiga provocará erro de script ausente. Não colocar chaves no Start Command.

#### Planos com Shell disponível

Após publicar e compilar o backend, execute em **Render → serviço `sistemamlivre` → Shell**, na pasta do backend:

```sh
node dist/scripts/diagnoseMercadoLivreOAuth.js --probe
```

Esse comando só estará disponível depois que o novo arquivo entrar no deploy. Executar localmente verifica o `.env` local, não as variáveis efetivas do Render. `dotenv/config` preserva variáveis já presentes no processo.

Interpretação:

| Resultado | Próximo passo |
|---|---|
| Local `invalid_grant`, Render `invalid_client` | Conferir primeiro se os testes usaram o mesmo aplicativo e o par vigente. Com IDs distintos, o teste de um aplicativo não valida o outro. Depois comparar as variáveis efetivas, a versão publicada e o momento dos logs. |
| Ambos `invalid_grant` | A recusa do código fictício é esperada. Fazer uma nova autorização real e analisar seu log; o teste negativo não valida conta, permissões, PKCE, callback ou persistência. |
| Ambos `invalid_client` | Conferir o par vigente do mesmo aplicativo e seu estado no painel. |
| Sem `upstreamStatus` | Verificar comunicação, timeout ou configuração antes de atribuir o problema às chaves. |
| `unauthorized_client` / `unauthorized_application` | Verificar permissões ou bloqueio do aplicativo. Esses códigos oficiais agora são preservados pelo diagnóstico. |

Em 03/10/2026, o primeiro teste local retornou HTTP 400 `invalid_grant`, e o controle com Secret fictício retornou `invalid_client`. Posteriormente foi confirmado que aquele teste usava um aplicativo diferente do aplicativo da cliente; portanto, não validava as credenciais atuais. Depois da atualização do `.env`, o teste local do aplicativo atual também retornou `invalid_client`, igual ao diagnóstico de inicialização e ao callback no Render. Os logs atuais já incluem `credentialCheck`, sem indícios de Secret malformado. Esses indicadores não comprovam o conteúdo ou a associação do Secret ao ID.

Um controle adicional usando o Secret local atual com o ID anterior, apenas em memória, também retornou `invalid_client`. Isso não confirmou a hipótese de mistura com o Secret do aplicativo anterior. A falha atual é reproduzível diretamente na API, sem login no navegador e fora do Render. O próximo passo é verificar o par vigente no painel do aplicativo confirmado pela cliente; se ele corresponder exatamente à configuração e a rejeição continuar, levar o resultado ao suporte oficial de integradores. Não presumir erro de cópia, bloqueio, PKCE ou problema no código apenas pelo retorno `invalid_client`.

Também foi detectado que o `.env` local utiliza o domínio do backend no callback, enquanto a configuração documentada usa o domínio do frontend. Conferir a URL efetiva do Render e a cadastrada no Mercado Livre. Essa divergência local merece ajuste separado, mas não comprova a causa do `invalid_client` de produção. Não alterar apenas um lado: a URL cadastrada e a enviada precisam corresponder exatamente.

### Registrar a navegação quando o Mercado Livre parece não abrir

Abra as ferramentas do navegador, vá a **Network/Rede**, ative **Preserve log/Preservar registro** e **Disable cache/Desativar cache**, e só então clique novamente em **Conectar Mercado Livre**. Verifique a sequência de documentos:

```text
/api/marketplace-accounts/mercadolivre/connect
→ auth.mercadolivre.com.br/authorization
→ /api/marketplace-accounts/mercadolivre/callback
→ tela do sistema
```

Se a chamada `/connect` retorna `302` com destino `auth.mercadolivre.com.br`, o sistema iniciou o redirecionamento. A sequência registrada permite verificar se o retorno ocorre rapidamente. Se retornar `401`, o problema é a sessão do sistema; `5xx` exige diagnóstico do backend. `token_exchange_failed` só é gerado depois da validação do retorno e da tentativa de troca do código; não é emitido pelo botão antes da autorização.

Uma janela privada ajuda a separar a sessão existente do Mercado Livre de uma falha do backend. Entre no sistema e inicie pelo botão; não reutilize URLs antigas. Não compartilhar HAR, cookies, URLs completas do callback com `code`/`state` ou corpos de requisições de autenticação. Para diagnóstico, basta informar os domínios, caminhos, status e os campos seguros dos logs.

Em 03/10/2026, as rotas públicas de conexão do frontend e do backend responderam `401` sem sessão, com `Cache-Control: private, no-store`. O proxy do frontend informou `BYPASS`. Isso descarta cache nessas chamadas observadas, mas não inspeciona uma sessão autenticada ou uma tentativa antiga.

## Autorizar outra conta

`client_id` e `client_secret` identificam o aplicativo. A conta conectada é a que entra no Mercado Livre e autoriza esse aplicativo. Portanto, não é necessário trocar as chaves do Render para permitir que outra conta principal autorize o mesmo aplicativo.

Para reproduzir sem aproveitar uma sessão da cliente, use uma janela privada, entre no sistema com seu usuário e inicie a conexão. A conta será associada ao usuário local que iniciou o fluxo. O Mercado Livre recomenda usuários de teste para testes de desenvolvimento; não é necessário criar outro aplicativo para usar um usuário de teste.

Não trocar credenciais de produção apenas para mudar a conta autorizadora. Se for necessário testar outro **aplicativo**, prefira uma configuração separada: as autorizações e os tokens pertencem ao aplicativo que os emitiu.

Fontes oficiais:

- [Autenticação e autorização](https://developers.mercadolivre.com.br/pt_br/mensagens-post-venda/autenticacao-e-autorizacao)
- [Realização de testes](https://developers.mercadolivre.com.br/pt_br/realizacao-de-testes/realizacao-de-testes)
- [Shell e SSH no Render](https://render.com/docs/ssh)
- [Start Command de Web Services](https://render.com/docs/web-services)
