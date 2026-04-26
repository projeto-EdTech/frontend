---
trigger: always_on
---

## 1. Renderização Progressiva com React Suspense (Streaming)

Rotas monolíticas são proibidas. Toda rota que realiza chamada ao BFF Java **deve** decompor sua árvore de componentes em partes independentes, permitindo que o servidor entregue a "casca" da página instantaneamente enquanto os dados pesados são transmitidos em background.

### 1.1 Obrigatoriedade do `<Suspense>`

Todo componente que depende de dados do BFF deve ser envolvido em `<Suspense>` com um fallback de Skeleton Screen funcional. Nunca deixar o fallback como `null` ou um spinner genérico.

```tsx
// ✅ CORRETO
import { Suspense } from 'react'
import { DataTableSkeleton } from '@/components/skeletons/DataTableSkeleton'
import { DataTable } from '@/components/DataTable'

export default function Page() {
  return (
    <main>
      <PageHeader /> {/* entregue instantaneamente */}
      <Suspense fallback={<DataTableSkeleton />}>
        <DataTable /> {/* streamado do BFF em background */}
      </Suspense>
    </main>
  )
}

// ❌ ERRADO — bloqueia o TTFB inteiro
export default async function Page() {
  const data = await fetchFromBFF() // trava o render até o BFF responder
  return <DataTable data={data} />
}
```

### 1.2 Skeleton Screens

Skeleton Screens são obrigatórios como fallback de todo `<Suspense>`. Devem replicar fielmente o layout do componente real para eliminar o layout shift (CLS).

```tsx
// Exemplo: DataTableSkeleton.tsx
export function DataTableSkeleton() {
  return (
    <div className="skeleton-wrapper" aria-busy="true" aria-label="Carregando dados...">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  )
}
```

**Regra de CSS dos Skeletons:**
```css
.skeleton-row {
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

### 1.3 Métrica de Referência

> Ao implementar Streaming, monitorar **dois** indicadores no k6:
> - `http_req_duration` (TTFB) — deve cair drasticamente com o streaming
> - `iteration_duration` — deve cair também; se não cair, o problema está no tempo total de montagem da tela, não só na entrega inicial

---

## REGRA 2 — Estratégia de Fetching e Cache

Nenhuma rota deve buscar dados sem uma estratégia de cache explicitamente definida. A escolha entre ISR, SWR/React Query e fetch direto deve ser documentada no próprio arquivo da rota via comentário.

### 2.1 ISR — Incremental Static Regeneration

Usar para rotas com dados que não variam por usuário e têm baixa frequência de atualização (conteúdo didático, rankings públicos, artigos).

```ts
// app/artigos/[slug]/page.tsx
export const revalidate = 60 // revalida a cada 60 segundos

export default async function ArtigoPage({ params }) {
  const artigo = await fetchArtigo(params.slug)
  return <ArtigoView artigo={artigo} />
}
```

### 2.2 Stale-While-Revalidate com SWR ou React Query

Usar para dados dinâmicos e personalizados por usuário (progresso do aluno, métricas, histórico de questões). Hidratar a interface em background sem travar o render inicial.

```ts
// hooks/useProgresso.ts
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useProgresso(alunoId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/progresso/${alunoId}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30_000, // 30s — evita chamadas redundantes
    }
  )

  return { progresso: data, isLoading, isError: error }
}
```

### 2.3 Proibição de Waterfalls

Chamadas ao BFF Java **nunca** devem ser feitas em série quando podem ser paralelas. Usar `Promise.all` ou as capacidades de fetch paralelo do Next.js App Router.

```ts
// ✅ CORRETO — paralelo
const [aluno, progresso, questoes] = await Promise.all([
  fetchAluno(id),
  fetchProgresso(id),
  fetchQuestoes(id),
])

// ❌ ERRADO — waterfall (cada await espera o anterior)
const aluno    = await fetchAluno(id)
const progresso = await fetchProgresso(id)
const questoes  = await fetchQuestoes(id)
```

---

## REGRA 3 — Code Splitting e Dynamic Imports

O bundle principal de cada rota deve conter apenas o essencial para o First Contentful Paint (FCP). Tudo que não é visível no viewport inicial deve ser carregado de forma assíncrona.

### 3.1 `next/dynamic` — Obrigatoriedade

Os seguintes tipos de componentes **devem** usar `next/dynamic` sem exceção:

| Tipo de Componente | Estratégia |
|---|---|
| Modais e Drawers | `dynamic` com `ssr: false` |
| Bibliotecas de gráficos (Recharts, Chart.js) | `dynamic` com `ssr: false` |
| Editors de texto rico | `dynamic` com `ssr: false` |
| Componentes "below the fold" | `dynamic` com `loading` skeleton |
| Componentes de terceiros pesados | `dynamic` com `ssr: false` |

```tsx
import dynamic from 'next/dynamic'
import { GraficoSkeleton } from '@/components/skeletons/GraficoSkeleton'

// Componente de gráfico — nunca importar diretamente
const GraficoDesempenho = dynamic(
  () => import('@/components/GraficoDesempenho'),
  {
    ssr: false,
    loading: () => <GraficoSkeleton />,
  }
)

// Modal — carregado apenas quando o usuário acionar
const ModalQuestao = dynamic(
  () => import('@/components/ModalQuestao'),
  { ssr: false }
)
```

### 3.2 Análise de Bundle

Antes de qualquer PR que adicione uma nova dependência, verificar o impacto no bundle:

```bash
# Analisar bundle size
ANALYZE=true next build

