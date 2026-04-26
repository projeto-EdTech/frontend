---
trigger: always_on
---

# Antigravity Rules — Otimização & Performance
# vestibuline | NextJS + BFF Java | v1.0 2026

## CONTEXTO DA ARQUITETURA

O vestibuline opera com arquitetura **BFF (Backend for Frontend)**:
- **Frontend:** NextJS (App Router, React 18+)
- **Backend:** Java (BFF — fonte de dados pesados)
- **Padrão de dados:** chamadas do NextJS → BFF Java → resposta ao cliente

Todo código gerado deve respeitar esta arquitetura. Nunca assumir que dados chegam instantaneamente — toda chamada ao BFF é potencialmente lenta e deve ser tratada com estratégia de cache e streaming.

---

## REGRA 1 — Streaming Obrigatório: Nunca Bloquear o TTFB

Rotas monolíticas que aguardam todos os dados antes de renderizar são **proibidas**. A casca da página deve ser entregue instantaneamente; dados pesados do BFF Java são transmitidos em background via `<Suspense>`.

```tsx
// ✅ CORRETO — casca entregue imediatamente, dados streamados
import { Suspense } from 'react'
import { DataTableSkeleton } from '@/components/skeletons/DataTableSkeleton'

export default function Page() {
  return (
    <main>
      <PageHeader />  {/* entregue no primeiro byte */}
      <Suspense fallback={<DataTableSkeleton />}>
        <DataTable />  {/* streamado do BFF em background */}
      </Suspense>
    </main>
  )
}

// ❌ ERRADO — bloqueia o TTFB inteiro até o BFF responder
export default async function Page() {
  const data = await fetchFromBFF()
  return <DataTable data={data} />
}
```

Ao gerar qualquer rota ou page component que faça chamada ao BFF, **sempre** decompor em `<Suspense>` + Skeleton Screen.

---

## REGRA 2 — Skeleton Screens: Fallback Obrigatório

Todo `<Suspense>` deve ter um Skeleton Screen funcional como fallback. `null`, spinners genéricos e `"Carregando..."` são **proibidos** como fallback.

O Skeleton deve replicar o layout real do componente para evitar layout shift (CLS = 0).

```tsx
// Skeleton com shimmer animation obrigatória
export function CardSkeleton() {
  return (
    <div className="skeleton-card" aria-busy="true" aria-label="Carregando...">
      <div className="skeleton-line skeleton-line--title" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line--short" />
    </div>
  )
}
```

```css
.skeleton-line {
  background: linear-gradient(
    90deg,
    var(--color-bg-alt) 25%,
    var(--color-border) 50%,
    var(--color-bg-alt) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-sm);
  height: 1rem;
  margin-bottom: var(--space-2);
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## REGRA 3 — Cache de Dados: Estratégia Explícita Sempre

Toda rota ou hook de dados deve ter estratégia de cache **declarada explicitamente**. Nunca deixar implícita.

### ISR — para conteúdo estático ou pouco volátil
Usar em: artigos, questões do banco, rankings públicos, conteúdo didático.

```ts
// app/artigos/[slug]/page.tsx
export const revalidate = 60 // revalida a cada 60s

export default async function Page({ params }) {
  const artigo = await fetchArtigo(params.slug)
  return <ArtigoView artigo={artigo} />
}
```

### SWR — para dados dinâmicos e personalizados por usuário
Usar em: progresso do aluno, histórico, métricas, notificações.

```ts
import useSWR from 'swr'

export function useProgresso(alunoId: string) {
  return useSWR(
    `/api/progresso/${alunoId}`,
    (url) => fetch(url).then(r => r.json()),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30_000,
    }
  )
}
```

Ao gerar um hook de dados, sempre perguntar internamente: *"Este dado muda por usuário?"*
- Sim → SWR/React Query
- Não → ISR com `revalidate`

---

## REGRA 4 — Proibição de Waterfalls: Fetches Sempre Paralelos

Chamadas ao BFF Java em série são **proibidas** quando podem ser paralelas. Ao gerar código de fetch múltiplo, usar `Promise.all` ou fetch paralelo do App Router.

```ts
// ✅ CORRETO — paralelo, sem waterfall
const [aluno, progresso, questoes] = await Promise.all([
  fetchAluno(id),
  fetchProgresso(id),
  fetchQuestoes(id),
])

// ❌ ERRADO — waterfall, cada chamada espera a anterior
const aluno     = await fetchAluno(id)
const progresso = await fetchProgresso(id)
const questoes  = await fetchQuestoes(id)
```

---

## REGRA 5 — Dynamic Imports: Code Splitting Obrigatório

O bundle principal de cada rota deve conter apenas o essencial para o First Contentful Paint. Os componentes abaixo **obrigatoriamente** usam `next/dynamic`:

| Tipo | Estratégia |
|---|---|
| Modais e Drawers | `dynamic` com `ssr: false` |
| Bibliotecas de gráfico (Recharts, Chart.js) | `dynamic` com `ssr: false` + skeleton |
| Editores de texto rico | `dynamic` com `ssr: false` |
| Componentes below the fold | `dynamic` com `loading` skeleton |
| Qualquer lib > 50kb gzipped | `dynamic` obrigatório |

```tsx
import dynamic from 'next/dynamic'
import { GraficoSkeleton } from '@/components/skeletons/GraficoSkeleton'

