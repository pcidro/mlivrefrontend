# Clientes Mercado Livre e Magalu

A tela `/customers` e o bloco de clientes do dashboard reutilizam a mesma tabela,
filtros e drawer para as duas plataformas. As oito colunas são Nome, CPF/CNPJ,
Telefone, Plataforma, Conta, Pedido, Data e Ação. O badge compartilhado identifica
Mercado Livre em tom neutro e Magalu em azul primário, também usado nas contas.

## Filtros e detalhes

`Todas` é o padrão e não envia `platform` na consulta existente `GET /api/customers`.
Mercado Livre envia `MERCADO_LIVRE`; Magalu envia `MAGALU`. Os filtros continuam na
URL, com busca debounced, conta, telefone, período e paginação da API. Uma
plataforma desconhecida na URL é tratada como Todas. Trocar plataforma limpa a
conta selecionada e reinicia a paginação; as opções de conta mostram somente as
compatíveis, identificadas por plataforma, nome e CNPJ quando disponível.

O drawer consulta `GET /api/customers/:id` para atualizar nome, documento e
telefone. Plataforma, conta, pedido e data vêm da linha selecionada: o endpoint
por ID retorna a venda mais recente geral, que pode ter outra origem quando o
mesmo cliente comprou nas duas plataformas. O endpoint atual não fornece eventos
de histórico; a seção continua omitida, conforme o design, sem eventos simulados.
Valores ausentes mantêm os rótulos existentes, como Nome não informado.

O botão WhatsApp permanece compartilhado e utiliza exclusivamente `normalizedPhone`
para gerar o link. Sem telefone normalizado válido, fica desabilitado. Não há
regra específica para Magalu, envio automático ou armazenamento de tokens no
navegador. Em telas pequenas a tabela mantém rolagem interna e o drawer continua
usando o componente acessível existente.

## Dashboard

Os quatro cards existentes são mantidos. `GET /api/dashboard` já inclui as duas
plataformas em total, com telefone, sem telefone e última importação, e fornece a
contagem Mercado Livre. O frontend obtém a contagem Magalu pelo total da paginação
de `GET /api/customers?platform=MAGALU&page=1&limit=1`, sem carregar toda a lista.
Os dois pedidos de resumo são executados em paralelo, com a mesma sessão.

O card de total apresenta as duas contagens. Elas representam clientes distintos
em cada origem e podem incluir o mesmo cliente; somá-las não corresponde
necessariamente ao total geral. Nunca se estima Magalu por subtração. Se a
consulta complementar falhar, exibe Indisponível e preserva o resumo disponível;
uma sessão expirada mantém o tratamento de autenticação existente. As contas
Magalu também aparecem na seção compartilhada de contas integradas.

Nenhum endpoint, persistência, schema ou integração backend foi alterado nesta
etapa. Build, lint e testes automatizados verificam as consultas existentes,
filtros combinados, paginação, detalhes, clientes compartilhados, WhatsApp,
contagens sobrepostas, erros e responsividade com respostas simuladas.
