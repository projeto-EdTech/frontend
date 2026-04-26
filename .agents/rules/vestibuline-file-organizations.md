---
trigger: always_on
---

# Antigravity Rules — Clean Architecture & Estrutura de Pastas
# vestibuline | NextJS App Router | v1.0 2026

## VISÃO GERAL DA ARQUITETURA

O vestibuline segue uma arquitetura orientada a **features/rotas**. Cada rota em `src/app` possui sua página principal e seus componentes exclusivos vivem em `src/components/<NomeDaRota>`. Componentes globais e compartilhados vivem diretamente em `src/components/ui`.

```
src/
├── app/                        # Rotas do Next.js App Router
│   ├── api/                    # Route Handlers (BFF proxy endpoints)
│   ├── Arena/                  # Rota /arena
│   ├── blog/                   # Rota /blog
│   ├── contato/                # Rota /contato
│   ├── create/                 # Rota /create
│   ├── estatisticas/           # Rota /estatisticas
│   ├── fonts/                  # Fontes locais (KaTeX, OpenDyslexic)
│   ├── library/                # Rota /library
│   ├── paidPlan/               # Rota /paidPlan
│   ├── privacy/                # Rota /privacy
│   ├── profile/                # Rota /profile
│   ├── ranking/                # Rota /ranking
│   ├── service/                # Camada de serviços server-side
│   ├── simulation/             # Rota /simulation
│   ├── terms/                  # Rota /terms
│   ├── VestIA/                 # Rota /vestia (IA do vestibuline)
│   ├── favicon.ico
│   ├── globals.css             # Tokens CSS globais (variáveis, reset)
│   ├── layout.tsx              # Root layout
│   ├── not-found.tsx           # Página 404
│   ├── page.tsx                # Homepage
│   └── providers.tsx           # Providers globais (tema, auth, SWR)
│
└── components/                 # Componentes React
    ├── Arena/                  # Componentes exclusivos da rota /Arena
    │   ├── ArenaGameClient.tsx # Lógica client-side do jogo
    │   └── GameDataServer.tsx  # Fetch server-side dos dados
    ├── blog/                   # Componentes exclusivos da rota /blog
    ├── community/              # Componentes de comunidade
    ├── Estatisticas/           # Componentes exclusivos de /estatisticas
    ├── Filtros/                # Componentes de filtro reutilizáveis
    ├── games/                  # Componentes de jogos/gamificação
    ├── Library/                # Componentes exclusivos de /library
    ├── mockups/                # Componentes de mockup/demo
    ├── payment/                # Componentes de pagamento
    ├── pricing/                # Componentes de planos e preços
    ├── profile/                # Componentes exclusivos de /profile
    ├── ranking/                # Componentes exclusivos de /ranking
    ├── Simula_PRO/             # Componentes do simulado PRO
    ├── Skeletons/              # Skeleton Screens globais
    └── ui/                     # Componentes globais compartilhados
        ├── Header.tsx
        ├── Footer.tsx
        ├── Sidebar.tsx
        ├── NavigationSound.tsx
        ├── ThemeToggle.tsx
        ├── ThemeProviderWrapper.tsx
        ├── LoadingScreen.tsx
        ├── AccessibilityMenu.tsx
        ├── UserAvatar.tsx
        └── ...
```

---

## REGRA 1 — Onde Criar Cada Arquivo

Ao gerar um novo arquivo, seguir este fluxo de decisão **sem exceções**:

```
O componente é usado em apenas UMA rota?
├── SIM → criar em src/components/<NomeDaRota>/
│         Exemplo: componente só usado em /Arena → src/components/Arena/
└── NÃO (usado em 2+ rotas) → criar em src/components/ui/
                               Exemplo: botão, modal, badge reutilizável
```

```
O arquivo busca dados do BFF Java no servidor?
├── SIM → sufixo Server.tsx | Exemplo: GameDataServer.tsx
└── NÃO (lógica client-side, estado, interação) → sufixo Client.tsx
                                                   Exemplo: ArenaGameClient.tsx
```