// ✅ CORRETO
const GraficoDesempenho = dynamic(
  () => import('@/components/GraficoDesempenho'),
  { ssr: false, loading: () => <GraficoSkeleton /> }
)

const ModalQuestao = dynamic(
  () => import('@/components/ModalQuestao'),
  { ssr: false }
)

// ❌ ERRADO — import direto de componente pesado
import GraficoDesempenho from '@/components/GraficoDesempenho'
```

Antes de sugerir qualquer nova dependência, verificar o peso com:
```bash
npx bundlephobia <nome-do-pacote>
```

---

## REGRA 6 — Memoização: Proteger Listas de Alta Densidade

Durante picos de carga com múltiplos usuários simultâneos, re-renders em cascata degradam a experiência. Componentes de lista e filhos de componentes que atualizam com frequência devem ser memoizados.

```tsx
// React.memo — para componentes folha estáveis
export const QuestaoCard = React.memo(function QuestaoCard({ questao, onResponder }) {
  return (
    <div>
      <p>{questao.enunciado}</p>
      <button onClick={() => onResponder(questao.id)}>Responder</button>
    </div>
  )
})

// useMemo — para cálculos derivados pesados
const questoesFiltradas = useMemo(
  () => questoes.filter(q => q.materia === materiaAtiva),
  [questoes, materiaAtiva]
)

// useCallback — para funções passadas a componentes memoizados
const handleResponder = useCallback(
  (questaoId: string) => dispatch({ type: 'RESPONDER', payload: questaoId }),
  [dispatch]
)
```

**Regra crítica:** Nunca usar `useMemo`/`useCallback` com array de dependências vazio `[]` para funções que usam valores do escopo — isso cria bugs silenciosos. O lint rule `exhaustive-deps` deve estar sempre ativo.

---

## REGRA 7 — Virtualização: Listas com Mais de 50 Itens

Listas com mais de **50 itens** no DOM são proibidas sem virtualização. Usar `react-window` como padrão do projeto.

```tsx
import { FixedSizeList as List } from 'react-window'

const ITEM_HEIGHT = 120

export function ListaQuestoes({ questoes }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <QuestaoCard questao={questoes[index]} />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={questoes.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

Para itens de altura variável (questões com enunciados longos): usar `VariableSizeList` com `ResizeObserver` para medir altura dinamicamente.

---

## REGRA 8 — Imagem LCP: Priority Obrigatório

A imagem principal (hero, banner, foto de capa) de **cada rota** deve ter `priority` declarado para ser pré-carregada antes do render. Esquecer o `priority` no LCP é tratado como bug de performance.

```tsx
import Image from 'next/image'

// ✅ LCP da rota — priority obrigatório
<Image
  src="/hero-estudante.webp"
  alt="Estudante focado preparando para o vestibular"
  width={1200}
  height={600}
  priority
  quality={85}
/>
```

Nunca usar `<img>` direta. Formato preferencial: WebP.

---

## REGRA 9 — Comentário de Estratégia de Cache Obrigatório

Toda rota (`page.tsx`) ou hook de dados deve ter um comentário no topo declarando a estratégia de cache escolhida e o motivo. Isso elimina ambiguidade para o time.

```ts
// CACHE STRATEGY: ISR — revalidate 60s
// Motivo: conteúdo didático estático, não varia por usuário
export const revalidate = 60

// CACHE STRATEGY: SWR — revalidateOnFocus + 30s dedup
// Motivo: progresso do aluno é dinâmico e personalizado
export function useProgresso(id: string) { ... }

// CACHE STRATEGY: no-store
// Motivo: dado financeiro sensível, nunca cachear
export const dynamic = 'force-dynamic'
```

---

## REGRA 10 — Checklist de Entrega (Definition of Ready)

Ao finalizar qualquer componente ou rota, verificar internamente todos os itens antes de considerar pronto:

```
[ ] Streaming
    → Componentes de dados em <Suspense> com Skeleton Screen funcional
    → TTFB não bloqueado pela espera do BFF Java

[ ] Cache declarado
    → Comentário de estratégia no topo do arquivo
    → ISR para estático / SWR para dinâmico / force-dynamic para sensível

[ ] Sem waterfalls
    → Todos os fetches múltiplos usam Promise.all

[ ] Code splitting
    → Modais, gráficos e componentes pesados com next/dynamic
    → Nenhuma lib > 50kb no bundle principal

[ ] Memoização
    → React.memo em componentes de lista
    → useCallback em handlers passados como prop
    → Sem dependências incorretas no useMemo/useCallback

[ ] Virtualização
    → react-window em listas com > 50 itens

[ ] Imagem LCP
    → priority declarado na imagem principal de cada rota
    → Nenhuma tag <img> direta

[ ] Métricas k6
    → http_req_duration (TTFB) reduzido vs baseline
    → iteration_duration (tempo total de tela) também reduzido
```

> ⚠️ **Atenção k6:** queda no `http_req_duration` sem queda no `iteration_duration` indica que o streaming está funcionando mas o tempo total de experiência não melhorou. Investigar gargalo no BFF Java ou na hidratação do cliente.

---

*vestibuline | antigravity-optimization.md | v1.0 2026*