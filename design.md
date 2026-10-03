# DESIGN.md — Central de Clientes

## 1. Objetivo deste documento

Este arquivo é a referência visual e técnica para o frontend da aplicação **Central de Clientes**.

A implementação deve reproduzir a linguagem visual da interface de referência fornecida, sem copiar cegamente cada pixel. O objetivo é manter a mesma sensação de produto: **dashboard SaaS profissional, claro, organizado, moderno, denso o suficiente para uso operacional e simples para uma usuária não técnica**.

Atualização de escopo: **Dashboard, Clientes, Contas Integradas e Importações**
incluem Mercado Livre e Magalu, com os mesmos cards, badges, cores e estados
descritos aqui. Reutilizar componentes e distinguir as plataformas por rótulos
e badges consistentes.
Não exibir Shopee ou outras plataformas futuras.

---

## 2. Princípios de design

A interface deve seguir estes princípios:

1. **Clareza operacional**
   - A usuária deve entender rapidamente quantos clientes foram importados, quantos têm telefone e quando ocorreu a última importação.
   - As ações principais devem ser óbvias: conectar conta, importar clientes, buscar cliente e abrir WhatsApp.

2. **Hierarquia visual forte**
   - Títulos e números importantes devem chamar atenção primeiro.
   - Informações secundárias devem usar contraste reduzido.
   - Ações primárias usam azul; ações ligadas a WhatsApp usam verde.

3. **Baixa carga cognitiva**
   - Poucas cores.
   - Poucos níveis de navegação.
   - Textos curtos.
   - Evitar excesso de cards decorativos.

4. **Visual SaaS B2B**
   - Fundo cinza-azulado muito claro.
   - Cards brancos.
   - Bordas suaves.
   - Cantos arredondados.
   - Sombras discretas.
   - Ícones lineares.

5. **Responsividade prática**
   - Desktop é a experiência principal.
   - Tablet deve continuar utilizável.
   - Mobile deve reorganizar conteúdo, evitando tabelas impossíveis de usar.

6. **Consistência**
   - Mesmas escalas de espaçamento.
   - Mesmos raios de borda.
   - Mesmos estados de hover/focus/disabled.
   - Mesmos padrões de loading e erro.

---

## 3. Stack visual esperada

O frontend é **React + Vite + TypeScript**.

A implementação deve aproveitar a stack de estilos já existente no projeto.

Regras:

- Se Tailwind CSS já estiver instalado, utilizar Tailwind.
- Se houver CSS Modules ou outra abordagem consolidada, manter o padrão existente.
- Não adicionar uma biblioteca pesada de UI apenas para reproduzir o design.
- Ícones podem usar `lucide-react` se já existir no projeto ou se for necessário instalar uma única biblioteca leve de ícones.
- Não misturar múltiplos sistemas de estilização sem necessidade.

---

## 4. Estrutura geral da aplicação

### Desktop

Layout principal em três regiões:

```text
┌──────────────┬──────────────────────────────────────┬──────────────────────┐
│ Sidebar      │ Conteúdo principal                   │ Painel lateral        │
│ 220–240px    │ flex: 1                              │ 300–340px             │
│              │                                      │ quando aberto         │
└──────────────┴──────────────────────────────────────┴──────────────────────┘
```

A tela deve ocupar no mínimo `100vh`.

### Regiões

- Sidebar fixa no desktop.
- Header no topo da área principal.
- Conteúdo com cards e tabela.
- Painel lateral de detalhes do cliente aparece quando um cliente é selecionado.

---

## 5. Design tokens

Centralizar tokens em um único local quando possível.

### Cores

Usar como referência:

```css
--color-bg: #f4f7fb;
--color-surface: #ffffff;
--color-surface-muted: #f8fafc;
--color-border: #e2e8f0;
--color-border-strong: #cbd5e1;

--color-text: #0f172a;
--color-text-secondary: #475569;
--color-text-muted: #64748b;
--color-text-subtle: #94a3b8;

--color-primary: #2563eb;
--color-primary-hover: #1d4ed8;
--color-primary-soft: #eff6ff;

--color-success: #16a34a;
--color-success-hover: #15803d;
--color-success-soft: #f0fdf4;

--color-danger: #dc2626;
--color-danger-soft: #fef2f2;

--color-warning: #d97706;
--color-warning-soft: #fffbeb;
```

Não usar gradientes chamativos.

### Tipografia

Preferência visual: Inter, Geist, system-ui ou equivalente sans-serif moderna.

```text
Page title:       24–28px / 700
Section title:    18–20px / 700
Card number:      28–32px / 700
Card label:       13–14px / 500
Body:             14px / 400
Table header:     12–13px / 600
Caption:          12px / 400
Button:           14px / 600
```

