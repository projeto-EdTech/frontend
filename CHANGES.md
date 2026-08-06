# CHANGES

## Correção dos desvios D1 e D2 — o JWT sai do `localStorage`

**Data:** 2026-08-06

### Motivação

A auditoria da seção seguinte encontrou três pontos em que o código não era a leitura literal do
fluxo de dez passos. Esta entrega fecha dois deles.

| Id | O desvio | Decisão |
|---|---|---|
| **D1** | O saneamento do corpo de cobrança era uma *denylist* de 7 campos. Um campo de dinheiro com nome novo (`valor`, `preco`, `desconto`) passava direto | Virar **allowlist** |
| **D2** | O JWT do aluno era gravado no `localStorage` além do cookie HttpOnly | **Correção completa**, não faseada |
| **D3** | `gateway` e `paymentId` encaminhados sem validação de tipo | **Nenhuma mudança de código** — é do Java |

**D2 é o item caro, e vale explicar por quê.** O token já vivia no cookie `user_data` HttpOnly,
que o JavaScript não consegue ler. A cópia no `localStorage` era uma segunda gravação do **mesmo
token**, e essa qualquer script na página lê numa linha — dependência do npm comprometida,
extensão do navegador, XSS. Com o token, o portador se faz passar pelo aluno no BFF. É a regra
que o `CLAUDE.md` já escrevia: *"JWTs must never be stored in `localStorage` or `sessionStorage`
— only in HttpOnly cookies"*.

A cópia existia porque o cliente precisava de duas coisas do token, e só uma delas era real:

1. **Mandar como `Authorization: Bearer`** — redundante. O cookie acompanha sozinho todo `fetch`
   same-origin. Mas 5 rotas liam **só** o header e ignoravam o cookie, então elas tinham de mudar
   antes de o cliente parar de mandá-lo.
2. **Ler o tier e a newsletter de dentro do JWT** para desenhar a tela — precisava de
   substituto, e ganhou `GET /api/user/me`.

---

### 1. D1 — Allowlist no saneamento do corpo

**`front/src/app/service/bffPayments.ts`.** `stripPayerEmail`, `stripClientDecisions` e a
constante `CAMPOS_PROIBIDOS` **saíram**. `sanitizeCheckoutBody` deixou de apagar campos e passou
a **remontar o corpo do zero**:

```ts
{ planId, payer: { first_name, last_name,
                   identification: { type, number },
                   address: { zip_code, street_name, street_number,
                              neighborhood, city, federal_unit } } }
```

Chave ausente na entrada continua ausente na saída — nada de `undefined` explícito no JSON. O
e-mail do pagador não está na lista, então some sem precisar de função própria.

A diferença prática: a denylist aplicava a regra "o cliente identifica, o servidor decide" apenas
aos nomes que alguém lembrou de prever. A allowlist a aplica a tudo, inclusive ao que ainda não
existe.

**Unificação do `payer` do boleto.** O boleto mandava `{ firstName, lastName, docType, docNumber }`
e as rotas irmãs `{ first_name, last_name, identification: { type, number } }`. Duas allowlists
para o mesmo conceito envelhece mal, e unificar saiu de graça porque **o endpoint Java ainda não
existe** — não há consumidor para quebrar. Alterados `components/payment/BoletoForm.tsx`
(interface `PayerData`) e `app/paidPlan/page.tsx` (a prop passada ao componente, que agora
reaproveita o `firstName`/`lastName`/`cleanedCpf` já calculados na página).

O contrato da seção "Cadeia de pagamento movida para o BFF Java" foi corrigido para o shape novo.

---

### 2. D2 — O token passa a existir só no cookie

Executado na ordem servidor → cliente → escrita. Inverter derrubaria autenticação em tela que
funciona, entre um passo e outro.

#### 2.1 Cinco rotas passaram a aceitar o cookie

Todas trocaram o parser à mão por `readUserToken(req)` — o mesmo utilitário que as rotas de
pagamento já usavam, que faz header → cookie. Nenhuma inventou parser próprio.

| Rota | O que lia antes |
|---|---|
| `api/universities/route.ts` | só o header |
| `api/games/flash-cards/route.ts` | só o header |
| `api/user/stats/route.ts` | só o header |
| `api/Nota-corte/route.ts` | header + cookie, com `next/headers` importado dinamicamente |
| `api/subscribe/route.ts` | **o JWT vinha no corpo da requisição** |

O caso do `subscribe` era o pior dos cinco: um token que o cliente escolhe qual mandar é um token
que ele pode trocar pelo de outro aluno. Agora sai da sessão, como nas demais.

Etapa aditiva: o header continua sendo aceito, então nada quebrou entre este passo e o 2.4.

#### 2.2 `GET /api/user/me` (nova)

O substituto de decodificar o JWT no navegador. Lê o cookie no servidor, decodifica com
`jwtDecoder.ts` (o único lugar do projeto autorizado a ler JWT) e devolve **só os claims de
exibição**:

```
200 → { id, nome, email, tier, newsletter }
401 → { error: 'Não autorizado.' }     // sem cookie, token ilegível ou `exp` vencido
```

- `tier` já sai normalizado por `normalizeTier` — a grafia que o BFF emite deixou de ser problema
  do cliente.
- **Nunca devolve `token`, `exp`, `iat` nem o payload cru.** Um teste trava a lista exata de
  chaves da resposta: se o JWT voltasse por aqui, o cliente teria como guardá-lo de novo e a
  proteção seria só aparente.
- **`exp` ausente não invalida.** Nem todo JWT do backend carrega o claim, e esta rota não libera
  acesso a nada — quem julga a validade do token é o BFF, a cada requisição. `exp` vencido, esse
  sim, responde 401.
- Divergência de grafia resolvida na rota: `JWTPayload` declarava `newsletter` e o botão do blog
  lia `newsLetter`. O `[key: string]: any` da interface escondia o erro. A rota aceita as duas.

**`front/src/lib/userClaims.ts` (novo)** — o lado cliente: `fetchUserClaims(signal?)`, que nunca
lança (falha significa "trate como deslogado", nunca "quebre a página"), e `notifyUserSynced()`.
Mora em `lib/` e não em `app/service/` porque roda no navegador, e a regra do `CLAUDE.md` reserva
`service/` para funções de servidor. O tipo é declarado ali em vez de importado da rota, para não
arrastar código de servidor ao bundle.

#### 2.3 As duas rotas pararam de devolver o JWT

| Rota | Antes | Depois |
|---|---|---|
| `api/sync-user/route.ts` | devolvia o corpo do backend inteiro, JWT incluído | grava o cookie e responde `{ ok, id, tipo }` — só o que o cliente usa (analytics) |
| `api/subscriptions/activate/route.ts` | repassava o corpo com `token` | grava o cookie e **remove `token`** do corpo; o resto (`activated`, `status`, `tier`, `expiresAt`) passa igual |

É aqui que o desvio nascia: enquanto o token voltasse ao navegador, apagar o `setItem` só adiaria
o problema até alguém reintroduzi-lo.

Aproveitado no mesmo arquivo: `sync-user` parou de devolver `details: backendData` e
`error: String(e)` ao cliente — mesma classe de vazamento que `bffPayments` já barrava nas rotas
de pagamento. Os detalhes vão para o log do servidor.

#### 2.4 Oito chamadas do cliente pararam de montar `Authorization`

`contexts/UniversityStorage.tsx` · `components/profile/UserConfig.tsx` ·
`components/profile/ProfileClient.tsx` (o `fetcher` do SWR e a consulta de nota de corte) ·
`components/Simula_PRO/NotaCorteConsulta.tsx` ·
`components/games/flash-card_game/functions/flash-cardlogic.ts` (GET e POST) ·
`components/Simula_PRO/SimulationQuizClient.tsx` · `components/blog/SubscribeButton.tsx`
(que também parou de mandar o token no corpo).

**Não foram tocados** os Server Components que leem o cookie direto com `cookies()` —
`EstatisticasDados`, `LibraryUniversityDataServer`, `SimulacaoLoader`, `NotaCorteResultados`.
Servidor lendo o próprio cookie é o caminho certo.

#### 2.5 Três leitores passaram a usar a rota

- **`hooks/useUserTier.ts`** — busca `/api/user/me` em vez de decodificar o `localStorage`.
  **O `setInterval` de 2s morreu**: era leitura de memória, e viraria uma requisição a cada dois
  segundos por aba aberta. Restaram os dois gatilhos que já existiam e que cobrem o caso real —
  `user_synced` (mesma aba: login, ativação) e `storage` (outras abas). Fallback para
  `session.user.tier` quando a rota não responde. A API pública do hook não mudou.
- **`components/blog/SubscribeButton.tsx`** — `newsletter` sai da rota.
- **`components/SyncUserEffect.tsx`** — a checagem "já sincronizei este usuário?" comparava o
  e-mail do JWT do `localStorage` com o da sessão; agora compara o de `/api/user/me`. Os
  analytics (`setUserId`) usam o `{ id, tipo }` que `/api/sync-user` devolve.

#### 2.6 As escritas sumiram, e a cópia velha é apagada

Removidos os três `localStorage.setItem("user_data", ...)`: `SyncUserEffect.tsx`,
`paidPlan/page.tsx` e `usePendingPaymentReconciliation.ts`. Nos dois últimos, o que sobrou foi
`notifyUserSynced()` — o cookie já foi gravado pela rota, e o evento é o que faz o tier valer sem
reload (passo 10 do fluxo).

`PixActivationResponse` perdeu o campo `token`: ele não chega mais.

**Migração.** Parar de escrever não apaga o que já foi escrito — todo aluno que já usou o site
tem a cópia gravada, e ela ficaria lá até o próximo logout. `SyncUserEffect` ganhou um efeito que
roda **uma vez por carregamento, independente do estado da sessão**, e remove a chave legada. A
limpeza do logout foi mantida pelo mesmo motivo.

**Logs.** Três `console.log` que imprimiam os primeiros caracteres do JWT foram apagados
(`api/games/flash-cards`, `api/Nota-corte`, `flash-cardlogic.ts`), mais o de `SimulacaoLoader`,
que agora registra só se o cookie existe.

---

### 3. D3 — nenhuma mudança de código

Validar `gateway` e `paymentId` é responsabilidade do Java. Registrado como critério de aceite em
`docs/Pauta_para_reuniao.md` §2: rejeitar `gateway` fora de `stripe|mercadopago` e `paymentId`
que não seja string não vazia.

Somada à pauta uma pergunta de reunião: **se o Java descobre a gateway pelo próprio `paymentId`,
o front precisa mandar o campo `gateway`?** Em caso negativo o passo 6 encolhe para
`{ paymentId }`. Não mexido sem essa resposta.

---

### 4. Testes

Escritos **antes** da implementação (passo 2 do workflow do `CLAUDE.md`) e rodados até falharem
pelos motivos certos — 49 vermelhos no primeiro run.

**Novos, em `front/src/test/auth/`:**

| Arquivo | O que trava |
|---|---|
| `jwtFalso.ts` | Helper, não é teste. `jwt-decode` não verifica assinatura — um token de teste só precisa das três partes e de um payload legível |
| `user-me-route.test.ts` | 14 casos: 401 sem cookie, com cookie vazio, com token ilegível e com `exp` vencido; token sem `exp` continua valendo; Bearer também vale; **a resposta não tem `token`, `exp`, `iat` nem `tipo`**; a lista exata de chaves; normalização das quatro grafias de tier; desconhecido vira `FREE`; as duas grafias de newsletter; e nenhuma ida ao BFF |
| `route-cookie-auth.test.ts` | 38 casos via `describe.each` sobre as 6 combinações de rota/método: **o cookie sozinho autentica**, o JWT chega ao BFF como Bearer, o header continua valendo, 401 sem nenhum dos dois, cookie vazio não vale, e **nenhum pedaço do JWT aparece no log**. Mais dois casos para o `subscribe`: `token` no corpo é ignorado, e sozinho não autentica |
| `token-nao-vaza.test.ts` | 9 casos: `sync-user` e `activate` gravam o cookie HttpOnly e **não devolvem o JWT no corpo**, inclusive quando o backend manda o token como string crua; erro do backend não vaza detalhe interno; 202 não grava cookie nem carrega token |

**Ajustados:**

- `payment/bff-proxy.test.ts` — o `payer` do boleto no shape novo, e três casos que a denylist não
  cobria: campo de dinheiro com nome inventado (`valor`, `preco`, `desconto`, `price`), a lista
  exata de chaves do corpo encaminhado, e campo estranho dentro de `payer`.
- `payment/activate-proxy.test.ts` — caso novo afirmando que o token vai ao cookie e **não** ao
  corpo.

---

### 5. Validação executada

| Etapa | Comando | Resultado |
|---|---|---|
| Testes unitários | `npm test` | ✅ **137 testes / 7 arquivos** (antes: 66 / 4) |
| Tipagem | `npx tsc --noEmit` | ✅ exit 0 |
| Build de produção | `npm run build` | ✅ compilou; `/api/user/me` na tabela de rotas |

Verificação de que a cópia sumiu do código:

```bash
grep -rn "localStorage.getItem('user_data')\|localStorage.setItem('user_data'" front/src/
# sem resultado
```

Os erros `DYNAMIC_SERVER_USAGE` de `/blog` e `/profile` no log do build e o `ConnectTimeoutError`
de `/api/plans` (o Java ainda não expõe o endpoint) são **pré-existentes**, sem relação com esta
entrega. `npm run lint` segue quebrado de antes — Next 16 removeu `next lint`.

### Roteiro manual pendente

Nenhum teste unitário cobre o cookie real do navegador. Antes de subir:

1. Login → DevTools → Application: `user_data` **não** existe no Local Storage; existe nos
   Cookies, com `HttpOnly` marcado.
