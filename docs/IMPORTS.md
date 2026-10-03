# Importações Mercado Livre e Magalu

A tela `/imports` consulta as contas sanitizadas e lista as ativas com plataforma
e nome: `Mercado Livre — Loja A` ou `Magalu — Loja B`, acrescentando CNPJ quando
disponível. Uma única conta ativa é selecionada automaticamente. Com várias
contas, é necessário escolher uma. Sem contas, oferece acesso a Contas Integradas.

## Envio e resultado

`importsService` concentra a seleção do endpoint:

| Plataforma da conta selecionada | Endpoint existente |
| --- | --- |
| MERCADO_LIVRE | POST `/api/imports/mercadolivre` |
| MAGALU | POST `/api/imports/magalu` |

A tela passa a plataforma e o nome da conta ao serviço como metadados locais.
O body enviado contém apenas `marketplaceAccountId`, `dateFrom` e `dateTo`,
seguindo os schemas estritos do backend. Não envia tokens ou credenciais. A API
central mantém os cookies de sessão. Dias escolhidos continuam usando as
fronteiras do dia no fuso do navegador, como no fluxo anterior do Mercado Livre.

Chamadas antigas sem plataforma continuam usando Mercado Livre. Plataformas
desconhecidas são rejeitadas antes do request. O resultado acrescenta a plataforma
e o nome da conta selecionada aos mesmos contadores/status retornados pelo backend;
nenhum resultado de importação é inventado se a chamada HTTP falhar.

Os cinco contadores e o badge de status são compartilhados entre plataformas:
pedidos encontrados, processados, clientes com telefone, sem telefone e erros.
`SUCCESS`, `PARTIAL_SUCCESS`, `ERROR` e `PROCESSING` mantêm os rótulos existentes.
O provider conserva a requisição e o bloqueio de duplo envio durante navegação.

## Histórico disponível

O backend ainda não expõe GET de importações. O frontend exibe **Importações desta
sessão**, formada somente pelos resultados reais recebidos após iniciar execuções
na interface. Cada entrada identifica a plataforma, a conta, a data, o status e
os cinco contadores. As mais recentes aparecem primeiro, identificadas por `id`.

Uma execução nova ou uma falha HTTP não apaga as entradas anteriores. A lista
permanece ao navegar entre páginas; recarregar ou sair da sessão a limpa. Não é
gravada em localStorage/sessionStorage e não representa o histórico completo
persistido no banco. `importCapabilities.history=false` continua indicando que
não há consulta remota do histórico. Uma futura leitura do banco exige um endpoint
autenticado próprio, fora desta alteração de frontend.

Resultados antigos sem metadados de plataforma continuam identificados como
Mercado Livre, preservando o contrato anterior. A etapa de Importações não alterou
rotas backend ou schema. A exibição dos clientes das duas plataformas está
documentada em [CUSTOMERS.md](CUSTOMERS.md).

## Testes

Os testes do serviço verificam os dois endpoints, compatibilidade legada, envio
restrito ao body aceito, fronteiras de datas e falhas. Os testes de navegador
cobrem seleção, contadores/status, histórico de ambas as plataformas, navegação
durante processamento, erro HTTP e mobile. Usam respostas simuladas; não iniciam
importações reais nas contas conectadas.
