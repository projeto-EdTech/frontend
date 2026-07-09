# Vestibuline — Front-End

Interface web da plataforma Vestibuline: preparação para vestibulares com simulados inteligentes, ranking, mini-games educativos, estatísticas personalizadas e pagamentos integrados.

[Reportar Bug](https://github.com/vestibuline-organization/vestibuline-Front/issues) · [Solicitar Melhoria](https://github.com/vestibuline-organization/vestibuline-Front/issues) · [Documentação Técnica](docs/manual-frontend.md)

> **AVISO:** Repositório PRIVADO — uso exclusivo da equipe Vestibuline. Nenhum trecho de código deve ser compartilhado externamente sem aprovação formal.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Stack Técnica](#stack-técnica)
3. [Funcionalidades](#funcionalidades)
4. [Arquitetura](#arquitetura)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Rotas e API](#rotas-e-api)
7. [Camada de Serviço](#camada-de-serviço)
8. [Contextos e Hooks Globais](#contextos-e-hooks-globais)
9. [Sistema de Pagamentos](#sistema-de-pagamentos)
10. [Setup Local](#setup-local)
11. [Scripts](#scripts)
12. [Variáveis de Ambiente](#variáveis-de-ambiente)
13. [Testes](#testes)
14. [Padrões e Convenções](#padrões-e-convenções)
15. [Segurança](#segurança)
16. [Contribuindo](#contribuindo)
17. [Licença](#licença)

---

## Visão Geral

O Vestibuline é uma plataforma EdTech voltada para estudantes de ensino médio de escolas públicas que se preparam para ENEM e vestibulares. O front-end funciona como BFF (Backend for Frontend) — todas as chamadas ao backend Java passam por Route Handlers Next.js, nunca diretamente do browser.

**Público-alvo:** estudantes ~17 anos, mobile-first, tema claro/escuro, fonte acessível OpenDyslexic disponível.

---

## Stack Técnica

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 + TypeScript 5 |
| Estilização | Tailwind CSS 4 + tailwind-merge + CVA |
| Componentes base | shadcn/ui (Radix UI primitives) |
| Animações | Framer Motion 12 + Anime.js 4 |
| Formulários | React Hook Form 7 + Zod |
| Autenticação | NextAuth v4 (Google, Azure AD, Facebook, Discord) |
| Pagamentos | MercadoPago SDK + Stripe (com failover automático) |
| IA | Google Generative AI (`@google/genai`, `@google/generative-ai`) |
| Analytics | Google Analytics 4, PostHog, Microsoft Clarity |
| Gráficos | Recharts 2 |
| Calendário | FullCalendar 6 (daygrid, timegrid, interaction) |
| Virtualização | react-window 2 + react-virtualized-auto-sizer |
| Drag & Drop | react-dnd 16 |
| HTTP client | SWR 2 (dados client-side), `fetch` nativo (server-side) |
| Markdown | react-markdown + remark-gfm + remark-math + rehype-katex |
| Testes | Vitest 4 |
| Linting | ESLint 9 + eslint-config-next |

---

## Funcionalidades

### Autenticação e Perfil

- Login social via Google, Microsoft (Azure AD), Facebook, Discord
- Sync de usuário com backend Java via `/api/sync-user` (salva cookie `user_data` HttpOnly)
- Perfil completo: foto, estatísticas, badges, conquistas, configurações de conta
- Integração Discord: geração de token OTP `VEST-XXXXX` para vincular conta ao bot
- Badge "Guerreiro do Discord" desbloqueada ao vincular conta Discord

### Sistema de Tiers

Tiers: `FREE` | `Simula PRO` | `TEACHER` | `ADMIN`

Fluxo: Java BFF → `/api/sync-user` → cookie `user_data` (HttpOnly JWT) + localStorage → hook `useUserTier` decodifica via `jwtDecoder.ts`

### Simulados

- Criação de simulados por universidade (`/simulation/[university]`)
- Simulado misto cross-universidade (`/api/simulations/create-mix`)
- Tela de questão com suporte a LaTeX (KaTeX)
- Resumo/resultado ao finalizar (`/simulation/[university]/summary`)
- Store em memória com TTL 10 min para passar questões entre rotas (`simulationStore.ts`)

### Ranking e Elo

- Ranking global de usuários (`/ranking`)
- Sistema de elo com modal de subida animado (Glassmorphism + Claymorphism)
- Tema claro/escuro sincronizado com `data-theme` no modal de elo

### Mini-games (Arena)

Rota `/Arena` com 4 jogos educativos:

| Jogo | Descrição |
| --- | --- |
| **Enigma** | Quiz de múltipla escolha por matéria com visual colorido por disciplina |
| **Lexoo** | Jogo de palavras educativo |
| **Nexo** | Jogo de conexões temáticas |
| **Flash Cards** | Revisão por cartões (deck via `/api/games/flash-cards`) |

### Simula PRO (conteúdo exclusivo para assinantes)

- Questões resolvidas com IA (Google Gemini): seletor hierárquico Matéria → Conteúdo com modal de seleção
- Chatbot IA (`/api/ai/chat`) com histórico (`/api/ai/historico`)
- Relatório de desempenho gerado por IA (`/api/relatorio-IA`)
- Planner de estudos com integração Google Calendar (`/api/planner/Google`)
- Estatísticas detalhadas por matéria/conteúdo (`/estatisticas/[subject]`)
- Geração de explicações por questão (`/api/generate-explanation`)

### Biblioteca e Blog

- Biblioteca de provas por universidade (`/library/[university]`)
- Blog com posts e playlists (`/blog`, `/blog/[slug]`, `/blog/playlist/[id]`)
- Playlists de questões: criar, adicionar questão, jogar

### Pagamentos

Ver seção [Sistema de Pagamentos](#sistema-de-pagamentos).

### Acessibilidade e Tema

- Fonte OpenDyslexic alternável via `AccessibilityContext`
- Tema claro/escuro persistido em localStorage + atributo `data-theme` no `<html>`
- Modo escuro apenas para usuários autenticados
- Todas as cores via CSS Custom Properties em `globals.css` — sem hex hardcoded

---

## Arquitetura

### Padrão BFF Proxy

Todos os `src/app/api/` Route Handlers são proxies finos para o Java BFF. Sem lógica de negócio nos handlers — lógica fica em `src/app/service/`.

```text
Browser
  └── Next.js Route Handler (src/app/api/)
        └── Service (src/app/service/)
              └── Java BFF (BACKEND_API_URL)
```

### Divisão Server / Client

Toda feature que combina dados BFF com interatividade usa o padrão obrigatório:

```text
page.tsx (thin — só Suspense)
  └── Suspense fallback={Skeleton}
        └── *DataServer.tsx  (Server Component — fetch BFF)
              └── *Client.tsx  ('use client' — estado + animações)
```

### Fluxo de Dados

```text
page.tsx
  └── Suspense
        └── *DataServer.tsx  →  fetch(BACKEND_API_URL/...)
              └── *Client.tsx  →  SWR / useState / useEffect
```

### Cache Strategy

Cada `page.tsx` ou hook de dados tem comentário obrigatório:

```ts
// CACHE STRATEGY: ISR — revalidate 60s — conteúdo estático
// CACHE STRATEGY: SWR — revalidateOnFocus — dados do usuário
// CACHE STRATEGY: no-store — dados sensíveis/financeiros
```

---

## Estrutura de Pastas

```text
front/
├── src/
│   ├── app/
│   │   ├── api/                    Route Handlers (proxies BFF)
│   │   │   ├── ai/                 chat, historico
│   │   │   ├── auth/               NextAuth handler
│   │   │   ├── badges/
│   │   │   ├── blog/               listagem e [slug]
│   │   │   ├── estatisticas/       [subject]
│   │   │   ├── games/              flash-cards
│   │   │   ├── gateway-health/     health check das gateways de pagamento
│   │   │   ├── generate-explanation/
│   │   │   ├── get-logo/
│   │   │   ├── Nota-corte/
│   │   │   ├── planner/            Google Calendar
│   │   │   ├── playlist/           CRUD + play
│   │   │   ├── process-subscription/  boleto, credit-card, pix
│   │   │   ├── questions/          [university]
│   │   │   ├── ranking/
│   │   │   ├── relatorio-IA/
│   │   │   ├── simulations/        create, create-mix, save-result, [id]
│   │   │   ├── subscribe/
│   │   │   ├── sync-user/
│   │   │   ├── universities/       listagem e [university]
│   │   │   ├── user/               profile, stats
│   │   │   ├── users/              generate-token (Discord OTP)
│   │   │   └── webhooks/           mercadopago, stripe
│   │   ├── service/                Lógica de negócio server-side
│   │   │   ├── payment/            Router de gateway + adapters
│   │   │   ├── badge.service.ts
│   │   │   ├── discordToken.service.ts
│   │   │   ├── game.service.ts
│   │   │   ├── jwtDecoder.ts       ÚNICO ponto de decode JWT
│   │   │   ├── playlist.service.ts
│   │   │   ├── pricing.service.ts
│   │   │   ├── ranking.service.ts
│   │   │   ├── simulation.service.ts
│   │   │   ├── statistics.service.ts
│   │   │   └── university.service.ts
│   │   ├── Arena/                  Mini-games hub
│   │   ├── blog/
│   │   ├── contato/
│   │   ├── create/
│   │   ├── estatisticas/
│   │   ├── library/
│   │   ├── paidPlan/
│   │   ├── privacy/
│   │   ├── profile/
│   │   ├── ranking/
│   │   ├── simulation/
│   │   ├── terms/
│   │   ├── VestIA/
│   │   ├── globals.css             CSS Custom Properties (tokens de cor, espaçamento)
│   │   └── layout.tsx              Root layout + provider stack
│   ├── components/
│   │   ├── Arena/                  Componentes dos mini-games
│   │   ├── Estatisticas/
│   │   ├── Filtros/
│   │   ├── games/                  Enigma, Lexoo, Nexo, Flash Cards
│   │   ├── Library/
│   │   ├── payment/                StripeCardForm, CreditCardForm
│   │   ├── pricing/                PricingClient (seleção de plano + pagamento)
│   │   ├── profile/                Perfil, badges, conquistas, Discord
│   │   ├── ranking/                RankingUpNotification (modal elo)
│   │   ├── Simula_PRO/             Questões IA, Planner, Stats, Chatbot
│   │   ├── Simulation/             Tela de simulado
│   │   ├── Skeletons/              Skeleton screens por rota
│   │   ├── blog/
│   │   ├── community/
│   │   ├── contato/
│   │   ├── mockups/
│   │   └── ui/                     shadcn/ui + componentes base customizados
│   ├── contexts/
│   │   ├── AccessibilityContext.tsx   Fonte OpenDyslexic
│   │   ├── LoadingContext.tsx
│   │   ├── ProfileIconContext.tsx
│   │   ├── ThemeContext.tsx           Tema claro/escuro + data-theme
│   │   └── UniversityStorage.tsx      Cache de universidades (fallback estático)
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   ├── use-toast.ts
│   │   └── useUserTier.ts            Lê tier do usuário via JWT/localStorage
│   ├── lib/
│   │   ├── badges/                   badgeUtils.ts + badges.json
│   │   ├── core/                     auth.ts · analytics.ts · utils.ts · discordLinked.ts
│   │   ├── data/                     dados estáticos (universidades, posts, playlists…)
│   │   ├── games/                    config.ts · games.ts
│   │   ├── planner/                  planner.ts
│   │   ├── ranking/                  rankUtils · rankUpUtils · ranking.ts
│   │   └── store/                    simulationStore.ts · userStatsCache.ts
│   ├── providers/
│   │   └── PostHogProvider.tsx
│   └── types/
│       └── next-auth.d.ts
├── tests/                            Specs Vitest
├── vitest.config.ts
├── next.config.ts
├── tailwind.config (inline via Tailwind v4)
└── package.json
```

---

## Rotas e API

### Rotas de Página

| Rota | Descrição |
| --- | --- |
| `/` | Landing page |
| `/Arena` | Hub de mini-games |
| `/Arena/[game]` | Jogo específico (Enigma, Lexoo, Nexo, Flash Cards) |
| `/blog` | Listagem de posts |
| `/blog/[slug]` | Post individual |
| `/blog/playlist/[id]` | Playlist de questões |
| `/contato` | Formulário de contato |
| `/create` | Criação de simulado |
| `/estatisticas/[subject]` | Estatísticas por matéria |
| `/library` | Biblioteca de provas (ISR — revalidate 1h) |
| `/library/[university]` | Provas por universidade |
| `/paidPlan` | Página de planos e pagamento |
| `/privacy` | Política de privacidade |
| `/profile` | Perfil do usuário |
| `/ranking` | Ranking global (ISR — revalidate 1min) |
| `/simulation/[university]` | Simulado |
| `/simulation/[university]/summary` | Resumo do simulado |
| `/terms` | Termos de uso |
| `/VestIA` | Assistente IA |

### Route Handlers (API)

| Endpoint | Método | Descrição |
| --- | --- | --- |
| `/api/ai/chat` | POST | Chat com IA (Google Gemini) |
| `/api/ai/historico` | GET | Histórico de conversas IA |
| `/api/auth/[...nextauth]` | GET/POST | Handler NextAuth |
| `/api/badges` | GET | Badges do usuário |
| `/api/blog` | GET | Posts do blog |
| `/api/blog/[slug]` | GET | Post por slug |
| `/api/estatisticas/[subject]` | GET | Estatísticas por matéria |
| `/api/games/flash-cards` | GET | Deck de flash cards |
| `/api/gateway-health` | GET | Health check MercadoPago + Stripe (ISR 30s) |
| `/api/generate-explanation` | POST | Gera explicação de questão via IA |
| `/api/get-logo` | GET | Logo de universidade |
| `/api/Nota-corte` | GET | Notas de corte |
| `/api/planner` | GET/POST | Planner de estudos |
| `/api/planner/Google` | POST | Sincroniza com Google Calendar |
| `/api/playlist` | GET/POST | Playlists do usuário |
| `/api/playlist/[id]` | GET/PUT/DELETE | Playlist específica |
| `/api/playlist/[id]/add-question` | POST | Adiciona questão à playlist |
| `/api/playlist/[id]/play` | GET | Modo de jogo da playlist |
| `/api/process-subscription/boleto` | POST | Processa boleto (MP → Stripe fallback) |
| `/api/process-subscription/credit-card` | POST | Processa cartão (hint-based: Stripe ou MP) |
| `/api/process-subscription/pix` | POST | Processa PIX (MP → Stripe fallback) |
| `/api/questions/[university]` | GET | Questões por universidade |
| `/api/ranking` | GET | Ranking global |
| `/api/relatorio-IA` | POST | Relatório de desempenho por IA |
| `/api/simulations/create` | POST | Cria simulado |
| `/api/simulations/create-mix` | POST | Cria simulado misto |
| `/api/simulations/save-result` | POST | Salva resultado do simulado |
| `/api/simulations/[id]` | GET | Simulado por ID |
| `/api/subscribe` | POST | Inscrição em plano |
| `/api/sync-user` | POST | Sincroniza usuário com BFF (seta cookie `user_data`) |
| `/api/universities` | GET | Lista universidades |
| `/api/universities/[university]` | GET | Universidade específica |
| `/api/user/profile` | GET/PUT | Perfil do usuário |
| `/api/user/stats` | GET | Estatísticas do usuário |
| `/api/users/generate-token` | POST | Gera token OTP Discord (`VEST-XXXXX`, TTL 5min) |
| `/api/webhooks/mercadopago` | POST | Webhook MercadoPago |
| `/api/webhooks/stripe` | POST | Webhook Stripe (verifica assinatura) |

---

## Camada de Serviço

`src/app/service/` contém funções server-side puras. Regras:

- Sem imports React ou hooks
- Retorno explicitamente tipado
- Erros descritivos em `!response.ok` — sem expor detalhes internos ao cliente
- Sempre usa `process.env.BACKEND_API_URL` — sem URLs hardcoded

| Arquivo | Responsabilidade |
| --- | --- |
| `jwtDecoder.ts` | **Único ponto** de decode JWT na aplicação |
| `badge.service.ts` | Fetch e parse de badges do BFF |
| `discordToken.service.ts` | Geração de token OTP Discord |
| `game.service.ts` | Dados de mini-games |
| `payment/` | Router de gateway + adapters MercadoPago e Stripe |
| `playlist.service.ts` | CRUD de playlists |
| `pricing.service.ts` | Planos e preços |
| `ranking.service.ts` | Ranking e elo |
| `simulation.service.ts` | Criação e gestão de simulados |
| `statistics.service.ts` | Estatísticas de desempenho |
| `university.service.ts` | Dados de universidades |

---

## Contextos e Hooks Globais

### Provider Stack (ordem em `layout.tsx`)

```text
NextAuthProvider
  ThemeProviderWrapper
    ProfileIconProvider
      AccessibilityProvider
        UniversityStorage
          PHProvider (PostHog)
```

### Contextos

| Contexto | Arquivo | Descrição |
| --- | --- | --- |
| `ThemeContext` | `contexts/ThemeContext.tsx` | Aplica `data-theme` (light/dark) no elemento html. Dark mode só para autenticados. |
| `ProfileIconContext` | `contexts/ProfileIconContext.tsx` | Estado do ícone/avatar do perfil |
| `AccessibilityContext` | `contexts/AccessibilityContext.tsx` | Alterna fonte OpenDyslexic (`--font-opendyslexic`) |
| `LoadingContext` | `contexts/LoadingContext.tsx` | Loading global entre navegações |
| `UniversityStorage` | `contexts/UniversityStorage.tsx` | Cache de universidades; fallback para `lib/data/universities.ts` se BFF indisponível |

### Hooks

| Hook | Arquivo | Descrição |
| --- | --- | --- |
| `useUserTier` | `hooks/useUserTier.ts` | Lê tier do usuário do localStorage (polling 2s); retorna `FREE \| Simula PRO \| TEACHER \| ADMIN` |
| `use-mobile` | `hooks/use-mobile.ts` | Detecta viewport mobile |
| `use-toast` | `hooks/use-toast.ts` | Toast notifications (Sonner) |

### Stores em Memória

| Store | Arquivo | Descrição |
| --- | --- | --- |
| `simulationStore` | `lib/store/simulationStore.ts` | `Map` com TTL 10min para passar questões entre `/api/simulations/create` e o client do simulado |
| `userStatsCache` | `lib/store/userStatsCache.ts` | Cache de estatísticas do usuário |

---

## Sistema de Pagamentos

### Estratégia de Roteamento

| Método | Gateway Principal | Fallback |
| --- | --- | --- |
| Cartão de Crédito | Stripe | MercadoPago |
| PIX | MercadoPago | Stripe |
| Boleto | MercadoPago | Stripe |

### Lógica de Failover

- Timeout de 15s por tentativa via `AbortController`
- Fallback apenas em erros retryable: `AbortError`, `TypeError` (rede), `GatewayError` 5xx
- Erros 4xx não acionam fallback (dados inválidos do usuário)
- **Cartão:** tokens Stripe (`pm_...`) e MercadoPago são incompatíveis — fallback server-side inviável. Solução: `/api/gateway-health` decide qual form renderizar no frontend; `gatewayHint` no body indica o gateway ao handler

### Arquivos de Pagamento

```text
src/app/service/payment/
  payment-gateway.types.ts    Interface IPaymentGateway + tipos normalizados + GatewayError
  mercadopago.gateway.ts      Adapter MercadoPago (DI via construtor)
  stripe.gateway.ts           Adapter Stripe (DI via construtor, API v2026-06-24.dahlia)
  payment-router.service.ts   Router com timeout + failover + singletons lazy

src/components/payment/
  StripeCardForm.tsx           Stripe Elements card form
  CreditCardForm.tsx           MercadoPago card form (fallback)

src/app/api/
  gateway-health/route.ts      Ping ambas gateways, cache ISR 30s
  webhooks/stripe/route.ts     Verifica assinatura + notifica BFF
  webhooks/mercadopago/route.ts
```

---

## Setup Local

### Pré-requisitos

- Node.js >= 18 LTS
- npm
- Java BFF rodando (para chamadas ao backend)

### Instalação

```bash
git clone https://github.com/vestibuline-organization/vestibuline-Front.git
cd vestibuline-Front/front
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` necessário por conflitos de peer deps entre pacotes.

### Configurar `.env`

Copiar e preencher (ver seção [Variáveis de Ambiente](#variáveis-de-ambiente)):

```bash
cp .env.example .env
```

### Iniciar

```bash
npm run dev
```

Aplicação: <http://localhost:3000>

---

## Scripts

Todos os comandos devem ser executados dentro de `front/`:

| Script | Comando | Descrição |
| --- | --- | --- |
| `dev` | `next dev` | Servidor de desenvolvimento |
| `dev:turbo` | `next dev --turbopack` | Dev com Turbopack (mais rápido) |
| `build` | `next build` | Build de produção |
| `start` | `next start` | Serve o build de produção |
| `lint` | `next lint` | ESLint |
| `test` | `vitest run` | Executa todos os testes (uma vez) |
| `test:watch` | `vitest` | Testes em modo watch |

---

## Variáveis de Ambiente

Arquivo `front/.env` — **nunca versionar**.

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Backend Java BFF (server-side only — nunca NEXT_PUBLIC_)
BACKEND_API_URL=

# Google (OAuth + IA + Calendar)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID_PLANNER=
GOOGLE_CLIENT_SECRET_PLANNER=
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

# MercadoPago
MERCADO_PAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MERCADO_PAGO_KEY=     # chave pública (SDK React)

# Stripe
STRIPE_SECRET_KEY=                 # sk_live_... ou sk_test_...
STRIPE_WEBHOOK_SECRET=             # whsec_... (Stripe CLI em dev)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # pk_live_... ou pk_test_...

# Analytics (só ativam em NODE_ENV=production)
NEXT_PUBLIC_GA_ID=                 # Google Analytics 4
NEXT_PUBLIC_CLARITY_ID=            # Microsoft Clarity
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# EmailJS
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=

# URLs de download do app
DOWNLOAD_APP_STORE=
DOWNLOAD_GOOGLE_PLAY=
DOWNLOAD_WINDOWS=
DOWNLOAD_MACOS=
DOWNLOAD_LINUX=

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Regra:** prefixo `NEXT_PUBLIC_` apenas para identificadores públicos não-secretos. Segredos, JWTs e credenciais ficam server-side.

---

## Testes

### Runner

Vitest 4 — configurado em `front/vitest.config.ts`.

```bash
# Rodar todos
npm test

# Watch mode
npm run test:watch

# Arquivo específico
npx vitest run tests/payment-router.test.ts
```

### Specs existentes

| Arquivo | O que testa |
| --- | --- |
| `payment-router.test.ts` | Router de gateway: failover, timeout, 4xx sem fallback, ambas falham, adapters MP e Stripe (13 testes) |
| `discordLinked.test.ts` | Helper `getDiscordLinked` — chaves alternativas, null/false/ausente |
| `guerreiro-discord-badge.test.ts` | Config da badge Discord (1 tier, social, metric) e desbloqueio |
| `ranking-up-theme.test.ts` | Classes Glassmorphism/Claymorphism no modal de elo (4 testes) |
| `universityLogo.test.ts` | Resolver de logo por slug/name, case-insensitive (6 testes) |
| `parseSubjectKey.test.ts` | Parse `"Matéria — Conteúdo"` e `buildSubjectTree` |
| `materiaVisualIconBg.test.ts` | `getMateriaVisual` — ícone/cor por matéria |
| `discordToken.service.test.ts` | Service de token Discord — URL, headers, parse |
| `generate-token.route.test.ts` | Route handler do token Discord — 401 sem JWT |
| `DiscordTokenModal.test.tsx` | Modal Discord — formato token, copiar, countdown |
| `UserConfigLayout.test.tsx` | Layout da página de configurações |
| `badge-cohesion.test.ts` | Consistência entre badges.json e badgeUtils |
| `ranking-up.test.ts` | Lógica de subida de elo |
| `user-profile.test.ts` | Dados de perfil |

### Testes k6 (carga)

Scripts em `front/tests/escalabilidade_K6/` — não são specs Vitest. Requerem Java BFF rodando e Stripe CLI (se testando pagamentos).

```bash
k6 run --env BFF_URL=http://localhost:8081 tests/escalabilidade_K6/seu-script.js
```

---

## Padrões e Convenções

### Nomenclatura de Arquivos

| Tipo | Convenção | Exemplo |
| --- | --- | --- |
| Server Component | `<Nome>DataServer.tsx` | `ProfileDataServer.tsx` |
| Client Component | `<Nome>Client.tsx` | `PricingClient.tsx` |
| Skeleton | `<Nome>Skeleton.tsx` em `components/Skeletons/` | `RankingSkeleton.tsx` |
| Hook customizado | `use<Nome>.ts` | `useUserTier.ts` |
| Tipos | `<nome>.types.ts` | `questao.types.ts` |
| Service (server-side) | `<nome>.service.ts` | `ranking.service.ts` |

**Regra de localização:** componente usado em 1 rota → `components/<NomeDaRota>/`. Usado em 2+ rotas → `components/ui/`.

### Estilização

- `cn()` de `src/lib/core/utils.ts` para merge de classes (clsx + tailwind-merge)
- Cores: sempre CSS variables de `globals.css` — nunca hex literal em componentes
- Tema: ler `data-theme` no `<html>`, nunca depender apenas de `prefers-color-scheme`
- Espaçamento/raios: tokens `--space-*`, `--radius-*` de `globals.css`
- Dynamic imports obrigatórios para: modais, drawers, Recharts, editores ricos, qualquer lib >50kb gzipped

### Performance

- Todo `<Suspense>` deve ter Skeleton Screen como fallback — nunca `null` ou spinner puro
- Múltiplos fetches em Server Component usam `Promise.all` — sem waterfalls
- Listas com >50 itens usam `react-window`
- Imagem LCP de cada rota deve ter `priority` e usar `next/image`

---

## Segurança

- **JWT decodificado apenas em `src/app/service/jwtDecoder.ts`** — nunca replicar lógica JWT
- JWTs nunca armazenados em `localStorage` ou `sessionStorage` — apenas em cookies HttpOnly
- Route Handlers validam JWT antes de executar qualquer ação
- Respostas de erro ao cliente nunca expõem stack traces, IPs ou detalhes internos
- Dados pessoais de alunos nunca persistidos client-side — sempre via endpoints autenticados
- Variáveis com `NEXT_PUBLIC_` apenas para identificadores não-secretos

---

## Contribuindo

### Fluxo de desenvolvimento

1. Crie issue descrevendo objetivo, escopo, critérios de aceite e riscos
2. Branch a partir de `main`:
   - `feat/area-descricao-curta`
   - `fix/area-breve-erro`
   - `chore/infra-ou-build`
   - `refactor/modulo-alvo`
3. Siga o **workflow TDD** do `CLAUDE.md`:
   - Escrever testes antes da implementação
   - Build deve passar antes de abrir PR
   - Documentar em `CHANGES.md`
4. Commits semânticos: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`
5. Abra PR vinculando issue (`Closes #ID`). Incluir:
   - Resumo da mudança
   - Motivação e contexto
   - Screenshots/GIF (para UI)
   - Impacto em performance/UX
   - Passos de teste manual

### Checklist antes do PR

- [ ] Build local passou (`npm run build`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Testes passando (`npm test`)
- [ ] Sem secrets hardcoded
- [ ] Variáveis novas documentadas no `.env` e no `CHANGES.md`
- [ ] Acessibilidade básica verificada (se UI nova)

### Políticas

- Não adicionar dependências sem justificar segurança e licença
- Dados sensíveis: usar `.env` local + segredos no provedor de deploy
- Nunca expor PII em logs
- Nunca expor endpoints internos em comentários públicos

---

## Licença

Código proprietário © Vestibuline. Todos os direitos reservados. Uso estritamente interno.

Não distribuir, reproduzir ou derivar sem autorização formal. Para liberação externa (snippet em blog, demo), solicitar aprovação ao responsável técnico e jurídico.

---

**Contato:** vestibuline.contato@gmail.com  
**Organização:** [github.com/vestibuline-organization](https://github.com/vestibuline-organization)

> Documento interno. Última atualização: 2026-07.
