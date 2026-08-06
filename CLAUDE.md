# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow obrigatório de funcionamento

1 -> A partir do prompt gere os testes para verificação da feature antes mesmo de começar a desenvolver, todos os testes unitários tem que ser criados dentro da pasta tests na raiz do projeto, caso a pasta não exista crie ela na raiz do repositório.
2 -> Com os testes escritos explore as opções e caminhos nos quais podem ser seguidos para o desenvolvimento
3 -> Escreva o plano de ação para implementar a feature
4 -> Desenvolva o plano proposto, dividindo a atividade do plano em task's
5 -> Após o desenvolvimento execute os testes escritos no passo 1, para validar oque foi gerado, se não passar em algum teste, identifique oque deu problema e conserte e rode o teste novamente
6 -> Após ter ocorrido tudo corretamente por favor crie, edite caso já exista, o arquivo CHANGES.md na raiz do projeto, no qual este por sua vez deve documentar tudo nos mínimos detalhes do que foi feito
7 -> Após ter ter documentado tudo no CHANGES.md prepare para gerar o commit, baseado nas alterações documentadas no CHANGES.md, ou seja deve ser feito baseado neste arquivo o commit mensage, mas espere a validação e comando do usuário
8 -> Com a validação do usuário siga o processo de commit -> push (sync changes) -> Pull Request. Não é necessário abrir uma branch nova para cada feature, apenas utilize a branch Grolla para realizar este processo

---

## Project Overview

**Vestibuline** (internally vestibuline) is a Brazilian EdTech platform for vestibular/ENEM exam preparation. The app is a Next.js frontend that acts as a BFF (Backend for Frontend) proxy to a Java backend service. Target audience: ~17-year-old students from public schools.

> [!NOTE]
> **Where the documentation lives:**
>
> | Topic | File |
> |---|---|
> | Setup, scripts, folder layout, tests | `front/README.md` |
> | Route-by-route API reference and the checklist for new routes | `front/src/app/api/README.md` |
> | Product overview, known pending items | `README.md` (repo root) |
> | Detailed change history and the contract required of the Java BFF | `CHANGES.md` |
> | Payment-chain decision and the ten-step flow | `docs/Pauta_para_reuniao.md` |
> | Load tests | `front/src/test/K6/README.md` |
>
> A `docs/manual-frontend.md` was referenced here previously; **it does not exist in the repository**. Do not cite it.

The actual Next.js application lives in `front/`. All development commands must be run from there.

---

## Commands

All commands run from `front/`:

```bash
npm run dev          # development server (standard)
npm run dev:turbo    # development server with Turbopack
npm run build        # production build (runs TypeScript too)
npm run start        # serve production build
npm test             # Vitest, single run
npm run test:watch   # Vitest, watch mode
npx tsc --noEmit     # typecheck
npm run lint         # BROKEN — see below
```

Install with `--legacy-peer-deps` due to peer dependency conflicts:

```bash
npm install --legacy-peer-deps
```

Tests run on **Vitest** (`npm test` / `npm run test:watch`). Config: `front/vitest.config.mts`, environment `node`, `globals: false`, `include: src/test/**/*.test.ts`.