2. Console: `localStorage.getItem('user_data')` → `null`.
3. Navegar por perfil, biblioteca, flash cards, nota de corte e estatísticas — é o que valida os
   8 Bearer removidos.
4. Network: nenhuma requisição sai com header `Authorization`.
5. Newsletter: o botão reflete o estado certo e o toggle funciona.
6. Migração: gravar `localStorage.setItem('user_data','x')` à mão, recarregar, conferir que sumiu.
7. Com o Java no ar: pagar e ver o tier mudar sem relogar (agora sem o polling de 2s).

---

### 6. Achados colaterais — registrados, não corrigidos

Cada um tem escopo próprio e nenhum foi introduzido aqui.

| Id | Achado |
|---|---|
| **A1** | `SimulationQuizClient.tsx` chama `/api/simulations/save-result` — **a rota não existe**. O resultado do simulado nunca chegou ao backend |
| **A2** | `flash-cardlogic.ts` faz `POST /api/games/flash-cards`, mas a rota exporta **só `GET`** — responde 405. Os acertos de flash card nunca foram salvos |
| **A3** | Grafia de `newsletter` / `newsLetter` divergente entre a interface do payload e o botão do blog. Contornado na rota nova, aceitando as duas; o contrato com o Java precisa ser fechado |

Comentários de aviso foram deixados nos dois call sites de A1 e A2.

---
---

## Auditoria de conformidade do fluxo de dez passos + fechamento da entrega

**Data:** 2026-08-06 (fechamento da entrega imediatamente abaixo)

### Objetivo

Conferir, arquivo por arquivo, se a cadeia de pagamento que está no working tree implementa
exatamente o fluxo de dez passos definido em [docs/Pauta_para_reuniao.md](docs/Pauta_para_reuniao.md) §2 — e
documentar o que a seção anterior deixou de fora ao descrever a entrega.

O fluxo alvo, ponto a ponto:

```
1.  front    → backend:            { planId: "anual" }
2.  backend  → Stripe/MercadoPago: resolve preço, cria cobrança
3.  backend  → front:              clientSecret (cartão) ou QR code (PIX)
4.  front    ⇄ gateway:            confirma pagamento (cartão nunca passa por nós)
5.  gateway  → front:              paymentId
6.  front    → backend:            { gateway, paymentId }        ← só o id
7.  backend  → Stripe/MercadoPago: "esse pagamento existe e foi pago?"
8.  backend:                       confere titularidade contra a sessão
9.  backend  → banco:              ativa o tier
10. backend  → front:              ok + JWT novo (tier muda sem relogar)
```

---

### 1. Resultado da conferência

**Os dez passos estão implementados como especificado.** O que é responsabilidade do frontend
está no código; o que é responsabilidade do Java está delegado, sem sobra de decisão no Next.