Usar line-height confortável entre `1.35` e `1.5`.

### Espaçamento

Base de 4px.

Escala sugerida:

```text
4, 8, 12, 16, 20, 24, 32, 40
```

### Border radius

```text
Botões pequenos: 8px
Inputs: 10px
Cards: 12–14px
Painéis grandes: 14–16px
Avatares: 9999px
```

### Sombras

Sombras discretas:

```css
box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04),
            0 4px 12px rgba(15, 23, 42, 0.04);
```

Evitar sombras fortes.

---

## 6. Sidebar

### Estrutura

Itens previstos:

- Dashboard
- Clientes
- Importações
- Contas Integradas
- Configurações

### Visual

- Largura: 220–240px.
- Fundo branco ou `#f8fafc`.
- Borda direita `1px solid var(--color-border)`.
- Ícone à esquerda.
- Texto 14px / 500 ou 600.
- Altura por item: aproximadamente 44px.

### Item ativo

- Fundo azul muito claro.
- Texto azul primário.
- Ícone azul.
- Opcional: borda esquerda azul de 3px.

### Estados

- hover: fundo `#f1f5f9`.
- focus-visible: outline azul acessível.

### Mobile

A sidebar deve virar drawer/menu colapsável.

---

## 7. Header

### Conteúdo

Esquerda:

```text
[ícone] Central de Clientes
        Clientes de marketplaces
```

Direita:

- opcional: ícone de notificações, se já fizer sentido no projeto;
- avatar do usuário;
- nome;
- empresa ou papel;
- chevron para menu.

Quando houver subtítulo de integrações, ele deve contemplar ambas as plataformas.

### Visual

- Altura aproximada: 68–76px.
- Fundo branco.
- Borda inferior discreta.
- Padding horizontal 24px.

---

## 8. Dashboard — cards de resumo

Primeira linha do conteúdo principal deve ter quatro cards em desktop:

1. **Clientes importados**
2. **Com telefone**
3. **Sem telefone**
4. **Última importação**

### Card padrão

Estrutura:

```text
[ícone em box suave]   Label
                       Valor principal
Texto/status auxiliar
```

### Exemplos

Clientes importados:

```text
Clientes importados
1.842
```

Com telefone:

```text
Com telefone
1.593
```

Sem telefone:

```text
Sem telefone
249
```

Última importação:

```text
Última importação
Hoje, 10:42
● Concluída com sucesso
```

### Regras

- Dados devem vir da API quando endpoint existir.
- Manter os quatro cards e apresentar as contagens Mercado Livre e Magalu no card de total.
- As contagens por plataforma podem incluir o mesmo cliente; não calcular Magalu por subtração do total.
- Se a contagem complementar falhar, mostrar "Indisponível", mantendo os totais disponíveis.
- Não inventar porcentagens de crescimento se backend não fornecer.
- Se não houver comparação histórica, remover o `+12%` e similares do mock de referência.
- Loading: skeleton.
- Erro: mensagem compacta dentro do card ou estado global.

---

## 9. Seção "Contas integradas"

### Objetivo

Mostrar as contas Mercado Livre e Magalu conectadas.

### Cabeçalho

Esquerda:

```text
Contas integradas
Gerencie suas contas conectadas ao Mercado Livre e à Magalu.
```

Direita:

```text
[ + Conectar Mercado Livre ] [ + Conectar Magalu ]
```

ou, se fluxo principal for importação:

```text
[ + Nova importação ]
```

### Card de conta

Exemplo:

```text
[logo ML] Mercado Livre — CNPJ 01
          ● Conectada
                              ⋮
```

Campos opcionais se backend fornecer:

- `displayName`
- CNPJ
- status
- externalAccountId
- data de conexão

Não mostrar token, refresh token ou qualquer credencial.

### Estados

Sem conta:

```text
Nenhuma conta conectada.
[ Conectar Mercado Livre ] [ Conectar Magalu ]
```

Erro:

```text
Não foi possível carregar as contas integradas.
[ Tentar novamente ]
```

---

## 10. Seção "Clientes"

Esta é a área operacional principal da aplicação.

### Container

- Card branco grande.
- Padding 16–20px.
- Header interno.
- Filtros.
- Tabs rápidas.
- Tabela.
- Paginação.

### Cabeçalho

```text
Clientes   ⓘ
Contatos obtidos das notas fiscais e dos dados disponíveis no Mercado Livre e na Magalu.
```

### Filtros

Linha desktop:

1. Search input
2. Plataforma: Todas, Mercado Livre, Magalu
3. Conta/CNPJ
4. Período
5. Opcional: status do telefone

