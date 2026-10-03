# Login no iPhone sem domínio próprio

O frontend permanece React/Vite no Static Site `mlivrefrontend` e o backend
permanece Express no Web Service `sistemamlivre`. O navegador chama `/api` no
endereço do frontend; o Render encaminha a requisição ao backend e devolve a
resposta ao navegador. O cookie HttpOnly passa a pertencer ao site aberto.

```text
iPhone/PC → mlivrefrontend.onrender.com/api → sistemamlivre.onrender.com/api
```

Esse é o princípio usado pelo Cats: o navegador mantém a sessão no próprio site
e um servidor faz a comunicação com a API. Aqui o proxy do Render faz esse papel,
sem criar um projeto Next.js nem armazenar tokens no JavaScript do navegador.
O Render documenta [Rewrite para um serviço de API](https://render.com/docs/deploy-redwood).

## Aplicar nos serviços existentes

1. Publique o backend atualizado. O middleware `preventApiCaching` envia
   `Cache-Control: private, no-store` em todas as respostas `/api`, incluindo
   erros e redirects. Isso impede que respostas de sessão sejam guardadas no
   proxy. Mantenha `NODE_ENV=production` para cookies Secure.

2. No Static Site **mlivrefrontend**, abra **Redirects/Rewrites** e adicione estas
   regras nesta ordem. Use **Rewrite** nas duas regras:

   | Source | Destination | Action |
   | --- | --- | --- |
   | `/api/*` | `https://sistemamlivre.onrender.com/api/*` | Rewrite |
   | `/*` | `/index.html` | Rewrite |

   A primeira regra precisa vir antes da segunda. A API deve receber o método,
   corpo, query string e cookies originais. **Redirect** mudaria o endereço do
   navegador para o backend e não resolveria o problema de sessão.

3. Em **Headers** do Static Site, configure o caminho `/api/*` com
   `Cache-Control: private, no-store`. Remova regras conflitantes que indiquem
   cache público para `/api`. Mantenha o cache dos arquivos estáticos.

4. Em **Environment** do Static Site, defina:

   ```env
   VITE_API_URL=/api
   ```

   Publique o frontend atualizado com um **novo build**. A variável é incorporada
   durante `npm run build`; só salvar o valor no painel não muda o JavaScript já
   publicado. Um valor antigo com a URL completa do backend continuaria usando
   cookies entre sites diferentes.

5. No Web Service **sistemamlivre**, mantenha/configure:

   ```env
   NODE_ENV=production
   FRONTEND_URL=https://mlivrefrontend.onrender.com
   MERCADO_LIVRE_REDIRECT_URI=https://mlivrefrontend.onrender.com/api/marketplace-accounts/mercadolivre/callback
   ```

   Cadastre essa mesma URI de callback no aplicativo do Mercado Livre. O início
   da autorização agora passa pelo frontend e grava `ml_oauth_state` nesse host;
   o retorno precisa passar pelo mesmo host para que esse cookie acompanhe o
   callback. Reinicie/publique o backend após mudar seu ambiente. Os tokens e
   secrets continuam apenas no backend. O endpoint de callback existente é
   preservado; só muda o endereço público usado para chegar a ele.

O [render.yaml](../render.yaml) registra as regras e a variável do frontend.
Para os serviços já existentes, aplique os valores no painel. Não crie um segundo
Static Site por Blueprint para tentar alterar o serviço atual. Se o serviço já
for gerenciado por Blueprint, atualize esse Blueprint com as mesmas regras.

## Confirmar depois da publicação

Faça login novamente no PC e no iPhone. O cookie anterior, se existir, pertence
ao backend e não é transferido para o frontend.

- Abrir `/login` diretamente deve responder 200 com a aplicação.
- `/api/health` no endereço do frontend deve retornar JSON da API, não HTML.
- Após login, `/api/auth/me` no frontend deve responder 200.
- Atualizar `/dashboard` deve preservar a sessão.
- Logout deve remover a sessão e `/api/auth/me` deve voltar a responder 401.
- Conectar o Mercado Livre deve retornar ao frontend com sessão e state válidos.

Na inspeção da rede, todas as chamadas da aplicação devem começar com
`https://mlivrefrontend.onrender.com/api/`. No login, confirme que o `Set-Cookie`
recebido pelo proxy é armazenado como cookie HttpOnly no host do frontend, sem
atributo Domain apontando para o backend. O backend atual não define Domain.

Se a infraestrutura não preservar `Set-Cookie`/`Cookie` ou redirects, a
confirmação de sessão exibirá o erro no login. Os testes locais verificam o fluxo
via proxy do Vite; a configuração do Render e o Safari real precisam ser
verificados após a publicação.

## Desenvolvimento e testes

Em desenvolvimento, o Vite encaminha `/api` para `API_PROXY_TARGET` (padrão
`http://localhost:3333`). Não inclua `/api` no valor do target: o caminho já é
preservado. `API_PROXY_TARGET` é lido apenas pelo servidor de desenvolvimento,
sem prefixo `VITE_`, e não é publicado no navegador.

```sh
npm run build
npm run lint
npm test
npm run test:proxy
```

`test:proxy` usa um servidor HTTP fictício e o proxy real do Vite. Verifica
cookies HttpOnly, restauração, logout, chamadas na mesma origem e ida/volta OAuth
em outro host local. Usa desktop e viewport de celular no Edge/Chromium; não é
uma reprodução do Safari. Não acessa banco, Render ou marketplaces.

Para erros depois de autorizar a conta, consulte [Diagnóstico da conexão com o Mercado Livre](MERCADO_LIVRE_OAUTH.md).