| # | Passo | Onde está | Situação |
|---|---|---|---|
| 1 | `{ planId }` sai do navegador | [page.tsx:343-357](front/src/app/paidPlan/page.tsx#L343-L357) (cartão), [page.tsx:500-516](front/src/app/paidPlan/page.tsx#L500-L516) (PIX), [BoletoForm.tsx:109-125](front/src/components/payment/BoletoForm.tsx#L109-L125) | ✅ com ressalva D1 |
| 2 | Backend resolve preço e cria a cobrança | fora do Next — nenhum SDK de gateway em `src/` | ✅ delegado |
| 3 | `clientSecret` / QR volta ao front | [credit-card/route.ts:37-43](front/src/app/api/process-subscription/credit-card/route.ts#L37-L43), [pix/route.ts:35-41](front/src/app/api/process-subscription/pix/route.ts#L35-L41), [boleto/route.ts:32-38](front/src/app/api/process-subscription/boleto/route.ts#L32-L38) | ✅ 2xx passa inteiro, sem tradução |
| 4 | Cartão vai direto do navegador à gateway | [CreditCardForm.tsx:136-157](front/src/components/payment/CreditCardForm.tsx#L136-L157) — `stripe.confirmPayment` no cliente | ✅ nenhum dado de cartão toca servidor nosso |
| 5 | Gateway devolve o `paymentId` | [CreditCardForm.tsx:157](front/src/components/payment/CreditCardForm.tsx#L157) → [page.tsx:426-430](front/src/app/paidPlan/page.tsx#L426-L430) | ✅ |
| 6 | Front manda **só** `{ gateway, paymentId }` | [activate/route.ts:53-59](front/src/app/api/subscriptions/activate/route.ts#L53-L59), [usePixPaymentStatus.ts:97-103](front/src/hooks/usePixPaymentStatus.ts#L97-L103), [usePendingPaymentReconciliation.ts:49-58](front/src/hooks/usePendingPaymentReconciliation.ts#L49-L58) | ✅ o corpo é desestruturado, nada mais é encaminhado |
| 7 | Backend pergunta à gateway se foi pago | fora do Next | ✅ delegado |
| 8 | Backend confere titularidade contra a sessão | [bffPayments.ts:127-137](front/src/app/service/bffPayments.ts#L127-L137) tira o e-mail do corpo; [bffPayments.ts:87-89](front/src/app/service/bffPayments.ts#L87-L89) manda o JWT do aluno como Bearer | ✅ delegado, com o insumo certo |
| 9 | Backend ativa o tier no banco | fora do Next | ✅ delegado |
| 10 | JWT novo, tier muda sem relogar | [activate/route.ts:63-75](front/src/app/api/subscriptions/activate/route.ts#L63-L75) (cookie), [page.tsx:416-424](front/src/app/paidPlan/page.tsx#L416-L424) + [useUserTier.ts:45-58](front/src/hooks/useUserTier.ts#L45-L58) (`user_synced`) | ✅ com ressalva D2 |

**Prova de que os passos 2 e 7 saíram mesmo do Next:**

```bash
grep -rn "from 'stripe'\|from 'mercadopago'\|STRIPE_SECRET_KEY\|MERCADO_PAGO_ACCESS_TOKEN\|BACKEND_SERVICE_TOKEN\|preapproval" front/src/
# sem resultado

ls front/src/app/api/webhooks
# No such file or directory

ls front/src/app/service
# bffPayments.ts  jwtDecoder.ts  pendingPayment.ts  sessionToken.ts
```

O único ponto do processo que fala com o mundo externo em nome do pagamento é
[callBff](front/src/app/service/bffPayments.ts#L75-L116), e ele só sabe falar com `BACKEND_API_URL`.

---

### 2. Desvios encontrados

Três. Nenhum quebra o fluxo; dois são deliberados e um é dívida antiga que continua aberta.

**D1 — o passo 1 carrega mais que `{ planId }`.** Vai junto um bloco `payer` com nome e CPF
(e, no boleto, o endereço). Não é desvio de responsabilidade: o Mercado Pago exige esses campos
para emitir PIX e boleto, e **nenhum deles fala de dinheiro ou de veredito**. O que define preço
e o que define quem é o titular continuam fora do alcance do navegador —
[stripClientDecisions](front/src/app/service/bffPayments.ts#L146-L166) descarta
`transaction_amount`, `amount`, `amountCents`, `unit_price`, `status`, `tier` e `expiresAt`, e
[stripPayerEmail](front/src/app/service/bffPayments.ts#L127-L137) descarta o e-mail. A regra do
fluxo é "o cliente identifica, o servidor decide", e é ela que está valendo.

**D2 — o passo 10 grava o JWT também no `localStorage`.** A rota grava o cookie `user_data`
HttpOnly corretamente ([activate/route.ts:68-74](front/src/app/api/subscriptions/activate/route.ts#L68-L74)),
mas o cliente grava o mesmo token no `localStorage` em
[page.tsx:419](front/src/app/paidPlan/page.tsx#L419) e
[usePendingPaymentReconciliation.ts:67](front/src/hooks/usePendingPaymentReconciliation.ts#L67),
porque é de lá que [useUserTier](front/src/hooks/useUserTier.ts#L15-L20) lê o tier.

> ⚠️ Isso contraria a regra do `CLAUDE.md`: *"JWTs must never be stored in `localStorage` or
> `sessionStorage` — only in HttpOnly cookies"*. **É dívida anterior a esta entrega** — o hook já
> lia `localStorage` antes da cadeia de pagamento existir —, está registrada como pendência
> desde a auditoria de 2026-08-04 e **segue aberta**. A ativação não a criou; apenas passou a
> alimentá-la. Consertar exige tirar a leitura do tier do `localStorage` inteiro, o que toca
> autenticação além de pagamento.

**D3 — `gateway` e `paymentId` são encaminhados sem validação de tipo.** A rota de ativação
desestrutura e repassa ([activate/route.ts:53-59](front/src/app/api/subscriptions/activate/route.ts#L53-L59)).
Deliberado: validar aqui seria regra de negócio num proxy fino, e o Java precisa validar de
qualquer forma — ele é o único que sabe quais gateways existem. **Vira requisito do lado Java:**
rejeitar `gateway` fora de `stripe|mercadopago` e `paymentId` que não seja string não vazia.

---

### 3. O que a seção anterior não documentou

A entrega abaixo descreve a saída da cadeia de pagamento, mas o working tree tem quatro
mudanças além dela.

**Vitrine de preços passou a consumir `/api/plans`.** `PricingCard.tsx` tinha os valores
escritos no código; agora busca a rota no mount e cai para os literais só se ela falhar
([PricingCard.tsx:341-410](front/src/components/PricingCard.tsx#L341-L410)). Mesmo desenho já
usado em `paidPlan/page.tsx`. Sem isso a landing anunciaria um preço e o checkout cobraria outro
— exatamente a segunda fonte de verdade que o §3 da pauta elimina. Os literais de fallback
(R$ 497,00 e R$ 50,00) **estão desatualizados de propósito**: são um piso de exibição para a
rota fora do ar, não um preço a cobrar.

**Testes k6 movidos para `front/src/test/K6/`.** `test_25/50/75/100.ts` e o `README.md` saíram da
raiz de `src/test/`. Motivo mecânico: o `include` do Vitest é `src/test/**/*.test.ts` — os
scripts k6 não usam o sufixo `.test.ts` e nunca seriam coletados —, mas manter os dois tipos de
arquivo misturados na mesma pasta confunde quem chega. Os testes unitários ficam em
`src/test/payment/`.

**`front/vitest.config.mts` (novo) e os scripts `test` / `test:watch`.** O `CLAUDE.md` ainda
registra *"There is no test runner configured yet"* — deixou de ser verdade nesta entrega.
Ambiente `node`, alias `@` apontando para `src/`, `globals: false` (os testes importam
`describe`/`it`/`expect` explicitamente). `vitest@^4.1.10` em `devDependencies`.

**`PAUTA.md` saiu da raiz e virou [docs/Pauta_para_reuniao.md](docs/Pauta_para_reuniao.md).**
Junto foi apagado o `docs/RFC-autenticacao-webhooks.md` criado em 2026-08-04: ele existia para
decidir como o salto Next→Java se autenticaria nos webhooks, e esse salto deixou de existir
quando o webhook passou a apontar direto para o Java. A nota descrevia um problema que a
arquitetura nova não tem.

---

### 4. Validação re-executada nesta conferência

| Etapa | Comando | Resultado |
|---|---|---|
| Testes unitários | `npm test` | ✅ **66 testes / 4 arquivos**, 892ms |
| Tipagem | `npx tsc --noEmit` | ✅ limpo, exit 0 |
| Build de produção | `npm run build` | ✅ compilou; `/api/webhooks/*` não aparece na tabela de rotas |

Arquivos de teste ativos: `bff-proxy.test.ts`, `activate-proxy.test.ts`, `pending-payment.test.ts`,
`tier-normalization.test.ts`.

**Duas observações do build, nenhuma bloqueante:**

1. `/api/plans` aparece como `ƒ (Dynamic)` e não como estático, apesar do `revalidate = 300`. A
   causa está no próprio log: a pré-renderização tentou falar com o `BACKEND_API_URL` e levou
   `ConnectTimeoutError` em `26.251.198.75:8081`, porque o Java ainda não expõe `/plans`. A rota
   respondeu o 503 genérico em vez de estourar — **o caminho de erro do proxy foi exercitado sem
   querer, e se comportou como desenhado**. Com o endpoint no ar, o Next volta a prerenderizar.

2. Os erros `DYNAMIC_SERVER_USAGE` no log são de `/blog` e `/profile` (uso de `headers`),
   **pré-existentes e sem relação** com a cadeia de pagamento.

`npm run lint` continua quebrado de antes desta entrega — `next lint` foi removido no Next 16 e o
ESLint 9 derruba com `TypeError: Converting circular structure to JSON` no
`eslint-config-next` do projeto. Fora de escopo, registrado desde a entrega anterior.

---

### 5. Conclusão

O frontend está pronto e conferido contra o fluxo. **O checkout não funciona até o Java subir os
cinco endpoints** — custo assumido do corte big bang, detalhado na seção 10 da entrega abaixo. A
esse checklist somam-se dois itens vindos desta auditoria:

- **validar `gateway` e `paymentId`** na entrada de `POST /subscriptions/activate` (desvio D3);
- **fechar a grafia do claim `tipo`**. O front normaliza `"Simula PRO"`, `"simula_pro"` e
  `"SIMULAPRO"` para o mesmo tier ([jwtDecoder.ts:66-79](front/src/app/service/jwtDecoder.ts#L66-L79)),
  com fail safe para `FREE` — mas normalizar é contorno, não contrato.

Do lado do frontend, permanece aberta a pendência D2 (JWT em `localStorage`), fora do escopo
desta entrega por decisão.

---
---

## Cadeia de pagamento movida para o BFF Java — Next vira proxy fino

**Data:** 2026-08-06

### Motivação

A regra de negócio do pagamento do Simula PRO vivia no Next: ele resolvia o preço na Stripe e no
Mercado Pago, criava a cobrança com os SDKs dos gateways, consultava se o pagamento aconteceu,
conferia a titularidade contra a sessão e só então avisava o Java para ativar o tier. Os webhooks
apontavam para o Next e morriam lá — o BFF Java autentica pelo JWT do aluno, e uma notificação de
gateway não carrega sessão de ninguém.

`docs/Pauta_para_reuniao.md` §2 define o fluxo alvo em dez passos. Esta entrega implementa o lado
do frontend dele: **o navegador manda `planId` e depois `paymentId`; preço, status, titularidade
e tier passam a sair inteiramente do Java.** O Next volta a ser o que o `CLAUDE.md` sempre
definiu — "thin proxies to the Java BFF — they receive, forward, and return. No business logic
lives here". A cadeia de pagamento era o único lugar do projeto que não seguia essa regra.

**Decisões que definiram o desenho** (tomadas com o usuário antes da implementação):

- **Corte big bang.** Nada de feature flag: a cadeia sai do Next nesta entrega. Enquanto o Java
  não expuser os endpoints, o checkout responde 503 — custo aceito da decisão.
- **Três endpoints de checkout no Java**, um por método de pagamento, espelhando as três rotas
  Next que já existiam.
- **Os testes da lógica de gateway são apagados junto com o código que testam.** Consequência
  aceita: os itens 1–7 da tabela de vulnerabilidades da pauta perdem a especificação executável
  que os cobria. O contrato registrado abaixo passa a ser a especificação escrita, e precisa
  virar critério de aceite do lado Java.

---

### 1. Contrato exigido do BFF Java

Todas as respostas replicam exatamente as formas que o cliente já consumia, para que nenhum
componente de tela mudasse de comportamento.

```
GET  {BACKEND_API_URL}/plans                          (público, sem Authorization)
  200 → { plans: [{ id, nome, descricao, amountCents, currency,
                    billingMode, interval, monthlyEquivalentCents }] }

POST {BACKEND_API_URL}/subscriptions/checkout/card     Authorization: Bearer <user_data JWT>
  body → { planId, payer: { first_name, last_name, identification: { type, number } } }
  200  → { clientSecret, billingMode, amountCents, currency, interval }

POST {BACKEND_API_URL}/subscriptions/checkout/pix      Authorization: Bearer <user_data JWT>
  body → { planId, payer: { first_name, last_name, identification: { type, number } } }
  201  → { payment_id, status, qr_code, qr_code_base64 }

POST {BACKEND_API_URL}/subscriptions/checkout/boleto   Authorization: Bearer <user_data JWT>
  body → { planId, payer: { first_name, last_name, identification: { type, number },
                            address: { zip_code, street_name, street_number,
                                       neighborhood, city, federal_unit } } }
  201  → { payment_id, status, boleto_url, boleto_code, due_date }

POST {BACKEND_API_URL}/subscriptions/activate          Authorization: Bearer <user_data JWT>
  body → { gateway: 'stripe'|'mercadopago', paymentId }
  200  → { activated: true,  status: 'paid', tier, expiresAt, token }   ← token = JWT novo
  202  → { activated: false, status: 'pending' }
  403  → titularidade divergente
  404  → gateway não conhece o id
  409  → { activated: false, status: 'failed' }
```

> ⚠️ **Atualizado em 06/08/2026.** O `payer` do boleto era `{ firstName, lastName, docType,
> docNumber }` e foi unificado com o de cartão e PIX — ver a seção de correção dos desvios, no
> topo deste arquivo. O `token` de `/subscriptions/activate` continua vindo do Java, mas **não é
> mais repassado ao navegador**: o Next grava o cookie e remove o campo do corpo.

Duas regras que o Java precisa aplicar e que o Next **não** aplicava:

1. **O e-mail do pagador vem da sessão, nunca do corpo.** Ver item 5 abaixo — corrige um bug
   latente, não é só arquitetura.
2. **Idempotência e dedupe por `(gateway, externalId)` são do Java**, com tabela. O Next não tem
   banco; a deduplicação por lá sempre foi promessa, não garantia (§4.2 da pauta).

---

### 2. Novo módulo de encaminhamento

**`front/src/app/service/bffPayments.ts` (novo).** Concentra o que as cinco rotas de pagamento
passam a fazer, para nenhuma delas repetir `BACKEND_API_URL` + `Authorization: Bearer` +
tratamento de erro à mão (como acontece em `api/Nota-corte/route.ts`).

- `callBff(path, { method, body, userToken, revalidate })` — devolve `{ status, data }`. Nunca
  lança: falha de rede e `BACKEND_API_URL` ausente viram 503, porque uma rota de pagamento
  estourando exceção não diz nada útil a quem está com o cartão na mão.
- **Nada de erro do BFF é repassado ao navegador.** Acima de 2xx a resposta é substituída por
  mensagem genérica do próprio status — o corpo do Java pode carregar host, stack ou nome de
  classe interna, e esta é a única barreira entre ele e a tela do aluno. As mensagens vão em
  `error` **e** `message` porque as telas atuais leem chaves diferentes (cartão e ativação leem
  `error`; PIX e boleto leem `message`).
- Sucesso (2xx) passa inteiro: é o `clientSecret`, o QR code ou o resultado da ativação, e o
  cliente depende do formato exato.
- `stripPayerEmail` / `stripClientDecisions` / `sanitizeCheckoutBody` — funções puras que
  descartam do corpo recebido o e-mail do pagador e os campos `transaction_amount`, `amount`,
  `amountCents`, `unit_price`, `status`, `tier` e `expiresAt`. Redundante com o Java ignorá-los,
  e a redundância é de propósito: nada que fale de dinheiro sai deste processo por conta do que
  o navegador mandou.
- `BFF_PAYMENT_PATHS` — os cinco caminhos do contrato num lugar só.

---

### 3. Rotas convertidas em proxy fino

| Rota | Antes | Depois |
|---|---|---|
| `api/process-subscription/credit-card/route.ts` | 191 linhas: resolvia Price na Stripe, criava/reusava Customer, criava Subscription ou PaymentIntent, montava metadata e três chaves de idempotência | 43 linhas: 401 sem sessão → sanitiza → encaminha |
| `api/process-subscription/pix/route.ts` | 142 linhas: consultava `preapproval_plan` no MP, montava `paymentBody` e metadata, criava o pagamento | 41 linhas, mesmo desenho |
| `api/process-subscription/boleto/route.ts` | 163 linhas, idem + endereço | 41 linhas, mesmo desenho |
| `api/subscriptions/activate/route.ts` | 149 linhas: consultava Stripe/MP, comparava e-mail da cobrança com o da sessão, traduzia estados, chamava o BFF | 76 linhas: dois porteiros, encaminha, grava cookie |
| `api/plans/route.ts` | resolvia os dois Prices na Stripe e calculava o equivalente mensal | encaminha `GET /plans`, sem `Authorization` |

O que **ficou** em cada uma, de propósito:

- **A exigência de sessão** (`readUserToken`) antes de qualquer encaminhamento. É o item 4 da
  tabela de vulnerabilidades da pauta; barrar aqui evita uma ida ao BFF, mas quem realmente
  valida o JWT é o Java.
- **A gravação do cookie `user_data`** em `activate`, quando a resposta traz `token`. Isso é
  mecânica de cookie do Next, não regra de negócio, e é o que faz o passo 10 do fluxo valer — o
  aluno paga e o tier muda sem relogar. Mesmos flags de `api/sync-user/route.ts`.
- **Os status 200/202/403/404/409 repassados sem tradução**, porque `usePixPaymentStatus` e
  `pendingPayment.shouldClearOnStatus` já os interpretam.

Só num `200` o cookie é regravado: num `202` o pagamento ainda está pendente e não existe tier
novo para carregar.

---

### 4. Webhooks removidos do Next

Apagados `api/webhooks/stripe/route.ts` e `api/webhooks/mercadopago/route.ts` (o diretório
`api/webhooks/` saiu junto). Com o Java sendo o dono da relação com a gateway, o webhook aponta
direto para ele e **não existe segundo salto para autenticar** — o problema descrito no RFC não
é resolvido, ele deixa de existir.

**Ação manual pendente:** repontar os webhooks nos painéis da Stripe e do Mercado Pago para a URL
do Java. Enquanto isso não for feito, renovação, cancelamento, inadimplência, estorno e
compensação de boleto continuam sem tratamento — mesma situação de antes desta entrega.

---

### 5. E-mail do pagador deixa de sair do navegador

**Bug latente corrigido de lavagem, não só arquitetura.** `formData.email` em
`paidPlan/page.tsx` é campo de texto livre, inicializado vazio — não vem da sessão. Ele ia para a
metadata da cobrança, e na ativação o Next comparava essa metadata com o e-mail da sessão
NextAuth. Um aluno que digitasse um e-mail diferente do da conta gerava uma cobrança que a
própria ativação depois rejeitava com **403: pagava e não recebia acesso**, sem nada quebrar
visivelmente.

Com o Java tirando o e-mail da sessão que ele mesmo autentica, o passo 8 (titularidade) vira
tautologicamente seguro e o caso desaparece.

**Arquivos.** `paidPlan/page.tsx` (payloads de `createCardIntent`, `processPixPayment` e a prop
`payerData` do boleto); `components/payment/BoletoForm.tsx` (campo `email` removido da interface
`PayerData` e do corpo enviado).

O campo de e-mail continua no formulário para contato e exibição — deixou apenas de ser insumo da
cobrança.

---

### 6. Camada de serviço de gateway removida

| Arquivo apagado | O que fazia |
|---|---|
| `src/lib/stripe.ts` | cliente Stripe server-side (`STRIPE_SECRET_KEY`) |
| `src/app/service/planCatalog.ts` | catálogo de preços na Stripe |
| `src/app/service/mercadoPagoCatalog.ts` | catálogo de preços no Mercado Pago |
| `src/app/service/stripePaymentVerification.ts` | consulta de PaymentIntent (passo 7) |
| `src/app/service/mercadoPagoPaymentVerification.ts` | consulta de Payment (passo 7) |
| `src/app/service/paymentVerification.types.ts` | tipos exclusivos dos dois acima |
| `src/app/service/mercadoPagoSignature.ts` | verificação HMAC do webhook do MP |
| `src/app/service/idempotency.ts` | chave de idempotência das criações de cobrança |
| `src/app/service/subscriptionActivation.ts` | chamada ao BFF, substituída por `bffPayments.ts` |

Os **dois catálogos de preço independentes** (§3 da pauta) somem com eles: trocar um preço
deixa de exigir lembrar de mexer em dois painéis.

**Continuam existindo:** `sessionToken.ts` (lido pelas rotas proxy), `jwtDecoder.ts` (decodifica
o JWT novo; `normalizeTier` segue aceitando as variantes de grafia porque a grafia oficial do
tier ainda é ponto de decisão em aberto), `pendingPayment.ts` (decisões puras do boleto, não fala
com gateway).

`usePixPaymentStatus` e `usePendingPaymentReconciliation` **não mudaram**: continuam mandando só
`paymentId` para `/api/subscriptions/activate`, agora proxy. O polling do PIX segue valendo pela
confirmação na hora; a reconciliação do boleto passa de único caminho de ativação a rede de
segurança do intervalo entre o webhook chegar ao Java e o aluno voltar ao site — os comentários
dos dois arquivos foram atualizados para dizer isso.

---

### 7. Dependências e variáveis de ambiente

**Removidas de `front/package.json`:** `stripe`, `mercadopago` e `@mercadopago/sdk-react` (esta
última já era dependência morta — nenhum import em `src/`). `npm install --legacy-peer-deps`
removeu 5 pacotes.

**Mantidas:** `@stripe/stripe-js` e `@stripe/react-stripe-js` — são o Payment Element, que roda
no navegador e é o passo 4 do fluxo (o cartão vai direto do navegador para a gateway).

**Saem do `.env` do Next** e passam a viver só no Java: `STRIPE_SECRET_KEY`,
`STRIPE_PRICE_ANUAL`, `STRIPE_PRICE_MENSAL`, `STRIPE_WEBHOOK_SECRET`,
`MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_PREAPPROVAL_ANUAL`,
`MERCADO_PAGO_PREAPPROVAL_MENSAL`, `MERCADO_PAGO_WEBHOOK_SECRET` e `BACKEND_SERVICE_TOKEN`
(esta última nunca chegou a existir de fato).

**Fica** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — chave pública, exigida pelo `loadStripe` no
`CreditCardForm.tsx`.

---

### 8. Testes

**Apagados** (14 arquivos, 154 testes) por testarem código que saiu do repositório:
`plan-catalog`, `mercadopago-catalog`, `pix-amount-guard`, `idempotency`, `mercadopago-signature`,
`mercadopago-webhook`, `stripe-webhook`, `stripe-credit-card-route`, `mercadopago-routes`,
`subscription-activation-service`, `plans-route`, `credit-card-auth`, `gateway-routing`,
`subscription-activate-route`.

**Escritos antes da implementação** (passo 2 do workflow do `CLAUDE.md`), com `fetch` global
mockado:

- **`src/test/payment/bff-proxy.test.ts`** — 39 testes. Roda a mesma bateria de 13 casos contra
  as três rotas de cobrança via `describe.each`, mais o catálogo. Trava: 401 sem sessão e sem
  chamar o BFF; cookie `user_data` vazio não vale; `Authorization: Bearer` também vale; URL,
  método, `cache: 'no-store'` e Bearer corretos; `planId` encaminhado; **e-mail nunca
  encaminhado**; `transaction_amount`/`amount`/`amountCents`/`status` descartados mesmo quando o
  cliente insiste; sucesso repassado sem traduzir; erro do BFF virando mensagem genérica sem
  vazar stack nem IP; 503 sem `BACKEND_API_URL`; 503 com o BFF fora do ar; 400 em corpo ilegível;
  e `/api/plans` encaminhando **sem** `Authorization`.
- **`src/test/payment/activate-proxy.test.ts`** — 13 testes: os dois porteiros (NextAuth e JWT do
  backend), encaminhamento com Bearer, cookie `user_data` gravado só em `200` com `token` e com
  `httpOnly`, `202` não gravando cookie, repasse de 202/403/404/409 sem vazar corpo do Java, e os
  dois caminhos de 503.

**Intocados:** `pending-payment.test.ts` e `tier-normalization.test.ts` (só comentários de
referência atualizados, já que apontavam para arquivos apagados).

---

### 9. Validação executada

| Etapa | Comando | Resultado |
|---|---|---|
| Testes unitários | `npm test` | ✅ 66 testes / 4 arquivos, todos verdes |
| Build de produção | `npm run build` | ✅ Compilou e passou no TypeScript. `/api/webhooks/*` não aparece mais na tabela de rotas |
| Lint | `npx eslint` | ❌ Falha **pré-existente**, não introduzida aqui |

O build exercitou o caminho de erro do proxy sem querer: a geração estática de `/api/plans`
tentou falar com o `BACKEND_API_URL` configurado, que ainda não expõe `/plans`, e a rota
respondeu o 503 genérico em vez de estourar — que é exatamente o comportamento desenhado.

**Lint.** `npm run lint` executa `next lint`, comando removido no Next.js 16. Chamar o ESLint
direto falha com `TypeError: Converting circular structure to JSON` dentro de
`@eslint/eslintrc/lib/shared/config-validator.js` — incompatibilidade entre `eslint@9.27.0` e o
`eslint-config-next` do projeto. Confirmado que o erro acontece igualmente em arquivo não tocado
por esta mudança (`src/lib/utils.ts`). Já estava registrado como pendência na entrega anterior;
segue fora de escopo.

**Verificação manual de que a cadeia saiu do Next:**

```bash
grep -rn "from 'stripe'\|from 'mercadopago'\|STRIPE_SECRET_KEY\|MERCADO_PAGO_ACCESS_TOKEN" front/src/
# sem resultado
```

---

### 10. O que fica pendente do lado Java

Sem isto no ar, **o checkout não funciona** — é o custo assumido do corte big bang:

- os três endpoints de checkout, `GET /plans` e `POST /subscriptions/activate`;
- resolução de preço nas duas fontes (Price da Stripe, `preapproval_plan` do MP);
- verificação de pagamento nas duas gateways: status, plano e titularidade contra a sessão;
- verificação de assinatura dos dois webhooks (HMAC no MP, `constructEvent` na Stripe);
- idempotência e dedupe por `(gateway, externalId)`, com tabela;
- ativação, renovação e revogação de tier, com histórico;
- repontamento dos webhooks nos painéis da Stripe e do Mercado Pago.

Os itens 1–7 da tabela de vulnerabilidades da pauta precisam ser reimplementados lá. O contrato
da seção 1 deste documento é a especificação escrita do que precisa existir do outro lado.

---
---

## Correções na cadeia de pagamento — auditoria do Simula PRO

**Data:** 2026-08-04

### Motivação

Auditoria completa da cadeia de pagamento (Stripe para cartão, Mercado Pago para PIX e boleto)
encontrou sete problemas. Quatro quebravam a ativação de tier ou expunham rota de cobrança em
produção; três eram pendências já registradas no README que continuavam abertas.

A restrição que definiu o desenho das correções: **não existe `BACKEND_SERVICE_TOKEN`**. O BFF
Java autentica pelo JWT do aluno (`user_data`), e os webhooks — chamadas servidor-a-servidor da
Stripe e do Mercado Pago — não carregam cookie nem sessão. Consequência: o boleto, que só
reconciliava por webhook, **nunca ativava tier**.

Onde deu para contornar sem backend novo, contornou-se. Onde não deu, o problema foi escrito
numa nota de decisão em vez de resolvido por conta própria.

**Fora de escopo por decisão:** JWT em `localStorage` (problema #7). Toca autenticação além de
pagamento; segue registrado como pendência no README.

---

### 1. Rota de cartão aceitava POST anônimo

**Problema.** `pix/route.ts` e `boleto/route.ts` chamavam `readUserToken` e respondiam 401.
`credit-card/route.ts` não tinha guard nenhum: um POST anônimo criava Customer e Subscription
**de verdade** na conta da Stripe, com o e-mail que o corpo mandasse. O README afirmava o
contrário ("as três rotas exigem o cookie `user_data`").

**Correção.** Guard com `readUserToken` logo após a checagem de `STRIPE_SECRET_KEY`, antes de
qualquer chamada ao gateway — um 401 tardio já teria criado o Customer. Resposta `{ error }`,
padrão do arquivo.

**Arquivos.** `src/app/api/process-subscription/credit-card/route.ts`;
`src/app/api/process-subscription/README.md` (afirmação corrigida, com nota do que era falso).

**Testes.** `src/test/payment/credit-card-auth.test.ts` (novo): 401 sem cookie com asserção de
que **nenhum** mock da Stripe foi chamado; cookie vazio não vale como sessão; erro não vaza
detalhe interno; cookie e `Authorization: Bearer` liberam.
`stripe-credit-card-route.test.ts` passou a mandar cookie no `buildRequest`.

---

### 2. Webhook do Mercado Pago usava um e-mail que o gateway reescreve

**Problema.** O webhook lia a titularidade de `paymentDetails.payer?.email`. O próprio código
documentava em `mercadoPagoPaymentVerification.ts` que o Mercado Pago **reescreve** esse campo
com o e-mail de quem efetivamente pagou — em sandbox, um usuário de teste; em produção,
qualquer terceiro que pague o QR. A rota de ativação já usava o `payer_email` gravado na
criação da cobrança. Os dois caminhos que precisam convergir mandavam e-mails diferentes ao
BFF.

**Correção.** O handler passou a delegar a consulta a `verifyMercadoPagoPayment` — a mesma
função da rota de ativação. Além do e-mail, isso elimina a duplicação de lógica (status,
fallback de `plan_id` para `external_reference`, `access_months`, `expiresAt`) e garante o
mesmo `externalId` nos dois caminhos, que é a chave de dedupe do BFF.

**Arquivos.** `src/app/api/webhooks/mercadopago/route.ts` — o import do SDK `mercadopago` saiu
do arquivo.

**Testes.** `mercadopago-webhook.test.ts`: o mock continua no limite do SDK, então o teste
exercita o verificador real. Dois casos novos — `payer.email` divergente de
`metadata.payer_email` (o que vai ao BFF é o da metadata) e `externalId` idêntico ao que a rota
de ativação produziria.

---

### 3. Grafia do tier deixava o aluno pago como FREE

**Problema.** `useUserTier` comparava `tipo === "SIMULAPRO"`. O JSDoc do contrato em
`subscriptionActivation.ts` e o `CLAUDE.md` diziam `"Simula PRO"`. Como o endpoint Java ainda
não existe, a grafia real **não está acordada** — e uma comparação exata contra a grafia errada
faz o aluno pagar e continuar FREE na tela. Falha cara e silenciosa: o dinheiro entra, o BFF
ativa, e só a comparação de string no cliente falha.

**Correção.** Função pura `normalizeTier(tipo: unknown): Tier` em `jwtDecoder.ts` — a regra do
`CLAUDE.md` manda leitura de JWT viver só ali. Normaliza com
`toUpperCase().replace(/[\s_-]/g, '')`, então `"Simula PRO"`, `"simula_pro"` e `"SIMULAPRO"`
chegam ao mesmo lugar. **Fail safe:** desconhecido vira `FREE` — errar para menos nega acesso a
quem pagou, o que é visível e corrigível; errar para mais dá conteúdo pago de graça.

Somada `isPaidTier(tier)`. O tipo `Tier` migrou de `useUserTier.ts` para `jwtDecoder.ts` e é
re-exportado, sem quebrar importadores.

**Arquivos.** `src/app/service/jwtDecoder.ts`, `src/hooks/useUserTier.ts` (dois casts viraram
chamadas a `normalizeTier`), `src/app/service/subscriptionActivation.ts` (JSDoc deixou de
afirmar uma grafia não confirmada).

**Testes.** `tier-normalization.test.ts` (novo): seis variantes de escrita, demais tiers,
ausente/vazio/desconhecido/não-string, e substring (`"SIMULAPROX"` → `FREE`).

---

### 4. Webhook do Mercado Pago sem validação de assinatura

**Problema.** Aceitava qualquer POST anônimo. O da Stripe já validava via
`stripe.webhooks.constructEvent`; o SDK do Mercado Pago não oferece equivalente.

**Correção.** `src/app/service/mercadoPagoSignature.ts` (novo), função pura
`verifyMercadoPagoSignature`:

- parseia `x-signature: ts=<unix>,v1=<hex>`, tolerando espaços;
- monta o manifesto `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` com `data.id` em
  minúsculas, como manda a doc do MP;
- HMAC-SHA256 com `MERCADO_PAGO_WEBHOOK_SECRET`;
- compara com `timingSafeEqual`, precedido de checagem de tamanho — `v1` vem de fora e a função
  do Node lança com buffers de tamanhos diferentes;
- rejeita `ts` fora de ±5 min, contra replay: o manifesto não muda, então sem janela uma
  notificação legítima capturada valeria para sempre.

**Fail closed em tudo** — segredo ausente, header malformado, `ts` fora da janela ou hash
divergente respondem **401 sem consultar o gateway**. A verificação acontece depois de
descartar eventos que não geram efeito (não-pagamento, sem `data.id`) e antes de qualquer
chamada externa.

**Nova variável obrigatória:** `MERCADO_PAGO_WEBHOOK_SECRET` (painel MP → Webhooks).

**Testes.** `mercadopago-signature.test.ts` (novo, 13 casos): assinatura íntegra, espaços,
`dataId` em maiúsculas, hash adulterado, outro segredo, outro `data.id`, `x-request-id`
divergente, `ts` velho e futuro, header malformado, segredo ausente, e `v1` de tamanho
diferente sem lançar. Em `mercadopago-webhook.test.ts`, três casos ponta a ponta.

---

### 5. Sem chave de idempotência

**Problema.** Duplo clique ou retry de rede gerava cobrança duplicada nos dois gateways — dois
QR codes de PIX, dois boletos registrados, duas assinaturas.

**Correção.** `src/app/service/idempotency.ts` (novo): `buildIdempotencyKey` deriva SHA-256 de
`(e-mail normalizado, plano, operação, janela de 10 min)`. Janela larga o bastante para cobrir
duplo clique e reload, curta o bastante para quem desistiu e voltou depois não ficar preso à
cobrança antiga. O hash não é por sigilo — é porque a chave viaja ao gateway e aparece em log e
dashboard; sem ele, o e-mail do aluno iria junto. `now` entra por parâmetro para o teste não
depender do relógio.

Uma chave por operação (`stripe:customer`, `stripe:sub`, `stripe:pi`, `pix`, `boleto`), porque
a Stripe recusa a mesma chave com corpo diferente e o checkout de cartão faz três chamadas.

**Arquivos.** As três rotas de `process-subscription/` — `idempotencyKey` no segundo argumento
das chamadas da Stripe, `requestOptions.idempotencyKey` no `payment.create` do MP.

**Testes.** `idempotency.test.ts` (novo): estabilidade a 3s de distância, chave nova na janela
seguinte, variação por aluno/plano/operação, normalização de e-mail, formato hex de 64 e
ausência de PII. Asserções somadas em `pix-amount-guard.test.ts` e `credit-card-auth.test.ts`
de que a chave chega ao SDK.

---

### 6. Ativação evaporava em silêncio · boleto nunca ativava

**Problema (6a).** Sem Bearer, `postToBff` fazia `console.error` e devolvia `null`. Só os
webhooks caem nesse caso. O efeito: o webhook respondia **200**, o gateway dava a notificação
por entregue e nunca reenviava. O aluno pagava e a ativação sumia sem nada quebrar
visivelmente.

**Correção (6a).** `postToBff` **lança**. O webhook responde 5xx, Stripe e MP reenfileiram, e a
ativação fica pendente no dashboard em vez de perdida. A rota `/api/subscriptions/activate` não
é afetada: ela garante `userToken` antes de chamar.

**Problema (6b).** Boleto compensa em dias e não tem polling. Sem webhook funcional, **quem
pagava boleto nunca virava PRO** — não havia caminho nenhum.

**Correção (6b).** Reconciliação no próximo acesso, sem backend novo:

- `BoletoForm` grava `{ gateway, paymentId, criadoEm }` em `localStorage` sob
  `pending_payment` ao gerar o boleto. Não é credencial — é o mesmo id que já aparece na tela,
  e sozinho não prova nada.
- `usePendingPaymentReconciliation` (novo hook), montado em `SyncUserEffect` (global em
  `layout.tsx`), pergunta **uma vez por carregamento de página**, já autenticado. Não é
  polling: `202` mantém a entrada para a próxima visita, porque um boleto leva dias.
- Em `200`, grava o token novo e dispara `CustomEvent('user_synced')` — o mesmo par que
  `SyncUserEffect` já usa, então o tier muda sem reload.
- A entrada é limpa no logout junto com `user_data`: reconciliação é por aluno, e deixar a
  entrada de um faria a próxima sessão perguntar pelo pagamento de outro e levar 403.

O modelo de confiança é o que já existia: o navegador manda só o `paymentId`, e
`/api/subscriptions/activate` reconsulta o Mercado Pago e confere titularidade contra a sessão
antes de liberar.

**Arquivos.** `src/app/service/subscriptionActivation.ts`,
`src/app/service/pendingPayment.ts` (novo), `src/hooks/usePendingPaymentReconciliation.ts`
(novo), `src/components/SyncUserEffect.tsx`, `src/components/payment/BoletoForm.tsx`.

**Testes.** `pending-payment.test.ts` (novo) cobre as decisões puras — `parsePendingPayment`
contra `localStorage` corrompido ou em formato antigo, TTL de 7 dias, e quais status limpam a
entrada (200/401/403/404/409 sim; 202 e 5xx não). Em
`subscription-activation-service.test.ts`, a expectativa antiga ("sem token não lança") foi
invertida, com casos novos para revogação e para a rota síncrona seguir funcionando.

---

### 7. Nota de decisão: autenticação dos webhooks

Criado `docs/RFC-autenticacao-webhooks.md` — nota para decisão dos sócios, não documentação de
código. Registra que o problema não é "acionar uma rota" (o salto Stripe→Next funciona), e sim
o salto Next→Java, onde não há credencial para repassar.

Cobre: o que já funciona (primeira compra de todos os métodos), o que continua sem solução
(renovação, cancelamento, inadimplência), o impacto de receita nos dois sentidos, e cinco
opções em duas famílias — credencial própria do servidor (service token, mTLS) versus reuso da
credencial do aluno (persistir JWT, generalizar a reconciliação). Recomenda **service token**,
única que cobre revogação e mais barata agora que o endpoint Java ainda está por escrever.

---

### Verificação

```
npx vitest run   → 16 arquivos, 176 testes, todos verdes (antes: 11 arquivos, 125 testes)
npm run build    → sem erro de tipagem ou build
```

Roteiros manuais somados ao README de pagamentos: 401 na rota de cartão sem sessão, 401 no
webhook do MP sem assinatura (com o `curl` que assina de verdade, para o caminho feliz), e a
verificação ponta a ponta da reconciliação de boleto pelo DevTools.

### Arquivos criados

| Arquivo | Papel |
|---|---|
| `docs/RFC-autenticacao-webhooks.md` | nota de decisão dos webhooks |
| `front/src/app/service/mercadoPagoSignature.ts` | verificação HMAC do `x-signature` |
| `front/src/app/service/idempotency.ts` | derivação da chave de idempotência |
| `front/src/app/service/pendingPayment.ts` | decisões puras da reconciliação de boleto |
| `front/src/hooks/usePendingPaymentReconciliation.ts` | efeito da reconciliação |
| `front/src/test/payment/credit-card-auth.test.ts` | sessão e idempotência da rota de cartão |
| `front/src/test/payment/mercadopago-signature.test.ts` | assinatura do webhook |
| `front/src/test/payment/idempotency.test.ts` | chave de idempotência |
| `front/src/test/payment/pending-payment.test.ts` | reconciliação de boleto |
| `front/src/test/payment/tier-normalization.test.ts` | grafia do tier |

### Pendências que permanecem

- **JWT em `localStorage`** — fora de escopo por decisão; toca autenticação além do checkout.
- **Autenticação dos webhooks** — aguarda a decisão do RFC.
- **Grafia de `tipo`** — o front normaliza, mas o contrato com o Java precisa ser fechado.
- **Migração para Checkout Sessions da Stripe** — pendência aceita, não bloqueia nada.

---

## Ativação de tier na tela de pagamento concluído (cartão + PIX)

**Data:** 2026-08-04

### Motivação

Nenhum pagamento aprovado alterava o tier do usuário. `activateUserTier` era stub `TODO(BFF)`
— só escrevia `console.info` — e os dois webhooks convergiam para lá sem efeito. **Um aluno
que pagava R$ 47,50 continuava `FREE`**, e continuaria mesmo relogando, porque o BFF nunca
soube da compra.

Além disso, só o cartão chegava na terceira tela do checkout. O PIX gerava o QR code e a tela
ficava parada para sempre: mesmo com o pagamento compensado, o aluno nunca via confirmação.

Esta entrega fecha o caminho síncrono — o aluno vira PRO na hora, sem relogar — mantendo os
webhooks como reconciliação assíncrona (boleto, renovação mensal, navegador fechado).

### Modelo de confiança

O ponto central, porque a rota é disparada pelo navegador e seria trivial de forjar:

| O navegador envia | O servidor busca no gateway |
|---|---|
| `{ gateway, paymentId }` — só o identificador | status, valor, plano, meses de acesso, e-mail do pagador |

Status `succeeded`/`approved` só conta se vier da Stripe/Mercado Pago. `planId` e `expiresAt`
saem da `metadata` gravada na **criação** da cobrança, não do que o cliente mandar depois.
Titularidade: e-mail da cobrança × e-mail da sessão NextAuth — divergiu, 403.

### Correção de segurança que virou pré-requisito

`transaction_amount` de PIX e boleto vinha do corpo da requisição (pendência #1 do README).
Era pendência aceita enquanto essas rotas só criavam cobrança. Com o PIX passando a ativar
tier, viraria porta aberta: `{"transaction_amount": 0.01}` compraria Simula PRO por um
centavo.

O valor passou a sair do `preapproval_plan` cadastrado no painel do Mercado Pago.

### Arquivos novos

**`front/src/app/service/mercadoPagoCatalog.ts`** — `resolveMercadoPagoPlan(planId)` lê
`GET /preapproval_plan/{id}` e devolve `auto_recurring.transaction_amount` em centavos. Ids
em `MERCADO_PAGO_PREAPPROVAL_ANUAL` / `_MENSAL`, espelhando o padrão `priceIdEnvVar` da
Stripe. **Fail closed:** variável ausente, plano inativo, plano de outra conta ou rede fora
lançam — a rota responde 503 em vez de cobrar. Cair para um valor padrão reabriria o buraco
que a função fecha.

> Cobrança avulsa de um plano recorrente é intencional: as rotas seguem na Payments API, e o
> `preapproval_plan` entra só como catálogo de preço. Migrar para assinatura de verdade
> (`POST /preapproval` + redirect) derrubaria o QR in-page e o polling.

**`front/src/app/service/paymentVerification.types.ts`** — `VerifiedPayment` e `PaymentState`
(`paid` | `pending` | `failed`). Arquivo só de tipos de propósito: um barril comum arrastaria
o SDK do Mercado Pago para dentro do webhook da Stripe, quebrando a separação de gateways.

**`front/src/app/service/stripePaymentVerification.ts`** — `verifyStripePayment` +
`extractStripeMetadata` / `extractStripeEmail` / `readBillingFromMetadata`.

**`front/src/app/service/mercadoPagoPaymentVerification.ts`** — `verifyMercadoPagoPayment`.

**`front/src/app/service/sessionToken.ts`** — `readUserToken(req)`, para não repetir parser de
cookie em quatro rotas. Lê `Authorization: Bearer` e cai para o cookie `user_data`, mesma
ordem de `Nota-corte/route.ts`, mas a partir do próprio `Request` — o que mantém as rotas
testáveis fora do contexto de request do Next.

**`front/src/app/api/subscriptions/activate/route.ts`** — a rota da tela 3:

| Situação | Resposta |
|---|---|
| Sem sessão NextAuth ou sem `user_data` | 401 |
| Corpo inválido / gateway desconhecido | 400 |
| Gateway não conhece o id | 404 |
| E-mail da cobrança ≠ e-mail da sessão | 403 |
| Pagamento pendente (PIX não pago, 3-D Secure aberto) | 202 `{ status: 'pending' }` |
| Estado terminal | 409 `{ status: 'failed' }` |
| Pago e BFF confirmou | 200 `{ activated: true, tier, token? }` |
| Pago e BFF sem o endpoint | 202 `{ activated: false, pending: true }` |

**`front/src/hooks/usePixPaymentStatus.ts`** — polling da rota enquanto o QR está na tela: 5s
nos 2 primeiros minutos, 10s depois, teto de 30 min (validade do código PIX). Pausa com
`document.hidden` e retoma no `visibilitychange` — o aluno sai da aba para pagar no app do
banco, esse é o caso comum e não a exceção. `AbortController` e limpeza de timer no unmount.

### Arquivos alterados

**`front/src/app/service/subscriptionActivation.ts`** — deixou de ser stub. Novo `postToBff`
com duas políticas de erro **opostas de propósito**:

- `404`/`501` não lançam: o endpoint pode não existir ainda no backend Java, e isso não pode
  derrubar o checkout de quem já pagou
- qualquer outro erro lança, para o webhook responder 5xx e o gateway reenviar

`TierActivationInput` ganhou `userToken?` — a rota manda o JWT do aluno, os webhooks caem para
`BACKEND_SERVICE_TOKEN`. O campo nunca vai no corpo, só no `Authorization`.

**`front/src/app/api/webhooks/stripe/route.ts`** — correção de um bug latente: `buildInput`
lia `object.metadata`, que vem **vazia** em `invoice.paid` de assinatura. A metadata é gravada
na Subscription e vive em `subscription_details.metadata`; toda renovação mensal ativaria com
`planId: null`. Passou a usar `extractStripeMetadata`, com busca em cascata.

**`front/src/app/api/process-subscription/pix/route.ts` e `.../boleto/route.ts`**

- valor de `resolveMercadoPagoPlan(planId)`; `transaction_amount` do corpo é lido e descartado
- sessão obrigatória → 401 (pendência #2)
- `metadata.payer_email` gravado na criação. **Motivo:** a titularidade não pode depender de
  `payment.payer.email`, que o Mercado Pago reescreve com o e-mail de quem efetivamente pagou
  — em sandbox, obrigatoriamente outro usuário de teste
- boleto: `MERCADO_PAGO_ACCESS_TOKEN` saiu do escopo de módulo (pendência #5); sem a chave a
  rota respondia falhando no carregamento, agora devolve 500 tratado
- erros deixaram de repassar a mensagem original do gateway

**`front/src/components/payment/CreditCardForm.tsx`** — `onSuccess` passou a receber
`paymentIntent.id`.

**`front/src/app/paidPlan/page.tsx`**

- `confirmedPayment` guarda de qual gateway/id veio a compra
- `activationState` (`idle` | `activating` | `active` | `pending`) reflete a **ativação**, não
  o pagamento — o dinheiro já entrou nos três casos
- efeito de ativação roda só com `currentPage === 'payment-success'`, com `useRef` de guarda
  contra StrictMode
- PIX pago avança sozinho para a tela 3, reaproveitando a resposta do polling em vez de
  chamar a rota de novo
- em `pending`, o texto explica que a liberação pode levar minutos e que não é preciso pagar
  de novo — nunca um erro alarmante para quem já pagou

**`front/src/components/payment/PixForm.tsx`** — nova prop `waitingStatus` com banner de
"Aguardando confirmação" / "Pagamento identificado!" / "Código expirado".

**`front/src/hooks/useUserTier.ts`** — passou a escutar `CustomEvent('user_synced')`. O evento
`storage` só dispara em outras abas; na mesma aba (caso de `/paidPlan`) o tier mudava só no
próximo ciclo do polling de 2s.

**`front/src/components/payment/BoletoForm.tsx`** — parou de enviar `transaction_amount`.

### Testes

`npm run test` — **11 arquivos, 125 testes, todos passando**. Novos:

| Arquivo | O que protege |
|---|---|
| `mercadopago-catalog.test.ts` | preço vem do `preapproval_plan`; falha lança em vez de improvisar valor |
| `pix-amount-guard.test.ts` | corpo com `0.01` não muda a cobrança; 401 sem sessão; 503 com catálogo fora |
| `subscription-activation-service.test.ts` | Bearer certo por caminho; 5xx propaga, 404/501 não |
| `subscription-activate-route.test.ts` | 401/400/403/404/202/409/200; cookie reescrito; dedupe por `externalId` |

Ajustados: `stripe-webhook.test.ts` (caso `subscription_details.metadata`) e
`mercadopago-routes.test.ts` (cookie de sessão + catálogo mockado).

`npm run build` passa; `npx tsc --noEmit` limpo.

> `npm run lint` está quebrado **de antes desta entrega**: o projeto está em Next 16, que
> removeu `next lint`, e o `.eslintrc` tem uma estrutura circular que derruba o ESLint 9.
> Não foi tocado aqui.

### Idempotência

Rota e webhook chegam ao BFF com o mesmo `(gateway, externalId)`: id da invoice para
assinatura (igual a `invoice.paid`), id do PaymentIntent para cobrança avulsa (igual a
`payment_intent.succeeded`), `payment_id` no Mercado Pago. A dedupe é responsabilidade do
backend Java.

### O que ainda depende do backend

O endpoint `POST {BACKEND_API_URL}/subscriptions/activate` **ainda não existe no BFF Java**.
Toda a cadeia do frontend está pronta e testada; enquanto o backend não subir, a rota responde
202, o checkout não quebra e o log registra a intenção. Nenhum caminho anônimo ou de terceiro
consegue ativar.

O BFF precisa: aceitar Bearer tanto do JWT do aluno quanto do service token, deduplicar por
`(gateway, externalId)` e — se possível — devolver um JWT novo em `token`.

### Novas variáveis de ambiente

```bash
MERCADO_PAGO_PREAPPROVAL_ANUAL=...    # preapproval_plan_id do plano anual
MERCADO_PAGO_PREAPPROVAL_MENSAL=...   # preapproval_plan_id do plano mensal
BACKEND_SERVICE_TOKEN=...             # Bearer dos webhooks, que não têm sessão
```

⚠️ **Verificar antes de subir:** os `preapproval_plan_id` precisam ser legíveis com o
`MERCADO_PAGO_ACCESS_TOKEN` em uso. Plano criado em produção não é legível com token `TEST-`:

```bash
curl -s https://api.mercadopago.com/preapproval_plan/$MERCADO_PAGO_PREAPPROVAL_ANUAL \
  -H "Authorization: Bearer $MERCADO_PAGO_ACCESS_TOKEN" | jq '{id,status,auto_recurring}'
```

### Pendências que continuam abertas

Pendências #3 (HMAC do webhook do Mercado Pago), #4 (chave de idempotência nos gateways) e #6
(JWT em `localStorage`) — fora do escopo desta entrega, registradas no README.

---

## PIX e boleto passam a gravar o plano no pagamento

**Data:** 2026-08-02 (complemento das entregas abaixo)

### Motivação

O webhook do Mercado Pago recebia o pagamento aprovado mas não sabia **qual plano** ativar:
as rotas de PIX e boleto não gravavam nada que identificasse a compra. `planId` chegava
`null` em `activateUserTier`, o que inviabilizava tanto a ativação automática quanto o teste
manual ponta a ponta desses dois métodos.

Isso era a pendência #8 do README das rotas de pagamento, confirmada na prática: o `GET` de
um pagamento criado pela aplicação voltava `metadata: {}` e `external_reference: null`.

### Alterações

**`front/src/app/service/planCatalog.ts`**

- `PlanConfig` ganhou `accessMonths` (12 para o anual, 1 para o mensal)
- Novo `getPlanAccessMonths(planId)` — **função pura**, sem I/O e sem dependência de gateway

Por que uma segunda fonte para `accessMonths`: no caminho do cartão o valor é derivado de
`price.recurring.interval`, porque ali a Stripe é a fonte de verdade. No Mercado Pago não
existe Price para consultar, e fazer uma cobrança por PIX depender de uma chamada à API da
Stripe acoplaria os dois gateways — exatamente o que esta feature separa. A função pura
resolve isso sem I/O.

**`front/src/app/api/process-subscription/pix/route.ts` e `.../boleto/route.ts`**

- Passam a exigir `planId` no corpo, validado com `isPlanId` → 400 quando ausente ou inválido
- Gravam no pagamento:

  ```ts
  external_reference: planId,
  metadata: {
    plan_id: planId,
    access_months: getPlanAccessMonths(planId),
    billing_mode: 'payment',
  }
  ```

`external_reference` duplica `plan_id` de propósito: aparece no painel do Mercado Pago, onde
`metadata` não é exibido, e serve de plano B na leitura do webhook.

**`front/src/app/api/webhooks/mercadopago/route.ts`**

- Lê `metadata.plan_id`, com fallback para `external_reference`
- `expiresAt` deixou de ser `null` fixo e passa a sair de
  `computeExpiresAt({ billingMode: 'payment', accessMonths })` — PIX e boleto são sempre
  cobrança única, não há renovação a esperar
- Removido o comentário que registrava a limitação, agora resolvida

**`front/src/app/paidPlan/page.tsx`** — `processPixPayment` envia `planId: planoSelecionado`
e o `<BoletoForm>` recebe `planId`.

**`front/src/components/payment/BoletoForm.tsx`** — nova prop `planId`, repassada no corpo
da requisição.

**Correção adicional (pendência #6):** `fetch('api/process-subscription/boleto')` →
`fetch('/api/process-subscription/boleto')`. Faltava a barra inicial; resolvia por acaso
apenas porque a página é exatamente `/paidPlan`, e teria dado 404 em qualquer rota aninhada.
Corrigido por estar no caminho direto do teste manual de boleto que esta entrega habilita.

### Testes

Total: **77 testes / 7 arquivos**, todos verdes (era 63 / 6).

- `mercadopago-webhook.test.ts` — **novo** (9 casos). Cobre o ramo que faltava: pagamento
  aprovado ativa o tier com o plano da metadata; `expiresAt` sai de `access_months`; fallback
  para `external_reference`; `pending` e `rejected` não ativam nada; **a notificação que mente
  dizendo `approved` no corpo não ativa**, porque o status real vem da consulta à API;
  eventos não-payment e sem `data.id` respondem 200 sem consultar; erro não vaza a mensagem
  do gateway.
- `mercadopago-routes.test.ts` — 5 casos novos: PIX e boleto gravam
  `metadata.plan_id`/`access_months`/`billing_mode` e `external_reference`; plano mensal
  concede 1 mês; as duas rotas recusam `planId` ausente ou desconhecido.

### Validação executada

| Etapa | Resultado |
|---|---|
| `npm run test` | ✅ 77 testes / 7 arquivos |
| `npm run build` | ✅ Compilou sem erro |
| `POST /pix` com `planId` | ✅ 201 — `payment_id 1327779490` |
| `POST /boleto` com `planId` | ✅ 201 — `payment_id 1349817351` |
| `POST /pix` sem `planId` | ✅ 400 |
| Metadata persistida no Mercado Pago | ✅ Os dois pagamentos voltam da API com `{"billing_mode":"payment","access_months":12,"plan_id":"anual"}` e `external_reference: "anual"` |
| Webhook com pagamento pendente | ✅ `[WEBHOOK_MP] Pagamento 1327779490 em status "pending" — sem ativação.` |

O ramo `approved` continua não sendo reproduzível no sandbox por API (`PUT status` → 403;
boleto não é pagável em sandbox), então fica coberto pelos testes automatizados. Para
comprovar manualmente, pague o QR do PIX com um usuário de teste comprador — procedimento
no README das rotas.

---

## Stripe como fonte de verdade de preço e modelo de cobrança

**Data:** 2026-08-02 (complemento da entrega abaixo)

### Motivação

Na entrega original, os valores viviam hardcoded em `planCatalog.ts` (R$ 497,00 anual e
R$ 50,00 mensal) e o modelo de cobrança era decidido no código. Requisito novo: **o que é
cobrado deve refletir diretamente o que está definido na Stripe.**

### Problema encontrado ao validar os Price IDs

Os dois IDs colados no `.env` (`price_1RmxnFPB0aJ7cbra…` e `price_1Rmy9zPB0aJ7cbra…`)
retornavam `No such price`. Consultando a API com a `STRIPE_SECRET_KEY` do projeto:

- Conta da chave: `acct_1Tp9NpCRbRMOQdYa` (BR, test mode)
- Os IDs colados carregam o fragmento de conta `PB0aJ7cbra` — foram criados em **outra
  conta Stripe**

Prices que de fato existem na conta correta:

| Price ID | Produto | Valor | Tipo | Ativo |
|---|---|---|---|---|
| `price_1TsW9iCRbRMOQdYaMQdywBoW` | Simula PRO Anual | R$ 500,00 | recorrente/ano | ✅ |
| `price_1TsWA5CRbRMOQdYaMajhubGG` | Simula PRO Mensal | R$ 47,50 | recorrente/mês | ✅ |
| `price_1Tw4S3CRbRMOQdYaurx6j1we` | Simula PRO Anual | R$ 500,00 | one_time | ❌ |
| `price_1Tw4RvCRbRMOQdYaPMah2u2g` | Simula PRO Mensal | R$ 47,50 | one_time | ❌ |

Decisão do usuário: usar o par recorrente ativo, e a UI passa a exibir os valores da Stripe.

**Duas consequências, ambas aprovadas:**

1. Os valores mudaram — R$ 500,00 e R$ 47,50 no lugar de R$ 497,00 e R$ 50,00.
2. O plano anual deixou de ser cobrança à vista e virou **assinatura anual com renovação
   automática**, porque o Price ativo é `recurring/year`.

### Design adotado

Em vez de trocar um valor hardcoded por outro, o modelo de cobrança passou a ser **derivado
do próprio Price**:

| Campo do Price | Vira |
|---|---|
| `unit_amount` | valor cobrado, em centavos |
| `currency` | moeda |
| `type: 'recurring'` | `Subscription` |
| `type: 'one_time'` | `PaymentIntent` |
| `recurring.interval` | `year` → 12 meses de acesso; `month` → 1 mês |

Trocar o Price no `.env`, ou editar o Price no dashboard, muda preço **e** modelo de
cobrança sem alterar código. Se o time quiser o anual à vista de volta, basta ativar o
Price `one_time` e apontar `STRIPE_PRICE_ANUAL` para ele.

### Alterações

**`front/src/app/service/planCatalog.ts` — reescrito**

- `getPlan` (síncrono, com valores no código) → `resolvePlan(planId)` (assíncrono, consulta
  `prices.retrieve`)
- `PlanConfig` guarda só o que a Stripe não define: id interno, nome, descrição e qual
  variável de ambiente contém o Price
- `ResolvedPlan` traz `amountCents`, `currency`, `billingMode`, `interval`, `accessMonths`
  e `stripePriceId`, todos derivados do Price
- Rejeita com erro explícito: Price inativo, Price sem `unit_amount` fixo (preço graduado
  ou por uso) e intervalo de recorrência fora de `month`/`year`
- `isPlanId()` — type guard que evita ida à Stripe para um `planId` inválido
- `monthlyEquivalentCents(plan)` — valor mensal equivalente, para a vitrine comparar anual
  com mensal
- `computeExpiresAt` passou a aceitar `{ billingMode, accessMonths }` em vez do plano
  inteiro, e trata `accessMonths` inválido devolvendo `null`

**`front/src/app/api/process-subscription/credit-card/route.ts`**

- Usa `resolvePlan` e ramifica por `plan.billingMode`, que agora vem do Price
- Valida `planId` com `isPlanId` **antes** de chamar a Stripe — id inválido não gera
  requisição à API
- `metadata` ganhou `billingMode` e `accessMonths`, para o webhook não precisar reconsultar
  o Price a cada evento
- Resposta ganhou `currency` e `interval`, além de `clientSecret`, `billingMode` e
  `amountCents`

**`front/src/app/api/plans/route.ts` — novo**

`GET /api/plans` devolve os dois planos resolvidos na Stripe, para a vitrine exibir
exatamente o que será cobrado. Resolve os dois Prices em paralelo com `Promise.all`.
Não expõe Price IDs nem outros dados internos. `revalidate = 300` (catálogo público muda
raramente). Não exige sessão — só há dados públicos de catálogo.

**`front/src/app/api/webhooks/stripe/route.ts`**

`buildInput` passou a ler `billingMode` e `accessMonths` da `metadata` em vez de resolver o
plano de novo. Além de evitar uma chamada de API por evento, congela as condições vigentes
no momento da compra, mesmo que o Price mude depois no dashboard.

**`front/src/app/paidPlan/page.tsx`**

- Busca `/api/plans` no mount e monta o array `planos` a partir dela; os literais viraram
  fallback para o caso de a rota falhar
- `beneficiosPadrao` e `planos` viraram `useMemo` (o array agora depende do estado de preço)
- Novo campo `recorrente` por plano, vindo do `billingMode`
- `"Estude o ano todo e ganhe 2 meses grátis!"` era texto fixo e deixaria de ser verdade a
  cada ajuste de preço; virou `"Economize R$ X por ano!"` calculado como
  `mensal × 12 − anual`, com fallback quando não há economia
- Subtítulo do preço e linha "Período" do resumo passaram a distinguir cobrança recorrente
  de cobrança única

**`front/src/components/PricingCard.tsx`**

`PricingPlans` busca `/api/plans` e deriva `priceMain`, `priceDecimal`, `billingCycleInfo`
e `oldPrice`. O `oldPrice` era o literal `"R$ 600"`; passou a ser `mensal × 12`, e só
aparece quando de fato é maior que o anual. Helper `splitPreco()` quebra o valor nas partes
inteira e decimal que o card já usava.

**`front/.env`**

`STRIPE_PRICE_ANUAL` e `STRIPE_PRICE_MENSAL` corrigidos para os Prices da conta certa, com
comentário registrando conta, valores e o fato de a Stripe ser a fonte de verdade.

### Testes

Total: **63 testes / 6 arquivos**, todos verdes.

- `plan-catalog.test.ts` — reescrito (18 casos). Mocka `prices.retrieve` e cobre: valor e
  moeda vindos do Price, `recurring` → `subscription`, `one_time` → `payment`, `year` → 12
  meses de acesso, `planId` inválido sem ida à Stripe, e as quatro rejeições (Price
  inativo, sem `unit_amount`, intervalo não suportado, env ausente). Mais
  `monthlyEquivalentCents`, `computeExpiresAt` e `isPlanId`.
- `stripe-credit-card-route.test.ts` — reescrito (14 casos). Agora prova que o valor cobrado
  é o do Price, que um Price `recurring` gera Subscription e um `one_time` gera
  PaymentIntent, que a `metadata` carrega `billingMode`/`accessMonths`, e que um Price
  inativo vira 500 sem vazar o ID.
- `plans-route.test.ts` — novo (5 casos). Valida o payload de `/api/plans`, o cálculo do
  equivalente mensal, que Price IDs não vazam, e os erros 503/500.
- `stripe-webhook.test.ts` — 2 casos novos: assinatura não define expiração; cobrança avulsa
  calcula a expiração a partir da `metadata`, sem consultar a Stripe.
- `gateway-routing.test.ts` e `mercadopago-routes.test.ts` — inalterados, seguem verdes.

### Validação executada

| Etapa | Resultado |
|---|---|
| `npm run build` | ✅ Passou; `/api/plans` registrada com ISR de 5 min |
| `npm run test` | ✅ 63 testes / 6 arquivos |
| `GET /api/plans` contra a Stripe real | ✅ 200 — `anual` 50000 brl `subscription`/`year`, `mensal` 4750 brl `subscription`/`month` |
| `POST /credit-card` `planId=anual` (test mode) | ✅ 200 — Subscription criada, `clientSecret` correto, `amountCents: 50000` |
| `POST /credit-card` `planId=mensal` (test mode) | ✅ 200 — `amountCents: 4750`, `interval: month` |
| `POST /credit-card` `planId=vitalicio` | ✅ 400 |

A chamada real confirmou o ponto mais arriscado da implementação: o `clientSecret` da
primeira fatura sai de `latest_invoice.confirmation_secret.client_secret` na API version
`2026-07-29.dahlia`, e não do antigo `latest_invoice.payment_intent`.

Objetos criados na conta de teste durante a validação: um Customer
`teste-claude@example.com` e Subscriptions incompletas. Podem ser apagados no dashboard.

### Avisos do painel da Stripe — analisados, nenhum é erro

O painel de desenvolvedores do Stripe.js exibe recomendações que foram confundidas com
erro. Nenhuma indica falha: a integração é suportada e as chamadas reais retornam 200.
Registrados em `front/src/app/api/process-subscription/README.md` para não serem
"corrigidos" por engano:

1. **"Elements usando uma API mais antiga" → migrar para Checkout Sessions.** Pendência
   aceita, não bloqueante. O ganho real para este projeto não é o anunciado (Adaptive
   Pricing é irrelevante — só BRL) e sim eliminar a extração do `clientSecret`, hoje
   dividida entre `paymentIntents.client_secret` e
   `latest_invoice.confirmation_secret.client_secret`. Custo: reescrita da rota, do
   `CreditCardForm`, do webhook e de ~19 testes. Verificado que os SDKs instalados já
   bastam (`CheckoutElementsProvider` e `useCheckout` em `@stripe/react-stripe-js/checkout`,
   `initCheckoutElementsSdk` em `@stripe/stripe-js`), sem necessidade de upgrade. Decisão:
   manter Elements + Intents por ora.
2. **"Use formas de pagamento dinâmicas"** — ignorado de propósito. Ativar isso faria o
   Payment Element oferecer PIX e boleto **da Stripe**, quebrando a separação de gateways.
3. **"Stripe.js via HTTP"** — informativo; `localhost` em dev é aceito e produção é HTTPS.

### Validação do fluxo Mercado Pago (PIX e boleto)

Executada contra o sandbox com as credenciais `TEST-…`. Resultados:

| Verificação | Resultado |
|---|---|
| `POST /pix` | ✅ 201 — `payment_id 1349817271`, `pending`, QR code EMV válido e `qr_code_base64` de 3 KB |
| `POST /boleto` | ✅ 201 — `payment_id 1349817275`, URL em `mercadopago.com.br/sandbox/...`, linha digitável e vencimento |
| Webhook consulta o pagamento na API | ✅ `[WEBHOOK_MP] Pagamento 1349817275 em status "pending" — sem ativação.` |
| Webhook ignora evento não-payment | ✅ `[WEBHOOK_MP] Evento ignorado: subscription.updated` |

**Limites do sandbox do Mercado Pago**, verificados na prática e documentados no README:

- `PUT /v1/payments/{id}` com `{"status":"approved"}` → **403 forbidden**. Não há como
  forçar aprovação pela API.
- Cartão de teste com titular `APRO` tokenizado via `/v1/card_tokens` cru → o pagamento
  volta `in_process/pending_contingency` e `card.cardholder.name` chega `null`; a simulação
  de status por nome não se aplica nesse caminho.
- **Boleto não é pagável em sandbox** — fica `pending` indefinidamente. Limitação do
  gateway, não da aplicação.
- **PIX é testável até a aprovação** criando um usuário de teste comprador
  (`POST /users/test_user` → 201) e pagando o QR pelo app do Mercado Pago logado com ele.
  O e-mail do comprador precisa diferir do da conta vendedora, senão a API responde
  `Payer email forbidden` (4390).

Como o webhook é agnóstico ao método — só consulta o pagamento e checa `status === 'approved'`
— validar o caminho por PIX cobre também o de boleto.

**Confirmação da pendência #8:** o `GET` do pagamento mostrou `metadata: {}` e
`external_reference: null`, ou seja, PIX e boleto realmente não gravam o plano. Um teste
paralelo criando pagamento com `metadata: { plan_id: 'anual' }` mostrou que o Mercado Pago
**persiste** o campo — a correção da pendência é viável exatamente como descrita.

**Efeito colateral da mudança de preço:** como a UI passou a exibir os valores da Stripe e
as rotas de PIX/boleto recebem `transaction_amount` da UI, PIX e boleto passaram a cobrar
**R$ 500,00** em vez de R$ 497,00. Os três métodos ficam consistentes, mas por coincidência
de configuração — PIX e boleto continuam sem validação server-side do valor (pendência #1).

### Price ID × Product ID

Durante a configuração, `STRIPE_PRICE_MENSAL` chegou a receber um Product ID
(`prod_SiOaLjlt4qhdsC`), que além de ser do tipo errado era de outra conta. A API só aceita
`price_…`: o Product é o que se vende e não carrega valor; o Price é quanto e com que
frequência.

Os comentários do `.env` e o README ganharam o alerta explícito, mais um comando `curl` que
lista os Prices de cada Product da conta. Os Products desta conta são
`prod_UsGhTf8rlEMjaB` (Mensal) e `prod_UsGh6FakSHUR8p` (Anual) — referência para localizar
os Prices no dashboard.

Revalidado após a correção: `GET /api/plans` → 200 com os dois planos, e
`POST /credit-card` `planId=mensal` → 200 com `amountCents: 4750`.

---

## Separação de gateways de pagamento — cartão via Stripe, PIX e boleto via Mercado Pago

**Data:** 2026-08-02

### Objetivo

Trocar o processamento de pagamento por método: cartão de crédito passa a ser processado
pela **Stripe**, enquanto PIX e boleto permanecem no **Mercado Pago**.

Antes desta mudança, os três métodos passavam pelo Mercado Pago. A Stripe existia apenas
como três variáveis órfãs em `front/.env` — o pacote nunca havia sido instalado e nenhum
arquivo do repositório referenciava Stripe.

### Estado final

| Método | Gateway | Modelo de cobrança |
|---|---|---|
| Cartão — plano anual | Stripe | `PaymentIntent` único, R$ 497,00 à vista |
| Cartão — plano mensal | Stripe | `Subscription` recorrente, R$ 50,00/mês |
| PIX | Mercado Pago | Pagamento único, R$ 497,00 |
| Boleto | Mercado Pago | Pagamento único, R$ 497,00 |

---

### Decisão de escopo: parcelamento removido

Durante o planejamento foi levantado o requisito de manter o parcelamento em até 12x que
existia no Brick do Mercado Pago (`maxInstallments: 12`).

**A Stripe não suporta parcelamento em BRL.** A documentação oficial lista o recurso apenas
para Mastercard Installments, México e Japão — o Brasil não está na lista
(<https://docs.stripe.com/payments/installments>, corroborado por
<https://github.com/stripe/stripe-ios/issues/1736>).

Decisão tomada: **plano anual passa a ser cobrado à vista, R$ 497,00**, e o plano mensal
vira assinatura recorrente de R$ 50,00/mês. Os textos da UI foram ajustados para refletir
isso.

### Decisão de escopo: segurança documentada, não corrigida

Foram identificados 8 defeitos no fluxo de pagamento existente (valor da cobrança enviado
pelo cliente, rotas sem autenticação, webhook sem validação de assinatura, entre outros).
Por decisão do usuário, eles foram **documentados** em
`front/src/app/api/process-subscription/README.md` em vez de corrigidos, e as rotas de PIX
e boleto ficaram intocadas.

Exceção necessária: as rotas novas da Stripe derivam o valor de um catálogo server-side,
porque é assim que a API da Stripe se implementa (`Subscription` usa `price` ID e
`PaymentIntent` recebe `amount` em centavos definido pelo servidor). Não é correção
retroativa — é a implementação correta da feature nova.

---

## Arquivos criados

### `front/src/app/service/planCatalog.ts`

Catálogo server-side dos planos, fonte de verdade do preço no servidor.

- `PlanId` = `'anual' | 'mensal'`; `BillingMode` = `'payment' | 'subscription'`
- `PlanDefinition` com `amountCents` (inteiro, centavos de BRL — nunca float), `currency`,
  `billingMode`, `stripePriceId` (só para assinatura) e `accessMonths`
- `getPlan(id: string): PlanDefinition | null` — retorna `null` para id desconhecido em vez
  de lançar, para o chamador responder 400
- Lê `STRIPE_PRICE_MENSAL` em tempo de chamada, não no carregamento do módulo, para que a
  ausência da variável não derrube a rota no import
- `computeExpiresAt(plan, from?)` — data de expiração do acesso; retorna `null` para
  assinaturas recorrentes (a renovação chega como novo `invoice.paid`)

Valores: anual `49_700` centavos / `accessMonths: 12`; mensal `5_000` centavos /
`accessMonths: 1`.

### `front/src/lib/stripe.ts`

Cliente Stripe compartilhado, somente servidor.

- `getStripe(): Stripe` — singleton preguiçoso. Instanciado sob demanda em vez de no escopo
  do módulo, para que uma `STRIPE_SECRET_KEY` ausente vire erro tratável dentro do handler
- `apiVersion` fixada em `'2026-07-29.dahlia'`, a versão gerada pelo SDK `stripe@22.4.0`
  instalado — é ela que define que o client secret da primeira fatura vem em
  `latest_invoice.confirmation_secret.client_secret`
- `appInfo` com nome e URL da aplicação

### `front/src/app/service/subscriptionActivation.ts`

Ponto único de ativação/revogação do tier pago. Os webhooks dos dois gateways convergem
para cá; nenhum outro lugar do frontend altera tier.

- `PaymentGateway` = `'stripe' | 'mercadopago'`
- `TierActivationInput` = `{ email, planId, gateway, externalId, expiresAt }`
- `activateUserTier(input)`, `revokeUserTier(input)`, `flagPaymentFailure(input)`
- Todas com `// TODO(BFF)`: o BFF Java ainda não expõe endpoint de assinatura, então hoje
  apenas registram a intenção em log com a tag `[TIER_ACTIVATION]`
- O contrato esperado do backend está documentado em JSDoc no próprio arquivo:
  `POST /subscriptions/activate`, `/subscriptions/revoke`, `/subscriptions/payment-failed`
- Documentado que, quando o endpoint existir, as funções devem **propagar** o erro para o
  webhook responder 5xx e o gateway reenviar a notificação

### `front/src/app/api/webhooks/stripe/route.ts`

Webhook da Stripe — reconciliação dos pagamentos de cartão.

- `runtime = 'nodejs'` e `dynamic = 'force-dynamic'`
- Lê o corpo com `await req.text()`: a verificação HMAC exige o corpo **cru**; `req.json()`
  normaliza o payload e invalida a assinatura
- Valida via `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)`
- 400 quando falta o cabeçalho `stripe-signature` ou a assinatura é inválida
- 500 quando `STRIPE_WEBHOOK_SECRET` não está configurada
- Eventos tratados:
  - `payment_intent.succeeded` → `activateUserTier` (plano anual)
  - `invoice.paid` → `activateUserTier` (plano mensal, primeira fatura e renovações)
  - `invoice.payment_failed` → `flagPaymentFailure` (não revoga)
  - `customer.subscription.deleted` → `revokeUserTier`
- Evento não mapeado responde 200 silencioso, para a Stripe não reenviar indefinidamente
- `extractEmail()` tenta `receipt_email`, depois `customer_email`, depois `metadata.email`
- `buildInput()` resolve o plano pelo `metadata.planId` e calcula `expiresAt` via
  `computeExpiresAt`

### `front/src/app/api/process-subscription/README.md`

Documentação das rotas de pagamento, com três blocos:

1. **Arquitetura** — tabela de qual método vai para qual gateway, por que o anual é à vista,
   de onde vem o valor cobrado, e as variáveis de ambiente necessárias
2. **Teste manual** — passo a passo com os cartões de teste de cada gateway (detalhado
   abaixo)
3. **8 pendências de segurança** — cada uma com arquivo:linha, cenário de exploração e
   correção sugerida, além do TODO(BFF) da ativação de tier

#### Cartões de teste documentados

Stripe (validade qualquer data futura, CVC quaisquer 3 dígitos, CPF `123.456.789-09`):

| Cartão | Resultado |
|---|---|
| `4242 4242 4242 4242` | Aprovado (caminho feliz padrão) |
| `4000 0007 6000 0002` | Aprovado — Visa emitido no Brasil, valida o cenário BRL/BR |
| `5555 5555 5555 4444` | Aprovado (Mastercard) |
| `4000 0025 0000 3155` | Exige autenticação 3-D Secure |
| `4000 0000 0000 0002` | Recusado (`card_declined`) |
| `4000 0000 0000 9995` | Recusado (`insufficient_funds`) |

Mercado Pago (CVV `123`, validade `11/30`, CPF `12345678909`):

| Cartão | Bandeira |
|---|---|
| `5031 4332 1540 6351` | Mastercard |
| `4235 6477 2802 5682` | Visa |

Com a nota de que no Mercado Pago o resultado é controlado pelo **nome do titular**
(`APRO` aprova, `OTHE` recusa, `CONT` deixa pendente, `FUND` recusa por saldo, `EXPI`
recusa por validade) e que em sandbox PIX e boleto nascem `pending` e precisam ser
aprovados pelo painel de teste.

### `front/vitest.config.mts`

Primeira configuração de test runner do projeto.

- `environment: 'node'`, `include: ['src/test/**/*.test.ts']`, `globals: false`
- Alias `@` → `./src`, espelhando o `paths` do `tsconfig.json`
- Extensão `.mts` em vez de `.ts` por dois motivos: silencia o aviso do Vite sobre sintaxe
  ESM em arquivo carregado como CommonJS, e mantém o arquivo fora do `**/*.ts` do
  `tsconfig.json`
- O padrão `*.test.ts` separa os testes unitários dos scripts de carga k6, que vivem em
  `src/test/K6/` e não usam esse sufixo

### Testes — `front/src/test/payment/` (5 arquivos, 45 casos)

Escritos **antes** da implementação, seguindo o workflow do `CLAUDE.md`.

**`plan-catalog.test.ts`** (6 casos) — anual é 49700 centavos / BRL / `payment`; anual não
expõe `stripePriceId`; mensal é 5000 centavos / `subscription` com Price ID do ambiente;
`STRIPE_PRICE_MENSAL` é lido em tempo de chamada; id desconhecido retorna `null`; valores em
centavos são inteiros.

**`stripe-credit-card-route.test.ts`** (11 casos) — mocka `@/lib/stripe`. Valida que o plano
anual chama `paymentIntents.create` com `amount: 49700`, `currency: 'brl'` e
`payment_method_types: ['card']`; que o mensal chama `subscriptions.create` com
`payment_behavior: 'default_incomplete'`; que o `clientSecret` do mensal vem de
`latest_invoice.confirmation_secret`; que o Customer é reaproveitado por e-mail; que
requisições sem `planId`, com `planId` inválido ou sem `payer.email` respondem 400; que um
`transaction_amount` enviado pelo cliente é ignorado; que a resposta tem exatamente as
chaves `amountCents`, `billingMode` e `clientSecret`; e que um erro da Stripe vira 500 sem
vazar a mensagem original.

**`stripe-webhook.test.ts`** (9 casos) — mocka `@/lib/stripe` e
`@/app/service/subscriptionActivation`. Valida rejeição sem `stripe-signature` e com
assinatura inválida; que `constructEvent` recebe o corpo **cru**; o mapeamento dos quatro
eventos tratados; que evento não mapeado responde 200 sem efeito colateral; e 500 quando
`STRIPE_WEBHOOK_SECRET` está ausente.

**`gateway-routing.test.ts`** (14 casos) — **teste de contrato da feature**. Verificação
estática do código-fonte, porque a regra a proteger é "qual SDK cada arquivo tem permissão
de tocar", e nenhum mock de runtime prova isso. Garante que a rota de cartão não importa
nem menciona nada do Mercado Pago, que usa `@/lib/stripe` e `@/app/service/planCatalog`,
que não lê valor do corpo da requisição e que restringe `payment_method_types` a `['card']`;
que as rotas de PIX e boleto não importam nada da Stripe e mantêm seus `payment_method_id`;
que os webhooks não se cruzam e ambos importam `subscriptionActivation`; que o webhook do
Mercado Pago não escuta mais `subscription.authorized`; e que o `CreditCardForm` usa
`@stripe/react-stripe-js`, não menciona `CardPayment` e não oferece parcelamento.

**`mercadopago-routes.test.ts`** (4 casos) — regressão. Mocka o SDK `mercadopago` e garante
que PIX continua devolvendo `{ payment_id, status, qr_code, qr_code_base64 }` com
`payment_method_id: 'pix'`, que boleto continua devolvendo
`{ payment_id, status, boleto_url, boleto_code, due_date }` com
`payment_method_id: 'bolbradesco'`, e que ambos recusam corpo incompleto com 400.

---

## Arquivos reescritos

### `front/src/app/api/process-subscription/credit-card/route.ts`

Reescrita completa: Mercado Pago → Stripe.

**Contrato anterior:** o cliente enviava `token`, `issuer_id`, `payment_method_id`,
`installments` e `transaction_amount`; a rota chamava `Payment.create` do Mercado Pago e
devolvia o objeto cru da resposta.

**Contrato novo:** o cliente envia apenas
`{ planId, payer: { email, first_name, last_name, identification } }`. O cartão nunca chega
ao servidor — o Payment Element tokeniza direto com a Stripe no navegador.

Fluxo do handler:

1. Guarda de `STRIPE_SECRET_KEY` → 500 `{ error: 'Erro de configuração do servidor.' }`
2. `getPlan(planId)` → 400 se `null`
3. Valida `payer.email` → 400 se ausente
4. Valida `stripePriceId` quando o plano é assinatura → 500 se `STRIPE_PRICE_MENSAL` faltar
5. `customers.list({ email, limit: 1 })` e reaproveita o Customer existente; só cria um novo
   se não houver, evitando duplicar cadastro a cada tentativa
6. Ramifica por `billingMode`:
   - `subscription` → `subscriptions.create` com `payment_behavior: 'default_incomplete'`,
     `payment_settings.save_default_payment_method: 'on_subscription'`,
     `payment_settings.payment_method_types: ['card']` e
     `expand: ['latest_invoice.confirmation_secret']`
   - `payment` → `paymentIntents.create` com `amount` do catálogo, `currency: 'brl'`,
     `payment_method_types: ['card']`, `description`, `receipt_email` e `metadata`
7. 502 quando a Stripe devolve a cobrança sem client secret
8. Responde **apenas** `{ clientSecret, billingMode, amountCents }`
9. `catch` loga com a tag `[API_STRIPE_CARD_ERROR]` e responde 500 genérico, sem repassar a
   mensagem da Stripe (pode conter detalhes internos)

`payment_method_types: ['card']` é obrigatório nos dois ramos: sem ele,
`automatic_payment_methods` faria o Payment Element oferecer PIX e boleto **da Stripe**,
que é exatamente o oposto da separação pedida. Está comentado no código e coberto por teste.

`metadata` carrega `{ planId, email, documento }` — é dela que o webhook extrai o plano.

### `front/src/components/payment/CreditCardForm.tsx`

Reescrita completa: Brick do Mercado Pago → Payment Element da Stripe.

- Removidos o import de `@mercadopago/sdk-react`, o componente `CardPayment`, o objeto
  `initialization` e todo o bloco `customization` (incluindo `maxInstallments: 12` e os
  labels de parcelamento)
- `loadStripe` é chamado uma única vez via `getStripePromise()`, memoizado no escopo do
  módulo — recriá-lo a cada render remontaria o Element. É o mesmo erro que o
  `initMercadoPago` cometia na página, dentro do corpo do render
- Novas props: `clientSecret`, `billingMode`, `selectedPlan`, `payerData`, `onSuccess`,
  `onError`. As antigas `onSubmit`/`onError` do Brick saíram
- Componente interno `StripeCardFields` usa `useStripe`/`useElements` (precisa viver dentro
  de `<Elements>`) e renderiza `<PaymentElement options={{ layout: 'tabs' }} />`
- Submit chama `stripe.confirmPayment({ elements, redirect: 'if_required', confirmParams })`.
  `if_required` mantém o usuário na página quando não há desafio 3-D Secure
- `confirmParams.payment_method_data.billing_details` recebe nome e e-mail do pagador;
  `return_url` aponta para `/paidPlan`
- Sucesso quando o PaymentIntent volta `succeeded` ou `processing`
- O rótulo do botão muda por modo: "Pagar R$ 497,00 à vista" ou "Assinar por R$ 50,00/mês"
- `options` do `<Elements>` memoizado por `clientSecret` via `useMemo`
- `appearance` reproduz o design macOS anterior (tema `flat`, `#0071e3`, tipografia
  San Francisco, raio 8px, focus ring `rgba(0,113,227,0.1)`, erro `#ff3b30`)
- Toda a moldura visual foi preservada: banner do mascote de boas-vindas, título da seção,
  faixa verde "Transação 100% Segura" e banner azul de incentivo. Só o subtítulo mudou, para
  distinguir "Cobrança única, à vista" de "Assinatura mensal com renovação automática"

### `front/src/app/api/webhooks/mercadopago/route.ts`

Reescrita do stub, que era inoperante.

**Problema:** o stub tratava `subscription.updated`, `subscription.authorized` e
`subscription.cancelled`, mas as rotas de PIX e boleto criam recursos do tipo `payment`.
Nenhum pagamento aprovado era reconciliado — os dois `if` nunca eram verdadeiros.

**Correção:**

- Dispatch agora é `eventType.startsWith('payment')`, cobrindo `payment.created` e
  `payment.updated`
- Não confia no status vindo no corpo da notificação: consulta o pagamento na API do
  Mercado Pago com `new Payment(client).get({ id })` antes de qualquer ativação
- Só chama `activateUserTier` quando `status === 'approved'`; os demais status respondem 200
  com log informativo
- `runtime = 'nodejs'` e `dynamic = 'force-dynamic'`
- Guarda de `MERCADO_PAGO_ACCESS_TOKEN` dentro do handler
- Removido o vazamento de `error.message` cru na resposta 500 (agora mensagem genérica com
  log `[WEBHOOK_MP_ERROR]`)
- Eventos não relacionados a pagamento respondem 200 para não gerar retry
- Documentado no cabeçalho do arquivo que a validação HMAC `x-signature` continua pendente

---

## Arquivos editados

### `front/src/app/paidPlan/page.tsx`

Mudanças pontuais, sem refatorar a página (1045 linhas).

- Removido o import de `initMercadoPago` e sua chamada, que rodava **no corpo do render**.
  Ele existia apenas para o Brick do cartão: `PixForm` é display-only e `BoletoForm` faz
  `fetch` próprio, nenhum dos dois usa o SDK React do Mercado Pago
- Novo tipo `PaymentType = "" | "cartao" | "Pix" | "boleto"` substituindo
  `paymentType: string`. As strings literais foram preservadas, inclusive o `"Pix"`
  capitalizado, para não quebrar os branches de título, render, botão da sidebar e página de
  sucesso
- Nova interface `CardIntent` = `{ clientSecret, billingMode, amountCents }`
- Novos estados `cardIntent`, `loadingCardIntent`, `cardIntentError`
- Removido o estado `[, setLoading]`, que ficaria órfão
- `processPayment` (que recebia o token do Brick) substituído por `createCardIntent`, um
  `useCallback` que faz `POST /api/process-subscription/credit-card` com `{ planId, payer }`
  — sem enviar valor — e guarda o `clientSecret`
- `useEffect` dispara `createCardIntent` ao entrar em `payment-details` com
  `paymentType === "cartao"`, com guarda contra disparo duplo
- `useEffect` limpa `cardIntent` quando o plano muda, já que o valor da cobrança mudou
- `handlePaymentError` passou a receber `{ message: string }` em vez de `unknown`
- Novo `handleCardPaymentSuccess` avança para `payment-success`
- No render do cartão, três estados: o `CreditCardForm` quando há `clientSecret`
  (com `key={clientSecret}` para remontar em nova cobrança); um **skeleton screen** animado
  enquanto a cobrança é criada (nunca `null` nem spinner, conforme regra do `CLAUDE.md`); e
  um painel de erro com botão "Tentar novamente"
- Texto do plano anual: `"R$ 497,00 cobrado em parcela única"` →
  `"R$ 497,00 à vista — equivale a R$ 41,50/mês"`. Texto do mensal:
  `"Cobrança mensal"` → `"Assinatura mensal, cancele quando quiser"`

Intocados: a regra de que o plano mensal só oferece cartão, os componentes `PixForm` e
`BoletoForm`, e `processPixPayment`.

### `front/src/components/PricingCard.tsx`

`billingCycleInfo` do plano anual: `"Pago anualmente (R$ 497)"` →
`"Pago anualmente (R$ 497 à vista)"`.

### `front/package.json`

- Dependências novas: `stripe@^22.4.0` (SDK server), `@stripe/stripe-js@^9.12.1` e
  `@stripe/react-stripe-js@^6.8.0` (Payment Element)
- DevDependency nova: `vitest@^4.1.10`
- Scripts novos: `"test": "vitest run"` e `"test:watch": "vitest"`
- `mercadopago` e `@mercadopago/sdk-react` **mantidos** — PIX e boleto continuam no
  Mercado Pago

Instalação com `--legacy-peer-deps`, conforme o `CLAUDE.md`.

### `front/.env`

Nova variável `STRIPE_PRICE_MENSAL=` (vazia, a preencher), com comentário explicando que é
o Price recorrente BRL 50,00/month criado no dashboard da Stripe e que o plano anual não
usa Price ID. As três variáveis Stripe que já existiam foram mantidas.

---

## Arquivos movidos

Os testes foram criados inicialmente em `tests/payment/` na raiz do repositório e, a pedido
do usuário, movidos para `front/src/test/payment/`, ao lado dos scripts de carga k6
(`front/src/test/K6/`). A pasta `tests/` da raiz foi removida e o `include` do
`vitest.config.mts` e a resolução de caminhos do `gateway-routing.test.ts` foram ajustados.

---

## Validação executada

| Etapa | Comando | Resultado |
|---|---|---|
| Build de produção | `npm run build` | ✅ Passou. `/api/webhooks/stripe` aparece registrada na tabela de rotas |
| Testes unitários | `npm run test` | ✅ 45 testes / 5 arquivos, todos verdes |
| Lint | `npm run lint` | ❌ Falhou por problema **pré-existente** (ver abaixo) |

### Problema pré-existente de lint (não introduzido por esta mudança)

`npm run lint` executa `next lint`, comando **removido no Next.js 16**, e falha com
`Invalid project directory provided, no such directory: front/lint`.

Chamar o ESLint diretamente também falha, com
`TypeError: Converting circular structure to JSON` dentro de
`@eslint/eslintrc/lib/shared/config-validator.js` — incompatibilidade entre `eslint@9.27.0`
e o `eslint-config-next` do projeto. Confirmado que o erro ocorre igualmente em arquivo não
tocado por esta mudança (`src/lib/utils.ts`), o que descarta relação com o código novo.

A correção do ESLint (migrar para `eslint.config.mjs` flat config e trocar o script para
`eslint .`) ficou fora do escopo desta entrega.

---

## Pré-requisito manual antes de testar

Criar no dashboard da Stripe (test mode) um Product **"Simula Pro Mensal"** com Price
recorrente **BRL 50,00 / month** e colar o ID resultante em `STRIPE_PRICE_MENSAL` no
`front/.env`. Sem isso, o plano mensal responde 500; o plano anual funciona normalmente.

A conta Stripe precisa estar habilitada para BRL.

O passo a passo completo de teste manual, com os cartões de cada gateway, está em
`front/src/app/api/process-subscription/README.md`.
