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

O frontend exibe **Importações desta
sessão**, formada somente pelos resultados reais recebidos após iniciar execuções
na interface. Cada entrada identifica a plataforma, a conta, a data, o status e
os cinco contadores. As mais recentes aparecem primeiro, identificadas por `id`.

Uma execução nova ou uma falha HTTP não apaga as entradas anteriores. A lista
permanece ao navegar entre páginas; recarregar ou sair da sessão a limpa. Não é
gravada em localStorage/sessionStorage e não representa o histórico completo
persistido no banco. `importCapabilities.history=false` continua indicando que
não há consulta remota do histórico completo de todas as plataformas. O novo GET
`/imports` retorna apenas a última execução de cada conta ML ativa; GET
`/imports/:id` acompanha uma execução ML autorizada.

Resultados antigos sem metadados de plataforma continuam identificados como
Mercado Livre, preservando o contrato anterior. A exibição dos clientes das duas plataformas está
documentada em [CUSTOMERS.md](CUSTOMERS.md).

## Sincronização automática Mercado Livre

Depois de persistir OAuth, o backend agenda a primeira sincronização e redireciona
para Contas Integradas. Padrão 90 dias, configurável no backend com
`MERCADO_LIVRE_INITIAL_SYNC_DAYS`. Contas Integradas e Importações mostram
progresso, contadores, resultado e botão para sincronizar novamente. O provider
retoma pelo banco após reload, consulta a cada 3s enquanto PROCESSING e para ao
concluir. Falhas de leitura são repetidas depois de 5s; sair da área autenticada
aborta consultas pendentes. Não precisa deixar aberta a tela de conexão.

Clientes são recarregados quando o progresso muda. Reconexão ou botão de
sincronização usam o último intervalo automático totalmente bem-sucedido,
com uma hora de sobreposição. Resultados parciais não avançam essa data.
Importações manuais de período escolhido mantêm o contrato anterior.
OAuth continua conectado mesmo quando a sincronização falha.

Antes de publicar, aplicar a migration backend `20261006120000_add_mercadolivre_sync`.
Queda/restart do backend interrompe processamento; sem heartbeat por dez minutos,
uma leitura/nova tentativa marca ERROR e permite retry idempotente. Não existe
fila externa para retomar automaticamente.

## Testes

Os testes do serviço verificam os dois endpoints, compatibilidade legada, envio
restrito ao body aceito, fronteiras de datas e falhas. Os testes de navegador
cobrem seleção, contadores/status, histórico de ambas as plataformas, navegação
durante processamento, erro HTTP e mobile. Usam respostas simuladas; não iniciam
importações reais nas contas conectadas.
