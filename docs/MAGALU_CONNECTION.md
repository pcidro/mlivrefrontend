# Magalu em Contas Integradas

A página `/marketplace-accounts` lista as contas sanitizadas de Mercado Livre e
Magalu retornadas por `GET /api/marketplace-accounts`. Mostra nome da loja quando
informado, plataforma, CNPJ disponível, status, identificação e data de conexão.
Quando o backend só conhece o tenant como nome, apresenta `Conta Magalu` e
`Nome da loja não informado`, mantendo o identificador nos detalhes. O indicador
azul com a letra M é uma identificação visual da interface, não um logo oficial.

`Conectar Magalu` navega para `/api/marketplace-accounts/magalu/connect`, usando
`VITE_API_URL`, assim como a conexão existente do Mercado Livre. O backend cria
state e consentimento e conclui OAuth; o frontend não gera code/state nem troca
tokens. Durante a navegação os botões ficam desabilitados. Loading, erro de
consulta com nova tentativa e ausência de contas usam os componentes existentes.

O callback de navegador volta a `/marketplace-accounts?magalu=success|error`.
O resultado é exibido por mensagem acessível e removido da URL. A lista é buscada
novamente ao carregar a página; a indicação da URL não substitui a consulta das
contas nem comprova autorização. O callback não encaminha code, state, mensagens
externas ou tokens. Requisições com `Accept: application/json` mantêm o contrato
JSON do backend. Sem `FRONTEND_URL` válida, o backend conserva sua confirmação
HTML segura.

## Deploy

- Backend: `FRONTEND_URL=https://mlivrefrontend.onrender.com`.
- Frontend: `VITE_API_URL=/api`, com o rewrite existente `/api/*` para o backend.
- `MAGALU_REDIRECT_URI` deve continuar correspondendo exatamente ao callback
  cadastrado no ID Magalu. No proxy atual:
  `https://mlivrefrontend.onrender.com/api/marketplace-accounts/magalu/callback`.
- Início e callback precisam acontecer na mesma origem vista pelo navegador,
  para o cookie de state chegar ao backend. Não trocar o redirect apenas para
  voltar à UI: `FRONTEND_URL` controla essa última navegação.
- Publicar backend e frontend para usar o retorno à página de contas.

Client ID/secret, tokens e chave de criptografia permanecem no backend. Nenhuma
variável Magalu é adicionada ao Vite e nada é salvo em localStorage/sessionStorage.

Clientes, dashboard, Contas Integradas e Importações incluem contas de ambas as
plataformas por meio do hook compartilhado com `includeMagalu: true`. Consulte
[CUSTOMERS.md](CUSTOMERS.md) e [IMPORTS.md](IMPORTS.md). Desconexão Magalu não é oferecida porque não há endpoint
correspondente nesta etapa; a desconexão existente do Mercado Livre foi preservada.

## Verificação

`npm run build`, `npm run lint`, `npm test` e `npm run test:e2e` verificam os tipos,
o frontend e os fluxos no navegador com respostas simuladas. Os testes Magalu
cobrem as duas plataformas, dados ausentes, mobile, navegação OAuth, sucesso,
erro, loading e recuperação da listagem. Não realizam consentimento real.