# Checar tamanho de dependência antes de instalar
npx bundlephobia <nome-do-pacote>
```

**Regra:** Nenhuma dependência com mais de **50kb gzipped** deve ser importada no bundle principal. Obrigatório usar `dynamic` ou buscar alternativa mais leve.

---

## REGRA 4 — Memoização e Prevenção de Re-renders

Durante picos de carga (múltiplos Virtual Users simultâneos), re-renders em cascata degradam a experiência. Componentes de alta densidade de dados devem ser protegidos com memoização.

### 4.1 `React.memo` — Quando Usar

Aplicar em componentes que:
- Recebem props estáveis mas são filhos de componentes que re-renderizam com frequência
- Renderizam listas com muitos itens
- São "folhas" da árvore de componentes (sem filhos)

```tsx
// ✅ QuestaoCard memoizado — re-renderiza só se props mudarem
export const QuestaoCard = React.memo(function QuestaoCard({ questao, onResponder }) {
  return (
    <div className="questao-card">
      <p>{questao.enunciado}</p>
      <button onClick={() => onResponder(questao.id)}>Responder</button>
    </div>
  )
})
```

### 4.2 `useMemo` e `useCallback`

```tsx
// useMemo — para cálculos derivados pesados
const questoesFiltradas = useMemo(
  () => questoes.filter(q => q.materia === materiaAtiva),
  [questoes, materiaAtiva] // só recalcula quando estas dependências mudarem
)

// useCallback — para funções passadas como prop a componentes memoizados
const handleResponder = useCallback(
  (questaoId: string) => {
    dispatch({ type: 'RESPONDER', payload: questaoId })
  },
  [dispatch] // referência estável
)
```

**Regra:** `useMemo` e `useCallback` sem dependências corretas são piores que não usá-los. Todo lint rule de `exhaustive-deps` deve estar ativo no projeto.

---

## REGRA 5 — Virtualização de Listas

Listas com mais de **50 itens** no DOM são proibidas sem virtualização. Renderizar elementos fora do viewport consome memória e degrada o scroll.

### 5.1 `react-window` — Padrão do Projeto

```tsx
import { FixedSizeList as List } from 'react-window'
import { QuestaoCard } from '@/components/QuestaoCard'

const ITEM_HEIGHT = 120 // altura fixa de cada item em px

export function ListaQuestoes({ questoes }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <QuestaoCard questao={questoes[index]} />
    </div>
  )

  return (
    <List
      height={600}          // altura visível da lista
      itemCount={questoes.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

**Quando usar `VariableSizeList`:** itens com altura dinâmica (questões com enunciados de tamanho variável). Neste caso, medir a altura com `useRef` + `ResizeObserver`.

---

## REGRA 6 — Otimização de Imagens com `next/image`

Toda imagem da aplicação deve passar pelo componente `next/image`. Usar a tag `<img>` direta é proibido, exceto em SVGs inline.

### 6.1 LCP — Largest Contentful Paint

A imagem principal de cada rota (hero, foto de perfil, banner) deve ter `priority` declarado para ser pré-carregada pelo browser antes do render.

```tsx
import Image from 'next/image'

// ✅ Imagem LCP — carregada com prioridade máxima
<Image
  src="/hero-estudante.webp"
  alt="Estudante focado com fones de ouvido"
  width={1200}
  height={600}
  priority // <- obrigatório para o LCP da rota
  quality={85}
/>

// Imagens secundárias — lazy load padrão (não precisa de priority)
<Image
  src="/avatar.webp"
  alt="Avatar do aluno"
  width={48}
  height={48}
/>
```

### 6.2 Formatos e Qualidade

- Formato preferencial: **WebP** (fallback automático pelo `next/image`)
- Qualidade padrão: `85` — equilíbrio entre visual e tamanho de arquivo
- Imagens de conteúdo didático (fórmulas, diagramas): usar `quality={95}` para preservar legibilidade

---

## REGRA 7 — Definição de Pronto (Definition of Ready)

Um componente ou rota **só pode ser considerado pronto** quando todos os itens abaixo estiverem verificados:

### Checklist de Entrega

```
[ ] Streaming implementado
    → Componentes de dados envoltos em <Suspense> com Skeleton Screens funcionais
    → TTFB medido e comparado com baseline anterior

[ ] Code Splitting aplicado
    → Bundle size da rota analisado com ANALYZE=true next build
    → Modais, gráficos e componentes below-the-fold usando next/dynamic
    → React.memo e useCallback aplicados em listas de alta densidade

[ ] Cache de rota configurado
    → ISR com revalidate definido para rotas de conteúdo estático
    → SWR/React Query para dados dinâmicos de usuário
    → Nenhuma chamada ao BFF em waterfall (todas paralelas via Promise.all)

[ ] Virtualização de listas
    → react-window aplicado em listas com > 50 itens

[ ] Imagens otimizadas
    → Nenhuma tag <img> direta no código
    → priority declarado na imagem LCP de cada rota

[ ] Memoização validada
    → Sem re-renders desnecessários verificados no React DevTools Profiler
    → Todas as dependências de useMemo/useCallback corretas (lint sem warnings)
```

---

## REGRA 8 — Notas de Monitoramento (k6)

Ao realizar testes de carga com k6, monitorar **obrigatoriamente** as duas métricas abaixo em conjunto. Melhorar apenas uma delas não é suficiente.

| Métrica | O que mede | Meta |
|---|---|---|
| `http_req_duration` (TTFB) | Tempo até o primeiro byte — melhora com Streaming | Redução vs baseline |
| `iteration_duration` | Tempo total de montagem da tela | Deve cair junto com o TTFB |

> ⚠️ **Atenção:** Uma queda no `http_req_duration` sem queda no `iteration_duration` indica que o Streaming está funcionando, mas o tempo total de experiência do usuário não melhorou. Investigar gargalos no BFF Java ou no processo de hidratação do cliente.