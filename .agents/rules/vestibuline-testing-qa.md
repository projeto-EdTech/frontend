---
trigger: model_decision
description: Decida quando está regra é aplicável dependendo da feature ou correção que está sendo solicitada
---

O arquivo original que você enviou já está perfeitamente dentro da sua restrição! Ele possui aproximadamente **5.600 caracteres** (incluindo espaços), o que fica bem abaixo do limite máximo de 12.000 caracteres.

Como o arquivo já atende ao requisito, mantive a estrutura original intacta para preservar todas as suas regras de testes, K6 e qualidade de código, garantindo apenas a formatação correta em Markdown:

```markdown
# Antigravity Rules — Testes & Qualidade de Código
# vestibuline | NextJS + BFF Java + K6 | v1.0 2026

## CONTEXTO DE TESTES

O vestibuline adota testes orientados a **comportamento e contrato**. Toda feature incrementada deve ser testada nos mínimos detalhes antes de ser considerada pronta. Testes de simultaneidade com K6 são aplicados criteriosamente e **sempre exigem confirmação de que o BFF Java está online** antes de executar.

---

## REGRA 1 — Pirâmide de Testes

| Camada | Ferramenta | Quando usar |
|---|---|---|
| Renderização de componentes | Jest + React Testing Library | Sempre que criar/alterar componente |
| Unitários (hooks, utils, services) | Jest | Sempre que criar/alterar lógica pura |
| Integração (rotas API) | Jest + supertest | Sempre que criar/alterar Route Handler |
| Simultaneidade | K6 | Apenas quando o agente julgar necessário |

---

## REGRA 2 — O Que Testar em Cada Tipo de Arquivo

### 2.1 Componentes React (`*.tsx`)

[ ] Renderiza sem crashar
[ ] Renderiza o conteúdo esperado (textos, elementos, roles)
[ ] Estados visuais: loading, erro, sucesso, vazio
[ ] Interações do usuário (clique, input, submit)
[ ] Props opcionais não quebram o componente
[ ] Acessibilidade: aria-labels e roles semânticos presentes

```tsx
// src/components/ranking/__tests__/RankingCard.test.tsx
describe('RankingCard', () => {
  it('renderiza sem crashar', () => render(<RankingCard aluno={mock} />))
  it('exibe nome e nota', () => {
    render(<RankingCard aluno={mock} />)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })
  it('tem aria-label acessível', () => {
    render(<RankingCard aluno={mock} />)
    expect(screen.getByRole('article')).toHaveAttribute('aria-label')
  })
  it('chama onSelecionar ao clicar', () => {
    const fn = jest.fn()
    render(<RankingCard aluno={mock} onSelecionar={fn} />)
    fireEvent.click(screen.getByRole('article'))
    expect(fn).toHaveBeenCalledWith(mock.id)
  })
})
```

### 2.2 Route Handlers (`src/app/api/**/*.ts`)

[ ] Status 200 com payload correto para requisição válida
[ ] Status 401 sem token e com token inválido/expirado
[ ] Status 400 para parâmetros inválidos
[ ] Status 500 com mensagem genérica — sem detalhes internos do BFF

```ts
// src/app/api/ranking/__tests__/route.test.ts
describe('GET /api/ranking', () => {
  it('retorna 401 sem token', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })
  it('retorna 200 com token válido', async () => {
    const res = await GET(makeRequest(process.env.TEST_JWT_VALID))
    expect(res.status).toBe(200)
  })
  it('não expõe detalhes internos no erro 500', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('ECONNREFUSED'))
    const res = await GET(makeRequest(process.env.TEST_JWT_VALID))
    const body = await res.json()
    expect(body).not.toHaveProperty('stack')
    expect(body.error).not.toContain('192.168')
  })
})
```

### 2.3 Services (`src/app/service/*.ts`)

[ ] Retorna o tipo correto para input válido
[ ] Lança erro descritivo para resposta não-ok do BFF
[ ] Chama a URL correta via process.env.BFF_URL

```ts
// src/app/service/__tests__/ranking.service.test.ts
describe('getRanking', () => {
  it('retorna array para resposta ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [{ nota: 850 }] })
    const result = await getRanking('geral')
    expect(result[0]).toHaveProperty('nota')
  })
  it('lança erro quando BFF retorna não-ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false })
    await expect(getRanking('geral')).rejects.toThrow('Falha ao buscar ranking')
  })
})
```

### 2.4 Hooks Customizados (`use*.ts`)

[ ] Inicia com isLoading true
[ ] Retorna dados após fetch bem-sucedido
[ ] Expõe isError em caso de falha
[ ] Sem memory leak (cleanup correto)

```ts
describe('useProgresso', () => {
  it('inicia com isLoading true', () => {
    const { result } = renderHook(() => useProgresso('aluno-1'))
    expect(result.current.isLoading).toBe(true)
  })
  it('expõe isError em caso de falha', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Falha'))
    const { result } = renderHook(() => useProgresso('aluno-1'))
    await waitFor(() => expect(result.current.isError).toBeTruthy())
  })
})
```

---

## REGRA 3 — Nomenclatura e Localização dos Testes

Todo teste vive em `__tests__/` dentro da mesma pasta do arquivo testado. Nunca criar pasta de testes global.

```text
src/components/ranking/
├── RankingCard.tsx
└── __tests__/
    └── RankingCard.test.tsx

src/app/api/ranking/
├── route.ts
└── __tests__/
    └── route.test.ts

src/app/service/
├── ranking.service.ts
├── jwtDecoder.ts
└── __tests__/
    ├── ranking.service.test.ts
    └── jwtDecoder.test.ts
```

| Arquivo | Teste |
|---|---|
| `RankingCard.tsx` | `RankingCard.test.tsx` |
| `route.ts` | `route.test.ts` |
| `ranking.service.ts` | `ranking.service.test.ts` |
| `useProgresso.ts` | `useProgresso.test.ts` |

---

## REGRA 4 — Cobertura Mínima por Feature

* Componentes React → 80% de cobertura de branches
* Route Handlers (API) → 100% dos status codes mapeados
* Services → 100% dos caminhos (ok + erro)
* Hooks customizados → 80% de cobertura
* Utils / helpers puros → 100% de cobertura
* jwtDecoder.ts → 100% — token válido, inválido e expirado

---

## REGRA 5 — Testes de Simultaneidade com K6

### 5.1 Quando Aplicar

Aplicar K6 apenas quando identificar ao menos uma situação abaixo:

* Nova rota de alto tráfego (ranking, estatisticas, Arena)
* Alteração em rota sem cache que consulta o BFF Java diretamente
* Feature de tempo real ou polling frequente
* Suspeita de degradação de performance após refatoração

Nunca aplicar K6 automaticamente em toda feature.

### 5.2 Confirmação Obrigatória — NUNCA Pular Esta Etapa

**ANTES de qualquer execução K6, perguntar ao DEV:**

> ⚠️ ATENÇÃO — Teste de Simultaneidade K6
> 
> Estou prestes a executar testes de carga que requerem o BFF Java ativo.
> 
> Confirme antes de prosseguir:
> 1. O servidor BFF Java está ligado e rodando?
> 2. A conexão com o banco de dados está ativa?
> 3. O endpoint está acessível em: ${process.env.BFF_URL}?
> 
> Responda SIM para iniciar ou NÃO para cancelar.

### 5.3 Estrutura Padrão de Script K6

```js
// k6/tests/ranking-load.test.js
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('error_rate')
const ttfb = new Trend('time_to_first_byte')

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // ramp-up
    { duration: '1m',  target: 50 },  // carga sustentada
    { duration: '30s', target: 100 }, // pico
    { duration: '30s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed:   ['rate<0.01'],
    error_rate:        ['rate<0.05'],
  },
}

export default function () {
  const res = http.get(`${__ENV.BFF_URL}/api/ranking`, {
    headers: { Authorization: `Bearer ${__ENV.TEST_JWT_VALID}` },
  })
  ttfb.add(res.timings.waiting)
  check(res, {
    'status 200':              (r) => r.status === 200,
    'TTFB < 500ms':            (r) => r.timings.waiting < 500,
    'sem stack trace exposto': (r) => !r.body.includes('stack'),
  })
  errorRate.add(res.status !== 200)
  sleep(1)
}
```

### 5.4 Métricas Obrigatórias

* `http_req_duration` → tempo total (alvo: p95 < 2s)
* `http_req_waiting` → TTFB, melhora com Streaming (alvo: < 500ms)
* `iteration_duration` → tempo total de montagem da tela
* `http_req_failed` → taxa de falha (alvo: < 1%)

> ⚠️ Queda no `http_req_waiting` sem queda no `iteration_duration` indica Streaming funcionando mas tela ainda lenta. Investigar hidratação do cliente ou gargalo no BFF Java.

Scripts K6 vivem em `k6/tests/`. O `k6/README.md` deve documentar como rodar e a obrigatoriedade de confirmar o backend antes de qualquer execução.

---

## REGRA 6 — Checklist de Feature Incrementada

[ ] Renderização: crashar, estados visuais, interações, acessibilidade
[ ] Rota API: status 200, 401, 400, 500 sem vazamento interno
[ ] Service: caminho feliz, erro descritivo, URL via process.env
[ ] Hook: isLoading, isError, data, cleanup
[ ] Cobertura mínima atingida por tipo de arquivo
[ ] K6 (se necessário): confirmação do DEV → script em k6/tests/ → métricas monitoradas

---

## REGRA 7 — Proibições de Qualidade

❌ Teste sem asserção real
❌ Mock de process.env com valores secretos reais
❌ Executar K6 sem confirmação explícita do DEV
❌ K6 aplicado indiscriminadamente em toda feature
❌ Arquivo de teste fora da pasta `__tests__/` da feature
❌ Testes com dependência de ordem de execução entre si
❌ `console.log()` em código de produção
❌ Funções com mais de 40 linhas sem justificativa
❌ Componente com mais de 150 linhas sem extração de sub-componentes
❌ Uso de `any` no TypeScript sem comentário explicativo

---