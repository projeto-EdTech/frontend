# Rotas de API do frontend

`src/app/api/` contém os Route Handlers do Next.js (App Router). Salvo duas exceções listadas no
fim, eles são **proxies finos para o BFF Java**: recebem, encaminham e devolvem. Nenhuma regra de
negócio vive aqui — é a regra do [`CLAUDE.md`](../../../../CLAUDE.md) e vale para todo o diretório.

> **Última revisão:** 06/08/2026 — depois de a cadeia de pagamento sair do Next e de o JWT sair
> do `localStorage`.

---

## Como o frontend fala com o backend

Existem **dois** caminhos, e escolher errado é o erro mais comum neste projeto.

```text
1. Server Component  ──────────────────────────────────►  BFF Java
   lê o cookie com `cookies()` e chama BACKEND_API_URL direto.
   Sem salto intermediário: é o caminho preferido quando não há interatividade.

2. Navegador  ────►  Route Handler (src/app/api)  ────►  BFF Java
   o cookie HttpOnly acompanha sozinho o fetch same-origin;
   a rota o lê com `readUserToken` e repassa como Bearer.
```

**Quando usar cada um:** se o dado é buscado na renderização, use um Server Component
(`*DataServer.tsx`) e chame o BFF direto — uma rota no meio só adiciona latência. Rotas em
`src/app/api/` existem para o que o **navegador** precisa disparar: interação, formulário,
polling.

Server Components que já falam direto com o BFF: `Estatisticas/EstatisticasDados.tsx`,
`Library/LibraryUniversityDataServer.tsx`, `Simula_PRO/NotaCorteResultados.tsx`,
`Simula_PRO/SimulacaoLoader.tsx`, `UniversitiesCountBadge.tsx`, `blog/BlogDataServer.tsx`,
`blog/BlogPostDataServer.tsx`, `profile/ProfileDataServer.tsx`.

---

## Autenticação — leia antes de criar rota nova

O JWT do aluno vive **só** no cookie `user_data`, HttpOnly. O JavaScript não consegue lê-lo, e é
isso que impede um script na página (dependência comprometida, extensão, XSS) de levar a sessão
embora.

**Três consequências práticas:**

1. **O cliente não monta `Authorization`.** O cookie acompanha sozinho todo `fetch` same-origin.
   Um `Authorization: Bearer` montado no navegador só é possível se alguém guardou o token onde
   não devia.
2. **A rota lê o token com `readUserToken(req)`**
   ([`src/app/service/sessionToken.ts`](../service/sessionToken.ts)) — header primeiro, cookie
   depois. Não escreva outro parser: já existe um, e ele é o mesmo em todas as rotas.
3. **Nada de JWT em log.** Nem os primeiros caracteres.

Quem valida o token é o **BFF Java**. O `readUserToken` só prova que existe sessão e entrega o
Bearer a repassar; ele não decodifica nem verifica assinatura.

```ts
import { readUserToken } from '@/app/service/sessionToken';

const userToken = readUserToken(request);
if (!userToken) {
  return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
}
```

---

## Inventário das rotas

### 🔐 Sessão e identidade

