# LJ Fontes — frontend

React + Vite + TypeScript estrito, com CSS organizado a partir de [design.md](design.md). Esta interface contempla somente Mercado Livre. Os dados de produção vêm da API; dados fictícios existem apenas nos testes.

## Identidade visual

A marca exibida é LJ Fontes. O logo fornecido em `public/ljfonts.png` aparece no login, cabeçalho, menu e rodapé, preservando suas proporções e cores. Também é usado como ícone da aba, cujo título é “LJ Fontes”. Os antigos textos de marca e o subtítulo da integração foram removidos da interface.

Os arquivos de Mercado Livre em `public/brands/` são cópias sem alteração dos assets do CDN oficial: [símbolo](https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/favicon.svg) e [logo em português](https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.5/mercadolibre/pt_logo_large_plus.webp). As imagens são servidas localmente, sem depender de requisições externas durante o uso da aplicação.

## Desenvolvimento

Requer Node.js 24 e o backend disponível. Configure `VITE_API_URL` em um arquivo local de ambiente usando `.env.example` como referência. A URL inclui o prefixo `/api`, por exemplo `http://localhost:3333/api`. A origem do frontend precisa estar autorizada no CORS do backend.

```sh
npm install
npm run dev
npm run build
npm run lint
npm test
npm run test:e2e
```

Em desenvolvimento, o fallback é `http://localhost:3333/api`; em produção, o endereço de fallback já utilizado pelo projeto foi preservado. Se `.env` aponta para produção, configure `VITE_API_URL=http://localhost:3333/api` em `.env.development.local` (ignorado pelo Git) para usar o backend local sem alterar o build de produção. Reinicie o Vite após alterar variáveis de ambiente. A variável é incorporada durante o build e não pode conter secrets.

No Render Static Site, configure a regra de **Rewrite** de `/*` para `/index.html` para suportar acesso direto e atualização das rotas do React Router. A publicação não faz parte desta implementação.

## Estrutura

```text
src/
├── app/
│   ├── router/             # Rotas públicas/protegidas e retorno do OAuth
│   └── providers/          # Sessão e importação em andamento
├── components/
│   ├── layout/             # AppLayout, Sidebar, Header
│   └── ui/                 # Componentes comuns
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── customers/
│   ├── imports/
│   └── marketplace-accounts/
├── hooks/                  # useResource com cancelamento de consultas obsoletas
├── lib/
│   ├── api/                # Cliente HTTP, erros, query params e tratamento de 401
│   └── utils/              # Formatação visual e URL do WhatsApp
├── styles/                 # Tokens, estilos globais, componentes e layout
├── types/                  # Paginação e status compartilhados
└── main.tsx
```