`npm run lint` is **broken** and predates recent work: it calls `next lint`, removed in Next.js 16, and invoking ESLint directly fails with `TypeError: Converting circular structure to JSON` (incompatibility between `eslint@9` and the project's `eslint-config-next`). Use `npx tsc --noEmit` instead.

---

## Environment Variables

Required in `front/.env` (never commit):

```
NEXTAUTH_URL=
NEXTAUTH_SECRET=
BACKEND_API_URL=        # Java BFF URL — server-side only, never NEXT_PUBLIC_
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
NEXT_PUBLIC_GA_ID=      # GA4 measurement ID (public)
NEXT_PUBLIC_CLARITY_ID= # Microsoft Clarity (public)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

**Rule:** Only use `NEXT_PUBLIC_` for non-secret public identifiers. `BACKEND_API_URL`, JWT secrets, and all credentials must remain server-side.

Analytics (GA4, PostHog, Clarity) only activate when `NODE_ENV === 'production'`.

---

## Architecture

### BFF Proxy Pattern

All `src/app/api/` Route Handlers are thin proxies to the Java BFF — they receive, forward, and return. No business logic lives here. Business logic lives in `src/app/service/`.

### Server / Client Split

Every feature that combines BFF data with interactivity uses the mandatory `*Server.tsx` + `*Client.tsx` split:

- `*DataServer.tsx` — Server Component, fetches from BFF, passes data as props
- `*Client.tsx` — `'use client'`, handles state/interactions/animations
- `page.tsx` — thin orchestrator with `<Suspense>` boundaries only; never fetches or holds state

### Data Flow

```
page.tsx (thin)
  └── <Suspense fallback={<*Skeleton />}>
        └── *DataServer.tsx (server fetch)
              └── *Client.tsx ('use client', state)
```

### `src/app/service/` Layer

Pure server-side functions that call the Java BFF. Rules:

- No React imports, no hooks
- Always type the return explicitly
- Always throw descriptive errors on `!response.ok`
- Always use `process.env.BACKEND_API_URL` (never hardcode URLs)

### Simulation Store (`src/lib/simulationStore.ts`)

An in-memory `Map` with 10-minute TTL, designed to pass simulation question sets between an `/api/simulations/create` route and the quiz client.

> **Dead code.** Neither that route nor any importer of `simulationStore` exists in the repository today. Do not build on it without first confirming the intended design.

### User Tier System

Tiers: `FREE` | `Simula PRO` | `TEACHER` | `ADMIN`

The tier flows: Java BFF → `/api/sync-user` → `user_data` cookie (HttpOnly) → `GET /api/user/me` decodes it server-side via `src/app/service/jwtDecoder.ts` → `src/lib/userClaims.ts` → `useUserTier`.

**The JWT never reaches the browser.** `/api/sync-user` and `/api/subscriptions/activate` write the cookie and strip `token` from the response body. `useUserTier` has no polling: it queries `/api/user/me` on mount and on the `user_synced` (same tab) and `storage` (other tabs) events.

`normalizeTier` in `jwtDecoder.ts` absorbs the spelling of the `tipo` claim (`"Simula PRO"`, `"simula_pro"` and `"SIMULAPRO"` all map to `SIMULAPRO`; anything unknown falls back to `FREE`). The official spelling is still an open contract point with the Java team.

### Authentication

NextAuth v4 with Google (+ calendar scope for planner), Azure AD, Facebook, Discord. On first login, the Google `id_token` is sent to `BACKEND_API_URL/auth/google` via `/api/sync-user`, which sets the `user_data` JWT cookie. Token refresh is handled automatically in the NextAuth `jwt` callback in `src/lib/auth.ts`.

### Theme

`ThemeContext` applies `data-theme="light|dark"` on `<html>`. Dark mode is only available to authenticated users. All colors must use CSS Custom Properties from `src/app/globals.css` — never hardcode hex values in components. Gradient primaries (`--gradient-primary`) replace flat solid colors for all CTAs and hero elements.

### Global Contexts (provider order in `layout.tsx`)

```
NextAuthProvider
  ThemeProviderWrapper
    ProfileIconProvider
      AccessibilityProvider
        UniversityStorage
          PHProvider (PostHog)
```

`UniversityStorage` fetches from `/api/universities` on mount. **There is no static fallback**: on failure it exposes `error` and the list stays empty — no `src/lib/dataUniversity` file exists in the repository. The real provider tree also includes `<NavigationSound />`, `<SkipLink />` and a `<Suspense>`-wrapped `<SyncUserEffect />`; `src/contexts/LoadingContext.tsx` exists but is imported by nobody.

---

## File & Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Route-specific component | `src/components/<Route>/` | `components/Arena/` |
| Shared component | `src/components/ui/` | `components/ui/Button.tsx` |
| Server Component | `<Name>DataServer.tsx` | `GameDataServer.tsx` |
| Client Component | `<Name>Client.tsx` | `ArenaGameClient.tsx` |
| Skeleton Screen | `<Name>Skeleton.tsx` in `components/Skeletons/` | `RankingSkeleton.tsx` |
| Custom hook | `use<Name>.ts` | `useUserTier.ts` |
| Types file | `<name>.types.ts` | `questao.types.ts` |

**Decision rule:** If a component is used in only one route → `src/components/<RouteName>/`. If used in 2+ routes → `src/components/ui/`.

No generic names like `Component.tsx`, `Helper.ts`, or `Utils.tsx`.

---

## Styling Rules

- Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for all class merging.
- Colors: always CSS variables from `globals.css`. Never hex literals in component files.
- Theme switching: always read/respect `data-theme` attribute on `<html>`, never rely on `prefers-color-scheme` alone.
- Accessibility font: `OpenDyslexic` via `--font-opendyslexic` CSS variable; toggled by `AccessibilityContext`.
- Spacing/border-radius: use the token scale (`--space-*`, `--radius-*`) from `globals.css`. No arbitrary pixel values.
- Dynamic imports required for: modals, drawers, Recharts/chart libs, rich text editors, any lib >50kb gzipped.

---

## Performance Patterns

- Every `<Suspense>` must have a Skeleton Screen fallback (`src/components/Skeletons/`). Never `null` or plain spinners.
- Multiple BFF fetches in a Server Component must use `Promise.all` — no serial waterfalls.
- Every `page.tsx` or data hook must have a cache strategy comment:

  ```ts
  // CACHE STRATEGY: ISR — revalidate 60s — static content
  // CACHE STRATEGY: SWR — revalidateOnFocus — user-specific data
  // CACHE STRATEGY: no-store — sensitive/financial data
  ```

- Lists with >50 items must use `react-window` virtualization.
- The LCP image in each route must have `priority` and use `next/image` (never `<img>`).

---

## Security Rules

- **JWT decoding happens only in `src/app/service/jwtDecoder.ts`.** Never replicate JWT logic elsewhere.
- JWTs must never be stored in `localStorage` or `sessionStorage` — only in HttpOnly cookies. **No route may return the JWT in a response body**: write the cookie and strip the field.
- **Client code must never build an `Authorization` header.** The HttpOnly cookie rides along with every same-origin `fetch` on its own; a hand-built Bearer is only possible if the token was stored somewhere it should not be. Server-side, read it with `readUserToken(req)` (`src/app/service/sessionToken.ts`) — header first, cookie second. Do not write another parser.
- Screen code that needs a claim (tier, newsletter) asks `GET /api/user/me` through `src/lib/userClaims.ts`.
- Route Handlers must require a session before executing any action; the Java BFF is what actually validates the JWT.
- Error responses to the client must never expose stack traces, IPs, or internal service details.
- **Never log a JWT, not even a prefix.**
- Student personal data must not be persisted client-side — fetch from authenticated endpoints only.

---

## Payment Chain

The whole Simula PRO chain — resolving price, creating the charge at the gateway, verifying payment, checking ownership against the session, activating the tier — **lives in the Java BFF**. This repository has **no server-side gateway SDK**, and the Stripe/Mercado Pago webhooks point straight at the Java service.

The browser sends `{ planId }` to start and `{ gateway, paymentId }` to activate — never an amount, never a status. `sanitizeCheckoutBody` in `src/app/service/bffPayments.ts` rebuilds the forwarded body from an **allowlist**, so anything outside the contract is dropped by default. The card itself goes straight from the browser to Stripe via the Payment Element.

Until the Java side exposes its five endpoints, **checkout answers 503**. The required contract is in the first section of `CHANGES.md`; the reasoning behind the decision is in `docs/Pauta_para_reuniao.md`.

---

## Testing

**Vitest.** Unit tests live in `front/src/test/`, with the `.test.ts` suffix — that suffix is what separates them from the k6 scripts under `src/test/K6/`, which share the directory but are never collected.

| Folder | Covers |
|---|---|
| `src/test/auth/` | cookie-based session on the routes, `/api/user/me`, and the guarantee that the JWT never returns to the browser |
| `src/test/payment/` | the payment routes as thin proxies, tier activation, boleto reconciliation, tier normalization |
| `src/test/K6/` | load tests — see the README there |

Import `describe`/`it`/`expect` explicitly (`globals: false`). Mock `fetch` with `vi.stubGlobal`, following the pattern in `src/test/payment/bff-proxy.test.ts`.

k6 scripts hardcode `BASE_URL = 'http://localhost:3000'` and exercise Next pages, not BFF endpoints. Confirm `BACKEND_API_URL` is reachable before drawing performance conclusions — otherwise the test measures the error page.

## 🔄 Workflow de Desenvolvimento Obrigatório

Sempre que for solicitado para realizar qualquer atividade (seja uma nova feature, refatoração ou correção de bug), você **DEVE** seguir estritamente o fluxo abaixo, passo a passo. Não pule nenhuma etapa.

### Passo 1: Compreensão do Problema

* Analise os requisitos da atividade detalhadamente.
* Garanta que compreendeu o escopo e o impacto antes de começar a escrever qualquer linha de código.

### Passo 2: Testes Primeiro (TDD approach)

* Antes de implementar a feature, escreva os testes unitários ou de integração que validam o comportamento esperado dessa nova funcionalidade.

### Passo 3: Implementação de Mínimo Impacto

* Crie ou edite os arquivos necessários para a adição da feature.
* **Regra de Ouro:** O código deve ser implementado de modo a gerar o **mínimo de impacto possível** no restante do código completo e existente da aplicação (evite refatorações desnecessárias em cascata).

### Passo 4: Validação de Compilação / Build

* Execute o comando de compilação ou build do projeto para verificar se há erros de sintaxe, tipagem ou build.
* 🚨 **Loop de Correção:** Caso ocorra qualquer erro de build/compilação nesta etapa, você deve **interromper o fluxo imediatamente e retornar ao Passo 3** para corrigir a implementação. Repita o processo até que o build passe sem erros.

### Passo 5: Execução dos Testes

* Com o build bem-sucedido, execute os testes que você descreveu no Passo 2 (e os demais testes afetados do projeto) para garantir que tudo está funcionando perfeitamente e que nenhuma regressão foi introduzida.