| Rota | Método | Endpoint no BFF | Sessão |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET` `POST` | — | — |
| `/api/sync-user` | `POST` | `POST /auth/google` | NextAuth |
| `/api/user/me` | `GET` | — (só decodifica) | `user_data`, com fallback na sessão NextAuth |
| `/api/user/stats` | `GET` | `GET /usuarios/{id}/estatisticas/geral` + `/performance-materia` | obrigatória |

**`/api/auth/[...nextauth]`** — núcleo do NextAuth. Configuração em [`src/lib/core/auth.ts`](../../lib/core/auth.ts):
Google (escopo só de `userinfo.profile` e `userinfo.email`), Azure AD, Facebook e Discord.
Renovação de token no callback `jwt`.

**`/api/sync-user`** — primeira ponte após o login OAuth. Pega o `id_token` do Google da sessão
NextAuth, manda ao Java, e **grava o JWT devolvido no cookie `user_data` HttpOnly**. É o único
ponto do fluxo que escreve esse cookie: se falhar, toda a aplicação se comporta como deslogada.

> O JWT **não volta no corpo**. A resposta é `{ ok, id, tipo }` — só o que o cliente usa para
> identificar o usuário nos analytics. Devolver o token daria ao navegador como guardá-lo, que é
> exatamente o que esta arquitetura evita.

Aceita o JWT do Java em cinco grafias — `string` crua, `{ token }`, `{ accessToken }`, `{ jwt }` e
`{ data: { token } }` — apara o prefixo `Bearer` e só grava o cookie se `decodeJWT()` devolver
payload válido. Timeout próprio de **8s** (`AbortSignal.timeout`), abaixo dos 10s do undici.

Os modos de falha são distinguíveis **no log do servidor**, porque na tela são idênticos:

| Log | Significado | Status |
|---|---|---|
| `[sync-user][ABORT]` | sessão NextAuth sem `googleAccount` ou sem `id_token` | 401 |
| `[sync-user][NET]` | não alcançou o BFF — rede, firewall, host errado | **504** |
| `[sync-user][BFF]` | o Java respondeu, mas com erro | relay do status |
| `[sync-user][SHAPE]` | respondeu OK, sem JWT utilizável no corpo | **502** |
| `[sync-user][BUG]` | exceção nossa | 500 |

Um 401 persistente em `/api/user/me` quase sempre começa aqui — ver a seção de conectividade com
o BFF no [`README.md`](../../../../README.md) da raiz antes de suspeitar da rota `me`.

**`/api/user/me`** — o substituto de decodificar o JWT no navegador. Lê o cookie no servidor,
decodifica com [`jwtDecoder.ts`](../service/jwtDecoder.ts) e devolve **apenas os claims de tela**:

```jsonc
{ "id": "...", "nome": "...", "email": "...", "tier": "SIMULAPRO", "newsletter": true }
```

`tier` já vem normalizado (`FREE` | `SIMULAPRO` | `TEACHER` | `ADMIN`). Nunca devolve `token`,
`exp`, `iat` nem o payload cru.
Consumida por [`src/lib/core/userClaims.ts`](../../lib/core/userClaims.ts), que é quem os componentes usam.

Tem **duas fontes de sessão**, e só responde 401 quando as duas faltam:

| Ordem | Cookie | Traz | Quando entra |
|---|---|---|---|
| 1 | `user_data` | tudo | sempre que existe e decodifica |
| 2 | `next-auth.session-token` | `nome`, `email`, `tier` — `id` é `null` e `newsletter` é `false` | `user_data` ausente, ilegível ou vencido |

A fonte 2 existe porque um `sync-user` que falha deixa o aluno autenticado no OAuth mas sem
`user_data` — e sem ela a aplicação inteira o trata como deslogado. O header
**`X-Claims-Source`** (`user_data` | `next-auth`) diz qual respondeu; `next-auth` é sinal de que
o problema está no `/api/sync-user`.

Esse cookie do NextAuth chega **fragmentado** (`next-auth.session-token.0`, `.1`, …) porque o
callback `jwt` guarda o `account` inteiro do Google. Quem remonta é
`readNextAuthSessionToken(req)` de [`sessionToken.ts`](../service/sessionToken.ts), ordenando
pelo sufixo **numérico** e reconhecendo também o nome `__Secure-` de produção. E ele é um **JWE
cifrado**, não um JWT: `jwt-decode` não o lê — quem abre é o `decode` do `next-auth/jwt` com a
`NEXTAUTH_SECRET`. A regra "só o `jwtDecoder` lê JWT" continua valendo: ela é sobre o token do
Java, e o token do NextAuth não é JWT.

O `id` do fallback é **sempre `null`**, nunca o `sub` do NextAuth: `SyncUserEffect` só pula a
sincronização quando `claims.id` é truthy, então preenchê-lo faria o `user_data` nunca ser gravado.

**`/api/user/stats`** — desempenho do aluno para o dashboard do perfil. Extrai o `id` do JWT e
busca as duas fontes do Java **em paralelo** (`Promise.all`), sem cascata: estatísticas gerais e
performance por matéria. A resposta é achatada no formato que a tela consome.

---

### 💳 Pagamento — Simula PRO

A cadeia inteira (resolver preço, criar cobrança na gateway, verificar pagamento, conferir
titularidade, ativar tier) vive **no Java**. Nenhum SDK de gateway existe neste repositório.
Todas as cinco rotas passam por [`src/app/service/bffPayments.ts`](../service/bffPayments.ts).

| Rota | Método | Endpoint no BFF | Sessão |
|---|---|---|---|
| `/api/plans` | `GET` | `GET /plans` | pública |
| `/api/process-subscription/credit-card` | `POST` | `POST /subscriptions/checkout/card` | obrigatória |
| `/api/process-subscription/pix` | `POST` | `POST /subscriptions/checkout/pix` | obrigatória |
| `/api/process-subscription/boleto` | `POST` | `POST /subscriptions/checkout/boleto` | obrigatória |
| `/api/subscriptions/activate` | `POST` | `POST /subscriptions/activate` | NextAuth **e** JWT |

**Corpo das três rotas de cobrança** — idêntico para os três métodos:

```jsonc
{
  "planId": "anual",
  "payer": {
    "first_name": "Maria",
    "last_name": "Silva",
    "identification": { "type": "CPF", "number": "12345678909" },
    // só no boleto: o Mercado Pago exige endereço para boleto registrado
    "address": { "zip_code": "...", "street_name": "...", "street_number": "...",
                 "neighborhood": "...", "city": "...", "federal_unit": "..." }
  }
}
```

> **`sanitizeCheckoutBody` remonta esse corpo do zero, por allowlist.** Campo que não estiver
> acima é descartado por não ter sido pedido — inclusive nomes que ninguém previu (`valor`,
> `preco`, `desconto`). **Valor, status e e-mail do pagador nunca saem do navegador:** o preço
> vem da gateway e o e-mail vem da sessão, os dois resolvidos no Java. É o que torna a
> conferência de titularidade possível.

**`/api/subscriptions/activate`** — o passo final. O navegador manda **só um identificador**:

```jsonc
{ "gateway": "stripe" | "mercadopago", "paymentId": "pi_123" }
```

O Java consulta a gateway, confere a titularidade contra a sessão e ativa o tier. O que sobra
para o Next é mecânica de cookie: num `200` com `token`, regrava `user_data` — e o tier passa a
valer sem o aluno relogar. **O token não vai no corpo da resposta.**

Status repassados sem tradução: `200` ativado · `202` pendente · `403` titularidade divergente ·
`404` gateway não conhece o id · `409` falhou.

Três origens chamam esta rota, todas com o mesmo corpo:
[`paidPlan/page.tsx`](../paidPlan/page.tsx) (cartão),
[`usePixPaymentStatus`](../../hooks/usePixPaymentStatus.ts) (polling do PIX),
[`usePendingPaymentReconciliation`](../../hooks/usePendingPaymentReconciliation.ts) (boleto, no
próximo acesso).

**Erros nunca vazam.** Acima de 2xx, `callBff` substitui o corpo do Java por mensagem genérica do
próprio status — o corpo original pode carregar host, stack ou nome de classe interna. Falha de
rede e `BACKEND_API_URL` ausente viram `503`.

---

### 📚 Conteúdo acadêmico

| Rota | Método | Endpoint no BFF | Sessão |
|---|---|---|---|
| `/api/universities` | `GET` | `GET /api/instituicao` | obrigatória |
| `/api/questions/[university]` | `POST` | `POST /api/prova/instituicao` | — |
| `/api/estatisticas/[subject]` | `GET` | `GET /api/instituicao/estatisticas/{id}/{materia}` | — |
| `/api/Nota-corte` | `GET` `POST` | `GET /nota-corte/cursos` · `GET /nota-corte/media` | obrigatória |
| `/api/blog` | `GET` | `GET /api/artigos` | — |
| `/api/blog/[slug]` | `GET` | `GET /api/artigos/{id}` | — |

**`/api/Nota-corte`** — `GET` lista os cursos; `POST` calcula a aprovação:

```jsonc
{ "userScore": 750, "targetCourse": "Medicina", "targetInstitution": "USP" }
```

**`/api/universities`** — consumida por [`UniversityStorage`](../../contexts/UniversityStorage.tsx),
que é provider global.

> ⚠️ **Não existe fallback estático.** O contexto apenas expõe `error` quando a rota falha, e a
> lista fica vazia — nenhum arquivo `src/lib/dataUniversity` existe no repositório, apesar de
> documentação antiga afirmar o contrário. Toda tela que depende de instituição fica vazia com o
> BFF fora do ar.

---

### 🎮 Jogos e utilitários

| Rota | Método | Origem dos dados | Sessão |
|---|---|---|---|
| `/api/games/flash-cards` | `GET` | `GET /flashcards/recomendacao?userId=` | obrigatória |
| `/api/get-logo` | `GET` | sistema de arquivos (`public/Logo_Universidades`) | — |

**`/api/get-logo`** — a única rota que não fala com o BFF. Resolve o caminho da imagem do logo
tolerando variações de nome e slug (`PUC-SP` vs `pucsp`).

---

## Mapa de consumo

| Rota | Quem chama |
|---|---|
| `/api/sync-user` | `components/SyncUserEffect.tsx` |
| `/api/user/me` | `lib/core/userClaims.ts` → `hooks/useUserTier.ts`, `components/blog/SubscribeButton.tsx`, `components/SyncUserEffect.tsx` |
| `/api/user/stats` | `components/profile/ProfileClient.tsx` (SWR) |
| `/api/subscribe` | `components/blog/SubscribeButton.tsx` |
| `/api/plans` | `components/PricingCard.tsx`, `app/paidPlan/page.tsx` |
| `/api/process-subscription/credit-card` | `app/paidPlan/page.tsx` |
| `/api/process-subscription/pix` | `app/paidPlan/page.tsx` |
| `/api/process-subscription/boleto` | `components/payment/BoletoForm.tsx` |
| `/api/subscriptions/activate` | `app/paidPlan/page.tsx`, `hooks/usePixPaymentStatus.ts`, `hooks/usePendingPaymentReconciliation.ts` |
| `/api/universities` | `contexts/UniversityStorage.tsx`, `components/Simula_PRO/NotaCorteConsulta.tsx`, `components/profile/UserConfig.tsx` |
| `/api/Nota-corte` | `components/Simula_PRO/NotaCorteConsulta.tsx`, `components/profile/ProfileClient.tsx`, `components/profile/UserConfig.tsx` |
| `/api/games/flash-cards` | `components/games/flash-card_game/functions/flash-cardlogic.ts` |
| `/api/get-logo` | `components/Simula_PRO/CourseCard.tsx`, `components/Simula_PRO/NotaCorteConsulta.tsx` |
| `/api/questions/[university]`, `/api/estatisticas/[subject]`, `/api/blog`, `/api/blog/[slug]` | sem consumidor via `fetch` no cliente — as telas correspondentes usam Server Components que chamam o BFF direto |

---

## ⚠️ Chamadas quebradas conhecidas

Registradas na auditoria de 06/08/2026. Nenhuma foi introduzida por ela, e cada uma tem escopo
próprio — **não invente a rota sem antes conferir o contrato com o time Java**.

| Chamada no cliente | Problema |
|---|---|
| `POST /api/simulations/save-result` (`Simula_PRO/SimulationQuizClient.tsx`) | **a rota não existe** — o resultado do simulado nunca chegou ao backend |
| `POST /api/games/flash-cards` (`flash-card_game/functions/flash-cardlogic.ts`) | a rota exporta **só `GET`** → responde 405; os acertos nunca foram salvos |
| `POST /api/generate-explanation` (`profile/ProfileClient.tsx`) | a rota **existe** e funciona (Gemini, streaming). O que falta é a UI: `Simula_PRO/Questoes_Gemini.tsx` não é montado por nenhuma tela, então `handleSubmit` nunca é disparado |

Outros pontos abertos: [`src/lib/simulationStore.ts`](../../lib/simulationStore.ts) não é
importado por ninguém, e a grafia do claim de newsletter diverge (`newsletter` na interface do
payload, `newsLetter` no botão do blog — `/api/user/me` aceita as duas como contorno).

---

## Checklist para criar uma rota nova

1. **É mesmo necessária?** Se o dado é buscado na renderização, um Server Component chamando o
   BFF direto é melhor.
2. **Proxy fino.** Recebe, encaminha, devolve. Regra de negócio vai para o Java.
3. **`process.env.BACKEND_API_URL`** — nunca URL no código, nunca `NEXT_PUBLIC_`.
4. **Sessão com `readUserToken(req)`**, 401 antes de qualquer chamada externa.
5. **Erro do BFF não chega ao navegador.** Nada de stack, host ou nome de classe. Rotas de
   pagamento já têm isso pronto em `callBff`.
6. **Comentário de cache strategy** no topo do arquivo:

   ```ts
   // CACHE STRATEGY: no-store — dados financeiros, sem cache
   // CACHE STRATEGY: ISR — revalidate 300s — catálogo público
   ```

7. **Teste** em `src/test/`, sufixo `.test.ts` (Vitest). Os arquivos em `src/test/auth/` já
   cobrem o padrão de sessão via `describe.each` — some a rota nova a `route-cookie-auth.test.ts`.