```
É uma rota/página navegável?
└── SIM → criar page.tsx dentro de src/app/<nome-da-rota>/
          Nunca colocar lógica pesada direto no page.tsx —
          delegar para componentes em src/components/<NomeDaRota>/
```

---

## REGRA 2 — Convenção de Nomenclatura

| Tipo | Convenção | Exemplo |
|---|---|---|
| Pasta de rota (app) | `camelCase` ou `PascalCase` | `Arena/`, `estatisticas/` |
| Pasta de componentes | `PascalCase` espelhando a rota | `Arena/`, `Estatisticas/` |
| Componente server-side | `<Nome>Server.tsx` | `GameDataServer.tsx` |
| Componente client-side | `<Nome>Client.tsx` | `ArenaGameClient.tsx` |
| Skeleton Screen | `<Nome>Skeleton.tsx` | `RankingSkeleton.tsx` |
| Hook customizado | `use<Nome>.ts` | `useProgresso.ts` |
| Arquivo de tipos | `<nome>.types.ts` | `questao.types.ts` |
| Arquivo de constantes | `<nome>.constants.ts` | `materias.constants.ts` |
| Utilitários puros | `<nome>.utils.ts` | `formatarNota.utils.ts` |

**Proibido:** nomes genéricos como `Component.tsx`, `Helper.ts`, `Data.tsx`, `Utils.tsx` sem prefixo de contexto.

---

## REGRA 3 — Separação Server / Client Obrigatória

O padrão `Server.tsx` + `Client.tsx` observado em `Arena/` é o **padrão obrigatório** para toda feature que combina dados do BFF com interatividade.

```tsx
// ✅ GameDataServer.tsx — Server Component
// Responsabilidade: buscar dados do BFF Java, passar como props
import { GameDataClient } from './ArenaGameClient'

export async function GameDataServer() {
  const data = await fetchBFF('/api/arena/dados')
  return <ArenaGameClient initialData={data} />
}

// ✅ ArenaGameClient.tsx — Client Component
// Responsabilidade: estado local, interações, animações
'use client'

interface Props {
  initialData: ArenaDados
}

export function ArenaGameClient({ initialData }: Props) {
  const [estado, setEstado] = useState(initialData)
  // lógica interativa aqui
}
```

**Nunca** misturar fetch de dados do BFF com lógica de estado e interação no mesmo componente.

---

## REGRA 4 — `page.tsx` é Apenas Orquestrador

O arquivo `page.tsx` de cada rota deve ser **fino** — apenas orquestra o layout da página, importa os Server Components da feature e define os `<Suspense>`. Nunca colocar lógica de negócio, fetch ou estado diretamente no `page.tsx`.

```tsx
// ✅ CORRETO — src/app/ranking/page.tsx
import { Suspense } from 'react'
import { RankingDataServer } from '@/components/ranking/RankingDataServer'
import { RankingSkeleton } from '@/components/Skeletons/RankingSkeleton'

export const revalidate = 60
// CACHE STRATEGY: ISR — ranking público, não varia por usuário

export default function RankingPage() {
  return (
    <main>
      <Suspense fallback={<RankingSkeleton />}>
        <RankingDataServer />
      </Suspense>
    </main>
  )
}

// ❌ ERRADO — lógica, fetch e estado no page.tsx
export default async function RankingPage() {
  const [dados, setDados] = useState([]) // useState em Server Component
  const ranking = await fetch('/api/ranking') // fetch direto no page
  return <div>{/* JSX massivo aqui */}</div>
}
```

---

## REGRA 5 — `src/app/api/` — Proxy para o BFF Java

A pasta `src/app/api/` contém exclusivamente **Route Handlers** que fazem proxy das chamadas para o BFF Java. Nunca escrever lógica de negócio aqui — apenas receber, repassar e retornar.

