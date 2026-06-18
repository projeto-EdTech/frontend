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
> A complete, detailed technical manual and architectural guide for developers is available at [docs/manual-frontend.md](file:///d:/GitHub/frontend/docs/manual-frontend.md). Always consult this guide for detailed styling (Apple HIG), Clean Architecture, security, and performance rules.

The actual Next.js application lives in `front/`. All development commands must be run from there.

---

## Commands

All commands run from `front/`:

```bash
npm run dev          # development server (standard)
npm run dev:turbo    # development server with Turbopack
npm run build        # production build
npm run start        # serve production build
npm run lint         # ESLint
```

Install with `--legacy-peer-deps` due to peer dependency conflicts:

```bash
npm install --legacy-peer-deps
```

There is no test runner configured yet (Vitest/Jest is on the roadmap). The `src/test/` directory contains k6 load test scripts, not unit tests.

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

An in-memory `Map` with 10-minute TTL used to pass simulation question sets between the `/api/simulations/create` route and the quiz client. Survives only for the duration of a server process — page refresh loses the simulation.

### User Tier System

Tiers: `FREE` | `Simula PRO` | `TEACHER` | `ADMIN`

The tier flows: Java BFF → `/api/sync-user` → `user_data` cookie (HttpOnly) + localStorage → `useUserTier` hook decodes via `src/app/service/jwtDecoder.ts`.

`useUserTier` currently polls localStorage every 2 seconds to detect post-login tier sync (noted in `PAUTA.md` as a known improvement: replace with a `CustomEvent('user_synced')`).

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

`UniversityStorage` fetches from `/api/universities` on mount and falls back to `src/lib/dataUniversity` static data when the BFF is unavailable.

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
- JWTs must never be stored in `localStorage` or `sessionStorage` — only in HttpOnly cookies.
- Route Handlers must validate the JWT before executing any action.
- Error responses to the client must never expose stack traces, IPs, or internal service details.
- Student personal data must not be persisted client-side — fetch from authenticated endpoints only.

---

## Testing (Current State)

No Jest/Vitest setup exists yet. The `src/test/` directory holds k6 load test scripts for BFF endpoints. When writing k6 tests, always confirm the Java BFF is running before executing load tests — k6 scripts use `__ENV.BFF_URL`.

Future test locations (per rules): `__tests__/` subdirectory co-located with the file under test.

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