"Todas" é o padrão. Identificar as contas por plataforma e nome. Ao trocar a
plataforma, limpar a seleção de conta e retornar à primeira página. Filtrar as
contas disponíveis conforme a plataforma, mantendo a busca e o período.

#### Campo de busca

Placeholder:

```text
Buscar cliente (nome, telefone, CPF/CNPJ ou pedido)...
```

A busca deve ser debounced (`300–500ms`) se chamar API diretamente.

### Tabs rápidas

- Todos
- Com telefone
- Sem telefone

Exemplo:

```text
[ Todos (1.842) ] [ Com telefone (1.593) ] [ Sem telefone (249) ]
```

A tab ativa usa azul primário.

---

## 11. Tabela de clientes

### Colunas desktop

1. Nome
2. CPF/CNPJ
3. Telefone
4. Plataforma
5. Conta
6. Pedido
7. Data
8. Ação

Usar o badge compartilhado: Mercado Livre neutro; Magalu azul primário.

### Exemplo

```text
Maria Silva | 123.456.789-00 | (11) 99999-9999 | Mercado Livre | CNPJ 01 | #ML-10234 | 29/09/2026 | WhatsApp
```

### Telefone inexistente

```text
— Sem telefone —
```

A ação WhatsApp fica desabilitada ou substituída por badge neutro:

```text
Sem telefone
```

### CPF/CNPJ inexistente

```text
Não informado
```

### Ação WhatsApp

Botão outline verde pequeno:

```text
[ ícone WhatsApp ] WhatsApp
```

Ao clicar:

```text
https://wa.me/{normalizedPhone}
```

Abrir nova aba com `noopener,noreferrer`.

### Linha selecionada

Quando o painel lateral estiver mostrando aquele cliente:

- fundo azul muito claro;
- ou borda/acento sutil.

### Hover

Linha deve ter hover discreto.

---

## 12. Paginação

Rodapé da tabela:

Esquerda:

```text
Mostrando 1 a 20 de 1.842 clientes
```

Direita:

```text
< 1 2 3 4 5 … 93 >
```

Não carregar todos os clientes no frontend.

Usar paginação da API.

Query params sugeridos:

```text
?page=1
&limit=20
&search=
&hasPhone=
&platform=
&marketplaceAccountId=
&dateFrom=
&dateTo=
```

Sincronizar filtros relevantes com a URL quando possível.

---

## 13. Painel lateral de detalhes do cliente

### Comportamento desktop

- Drawer/painel fixado à direita.
- Largura aproximada: 320px.
- Fundo branco.
- Borda esquerda.
- Scroll próprio quando necessário.
- Abrir ao clicar em uma linha ou ação "ver detalhes".

### Header

```text
Detalhes do cliente                         X
```

### Identificação

Avatar com iniciais.

```text
MS   Maria Silva
     Cliente desde 29/09/2026
```

### Campos

Mostrar somente o que existe:

- CPF/CNPJ
- Telefone
- Plataforma
- Conta/CNPJ de origem
- Pedido
- Data da venda
- Status do telefone

Preservar a plataforma, conta, pedido e data da linha selecionada. A consulta por
ID pode retornar outra venda mais recente do mesmo cliente; ela atualiza os dados
do cliente sem substituir a origem exibida na lista filtrada.

### Botão principal

```text
[ WhatsApp ] Abrir no WhatsApp
```

- largura 100%;
- verde;
- desabilitado se não houver telefone.

### Histórico

Se backend já fornecer eventos, apresentar timeline.

Exemplo:

```text
● Pedido realizado
  29/09/2026 14:21

● Cliente importado
  29/09/2026 10:42
```

Se backend ainda não fornecer histórico, **não inventar eventos falsos**. Pode omitir temporariamente a seção.

---

## 14. Tela "Clientes"

Além do bloco resumido no Dashboard, deve existir rota específica `/customers` ou equivalente.

Nesta tela:

- usar largura total disponível;
- manter filtros completos;
- tabela com paginação;
- drawer de detalhes;
- permitir busca mais confortável.

O Dashboard pode mostrar a mesma tabela ou uma versão reduzida dos clientes recentes, dependendo do que o backend atual suportar.

---

## 15. Tela "Importações"

### Objetivo

Permitir iniciar importação e acompanhar histórico.

### Bloco de nova importação

Campos:

- Conta integrada, identificando Mercado Livre ou Magalu e o nome da loja
- Data inicial
- Data final
- botão `Importar clientes`

### Botão

Azul primário.

Durante processamento:

```text
Importando clientes...
```