```ts
// ✅ src/app/api/ranking/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const response = await fetch(`${process.env.BFF_URL}/ranking`, {
    headers: { Authorization: req.headers.get('Authorization') ?? '' },
  })

  const data = await response.json()
  return NextResponse.json(data)
}

// ❌ ERRADO — lógica de negócio dentro do Route Handler
export async function GET() {
  const dados = await db.query('SELECT * FROM ranking ORDER BY nota DESC')
  const filtrados = dados.filter(...)
  const formatados = filtrados.map(...)
  return NextResponse.json(formatados)
}
```

---

## REGRA 6 — `src/app/service/` — Serviços Server-Side

A pasta `service/` contém funções puras de acesso a dados usadas pelos Server Components. É a camada de abstração entre os componentes e o BFF Java.

```ts
// ✅ src/app/service/ranking.service.ts
const BFF_URL = process.env.BFF_URL

export async function getRanking(filtro: string): Promise<RankingItem[]> {
  const res = await fetch(`${BFF_URL}/ranking?filtro=${filtro}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error('Falha ao buscar ranking')
  return res.json()
}
```

Regras da camada `service/`:
- Funções puras, sem estado
- Sempre tipar o retorno explicitamente
- Sempre tratar erros com `throw new Error()` descritivo
- Nunca importar hooks ou componentes React aqui

---

## REGRA 7 — `src/components/Skeletons/` — Repositório Central de Skeletons

Todos os Skeleton Screens vivem em `src/components/Skeletons/`. Nunca criar skeleton inline ou dentro da pasta de outra feature.

```
src/components/Skeletons/
├── RankingSkeleton.tsx
├── ProfileSkeleton.tsx
├── LibrarySkeleton.tsx
├── EstatisticasSkeleton.tsx
├── SimulacaoSkeleton.tsx
└── CardSkeleton.tsx         # skeleton genérico reutilizável
```

Cada Skeleton deve ter `aria-busy="true"` e `aria-label` descritivo.

---

## REGRA 8 — `providers.tsx` — Único Ponto de Providers Globais

Todos os providers globais (tema, autenticação, SWR, analytics) devem ser registrados **exclusivamente** em `src/app/providers.tsx`. Nunca adicionar providers no `layout.tsx` diretamente nem criar providers avulsos em rotas específicas.

```tsx
// ✅ src/app/providers.tsx
'use client'

import { ThemeProviderWrapper } from '@/components/ui/ThemeProviderWrapper'
import { SWRConfig } from 'swr'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ fetcher: (url) => fetch(url).then(r => r.json()) }}>
      <ThemeProviderWrapper>
        {children}
      </ThemeProviderWrapper>
    </SWRConfig>
  )
}
```

---

## REGRA 9 — `globals.css` — Único Arquivo de Tokens Globais

Todas as CSS Custom Properties (tokens de cor, tipografia, espaçamento, sombra) devem ser declaradas **exclusivamente** em `src/app/globals.css`. Nunca redeclarar variáveis em arquivos CSS de componentes.

```css
/* src/app/globals.css */
:root {
  /* Cores primárias */
  --color-blue-500: #0071e3;
  --gradient-primary: linear-gradient(135deg, #0071e3, #6366f1);

  /* Tipografia */
  --font-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Espaçamento */
  --space-4: 1rem;

  /* ... todos os tokens aqui */
}

[data-theme="light"] { ... }
[data-theme="dark"]  { ... }
```

---

## REGRA 10 — Proibições Gerais de Arquitetura

```
❌ useState ou useEffect em Server Components (arquivos sem 'use client')
❌ fetch direto ao BFF Java dentro de Client Components
❌ Lógica de negócio dentro de page.tsx
❌ Lógica de negócio dentro de src/app/api/ Route Handlers
❌ Componentes globais criados fora de src/components/ui/
❌ Skeletons criados fora de src/components/Skeletons/
❌ CSS Custom Properties declaradas fora de globals.css
❌ Providers globais criados fora de providers.tsx
❌ Importar componentes de uma feature dentro de outra feature
   (ex: importar componente de Arena/ dentro de Ranking/)
   → Se precisar compartilhar, mover para ui/
```

---

*vestibuline | antigravity-architecture.md | v1.0 2026*