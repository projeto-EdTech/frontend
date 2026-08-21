# Vestibuline — Front-End

Interface web da plataforma Vestibuline: preparação para vestibulares com simulados de provas reais, consulta de nota de corte, mini-games educativos, estatísticas de desempenho, ranking e checkout do plano Simula PRO.

[Reportar Bug](https://github.com/projeto-EdTech/frontend/issues) · [Solicitar Melhoria](https://github.com/projeto-EdTech/frontend/issues)

> **AVISO:** Repositório PRIVADO — uso exclusivo da equipe Vestibuline. Nenhum trecho de código deve ser compartilhado externamente sem aprovação formal.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Escopo Atual — Fase 1](#escopo-atual--fase-1)
3. [Stack Técnica](#stack-técnica)
4. [Funcionalidades](#funcionalidades)
5. [Arquitetura](#arquitetura)
6. [Autenticação e Sessão](#autenticação-e-sessão)
7. [Estrutura de Pastas](#estrutura-de-pastas)
8. [Rotas de Página](#rotas-de-página)
9. [Route Handlers (API)](#route-handlers-api)
10. [Camada de Serviço](#camada-de-serviço)
11. [Contextos, Hooks e Stores](#contextos-hooks-e-stores)
12. [Sistema de Pagamentos](#sistema-de-pagamentos)
13. [Gate de IP (`proxy.ts`)](#gate-de-ip-proxyts)
14. [Setup Local](#setup-local)
15. [Scripts](#scripts)
16. [Variáveis de Ambiente](#variáveis-de-ambiente)
17. [Testes](#testes)
18. [Padrões e Convenções](#padrões-e-convenções)
19. [Segurança](#segurança)
20. [Estado Atual e Dívidas Conhecidas](#estado-atual-e-dívidas-conhecidas)
21. [Fluxo de Contribuição](#fluxo-de-contribuição)
22. [Licença](#licença)

---

## Visão Geral

O Vestibuline é uma plataforma EdTech para estudantes de ensino médio que se preparam para o ENEM e vestibulares. O front-end é um **Next.js 16 (App Router)** que atua como camada BFF: nenhuma chamada sai do navegador direto para o backend Java — ou passa por um Route Handler em `src/app/api/`, ou é feita por um Server Component que fala com o BFF no servidor.

**Público-alvo:** estudantes de ~17 anos, mobile-first, com tema claro/escuro e recursos de acessibilidade (incluindo fonte OpenDyslexic).

O repositório é um monorepo raso: a aplicação inteira vive em `front/`.

```text
frontend/
├── CHANGES.md          histórico detalhado de cada entrega
├── README.md           este arquivo
└── front/              aplicação Next.js
```

---

## Escopo Atual — Fase 1

O roadmap de lançamento libera as features em cinco fases. **O repositório está alinhado à Fase 1 — Lançamento Core (Jan/2027)**: features das fases seguintes foram removidas do código para que nada prometido chegue ao usuário antes da hora.

| Camada | Fase | Situação no repo |
| --- | --- | --- |
| Core FREE | 1 | ✅ presente |
| Conversão PRO (Planner, Playlist de Questões, limites ilimitados) | 2 | ❌ removido |
| IA Premium (VestIA, Relatórios IA) | 3 | ❌ removido |
| Multiplataforma (mobile/desktop) | 4 | — |
| B2B Institucional (dashboard professor) | 5 | — |

**Exceção deliberada:** a *Explicação de Gabarito por IA* (`/api/generate-explanation` + `Simula_PRO/Questoes_Gemini.tsx`) permanece no repositório por decisão do time, embora ainda não esteja montada em nenhuma tela. Ver [Estado Atual](#estado-atual-e-dívidas-conhecidas).

Detalhes do corte: seção `[Chore/scope]` no [CHANGES.md](CHANGES.md).

---

## Stack Técnica

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Runtime | React 19 + TypeScript 5 |
| Estilização | Tailwind CSS 4 + tailwind-merge + CVA |
| Componentes base | shadcn/ui (primitivos Radix UI) |
| Animações | Framer Motion 12 + Anime.js 4 + canvas-confetti |
| Formulários | React Hook Form 7 + Zod |
| Autenticação | NextAuth v4 (Google, Azure AD, Facebook, Discord) |
| Pagamentos | Mercado Pago SDK + Stripe (com failover automático) |
| IA | Google Generative AI (`@google/generative-ai`) — só explicação de gabarito |
| Analytics | Google Analytics 4, PostHog, Microsoft Clarity |
| Gráficos | Recharts 2 |
| Virtualização | react-window 2 + react-virtualized-auto-sizer |
| Dados client-side | SWR 2 · `fetch` nativo no servidor |
| Markdown/Matemática | react-markdown + remark-gfm + remark-math + rehype-katex + KaTeX |
| E-mail | EmailJS (formulário de contato) + Resend + `@react-email/render` |
| Testes | Vitest 4 · k6 (carga) |
| Linting | ESLint 9 + eslint-config-next |

---

## Funcionalidades

### Simulador de Exames

Núcleo do produto, em dois modos:

- **Prova real** — escolhe banca, ano e dia; resolve com cronômetro em `/simulation/[university]`, com resumo e gabarito em `/simulation/[university]/summary`
- **Personalizado** — `/create` monta a prova por matéria/conteúdo (`/api/simulations/create`) ou como mix por universidade (`/api/simulations/create-mix`)

Enunciados suportam LaTeX via KaTeX. O estado da prova persiste em `localStorage`; o resultado transita por `sessionStorage` até a tela de resumo. `lib/store/simulationStore.ts` guarda as questões geradas em memória com TTL para a transição entre rotas.

### Consultor de Notas de Corte

`/Nota-corte` recebe nota, curso e instituição por query string e mostra se o aluno passaria. `NotaCorteConsulta` também aparece como aba dentro do perfil. Dados de mais de 100 cursos em `lib/data/notaCorte.ts`; o cálculo real fica no BFF via `/api/Nota-corte`.

### Arena — mini-games

`/Arena` lista o hub; `/Arena/[game]` carrega o jogo por slug. Quatro jogos, cada um com README próprio na sua pasta:

| Jogo | Slug | Descrição |
| --- | --- | --- |
| **Flash Cards** | `flash-cards` | Revisão por repetição espaçada, com combo e pontuação. Limite FREE de 10 cards/dia (`DAILY_LIMIT`) |
| **Lexoo** | `lexoo` | Jogo diário de palavras |
| **Nexo** | `nexo` | Conexões — 16 palavras em 4 grupos temáticos |
| **Enigma** | `enigma` | Descobrir o conteúdo oculto de vestibular |

### Biblioteca e Blog

- `/library` — catálogo de provas; `/library/[university]` — provas da instituição, com filtros
- `/blog` e `/blog/[slug]` — artigos com SEO, renderizados por Server Components que falam direto com o BFF

### Perfil, Estatísticas e Ranking

`/profile` reúne, em abas: estatísticas gerais, histórico de simulados, desempenho por matéria, configurações (vestibular-alvo, curso, avatar) e consulta de nota de corte. `/estatisticas/[subject]` mostra a incidência histórica de tópicos por matéria.

O perfil também traz ranking, badges e conquistas, e a vinculação com o Discord por token OTP (`VEST-XXXXX`, via `/api/user/generate-token`).

### Acessibilidade e Tema

- Fonte OpenDyslexic alternável pelo `AccessibilityContext`
- Tema claro/escuro persistido e aplicado via `data-theme` no `<html>`
- `SkipLink` para navegação por teclado
- Cores sempre por CSS Custom Properties em `globals.css` — sem hex literal em componente

### Pagamentos

Checkout do Simula PRO com cartão, PIX e boleto. Ver [Sistema de Pagamentos](#sistema-de-pagamentos).

---

## Arquitetura

### Os dois caminhos até o backend

Escolher errado aqui é o erro mais comum do projeto:

```text
1. Server Component  ─────────────────────────────►  BFF Java
   lê o cookie com cookies() e chama BACKEND_API_URL direto.
   Caminho preferido quando o dado é buscado na renderização.

2. Navegador  ────►  Route Handler (src/app/api)  ────►  BFF Java
   o cookie HttpOnly acompanha sozinho o fetch same-origin;
   a rota o lê com readUserToken e repassa como Bearer.
```

Rotas em `src/app/api/` existem para o que o **navegador** precisa disparar: interação, formulário, polling. Se o dado é buscado na renderização, uma rota no meio só adiciona latência.

Server Components que já falam direto com o BFF: `Estatisticas/EstatisticasDados.tsx`, `Library/LibraryUniversityDataServer.tsx`, `Simula_PRO/NotaCorteResultados.tsx`, `Simula_PRO/SimulacaoLoader.tsx`, `blog/BlogDataServer.tsx`, `blog/BlogPostDataServer.tsx`, `profile/ProfileDataServer.tsx`, `Arena/GameDataServer.tsx`.

### Route Handler é proxy fino

Recebe, encaminha, devolve. **Nenhuma regra de negócio vive em `src/app/api/`** — ela fica em `src/app/service/` ou no Java. Erro do BFF nunca chega cru ao navegador: acima de 2xx o corpo é substituído por mensagem genérica, porque o original pode carregar host, stack ou nome de classe interna.

### Divisão Server / Client

Feature que combina dados do BFF com interatividade segue o padrão:

```text
page.tsx (fino — só Suspense)
  └── Suspense fallback={<Skeleton />}
        └── *DataServer.tsx   (Server Component — fetch no BFF)
              └── *Client.tsx  ('use client' — estado + animações)
```

### Cache Strategy

Todo Route Handler e service carrega um comentário no topo declarando a estratégia:

```ts
// CACHE STRATEGY: no-store — dados financeiros, sem cache
// CACHE STRATEGY: ISR — revalidate 3600s — catálogo público
// CACHE STRATEGY: SWR — revalidateOnFocus — dados do usuário
```

---

## Autenticação e Sessão

O JWT do aluno vive **só** no cookie `user_data`, HttpOnly. O JavaScript não consegue lê-lo — é isso que impede um script na página (dependência comprometida, extensão, XSS) de levar a sessão embora.

Três consequências práticas:

1. **O cliente não monta `Authorization`.** O cookie acompanha sozinho todo `fetch` same-origin. Um `Authorization: Bearer` montado no navegador só é possível se alguém guardou o token onde não devia.
2. **A rota lê o token com `readUserToken(req)`** ([`service/sessionToken.ts`](front/src/app/service/sessionToken.ts)) — header primeiro, cookie depois. Não escreva outro parser.
3. **Nada de JWT em log.** Nem os primeiros caracteres.

Quem valida o token é o BFF Java. `readUserToken` só prova que existe sessão e entrega o Bearer a repassar.

### Fluxo de login

```text
Login OAuth (NextAuth)
  └── SyncUserEffect  →  POST /api/sync-user
        └── manda o id_token do Google ao BFF Java
              └── grava o JWT devolvido no cookie user_data (HttpOnly)
                    └── dispara o evento user_synced
```

A resposta de `/api/sync-user` é `{ ok, id, tipo }` — **o JWT não volta no corpo**. Devolvê-lo daria ao navegador como guardá-lo, que é exatamente o que esta arquitetura evita.

### Tier do usuário

Tiers: `FREE` · `SIMULAPRO` · `TEACHER` · `ADMIN`.

`GET /api/user/me` lê o cookie no servidor, decodifica com [`jwtDecoder.ts`](front/src/app/service/jwtDecoder.ts) e devolve **apenas claims de tela** (`id`, `nome`, `email`, `tier`, `newsletter`) — nunca `token`, `exp`, `iat` ou o payload cru.

O hook [`useUserTier`](front/src/hooks/useUserTier.ts) consome isso via `lib/core/userClaims.ts`. **Não há polling:** a rota é consultada na montagem e em dois eventos — `user_synced` (mesma aba: login, ativação de assinatura) e `storage` (outras abas).

---

## Estrutura de Pastas

```text
front/
├── src/
│   ├── app/
│   │   ├── api/                       Route Handlers (proxies finos p/ o BFF)
│   │   │   ├── auth/[...nextauth]/    handler NextAuth
│   │   │   ├── sync-user/             ponte pós-login → grava cookie user_data
│   │   │   ├── user/                  me · stats · profile · generate-token
│   │   │   ├── plans/                 catálogo de planos
│   │   │   ├── process-subscription/  boleto · credit-card · pix
│   │   │   ├── subscriptions/activate/  ativação do tier após pagamento
│   │   │   ├── subscribe/             newsletter
│   │   │   ├── gateway-health/        ping Mercado Pago + Stripe (ISR 30s)
│   │   │   ├── webhooks/              mercadopago · stripe
│   │   │   ├── universities/          listagem e [university]
│   │   │   ├── questions/[university]/
│   │   │   ├── simulations/           create · create-mix · save-result · [id]
│   │   │   ├── estatisticas/[subject]/
│   │   │   ├── Nota-corte/
│   │   │   ├── blog/                  listagem e [slug]
│   │   │   ├── badges/
│   │   │   ├── games/flash-cards/
│   │   │   ├── generate-explanation/  Gemini (streaming) — ver Estado Atual
│   │   │   ├── get-logo/              única rota que não fala com o BFF
│   │   │   └── README.md              inventário detalhado das rotas
│   │   ├── service/                   lógica server-side (sem React)
│   │   │   ├── payment/               router de gateway + adapters MP/Stripe
│   │   │   ├── jwtDecoder.ts          ÚNICO ponto de decode de JWT
│   │   │   ├── sessionToken.ts        readUserToken — header, depois cookie
│   │   │   ├── bffPayments.ts         encaminhamento das rotas de pagamento
│   │   │   ├── pendingPayment.ts      boleto pendente até reconciliar
│   │   │   ├── badge.service.ts · discordToken.service.ts · game.service.ts
│   │   │   ├── pricing.service.ts · simulation.service.ts
│   │   │   └── statistics.service.ts · university.service.ts
│   │   ├── Arena/ · Nota-corte/ · blog/ · contato/ · create/ · estatisticas/
│   │   ├── library/ · paidPlan/ · privacy/ · profile/ · simulation/ · terms/
│   │   ├── fonts/                     OpenDyslexic-Regular.otf
│   │   ├── globals.css                CSS Custom Properties (cores, espaçamento)
│   │   ├── layout.tsx                 root layout + stack de providers + GA4/Clarity
│   │   ├── providers.tsx              NextAuthProvider
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── Simula_PRO/                simulado, nota de corte, gráficos por tópico
│   │   ├── Arena/                     hub e carregamento dos mini-games
│   │   ├── games/                     Enigma · Lexoo · Nexo · flash-card_game
│   │   ├── Estatisticas/ · Filtros/ · Library/ · blog/ · profile/
│   │   ├── payment/                   BoletoForm · CreditCardForm · PixForm · StripeCardForm
│   │   ├── pricing/                   checkout alternativo (órfão — ver Estado Atual)
│   │   ├── Skeletons/                 um skeleton por rota
│   │   ├── mockups/                   mockups visuais da landing
│   │   └── ui/                        shadcn/ui + customizados
│   ├── contexts/                      Accessibility · Loading · ProfileIcon · Theme · UniversityStorage
│   ├── hooks/                         useUserTier · usePixPaymentStatus
│   │                                  usePendingPaymentReconciliation · use-mobile · use-toast
│   ├── lib/
│   │   ├── core/                      auth · analytics · utils · userClaims
│   │   │                              discordLinked · ip-allowlist · seededRandom
│   │   ├── data/                      universities · notaCorte · posts · stats
│   │   │                              profile · targetScores
│   │   ├── games/                     config.ts (mapa slug→componente) · games.ts
│   │   ├── store/                     simulationStore · userStatsCache
│   │   └── MOCK_ARCHITECTURE.md       o que hoje é estático e como religar o BFF
│   ├── providers/PostHogProvider.tsx
│   ├── types/                         next-auth.d.ts · katex.d.ts · nota-corte · university
│   └── proxy.ts                       gate de IP (Next 16 proxy)
├── tests/                             specs Vitest + escalabilidade_K6/
├── public/                            Mascote, logos de universidades, ícones
├── CLAUDE.md                          regras de trabalho no repositório
├── next.config.ts · tailwind.config.ts · postcss.config.mjs
├── eslint.config.mjs · vitest.config.ts · tsconfig.json
└── package.json
```

---

## Rotas de Página

| Rota | Descrição |
| --- | --- |
| `/` | Landing page |
| `/Arena` | Hub de mini-games |
| `/Arena/[game]` | Jogo por slug (`flash-cards`, `lexoo`, `nexo`, `enigma`) |
| `/Nota-corte` | Resultado da consulta de nota de corte (via query string) |
| `/blog` | Listagem de artigos |
| `/blog/[slug]` | Artigo individual |
| `/contato` | Formulário de contato (EmailJS) |
| `/create` | Criação de simulado personalizado |
| `/estatisticas/[subject]` | Incidência de tópicos por matéria |
| `/library` | Biblioteca de provas |
| `/library/[university]` | Provas da universidade |
| `/paidPlan` | Planos e checkout do Simula PRO |
| `/privacy` | Política de privacidade |
| `/profile` | Perfil, estatísticas, histórico, configurações |
| `/simulation/[university]` | Execução do simulado |
| `/simulation/[university]/summary` | Resumo e gabarito |
| `/terms` | Termos de uso |

---

## Route Handlers (API)

### Sessão e identidade

| Rota | Método | Endpoint no BFF | Sessão |
| --- | --- | --- | --- |
| `/api/auth/[...nextauth]` | GET · POST | — | — |
| `/api/sync-user` | POST | `POST /auth/google` | NextAuth |
| `/api/user/me` | GET | — (só decodifica o cookie) | cookie/header |
| `/api/user/stats` | GET | `/usuarios/{id}/estatisticas/geral` + `/performance-materia` | obrigatória |
| `/api/user/profile` | POST | perfil do aluno | obrigatória |
| `/api/user/generate-token` | POST | token OTP `VEST-XXXXX` p/ vincular o Discord | obrigatória |

### Pagamento — Simula PRO

A cadeia inteira (resolver preço, criar cobrança, verificar pagamento, conferir titularidade, ativar tier) vive **no Java**. Todas as rotas passam por [`bffPayments.ts`](front/src/app/service/bffPayments.ts).

| Rota | Método | Endpoint no BFF | Sessão |
| --- | --- | --- | --- |
| `/api/plans` | GET | `GET /plans` | pública |
| `/api/process-subscription/credit-card` | POST | `POST /subscriptions/checkout/card` | obrigatória |
| `/api/process-subscription/pix` | POST | `POST /subscriptions/checkout/pix` | obrigatória |
| `/api/process-subscription/boleto` | POST | `POST /subscriptions/checkout/boleto` | obrigatória |
| `/api/subscriptions/activate` | POST | `POST /subscriptions/activate` | NextAuth **e** JWT |
| `/api/gateway-health` | GET | — (ping direto nas gateways) | pública |
| `/api/webhooks/mercadopago` | POST | notificação da gateway | — |
| `/api/webhooks/stripe` | POST | notificação com verificação de assinatura | — |

`sanitizeCheckoutBody` remonta o corpo do checkout **do zero, por allowlist** — campo não previsto é descartado. **Valor, status e e-mail do pagador nunca saem do navegador:** o preço vem da gateway e o e-mail vem da sessão, ambos resolvidos no Java. É o que torna a conferência de titularidade possível.

### Conteúdo acadêmico

| Rota | Método | Endpoint no BFF |
| --- | --- | --- |
| `/api/universities` | GET | `GET /api/instituicao` |
| `/api/universities/[university]` | GET | instituição específica |
| `/api/questions/[university]` | POST | `POST /api/prova/instituicao` |
| `/api/estatisticas/[subject]` | GET | `GET /api/instituicao/estatisticas/{id}/{materia}` |
| `/api/Nota-corte` | GET · POST | `GET /nota-corte/cursos` · `/nota-corte/media` |
| `/api/simulations/create` | POST | simulado por matéria/conteúdo |
| `/api/simulations/create-mix` | POST | mix por universidade |
| `/api/simulations/[id]` | GET | simulado por id |
| `/api/simulations/save-result` | POST | resultado do simulado |
| `/api/blog` · `/api/blog/[slug]` | GET | `GET /api/artigos` |

### Jogos, badges e utilitários

| Rota | Método | Origem |
| --- | --- | --- |
| `/api/games/flash-cards` | GET | `GET /flashcards/recomendacao?userId=` |
| `/api/badges` | GET | configuração de conquistas (ISR 1h) |
| `/api/subscribe` | POST | inscrição na newsletter |
| `/api/generate-explanation` | POST | Gemini `gemini-2.5-flash`, streaming |
| `/api/get-logo` | GET | sistema de arquivos (`public/Logo_Universidades`) |

Inventário completo, com corpo das requisições e mapa de consumo: [`front/src/app/api/README.md`](front/src/app/api/README.md).

---

## Camada de Serviço

`src/app/service/` contém funções server-side puras. Regras:

- Sem imports de React ou hooks
- Retorno explicitamente tipado
- Erro descritivo em `!response.ok`, sem expor detalhe interno ao cliente
- Sempre `process.env.BACKEND_API_URL` — nunca URL no código, nunca `NEXT_PUBLIC_`

| Arquivo | Responsabilidade |
| --- | --- |
| `jwtDecoder.ts` | **Único ponto** de decode de JWT na aplicação; normaliza o tier |
| `sessionToken.ts` | `readUserToken(req)` — header `Authorization`, depois cookie `user_data` |
| `bffPayments.ts` | Encaminha as rotas de pagamento ao Java; sanitiza corpo e mensagens de erro |
| `pendingPayment.ts` | Cobrança pendente no navegador (boleto), à espera de reconciliação |
| `payment/` | Router de gateway + adapters Mercado Pago e Stripe |
| `pricing.service.ts` | Planos e preços |
| `simulation.service.ts` | Criação e gestão de simulados (`no-store`) |
| `statistics.service.ts` | Estatísticas de desempenho (ISR 1h) |
| `university.service.ts` | Dados de instituições (ISR 1h) |
| `game.service.ts` | Metadados dos mini-games (ISR 1h) |
| `badge.service.ts` | Configuração de badges (ISR 1h) |
| `discordToken.service.ts` | Token OTP de vinculação com o Discord |

---

## Contextos, Hooks e Stores

### Stack de providers (`layout.tsx`)

```text
NextAuthProvider
  ThemeProviderWrapper
    ProfileIconProvider
      NavigationSound
      AccessibilityProvider
        UniversityStorage
          SkipLink
          Suspense → SyncUserEffect
          PHProvider (PostHog)
            {children}
```

GA4 e Microsoft Clarity são injetados por `next/script` com `strategy="afterInteractive"` e **só em `NODE_ENV=production`** — em desenvolvimento contaminariam os dados reais.

### Contextos

| Contexto | Descrição |
| --- | --- |
| `ThemeContext` | Aplica `data-theme` (light/dark) no `<html>` e persiste a escolha |
| `AccessibilityContext` | Alterna a fonte OpenDyslexic (`--font-opendyslexic`) e demais preferências de leitura |
| `ProfileIconContext` | Estado do avatar do perfil |
| `LoadingContext` | Loading global entre navegações — **não está no provider stack nem tem consumidor** |
| `UniversityStorage` | Provider global com a lista de instituições, consumida por várias telas |

> ⚠️ `UniversityStorage` **não tem fallback estático**: quando `/api/universities` falha, o contexto expõe `error` e a lista fica vazia. Toda tela que depende de instituição fica vazia com o BFF fora do ar.

### Hooks

| Hook | Descrição |
| --- | --- |
| `useUserTier` | Tier via `GET /api/user/me`; sem polling — reage a `user_synced` e `storage` |
| `usePixPaymentStatus` | Polling do PIX enquanto o QR está na tela (até 30 min) |
| `usePendingPaymentReconciliation` | Reconcilia boleto pendente no acesso seguinte |
| `use-mobile` | Detecta viewport mobile |
| `use-toast` | Notificações (Sonner) |

### Stores em memória

| Store | Descrição |
| --- | --- |
| `lib/store/simulationStore.ts` | `Map` com TTL de 10 min guardando as questões geradas entre `/api/simulations/create*` e a execução do simulado. Consumido por `simulation.service.ts` e pelas rotas `create`, `create-mix` e `[id]` |
| `lib/store/userStatsCache.ts` | Cache das estatísticas do usuário — **sem importador hoje** |

---

## Sistema de Pagamentos

### Estratégia de roteamento

| Método | Gateway principal | Fallback |
| --- | --- | --- |
| Cartão de crédito | Stripe | Mercado Pago |
| PIX | Mercado Pago | Stripe |
| Boleto | Mercado Pago | Stripe |

### Failover

- Timeout de **15 s** por tentativa via `AbortController`
- Fallback **apenas** em erro retryable: `AbortError` (timeout), `TypeError` (rede), `GatewayError` 5xx
- Erro 4xx (dado inválido) **não** aciona fallback — volta imediatamente ao usuário
- **Cartão não usa router server-side:** tokens Stripe (`pm_...`) e Mercado Pago são incompatíveis entre si. A solução é o health check pré-renderização decidir qual formulário exibir, e o campo `gatewayHint` no corpo indicar ao backend qual gateway usar

### Ativação do tier

O navegador manda **só um identificador** para `/api/subscriptions/activate`:

```jsonc
{ "gateway": "stripe" | "mercadopago", "paymentId": "pi_123" }
```

O Java consulta a gateway, confere a titularidade contra a sessão e ativa o tier. O que sobra para o Next é mecânica de cookie: num `200` com `token`, regrava `user_data` — e o tier passa a valer sem o aluno relogar. Status repassados sem tradução: `200` ativado · `202` pendente · `403` titularidade divergente · `404` id desconhecido · `409` falhou.

Três origens chamam essa rota: `paidPlan/page.tsx` (cartão), `usePixPaymentStatus` (polling do PIX) e `usePendingPaymentReconciliation` (boleto).

### Arquivos

```text
src/app/service/payment/
  payment-gateway.types.ts    IPaymentGateway + tipos normalizados + GatewayError
  mercadopago.gateway.ts      adapter Mercado Pago (DI via construtor)
  stripe.gateway.ts           adapter Stripe (DI via construtor)
  payment-router.service.ts   router com timeout, failover e singletons lazy

src/components/payment/
  StripeCardForm.tsx · CreditCardForm.tsx · PixForm.tsx · BoletoForm.tsx
```

---

## Gate de IP (`proxy.ts`)

[`front/src/proxy.ts`](front/src/proxy.ts) é o *proxy* do Next 16 (sucessor do middleware). Quando `ALLOWED_IPS` está definido, tudo que vem de fora da allowlist recebe **404 sem corpo** — o domínio precisa parecer deploy inexistente, não site protegido.

- O gate liga pela **presença** da env, não pelo tamanho da lista: se todas as regras forem inválidas (typo), tudo vira 404 em vez de abrir o site
- O IP vem de `x-vercel-forwarded-for` (escrito pela borda da Vercel, não forjável), com `x-real-ip` e `x-forwarded-for` como fallback
- O matcher cobre **tudo**, inclusive `/_next/static` e `public/`, para que nem os chunks provem que o app existe
- **Exceção:** `/api/webhooks/*` fica fora — as notificações chegam dos servidores da Stripe e do Mercado Pago, que nunca estarão na allowlist

Sem `ALLOWED_IPS`, o gate fica desligado e o app responde normalmente.

---

## Setup Local

### Pré-requisitos

- Node.js >= 18 LTS
- npm
- Java BFF rodando (para tudo que não é estático)

### Instalação

```bash
git clone https://github.com/projeto-EdTech/frontend.git
cd frontend/front
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` é **obrigatório**: `date-fns@4` conflita com o peer `^2 || ^3` exigido por `react-day-picker@8`. Sem a flag o install aborta com `ERESOLVE`.

### Configurar o `.env`

Criar `front/.env` com as chaves da seção [Variáveis de Ambiente](#variáveis-de-ambiente). O arquivo **nunca** é versionado.

### Iniciar

```bash
npm run dev
```

Aplicação em <http://localhost:3000>.

---

## Scripts

Todos rodam dentro de `front/`:

| Script | Comando | Descrição |
| --- | --- | --- |
| `dev` | `next dev` | Servidor de desenvolvimento |
| `dev:turbo` | `next dev --turbopack` | Dev com Turbopack |
| `build` | `next build` | Build de produção |
| `start` | `next start` | Serve o build de produção |
| `test` | `vitest run` | Executa os testes uma vez |
| `test:watch` | `vitest` | Testes em modo watch |
| `lint` | `next lint` | ⚠️ **quebrado** — ver [Estado Atual](#estado-atual-e-dívidas-conhecidas) |

---

## Variáveis de Ambiente

Arquivo `front/.env` — **nunca versionar**. As chaves abaixo são as efetivamente lidas pelo código:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Backend Java BFF (server-side only — nunca NEXT_PUBLIC_)
BACKEND_API_URL=
BACKEND_API_KEY=                     # usado por /api/simulations/save-result

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Gemini (explicação de gabarito)
GEMINI_API_KEY=

# Microsoft Azure AD
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# Facebook OAuth
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MERCADO_PAGO_KEY=        # chave pública (SDK React)

# Stripe
STRIPE_SECRET_KEY=                   # sk_live_... ou sk_test_...
STRIPE_WEBHOOK_SECRET=               # whsec_... (Stripe CLI em dev)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # pk_live_... ou pk_test_...

# Analytics (só ativam em NODE_ENV=production)
NEXT_PUBLIC_GA_ID=                   # Google Analytics 4
NEXT_PUBLIC_CLARITY_ID=              # Microsoft Clarity
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# EmailJS (formulário de contato)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=

# Gate de IP (opcional — define se o site fica público)
ALLOWED_IPS=                         # lista separada por vírgula; vazio = gate desligado
```

**Regra:** prefixo `NEXT_PUBLIC_` apenas para identificadores públicos não-secretos. Segredos, JWTs e credenciais ficam server-side.

> O `.env` atual ainda carrega chaves sem consumidor no código (`GOOGLE_CLIENT_ID_PLANNER`, `GOOGLE_CLIENT_SECRET_PLANNER`, `NEXT_PUBLIC_BASE_URL`, `EMAILJS_PRIVATE_KEY`, `DOWNLOAD_*`) — restos do Planner e de features de fases futuras. Podem sair.

---

## Testes

### Runner

Vitest 4, configurado em [`front/vitest.config.ts`](front/vitest.config.ts): ambiente `node`, alias `@` → `src/`, specs em `tests/**/*.test.{ts,tsx}`. Os scripts k6 ficam **excluídos** do Vitest.

```bash
npm test                                   # todos
npm run test:watch                         # watch
npx vitest run tests/payment-router.test.ts # arquivo específico
```

Os testes vivem em `front/tests/` (não em `src/`) para o projeto manter um único `node_modules`.

### Specs

| Arquivo | O que testa |
| --- | --- |
| `payment-router.test.ts` | Router de gateway: primário, failover em timeout/rede/5xx, 4xx sem fallback, mapeamento dos adapters |
| `proxy.test.ts` | Gate de IP: allowlist, matcher, exceção dos webhooks |
| `ip-allowlist.test.ts` | `normalizeIp` e `ipToBits` — parsing de IPv4/IPv6 e CIDR |
| `parseSubjectKey.test.ts` | Parse de `"Matéria — Conteúdo"` e `buildSubjectTree` |
| `materiaVisualIconBg.test.ts` | `getMateriaVisual` — ícone e cor por matéria |
| `universityLogo.test.ts` | Resolver de logo por slug/nome, case-insensitive |
| `discordLinked.test.ts` | `getDiscordLinked` — chaves alternativas, null/false/ausente |
| `discordToken.service.test.ts` | Service do token Discord — URL, headers, parse |
| `generate-token.route.test.ts` | Route handler do token Discord |
| `DiscordTokenModal.test.tsx` | Modal do Discord — formato do token, cópia, countdown |
| `UserConfigLayout.test.tsx` | Layout da tela de configurações |
| `ranking-up-theme.test.ts` | Classes de tema no modal de subida de liga |
| `guerreiro-discord-badge.test.ts` | Badge "Guerreiro do Discord" — config e desbloqueio |
| `badge-cohesion.test.ts` | Coerência entre `badges.json` e `badgeUtils` |
| `ranking-up.test.ts` | Lógica de subida de liga |
| `user-profile.test.ts` | Dados de perfil |

### Carga (k6)

Scripts em `front/tests/escalabilidade_K6/` (`test_25`, `test_50`, `test_75`, `test_100`) — **não** são specs Vitest. Exigem o BFF Java no ar. Ver o README da própria pasta.

---

## Padrões e Convenções

### Nomenclatura

| Tipo | Convenção | Exemplo |
| --- | --- | --- |
| Server Component | `<Nome>DataServer.tsx` | `ProfileDataServer.tsx` |
| Client Component | `<Nome>Client.tsx` | `PricingClient.tsx` |
| Skeleton | `<Nome>Skeleton.tsx` em `components/Skeletons/` | `ResultSkeleton.tsx` |
| Hook | `use<Nome>.ts` | `useUserTier.ts` |
| Service | `<nome>.service.ts` | `pricing.service.ts` |
| Tipos | `<nome>.types.ts` | `payment-gateway.types.ts` |

**Localização:** componente usado em 1 rota → `components/<NomeDaRota>/`. Usado em 2+ rotas → `components/ui/`.

### Estilização

- `cn()` de `lib/core/utils.ts` para merge de classes (clsx + tailwind-merge)
- Cores sempre por CSS variable de `globals.css` — **nunca** hex literal em componente
- Tema: ler `data-theme` no `<html>`, nunca depender só de `prefers-color-scheme`
- Dynamic import obrigatório para modais, drawers, Recharts, editores ricos e qualquer lib >50 kB gzipped

### Performance

- Todo `<Suspense>` usa Skeleton como fallback — nunca `null` nem spinner puro
- Múltiplos fetches em Server Component vão em `Promise.all` — sem waterfall
- Listas com mais de 50 itens usam `react-window`
- A imagem LCP de cada rota usa `next/image` com `priority`

### Criando uma rota nova

1. **É mesmo necessária?** Se o dado é buscado na renderização, um Server Component chamando o BFF direto é melhor
2. Proxy fino — regra de negócio vai para o Java
3. `process.env.BACKEND_API_URL`, nunca URL no código
4. Sessão com `readUserToken(req)`, 401 antes de qualquer chamada externa
5. Erro do BFF não chega ao navegador
6. Comentário de cache strategy no topo do arquivo
7. Teste em `front/tests/`, sufixo `.test.ts`

---

## Segurança

- **JWT decodificado apenas em `service/jwtDecoder.ts`** — nunca replicar a lógica
- JWT nunca em `localStorage` ou `sessionStorage` — só no cookie `user_data` HttpOnly
- O cliente nunca monta `Authorization`; o cookie acompanha sozinho o fetch same-origin
- Route Handlers validam sessão antes de qualquer chamada externa
- Erro do BFF nunca vaza ao cliente: host, stack e nome de classe são substituídos por mensagem genérica
- Corpo de checkout remontado por allowlist; valor e e-mail do pagador resolvidos no servidor
- Nada de JWT em log, nem os primeiros caracteres
- `NEXT_PUBLIC_` só para identificador não-secreto

---

## Estado Atual e Dívidas Conhecidas

Registro honesto do que está quebrado ou pendente — atualizar conforme resolver.

### Build

`npm run build` **falha** com dois erros de módulo não encontrado:

```text
Can't resolve '@/lib/badges/badgeUtils'
Can't resolve '@/lib/badges/badges.json'
```

`service/badge.service.ts` e `api/badges/` importam `src/lib/badges/`, que não existe neste checkout — vive em outra branch (commit `a555c67`). Mesma causa das falhas de `badge-cohesion.test.ts`, `guerreiro-discord-badge.test.ts` e `ranking-up.test.ts` (esse último por `lib/ranking/rankUpUtils`).

### Lint

`npm run lint` chama `next lint`, **removido no Next 16**. Rodar `npx eslint` direto também falha, com `Converting circular structure to JSON` vindo do `FlatCompat` em `eslint.config.mjs`. Precisa de migração para flat config nativo.

### Explicação de Gabarito por IA — presente, porém desligada

A rota `/api/generate-explanation` funciona, e `ProfileClient` tem o `handleSubmit` que a chama. Mas a UI (`Simula_PRO/Questoes_Gemini.tsx`) **não é montada por nenhuma tela**, e o componente desestrutura `isFree` de `useUserTier()`, que devolve `{ tier, isPro, loading }`. Religar exige: corrigir para `!isPro`, criar a aba "Revisão" no `NavigationBar` e renderizar o componente no `ProfileClient`.

### Código órfão

Arquivos sem nenhum importador, todos de features que a Fase 1 lança — limpeza pendente, não remoção de escopo:

| Órfão | Observação |
| --- | --- |
| `components/pricing/*` (9 arquivos) | Subárvore inteira morta: `PricingDataServer` → `PricingClient`, mas ninguém importa o `DataServer`. O checkout real é o `app/paidPlan/page.tsx`, monolítico |
| `components/contato/*` (4 arquivos) | `app/contato/page.tsx` é monolítica e não os usa |
| `components/community/*` (4 arquivos) | Cópia antiga de `components/blog/` |
| `components/Simulation/*` | Duplica `Simula_PRO/SimulacaoLoader` + `SimulationQuizClient`; a rota usa a versão de `Simula_PRO/` |
| `contexts/LoadingContext.tsx` | Fora do provider stack |
| Componentes de perfil | `ProfileHeroCard` · `UserRanking` · `AchievementCarousel` · `SimulationModal` |
| Avulsos | `ThemeToggle` · `DemoModal` · `mockups/EstatisticasMockup` · `Library/UniversityDataServer` · `Skeletons/` não referenciados |

### Outros

- `lib/MOCK_ARCHITECTURE.md` cita `data/ranking.ts` e `data/games.ts`, que não existem neste checkout
- `src/app/api/README.md` diz que `simulationStore.ts` não tem importador — desatualizado: tem quatro, e o caminho mudou para `lib/store/`
- `lib/store/userStatsCache.ts` está sem consumidor
- `lib/data/posts.ts` tem divergência de tipo em `readingTime`
- `components/pricing/PricingClient.tsx` passa props que `CreditCardFormProps` não declara
- `npx tsc --noEmit` acusa 47 erros, concentrados nos itens acima

---

## Fluxo de Contribuição

O processo canônico está em [`front/CLAUDE.md`](front/CLAUDE.md). Resumo:

1. **Testes primeiro.** Escrever os testes da feature antes de implementar, em `front/tests/`
2. Explorar caminhos possíveis de implementação
3. Escrever o plano de ação
4. Implementar, dividido em tasks
5. Rodar os testes do passo 1; se algum falhar, corrigir e rodar de novo
6. Documentar a entrega em detalhe no [`CHANGES.md`](CHANGES.md) da raiz
7. Atualizar este `README.md` **com base no `CHANGES.md`**
8. Preparar a mensagem de commit a partir do `CHANGES.md` — e **aguardar validação do usuário**
9. Com a validação: commit → push → Pull Request. Não abrir branch por feature — usar a branch `DEV`

### Checklist antes do PR

- [ ] Testes passando (`npm test`)
- [ ] Build local passou (`npm run build`) — hoje bloqueado, ver [Estado Atual](#estado-atual-e-dívidas-conhecidas)
- [ ] Sem secret hardcoded
- [ ] Variável de ambiente nova documentada aqui e no `CHANGES.md`
- [ ] Acessibilidade verificada, se houver UI nova
- [ ] `CHANGES.md` e `README.md` atualizados

### Políticas

- Não adicionar dependência sem justificar segurança e licença
- Dados sensíveis: `.env` local + segredos no provedor de deploy
- Nunca expor PII em log
- Nunca expor endpoint interno em comentário público

---

## Licença

Código proprietário © Vestibuline. Todos os direitos reservados. Uso estritamente interno.

Não distribuir, reproduzir ou derivar sem autorização formal. Para liberação externa (snippet em blog, demo), solicitar aprovação ao responsável técnico e jurídico.

---

**Contato:** vestibuline.contato@gmail.com
**Repositório:** [github.com/projeto-EdTech/frontend](https://github.com/projeto-EdTech/frontend)

> Documento interno. Última atualização: 2026-08-21.
