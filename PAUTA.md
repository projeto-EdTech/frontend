# 📊 GA4 — Status de Implementação e Próximos Passos

> **Data:** Abril/2026  
> **Autor:** para revisão do time de desenvolvimento

---

## ✅ O que já está implementado

### Script base (layout.tsx)

- Tag GA4 carregada via `next/script` com `strategy="afterInteractive"` (não bloqueia o render)
- **Só ativa em produção** (`NODE_ENV === 'production'`) — dados de development ficam limpos
- ID centralizado na variável de ambiente `NEXT_PUBLIC_GA_ID`

### Serviço centralizado (src/lib/analytics.ts)

- Guard SSR-safe: nenhuma chamada quebra em Server Components ou ad-blockers
- Funções tipadas via `@types/gtag.js`
- Atualmente expõe: `setUserId()` e `trackLogin()`

### User-ID (SyncUserEffect.tsx)

- Após sincronização com o backend, o UUID do usuário é enviado ao GA4 via `gtag('set', { user_id })`
- Isso permite correlacionar sessões do mesmo usuário em dispositivos diferentes
- **Importante para:** cálculo correto de LTV, churn e retenção real

---

## 🟡 Pendente para discussão — Eventos de Produto

Estes eventos já foram mapeados no código mas ainda **não foram implementados**. São opcionais mas agregam muito valor analítico.

### 1. Eventos do Simulado

**Arquivo:** `src/components/Simula_PRO/SimulationQuizClient.tsx`

| Evento | Quando disparar | Dados relevantes |
|---|---|---|
| `start_simulation` | `useEffect` inicial, após `setIsLoading(false)` | university, year, total_questions |
| `complete_simulation` | `handleFinishExam`, após `saveResultToBackend` | university, year, correct_answers, success_rate, time_spent |
| `answer_question` *(opcional)* | `handleNextQuestion` a cada questão | question_number, subject, is_correct |

> **Dúvida em aberto:** rastrear `answer_question` individualmente (gera ~45 eventos/simulado) ou só o resultado final?  
> Prós do granular: visibilidade por matéria diretamente no GA4 sem dashboard extra.

---

### 2. Evento de Newsletter

**Arquivo:** `src/components/blog/SubscribeButton.tsx`  
**Handler:** dentro do `if (response.ok)` no `handleSubscribe`

```typescript
trackNewsletterSubscribe(); // a implementar em analytics.ts
```

---

### 3. Funil de Pagamento

**Arquivo:** `src/app/paidPlan/page.tsx`

| Evento | Quando | Dados |
|---|---|---|
| `begin_checkout` | Clique em "Assinar Plano" | plan_id, value, currency |
| `purchase` | Pagamento aprovado (callback MP) | transaction_id, plan_id, value |

> Estes são eventos de **conversão** — essenciais para medir ROI de campanhas futuras.

---

### 4. Arena — Jogos

**Arquivo:** `src/app/Arena/page.tsx`

```typescript
trackStartGame({ game_name: 'nome-do-jogo' }); // a implementar em analytics.ts
```

---

### 5. Melhoria de Performance — useUserTier.ts

**Contexto:** o hook atual usa `setInterval(checkTier, 2000)` — verifica o tier do usuário a cada 2 segundos, gerando ~1.800 chamadas/hora por usuário ativo.

**Proposta:** substituir por `CustomEvent('user_synced')` disparado pelo `SyncUserEffect` após o sync — reação instantânea, zero polling.

> Não tem relação com GA4, mas pode ser feito na mesma PR dos eventos de produto.

---

## 📁 Funções a adicionar em `analytics.ts`

Para implementar os eventos acima, basta adicionar ao `src/lib/analytics.ts`:

```typescript
export const trackStartSimulation = (params: {
  university: string; year: string | null; total_questions: number;
}) => { if (!canTrack()) return; window.gtag('event', 'start_simulation', params); };

export const trackCompleteSimulation = (params: {
  university: string; year: string | null; total_questions: number;
  correct_answers: number; success_rate: number; time_spent_seconds: number;
}) => { if (!canTrack()) return; window.gtag('event', 'complete_simulation', params); };

export const trackAnswerQuestion = (params: {
  university: string; question_number: number; subject: string; is_correct: boolean;
}) => { if (!canTrack()) return; window.gtag('event', 'answer_question', params); };

export const trackNewsletterSubscribe = (): void => {
  if (!canTrack()) return; window.gtag('event', 'subscribe_newsletter');
};

export const trackBeginCheckout = (params: {
  plan_id: string; value: number; currency: string;
}) => { if (!canTrack()) return; window.gtag('event', 'begin_checkout', params); };

export const trackPurchase = (params: {
  transaction_id: string; plan_id: string; value: number; currency: string;
}) => { if (!canTrack()) return; window.gtag('event', 'purchase', params); };

export const trackStartGame = (params: { game_name: string }): void => {
  if (!canTrack()) return; window.gtag('event', 'start_game', params);
};
```

---

## Como validar em produção

1. Acesse o [GA4 DebugView](https://analytics.google.com) → Admin → DebugView
2. Faça login na aplicação em produção (`npm run build && npm start`)
3. Verifique no DebugView:
   - Evento `login` aparece com `method: oauth`
   - Parâmetro `user_id` está presente na sessão
