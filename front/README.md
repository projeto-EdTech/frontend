# Vestibuline — aplicação Next.js

Este diretório é a aplicação de verdade. **Todo comando roda daqui**, não da raiz do repositório.

Visão geral do produto e políticas internas: [`../README.md`](../README.md).
Guia completo de arquitetura e convenções: [`../CLAUDE.md`](../CLAUDE.md).

---

## Setup

```bash
npm install --legacy-peer-deps   # o --legacy-peer-deps é obrigatório: há conflito de peer deps
npm run dev
```

<http://localhost:3000>

Antes do primeiro `dev`, crie o `.env` — ver [Variáveis de ambiente](#variáveis-de-ambiente).
Sem `BACKEND_API_URL` a aplicação sobe, mas toda tela que depende de dado do backend fica vazia.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run dev:turbo` | Idem, com Turbopack |
| `npm run build` | Build de produção (roda o TypeScript junto) |
| `npm run start` | Serve o build |
| `npm test` | Vitest, uma passada |
| `npm run test:watch` | Vitest em watch |
| `npm run lint` | ⚠️ **quebrado** — ver abaixo |

> **`npm run lint` não funciona.** Ele chama `next lint`, comando removido no Next.js 16. Chamar
> o ESLint direto também falha, com `TypeError: Converting circular structure to JSON` —
> incompatibilidade entre `eslint@9` e o `eslint-config-next` do projeto. Pendência conhecida,
> anterior às entregas recentes. Use `npx tsc --noEmit` como rede enquanto isso.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **Tailwind CSS 4** com `tailwind-merge` e `class-variance-authority`
- **Radix UI** / shadcn adaptado · **Lucide** (ícones) · **Framer Motion**
- **NextAuth v4** — Google, Azure AD, Facebook, Discord
- **SWR** · **React Hook Form + Zod** · **Recharts** · **react-window**
- **Vitest 4** (testes) · **k6** (carga)
- **@stripe/stripe-js** + **@stripe/react-stripe-js** — só o Payment Element, que roda no
  navegador. **Não há SDK de gateway server-side neste repositório**; ver
  [Pagamento](#pagamento).

## Estrutura

```text
front/
  src/
    app/
      api/            Route Handlers — proxies finos para o BFF Java (README próprio)
      service/        Funções puras de servidor: sessão, JWT, encaminhamento ao BFF
      <rota>/         page.tsx + componentes da rota
    components/
      <Rota>/         componentes de uma rota só
      ui/             compartilhados por 2+ rotas
      Skeletons/      fallbacks de <Suspense>
    contexts/         providers globais (tema, universidades, acessibilidade)
    hooks/            use<Nome>.ts
    lib/              utilidades de cliente e dados estáticos
    types/            tipagens globais
    test/
      auth/           testes de sessão e cookie (Vitest)
      payment/        testes da cadeia de pagamento (Vitest)
      K6/             scripts de carga (README próprio)
  vitest.config.mts
  next.config.ts
```

**Regra de decisão para componentes:** usado em uma rota só → `components/<Rota>/`. Usado em
2 ou mais → `components/ui/`.

## Variáveis de ambiente

`.env` na raiz de `front/`. **Nunca versione.**

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

BACKEND_API_URL=          # BFF Java — server-side, NUNCA com prefixo NEXT_PUBLIC_

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # chave pública, exigida pelo Payment Element

NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_CLARITY_ID=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

`NEXT_PUBLIC_` **só** para identificador público não secreto. Chave de gateway, segredo de JWT e
credencial de provedor ficam sem o prefixo — e as de pagamento nem existem mais aqui.

Analytics (GA4, PostHog, Clarity) só ativam com `NODE_ENV === 'production'`.

---

## Arquitetura em três regras

**1. Route Handler é proxy fino.** `src/app/api/` recebe, encaminha e devolve. Regra de negócio
vive no BFF Java. Detalhe rota por rota em [`src/app/api/README.md`](src/app/api/README.md).

**2. Todo dado que combina BFF com interatividade usa a divisão Server/Client:**

```text
page.tsx                  orquestrador fino, só <Suspense>
  └── *DataServer.tsx     Server Component, busca no BFF, passa por props
        └── *Client.tsx   'use client', estado e interação
```

Todo `<Suspense>` precisa de um Skeleton como fallback — nunca `null`, nunca spinner solto.
Buscas múltiplas num Server Component vão em `Promise.all`, sem cascata.

**3. O JWT do aluno vive só no cookie `user_data`, HttpOnly.** Nunca em `localStorage` ou
`sessionStorage`. O cookie acompanha sozinho todo `fetch` same-origin, então **componente não
monta `Authorization`**. Quem precisa do tier ou de outro claim pergunta a `GET /api/user/me`
através de [`src/lib/userClaims.ts`](src/lib/userClaims.ts). Decodificação de JWT acontece só em
[`src/app/service/jwtDecoder.ts`](src/app/service/jwtDecoder.ts).

### Tiers

`FREE` · `Simula PRO` · `TEACHER` · `ADMIN`. O tier chega no claim `tipo` do JWT, é normalizado
no servidor por `normalizeTier` (`"Simula PRO"`, `"simula_pro"` e `"SIMULAPRO"` caem no mesmo
lugar; desconhecido vira `FREE`) e chega à tela pelo hook `useUserTier`, que consulta
`/api/user/me` na montagem e nos eventos `user_synced` e `storage`.

### Pagamento

A cadeia inteira — resolver preço, criar cobrança, verificar pagamento, conferir titularidade,
ativar tier — **está no BFF Java**. O Next só encaminha, e os webhooks das gateways apontam
direto para o Java.

Consequência: **enquanto o Java não expuser os cinco endpoints, o checkout responde 503.** É o
custo assumido do corte; o contrato exigido está na primeira seção do
[`../CHANGES.md`](../CHANGES.md).

O cartão nunca toca servidor nosso: o Payment Element tokeniza direto com a Stripe, no navegador.

### Tema e estilo

`ThemeContext` aplica `data-theme="light|dark"` no `<html>`. Modo escuro só para autenticado.
Cores sempre por CSS Custom Properties de `src/app/globals.css` — **nenhum hex literal em
componente**. Espaçamento e raio pela escala de tokens (`--space-*`, `--radius-*`). Merge de
classes sempre com `cn()` de `src/lib/utils.ts`.

Import dinâmico é obrigatório para modais, drawers, bibliotecas de gráfico, editores de texto
rico e qualquer dependência acima de 50 kB gzipped.

---

## Testes

```bash
npm test              # Vitest — src/test/**/*.test.ts
npx tsc --noEmit      # tipagem
npm run build         # build + TypeScript
```

Os testes ficam em `src/test/`, com sufixo `.test.ts` — é o `include` do
[`vitest.config.mts`](vitest.config.mts). O sufixo é o que separa os testes unitários dos scripts
k6, que moram em `src/test/K6/` e não o usam.

| Pasta | Cobre |
|---|---|
| `src/test/auth/` | sessão via cookie nas rotas, `/api/user/me`, e a garantia de que o JWT não volta ao navegador |
| `src/test/payment/` | as rotas de pagamento como proxy fino, a ativação de tier, a reconciliação de boleto e a normalização de tier |
| `src/test/K6/` | carga — ver [README próprio](src/test/K6/README.md) |

O ambiente é `node` e `globals: false`: importe `describe`/`it`/`expect` de `vitest`
explicitamente.

## Ao criar código novo

| Tipo | Convenção | Exemplo |
|---|---|---|
| Server Component | `<Nome>DataServer.tsx` | `GameDataServer.tsx` |
| Client Component | `<Nome>Client.tsx` | `ArenaGameClient.tsx` |
| Skeleton | `<Nome>Skeleton.tsx` em `components/Skeletons/` | `RankingSkeleton.tsx` |
| Hook | `use<Nome>.ts` | `useUserTier.ts` |
| Tipos | `<nome>.types.ts` | `questao.types.ts` |

Nada de `Component.tsx`, `Helper.ts` ou `Utils.tsx`.

Todo `page.tsx` ou hook de dados leva um comentário de estratégia de cache:

```ts
// CACHE STRATEGY: ISR — revalidate 60s — conteúdo estático
// CACHE STRATEGY: SWR — revalidateOnFocus — dado do usuário
// CACHE STRATEGY: no-store — dado sensível ou financeiro
```

Lista com mais de 50 itens usa `react-window`. A imagem de LCP de cada rota usa `next/image` com
`priority` — nunca `<img>`.