Desabilitar múltiplos cliques.

### Resultado

Exemplo:

```text
Importação concluída
420 pedidos encontrados
418 processados
371 com telefone
47 sem telefone
2 erros
```

### Histórico

Tabela/cards com:

- Data
- Conta
- Plataforma (Mercado Livre ou Magalu)
- Status
- Pedidos encontrados
- Processados
- Com telefone
- Sem telefone
- Erros

O frontend atual lista as execuções realizadas na sessão, preservadas durante a
navegação e identificadas pela plataforma/conta selecionada. O backend ainda não
possui rota de leitura do histórico persistido; não inventar endpoints nem usar
dados fictícios para preencher essa lista. Recarregar encerra esse histórico local.

Status:

- PROCESSING → azul/neutro
- SUCCESS → verde
- PARTIAL_SUCCESS → amarelo
- ERROR → vermelho

---

## 16. Tela "Contas Integradas"

### Sem conta conectada

Estado vazio central:

```text
Conecte uma conta de Mercado Livre ou Magalu
para começar a importar seus clientes.

[ Conectar Mercado Livre ] [ Conectar Magalu ]
```

### Conta conectada

Mostrar card com:

- logo Mercado Livre ou identificação visual Magalu;
- badge da plataforma;
- nome da conta;
- CNPJ se disponível;
- status;
- data da conexão;
- ações permitidas pelo backend.

Possíveis ações:

- Reconectar
- Desativar

Não implementar exclusão destrutiva sem confirmação.

---

## 17. Tela "Configurações"

V1 simples.

Pode conter:

- dados do usuário logado;
- nome;
- email;
- avatar se suportado;
- logout.

Não criar configurações fictícias sem backend.

---

## 18. Componentização

Evitar páginas monolíticas.

Estrutura sugerida:

```text
src/
├── app/
│   ├── router/
│   └── providers/
│
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Badge/
│   │   ├── Card/
│   │   ├── Skeleton/
│   │   ├── EmptyState/
│   │   └── Pagination/
│   │
│   └── layout/
│       ├── AppLayout/
│       ├── Sidebar/
│       └── Header/
│
├── features/
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── pages/
│   │
│   ├── customers/
│   │   ├── components/
│   │   │   ├── CustomerFilters/
│   │   │   ├── CustomerTable/
│   │   │   ├── CustomerRow/
│   │   │   ├── CustomerDetailsDrawer/
│   │   │   └── CustomerStatusTabs/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── pages/
│   │
│   ├── imports/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── pages/
│   │
│   ├── marketplace-accounts/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── pages/
│   │
│   └── auth/
│       ├── components/
│       ├── services/
│       ├── types/
│       └── pages/
│
├── hooks/
├── lib/
│   ├── api/
│   └── utils/
│
├── styles/
├── types/
└── main.tsx
```

Não precisa criar pastas vazias. Criar somente o necessário.

---

## 19. Camada de API

Não fazer `fetch()` diretamente espalhado por componentes.

Criar cliente central:

```text
src/lib/api/apiClient.ts
```

Requisitos:

- base URL via `VITE_API_URL`;
- `credentials: "include"`;
- tratamento central de JSON;
- tratamento de `401`;
- erros tipados;
- suporte a query params.

Exemplo conceitual:

```ts
apiClient.get('/customers', { params })
apiClient.post('/imports/mercadolivre', body)
```

Não armazenar JWT em `localStorage` se autenticação atual utiliza cookie HttpOnly.

---

## 20. Tipagem

Criar types baseados nas respostas reais do backend.

Exemplo conceitual:

```ts
export interface Customer {
  customerId: string;
  name: string;
  phone: string | null;
  normalizedPhone: string | null;
  document: string | null;
  documentType: 'CPF' | 'CNPJ' | null;
  marketplaceAccountId?: string;
  marketplaceAccountName?: string;
  externalOrderId?: string | null;
  orderDate?: string | null;
}
```

Não usar `any` para respostas de API.

---

## 21. Hooks e estado

Não adicionar Redux sem necessidade.

Preferência:

- estado local para UI;
- custom hooks para chamadas e composição de estado;
- React Query/TanStack Query somente se já estiver instalado ou se houver justificativa clara.

Exemplos:

```text
useCustomers()
useDashboard()
useImports()
useMarketplaceAccounts()
```

Separar estado remoto de estado puramente visual.

---

## 22. Loading, erro e empty state

Toda tela que depende de API deve possuir três estados explícitos:

### Loading

- skeletons nos cards;
- skeleton rows na tabela;
- evitar layout shift exagerado.

### Error

Mensagem simples:

```text
Não foi possível carregar os clientes.
[ Tentar novamente ]
```