Cada feature possui páginas, services e tipos; componentes e hooks ficam na feature quando há necessidade. `App.tsx` apenas compõe o provider de sessão e o roteador.

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/login` | Formulário integrado ao login existente, com email, senha e cookie HttpOnly. |
| `/termos-de-uso` | Página pública com termos do uso interno do sistema. |
| `/politica-de-privacidade` | Página pública com fontes, uso, proteção e atendimento sobre dados. |
| `/dashboard` | Quatro cards com dados reais, contas integradas e tabela paginada de clientes. |
| `/customers` | Busca, filtros, paginação, detalhes em drawer e abertura manual do WhatsApp. |
| `/imports` | Conta, período, envio protegido contra cliques repetidos e resumo real da importação. |
| `/marketplace-accounts` | Contas conectadas, retorno OAuth, conexão por navegação e desconexão confirmada. |
| `/settings` | Dados públicos do usuário autenticado e logout. |

O acesso à raiz redireciona ao dashboard. O retorno OAuth `/?mercadolivre=success|error` leva à página de contas e remove o parâmetro após apresentar o resultado.

Termos e privacidade não exigem sessão e permanecem disponíveis quando a API
estiver indisponível. Há links no login e entre os documentos. Antes de publicar,
a empresa deve confirmar o conteúdo e completar sua identificação jurídica e
um canal direto de contato sobre privacidade. Usar a regra de rewrite do Render
descrita acima para acesso direto e atualização dessas URLs.

Sem uma sessão confirmada, a tela de login aparece desde o início. A consulta de sessão roda em segundo plano, com limite de 10 segundos. Falhas são exibidas no próprio login com opção de tentar novamente. Uma sessão válida recupera a página solicitada, incluindo o retorno OAuth. O envio do formulário aguarda essa verificação para evitar respostas concorrentes sobrescrevendo o login.

## Componentes e hooks

- Layout: `AppLayout`, `Sidebar`, `Header`.
- UI: `Button`, `Input`, `Select`, `Card`, `Badge`, `Avatar`, `Icon`, `Skeleton`, `EmptyState`, `ErrorState`, `Pagination` e `Drawer`.
- Clientes: `CustomersSection`, `CustomerFilters`, `CustomerTable`, `CustomerDetailsDrawer`, `WhatsAppButton`.
- Demais features: `SummaryCards`, `AccountsSection`, `AccountCard`, `ImportResult`, `ImportStatusBadge`.
- Hooks: `useAuth`, `useCustomers`, `useCustomerFilters`, `useDebouncedSearch`, `useDashboard`, `useImports`, `useMarketplaceAccounts` e `useResource`.
- Services: `authService`, `customersService`, `dashboardService`, `importsService` e `marketplaceAccountsService`.

## Contratos utilizados

Todos os caminhos abaixo são relativos à base definida por `VITE_API_URL`.

| Método | Endpoint | Uso |
| --- | --- | --- |
| POST | `/auth/login` | Login já existente; `{ email, password }`. |
| GET | `/auth/me` | Restaurar sessão e obter somente dados públicos do usuário. |
| POST | `/auth/logout` | Limpar o cookie HttpOnly no servidor. |
| GET | `/dashboard` | Contadores e `lastImport` do usuário autenticado. |
| GET | `/customers` | `{ data, pagination }` com filtros e paginação remotos. |
| GET | `/customers/:id` | Dados básicos do cliente e do pedido associado. |
| GET | `/marketplace-accounts` | `{ data }` com contas ativas. |
| GET | `/marketplace-accounts/mercadolivre/connect` | Navegação do navegador para iniciar OAuth. |
| DELETE | `/marketplace-accounts/mercadolivre/:id` | Desconectar após confirmação, preservando dados importados. |
| POST | `/imports/mercadolivre` | `{ marketplaceAccountId, dateFrom, dateTo }` e resposta com contadores. |

`GET /auth/me` e `POST /auth/logout` foram os únicos endpoints acrescentados nesta etapa. Eram necessários para recuperar a sessão após atualizar a página e encerrar o cookie HttpOnly. Reutilizam a autenticação, a seleção pública de usuário e as opções de cookie existentes; o mecanismo de login permanece o mesmo. `/auth/me` usa exclusivamente `req.user_id`.

O cliente HTTP envia `credentials: "include"`, trata JSON/204/erros de conexão, expõe `ApiError` e avisa o provider quando recebe 401. Credenciais de marketplace não fazem parte dos contratos consumidos. Não há JWT, senha, documento ou telefone armazenado em `localStorage` nem logs desses dados.

## Comportamento de clientes

- Busca remota com debounce de 400 ms por nome, telefone, CPF/CNPJ ou pedido, conforme suporte existente do backend.
- Conta/CNPJ, datas, telefone e página sincronizados na URL. Alterar filtros volta à primeira página.
- Atualizações do roteador são síncronas (`useTransitions={false}`) para preservar todos os caracteres dos campos controlados pela URL durante digitação rápida; o debounce das consultas continua em 400 ms.
- Consultas enviam `platform=MERCADO_LIVRE` internamente; não há seletor nem coluna de plataforma.
- Paginação de 20 registros, sem carregar a base inteira.
- Datas escolhidas representam o início/fim do dia no fuso do navegador e são enviadas em ISO para a API.
- CPF/CNPJ e telefone são formatados apenas na apresentação; os valores persistidos permanecem intactos.
- Ausências mostram “Não informado” ou “Sem telefone”. O WhatsApp usa apenas telefone brasileiro normalizado válido, `target="_blank"` e `rel="noopener noreferrer"`, sem mensagem automática.
- O drawer usa diálogo modal nativo, fecha por Escape, contém o foco e o devolve ao acionador. No celular, os detalhes ocupam a tela e a tabela tem scroll horizontal contido e acessível por teclado.

## Importações e endpoints ausentes

O POST de importação existente responde ao término do processamento. A interface mantém o bloqueio e o resultado em memória enquanto o usuário navega entre páginas. Mostra `ordersFound`, `ordersProcessed`, `customersWithPhone`, `customersWithoutPhone` e `errorsCount`, respeitando `SUCCESS`, `PARTIAL_SUCCESS`, `ERROR` e `PROCESSING`.

Ainda não existem rotas de leitura `GET /imports` e `GET /imports/:id`. Por isso não há histórico, polling ou recuperação do resultado após recarregar/fechar a página. `importCapabilities.history` está definido como `false`; o serviço da feature concentra o ponto de integração futuro sem disparar chamadas inexistentes. O backend mantém seus registros de importação e a idempotência dos pedidos.

O detalhe de cliente não fornece histórico de eventos, lista de pedidos ou data de cadastro. Esses dados não são inventados. A listagem atual é ordenada pelo backend por nome; a tabela do dashboard é chamada “Clientes”, sem prometer ordem por recência.

## Dependências acrescentadas

- `react-router-dom`: necessário para as cinco páginas autenticadas, proteção de rotas, links e filtros na URL. Utiliza o [modo declarativo oficial do React Router](https://reactrouter.com/start/declarative/installation).
- `@playwright/test` (desenvolvimento): valida os fluxos no navegador e a responsividade com API simulada. Nenhuma biblioteca de estado, UI ou estilos foi adicionada.

## Validação

`npm test` verifica formatação de CPF/CNPJ e telefone, geração segura do link WhatsApp, limites de datas e cliente HTTP (cookies, query params, JSON, 204, 401 e falhas de rede).

`npm run test:e2e` inicia uma instância local isolada do Vite em `127.0.0.1:4173`, substitui explicitamente a URL da API e intercepta todos os endpoints com dados fictícios. Requisições para outras origens são bloqueadas. Testa login/restauração/logout, busca com debounce, filtros, paginação, drawer/foco/Escape, importação sem duplo envio, erros/vazio/401, OAuth/desconexão e telas desktop/tablet/mobile. Não acessa o banco nem o Mercado Livre.

O navegador padrão dos testes é o Microsoft Edge instalado. Para outro ambiente, instale o Chromium do Playwright (`npx playwright install chromium`) e defina `PLAYWRIGHT_CHANNEL=chromium` antes de executar os testes. Capturas ficam em `test-results/`, ignorado pelo Git.

O backend também possui teste de sessão em `routes/sessionRoutes.test.ts`, executado junto à suíte existente por `npm test`, sem banco real.