### Empty

Exemplo clientes:

```text
Nenhum cliente encontrado.
Faça uma importação ou altere os filtros.
```

Exemplo conta:

```text
Nenhuma conta conectada.
```

---

## 23. Responsividade

### Desktop >= 1200px

- Sidebar fixa.
- Cards em 4 colunas.
- Tabela completa.
- Drawer lateral pode coexistir com conteúdo.

### Tablet 768–1199px

- Sidebar reduzida ou drawer.
- Cards em 2 colunas.
- Filtros quebram em duas linhas.
- Painel de detalhes vira drawer overlay.

### Mobile < 768px

- Header compacto.
- Sidebar via menu.
- Cards em 1 coluna ou 2 se couber.
- Tabela deve virar cards/lista ou permitir scroll horizontal controlado.
- Priorizar campos:
  - nome;
  - telefone;
  - CPF/CNPJ;
  - pedido;
  - ação WhatsApp.
- Detalhes como drawer fullscreen ou modal sheet.

---

## 24. Acessibilidade

Obrigatório:

- elementos interativos devem ser `button`, `a`, `input`, etc., não `div` clicável;
- labels associados aos inputs;
- `aria-label` em ícones sem texto;
- foco visível;
- contraste adequado;
- navegação por teclado;
- drawer deve permitir fechar com Escape;
- modal/drawer deve controlar foco quando aplicável;
- botões disabled precisam usar atributo real `disabled`.

---

## 25. Formatação de dados

Centralizar helpers.

### Telefone

Banco/API:

```text
5511999999999
```

UI:

```text
(11) 99999-9999
```

### CPF

```text
12345678900
→ 123.456.789-00
```

### CNPJ

```text
12345678000190
→ 12.345.678/0001-90
```

### Data

Usar locale `pt-BR`.

```text
29/09/2026
29/09/2026 14:21
```

Não repetir lógica de formatação em vários componentes.

---

## 26. Segurança no frontend

O frontend nunca deve:

- receber access token de qualquer marketplace;
- receber refresh token;
- exibir secrets;
- armazenar JWT sensível no localStorage quando cookie HttpOnly estiver sendo usado;
- logar dados sensíveis desnecessariamente.

Evitar `console.log` com objetos inteiros de cliente em produção.

---

## 27. Performance

- Paginação server-side.
- Debounce na busca.
- Não carregar milhares de clientes de uma vez.
- Evitar renderização desnecessária de tabelas grandes.
- Usar lazy loading para páginas quando fizer sentido.
- Não otimizar prematuramente componentes pequenos.

---

## 28. Regras específicas da V1

### Deve existir

- Login já existente.
- Dashboard.
- Clientes.
- Importações.
- Contas Integradas.
- Configurações básicas.
- Mercado Livre.
- Magalu.
- Coluna e filtro de plataforma.
- Nome do cliente.
- CPF/CNPJ.
- Telefone.
- Pedido.
- Data.
- Conta/CNPJ de origem.
- Abrir WhatsApp.

### NÃO deve existir ainda

- Shopee.
- Filtro de plataforma com opções futuras.
- Logos de plataformas não implementadas.
- Envio automático de WhatsApp.
- Campanhas.
- Disparo em massa.
- Relatórios avançados.
- Gráficos fictícios.
- Dados mockados misturados com dados reais em produção.

---

## 29. Critérios de aceitação visual

A interface será considerada alinhada ao design quando:

1. possuir sidebar clara e consistente;
2. possuir header limpo;
3. dashboard usar cards compactos com boa hierarquia;
4. tabela de clientes for o foco operacional;
5. filtros forem organizados e fáceis de usar;
6. botão WhatsApp tiver destaque verde sem dominar a tela;
7. drawer lateral permitir consultar cliente sem sair da lista;
8. cores forem sóbrias e profissionais;
9. interface funcionar bem em desktop e tablet;
10. as duas plataformas forem identificadas consistentemente na lista, filtros, contas e detalhes.

---

## 30. Critérios de aceitação técnica

A implementação deverá:

- usar React + Vite + TypeScript;
- respeitar a arquitetura existente;
- não recriar autenticação existente;
- não inventar endpoints;
- analisar as rotas do backend antes de integrar;
- criar camada de API centralizada;
- usar tipos TypeScript;
- evitar `any`;
- separar pages, components, services e types por feature;
- tratar loading/error/empty;
- usar `credentials: 'include'` quando necessário;
- ser responsiva;
- ser acessível;
- não expor credenciais dos marketplaces;
- manter OAuth no backend e compartilhar a ação WhatsApp usando `normalizedPhone`.
