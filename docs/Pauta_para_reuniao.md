# Pauta de reunião — mover a cadeia de pagamento para o backend Java

> **Data:** 04/08/2026
> **Escopo:** onde vive a regra de negócio do pagamento do Simula PRO

> ✅ **Decidido em 06/08/2026: mover a cadeia para o Java.** O lado do frontend já foi
> implementado — as rotas de pagamento viraram proxy fino e os webhooks saíram do Next. O
> contrato exigido do BFF Java e o que falta construir do outro lado estão na primeira seção de
> [`CHANGES.md`](../CHANGES.md). O texto abaixo fica como registro do raciocínio da decisão.

---

## 1. O que se decide nesta reunião

Hoje a regra de negócio do pagamento vive no **frontend Next.js**: é ele que resolve o preço na
Stripe e no Mercado Pago, cria a cobrança, verifica se o pagamento aconteceu e só então avisa o
backend Java para liberar o acesso.

A proposta é **mover essa responsabilidade inteira para o Java**, deixando o Next como o que ele
deveria ser: um proxy fino que recebe, encaminha e devolve.

A decisão não é sobre estilo de código. Ela determina onde ficam as chaves de pagamento, quem
responde por uma cobrança errada, e se o problema de reconciliação dos webhooks (§4.1) continua
existindo ou desaparece.

---

## 2. O fluxo proposto

`backend` aqui significa **o BFF Java**. O Next pode permanecer no caminho como proxy fino
(recebe, encaminha, devolve), sem regra de negócio — que é exatamente o padrão que o
`CLAUDE.md` do projeto já define para todas as outras rotas.

```text
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

### O que cada passo garante

| Passo | Garantia | O que ele impede |
|---|---|---|
| 1 | O navegador manda **o plano, nunca o preço** | Cobrança forjada com valor arbitrário |
| 2 | O preço sai da fonte de verdade (Price da Stripe / `preapproval_plan` do MP) | Divergência entre o que a tela mostra e o que é cobrado |
| 3 | O navegador recebe só o necessário para completar o pagamento | Exposição de chave secreta ao cliente |
| 4 | Cartão vai direto do navegador para a gateway | Número de cartão trafegando ou sendo logado por nós |
| 5–6 | O navegador devolve **um identificador, não um veredito** | Cliente declarar "pago" e receber acesso |
| 7 | Quem afirma que houve pagamento é a gateway, consultada pelo servidor | Ativação com id inventado ou de pagamento não concluído |
| 8 | O dono da compra é comparado com o dono da sessão | Ativar a conta de terceiro com o pagamento de outro |
| 9 | O tier nasce no banco, fonte única de verdade | Estado de assinatura espalhado e divergente |
| 10 | O JWT novo carrega o tier atualizado | Aluno pagar e precisar deslogar/relogar para usar |

### A regra que sustenta o desenho inteiro

> **O navegador é do usuário. Nada que ele afirme sobre dinheiro pode ser aceito — só o que ele
> identifica.**

Todo passo acima é uma aplicação dessa regra. O cliente manda `planId` (identifica o plano, não
o preço) e `paymentId` (identifica a compra, não o status). Valor e status sempre vêm da
gateway, consultada pelo servidor.

---

### Onde cada passo vive no código

> Mapeado em 06/08/2026, depois da implementação do lado frontend. Todo caminho front→backend
> passa por uma rota `src/app/api/` que só encaminha; quem fala com o `BACKEND_API_URL` é
> sempre [`bffPayments.ts`](../front/src/app/service/bffPayments.ts), em nenhum outro lugar.

#### As cinco rotas de comunicação front ⇄ backend

| # | Rota Next (navegador chama) | Endpoint no BFF Java | Passos |
|---|---|---|---|
| R1 | `GET /api/plans` | `GET /plans` | 1 (catálogo) |
| R2 | `POST /api/process-subscription/credit-card` | `POST /subscriptions/checkout/card` | 1→3 |
| R3 | `POST /api/process-subscription/pix` | `POST /subscriptions/checkout/pix` | 1→3 |
| R4 | `POST /api/process-subscription/boleto` | `POST /subscriptions/checkout/boleto` | 1→3 |
| R5 | `POST /api/subscriptions/activate` | `POST /subscriptions/activate` | 6→10 |

##### R1 — catálogo de planos (público, sem `Authorization`)

| Papel | Arquivo |
|---|---|
| Quem chama | [`front/src/components/PricingCard.tsx`](../front/src/components/PricingCard.tsx) (vitrine), [`front/src/app/paidPlan/page.tsx`](../front/src/app/paidPlan/page.tsx) (checkout) |
| Rota proxy | [`front/src/app/api/plans/route.ts`](../front/src/app/api/plans/route.ts) |
| Encaminhamento | [`front/src/app/service/bffPayments.ts`](../front/src/app/service/bffPayments.ts) — `BFF_PAYMENT_PATHS.plans` |

Os dois consumidores precisam existir: se a vitrine tivesse preço próprio, ela anunciaria um
valor e o checkout cobraria outro — a segunda fonte de verdade que a §3 elimina.

##### R2 — cartão de crédito

| Papel | Arquivo |
|---|---|
| Quem chama | [`front/src/app/paidPlan/page.tsx`](../front/src/app/paidPlan/page.tsx) — `createCardIntent` |
| Rota proxy | [`front/src/app/api/process-subscription/credit-card/route.ts`](../front/src/app/api/process-subscription/credit-card/route.ts) |
| Sessão (401 antes de encaminhar) | [`front/src/app/service/sessionToken.ts`](../front/src/app/service/sessionToken.ts) — `readUserToken` |
| Saneamento do corpo | [`front/src/app/service/bffPayments.ts`](../front/src/app/service/bffPayments.ts) — `sanitizeCheckoutBody` |
| **Passo 4 — fora do backend** | [`front/src/components/payment/CreditCardForm.tsx`](../front/src/components/payment/CreditCardForm.tsx) — `stripe.confirmPayment` roda **no navegador** com `@stripe/react-stripe-js`. O cartão não toca servidor nenhum nosso |

##### R3 — PIX

| Papel | Arquivo |
|---|---|
| Quem chama | [`front/src/app/paidPlan/page.tsx`](../front/src/app/paidPlan/page.tsx) — `processPixPayment` |
| Rota proxy | [`front/src/app/api/process-subscription/pix/route.ts`](../front/src/app/api/process-subscription/pix/route.ts) |
| Exibe o QR (passo 3) | [`front/src/components/payment/PixForm.tsx`](../front/src/components/payment/PixForm.tsx) |
| Passos 4–5 | acontecem no app do banco do aluno; o `payment_id` já veio na resposta de R3 |

##### R4 — boleto

| Papel | Arquivo |
|---|---|
| Quem chama | [`front/src/components/payment/BoletoForm.tsx`](../front/src/components/payment/BoletoForm.tsx) — o formulário monta e envia sozinho |
| Rota proxy | [`front/src/app/api/process-subscription/boleto/route.ts`](../front/src/app/api/process-subscription/boleto/route.ts) |
| Guarda o id para depois | [`front/src/app/service/pendingPayment.ts`](../front/src/app/service/pendingPayment.ts) — `PENDING_PAYMENT_KEY` no `localStorage` |

O boleto compensa em dias: não há passo 4/5 com o aluno na tela. Quem fecha o ciclo é o webhook
que chega direto ao Java, mais a reconciliação de R5 no próximo acesso.

##### R5 — ativação do tier (passos 6 a 10 — a rota mais importante do fluxo)

| Papel | Arquivo |
|---|---|
| Rota proxy | [`front/src/app/api/subscriptions/activate/route.ts`](../front/src/app/api/subscriptions/activate/route.ts) |
| Quem chama — **cartão** | [`front/src/app/paidPlan/page.tsx`](../front/src/app/paidPlan/page.tsx) — efeito de ativação ao chegar na tela de confirmação |
| Quem chama — **PIX** | [`front/src/hooks/usePixPaymentStatus.ts`](../front/src/hooks/usePixPaymentStatus.ts) — polling enquanto o QR está na tela (5s→10s, teto de 30 min) |
| Quem chama — **boleto** | [`front/src/hooks/usePendingPaymentReconciliation.ts`](../front/src/hooks/usePendingPaymentReconciliation.ts) — uma tentativa por carregamento de página, montado em [`SyncUserEffect.tsx`](../front/src/components/SyncUserEffect.tsx) |
| Passo 10 — grava o JWT novo | a própria rota reescreve o cookie `user_data` (HttpOnly), só em `200` com `token` |
| Passo 10 — tier muda sem relogar | [`front/src/hooks/useUserTier.ts`](../front/src/hooks/useUserTier.ts) + [`front/src/app/service/jwtDecoder.ts`](../front/src/app/service/jwtDecoder.ts), acordados pelo `CustomEvent('user_synced')` |

Os três caminhos mandam **exatamente o mesmo corpo**: `{ gateway, paymentId }`. É a aplicação
literal do passo 6 — três origens diferentes, nenhuma delas com permissão de afirmar nada.

#### A credencial que sustenta o passo 8

O Bearer que R2–R5 repassam ao Java é o cookie `user_data`, gravado no login por
[`front/src/app/api/sync-user/route.ts`](../front/src/app/api/sync-user/route.ts)
(`BACKEND_API_URL/auth/google`). É esse JWT que faz o passo 8 funcionar: o Java sabe de quem é a
sessão porque foi ele mesmo que a emitiu — não porque o navegador disse.

#### Desvios entre o desenho e o código (auditoria de 06/08/2026)

Três pontos onde o código não é a leitura literal do fluxo. Detalhamento na 1ª seção do
[`CHANGES.md`](../CHANGES.md).

| Id | Passo | Desvio | Situação |
|---|---|---|---|
| **D1** | 1 | Além do `planId`, o corpo levava `payer` (nome, CPF e, no boleto, endereço), e o saneamento era uma lista de campos proibidos | **✅ Corrigido.** O corpo passou a ser **remontado por allowlist** em `sanitizeCheckoutBody`: só `planId` e `payer` (com `first_name`, `last_name`, `identification` e, no boleto, `address`) chegam ao Java. Campo com nome que ninguém previu — `valor`, `preco`, `desconto` — é descartado por não ter sido pedido. O `payer` do boleto foi unificado com o de cartão e PIX: um contrato só |
| **D2** | 10 | O JWT era gravado **também** no `localStorage`, não só no cookie HttpOnly | **✅ Corrigido.** O token existe agora **apenas** no cookie `user_data` HttpOnly. `/api/sync-user` e `/api/subscriptions/activate` pararam de devolvê-lo no corpo; 8 chamadas do cliente pararam de montar `Authorization` (o cookie acompanha sozinho todo fetch same-origin) e 5 rotas passaram a lê-lo com `readUserToken`; a nova `GET /api/user/me` devolve só os claims de exibição. A cópia legada é apagada no carregamento |
| **D3** | 6 | `gateway` e `paymentId` são encaminhados sem validação de tipo | **Aceito, vira requisito do Java.** Validar num proxy fino seria regra de negócio, e o Java precisa validar de qualquer forma. **Critério de aceite:** rejeitar `gateway` fora de `stripe\|mercadopago` e `paymentId` que não seja string não vazia |

> **Pergunta para a reunião.** Se o Java descobre a gateway a partir do próprio `paymentId`, o
> front precisa mesmo mandar o campo `gateway`? Em caso negativo, o passo 6 encolhe para
> `{ paymentId }`. Não mexido sem essa resposta.

---

## 3. O que muda em relação a hoje

```text
HOJE
front → Next (resolve preço, cria cobrança, verifica pagamento) → Java (ativa) → banco
        └── regra de negócio + chaves da gateway                   └── sem acesso à gateway

PROPOSTO
front → [Next proxy fino] → Java (resolve preço, cria cobrança, verifica, ativa) → banco
                            └── um único dono da cadeia
```

Três coisas somem no caminho:

- **Dois catálogos de preço.** Hoje existem `planCatalog.ts` (Stripe) e `mercadoPagoCatalog.ts`
  (MP), independentes. Trocar um preço exige lembrar de mexer nos dois painéis; esquecer
  significa cobrar valores diferentes por método de pagamento.
- **Dois serviços de verificação** duplicando a mesma lógica para gateways diferentes.
- **Chaves de pagamento em dois ambientes.** `STRIPE_SECRET_KEY` e `MERCADO_PAGO_ACCESS_TOKEN`
  passam a viver só no Java.

### Isto já era a arquitetura documentada do projeto

O `CLAUDE.md` do repositório define:

> All `src/app/api/` Route Handlers are thin proxies to the Java BFF — they receive, forward,
> and return. **No business logic lives here.**
> `src/app/service/` — Pure server-side functions **that call the Java BFF**. Always use
> `process.env.BACKEND_API_URL` (never hardcode URLs).

A cadeia de pagamento é **o único lugar do projeto que não segue essa regra**. As rotas de
`process-subscription/` não são proxies finos — elas decidem preço e criam cobrança. Os serviços
de pagamento não chamam o BFF — chamam Stripe e Mercado Pago direto.

Ou seja: a proposta não introduz uma arquitetura nova. Ela traz o pagamento de volta para a
arquitetura que o projeto já tinha escolhido.

---

## 4. Por que esta decisão

### 4.1 Faz o problema da autenticação dos webhooks desaparecer, em vez de contorná-lo

Há um bloqueio real hoje: notificações de pagamento chegam ao Next, mas o Next não tem credencial
para repassá-las ao Java — o BFF autentica pelo JWT do aluno, e um webhook não carrega sessão de
ninguém.

```text
hoje:      Stripe/MP → Next → Java     o segundo salto não tem credencial
proposto:  Stripe/MP → Java            não existe segundo salto
```

Com o Java sendo o dono da relação com a gateway, o webhook aponta direto para ele. Não há
intermediário para autenticar. **O problema não é resolvido — ele deixa de existir.**

Consequência prática: renovação mensal, cancelamento e inadimplência voltam a funcionar. Hoje
não funcionam.

### 4.2 O Java tem banco de dados; o Next não

Duas coisas hoje são "responsabilidade do BFF" apenas no papel, porque o Next não tem onde
guardar estado:

- **Idempotência real.** A mesma compra chega por dois caminhos (tela e webhook). Sem banco, a
  deduplicação por `(gateway, externalId)` é uma promessa, não uma garantia.
- **Histórico de assinatura.** Quando começou, quando renova, quando foi cancelada. Isso é dado
  de negócio e precisa de tabela.

### 4.3 Responsabilidade concentrada

Quando uma cobrança sai errada, hoje a investigação passa por dois serviços, dois repositórios e
duas pessoas. Com um dono só, existe um lugar para olhar, um log para ler e uma pessoa que
responde.

### 4.4 Reduz a superfície onde um erro custa dinheiro

O frontend é reimplantado com frequência — é onde mudam textos, telas e experimentos. Cada
deploy de frontend hoje é um deploy que toca código de cobrança. Separar as duas coisas diminui
a chance de um ajuste de tela quebrar pagamento.

---

## 5. Vulnerabilidades que este desenho cobre

As sete primeiras foram **encontradas na auditoria da implementação atual** e já estão
corrigidas no Next. Elas aparecem aqui porque **precisam ser reimplementadas no Java** — mover a
cadeia sem reimplementá-las reabriria todas.

| # | Vulnerabilidade | Como se explora | O que a cobre no fluxo |
|---|---|---|---|
| 1 | **Valor vindo do cliente** | POST com `transaction_amount: 0.01` → Simula PRO por um centavo | Passos 1–2: o navegador manda `planId`; o preço sai da gateway |
| 2 | **Status forjado pelo cliente** | POST afirmando `"status":"approved"` sem ter pago | Passos 6–7: o navegador manda só o id; o servidor consulta a gateway |
| 3 | **Roubo de titularidade** | Pegar o `paymentId` de uma compra alheia e ativar a própria conta | Passo 8: e-mail da cobrança × e-mail da sessão; divergiu, nega |
| 4 | **Rota de cobrança sem sessão** | POST anônimo criando Customer e assinatura na conta da Stripe | Passo 1 exige sessão autenticada antes de qualquer chamada à gateway |
| 5 | **Cobrança duplicada** | Duplo clique ou retry de rede gera dois PIX / dois boletos / duas assinaturas | Chave de idempotência por `(aluno, plano, operação, janela)` + dedupe no banco |
| 6 | **Webhook forjado** | POST anônimo no endpoint de webhook para ativar tier de graça | Verificação de assinatura HMAC (`x-signature` no MP, `constructEvent` na Stripe) |
| 7 | **Grafia divergente do tier** | Não é ataque: backend emite `"Simula PRO"`, cliente compara com `"SIMULAPRO"` → aluno paga e continua FREE | Passo 9: o tier nasce no banco, com uma grafia só, definida por quem a escreve |
| 8 | **Dados de cartão no nosso servidor** | Número e CVV passando por log, APM ou dump de memória | Passo 4: o cartão vai direto do navegador para a gateway |
| 9 | **Ativação perdida em silêncio** | Notificação de pagamento aceita e descartada; o aluno paga e nunca recebe acesso, sem nada quebrar visivelmente | Webhook direto no Java + dedupe no banco: nada depende de um salto sem credencial |
| 10 | **Chave de pagamento em ambiente demais** | Vazamento no ambiente do frontend expõe a chave secreta da Stripe | As chaves passam a viver só no Java |
| 11 | **Acesso vitalício após cancelamento** | Aluno cancela e continua PRO indefinidamente | Webhook de cancelamento chegando ao Java revoga no banco |

> ⚠️ **Ponto de atenção da migração.** Os itens 1 a 7 estão hoje corrigidos e cobertos por
> testes automatizados no Next. Se a cadeia for para o Java sem reimplementá-los, todos voltam.
> O código atual serve de **especificação executável** do que precisa existir do outro lado.

---

## 6. O que o fluxo de 10 passos não cobre — e precisa entrar na conversa

Os dez passos descrevem a **primeira compra**, com o aluno na tela. Está correto e é o caso mais
comum. Mas uma assinatura tem vida depois da compra, e esses eventos **não têm ninguém no
navegador para disparar a chamada**:

| Evento | Quem sabe | Consequência de não tratar |
|---|---|---|
| Renovação mensal daqui a 11 meses | só a gateway | Aluno em dia perde o acesso na virada do ciclo |
| Aluno cancela a assinatura | só a gateway | **Continua PRO para sempre** |
| Cartão recusado na renovação | só a gateway | Inadimplência invisível |
| Boleto compensando em 3 dias | só a gateway | Aluno pagou e nunca recebe acesso |
| PIX pago depois de fechar o navegador | só a gateway | Idem |
| Estorno / chargeback | só a gateway | Serviço entregue sem receber |

O mecanismo para todos é o mesmo — **webhook** — e é justamente ele que hoje não funciona. No
desenho proposto, ele vira o passo complementar natural:

```text
11. gateway → backend:  "assinatura X foi renovada / cancelada / estornada"
12. backend:            verifica a assinatura HMAC da notificação
13. backend → gateway:  reconsulta o evento (não confia no corpo recebido)
14. backend → banco:    ativa, renova ou revoga
```

Sem os passos 11–14, o item 11 da tabela de vulnerabilidades continua aberto: **cancelamento
não revoga nada.** É o único caso com prejuízo financeiro direto e contínuo — serviço entregue
de graça, todo mês, até alguém corrigir o banco à mão, cliente por cliente.

---

## 7. Custo e risco — avaliação honesta

Esta seção existe para a decisão não ser tomada só pelo lado bom.

### O que o time Java precisa construir

| Item | Observação |
|---|---|
| Integração com o SDK da Stripe | criação de PaymentIntent e Subscription |
| Integração com o SDK do Mercado Pago | criação de pagamento PIX e boleto |
| Resolução de preço nas duas fontes | Price da Stripe, `preapproval_plan` do MP |
| Verificação de pagamento nas duas gateways | status, plano, titularidade |
| Verificação de assinatura dos dois webhooks | HMAC no MP, `constructEvent` na Stripe |
| Idempotência e dedupe por `(gateway, externalId)` | com tabela |
| Ativação, renovação e revogação de tier | com histórico |

É **uma ordem de grandeza a mais de trabalho** do que a alternativa mais barata da §8 (apenas
aceitar uma credencial de serviço num endpoint). E o endpoint `/subscriptions/activate` ainda
não existe do lado Java — a cadeia inteira é um pedido consideravelmente maior.

### Riscos

- **Reescrever pagamento que funciona tem risco próprio.** A cadeia atual está no ar, testada
  por 176 testes automatizados. Toda migração de código de cobrança carrega risco de regressão
  em algo que hoje não falha.
- **Janela de transição.** Enquanto o Java não estiver pronto, quem cobra é o Next. Precisa
  ficar claro quem responde por cada método durante a virada, e como é o corte.
- **Trabalho recente vira base, não produto final.** As correções desta última entrega
  (valor do servidor, titularidade, assinatura HMAC, idempotência) permanecem valiosas como
  especificação, mas o código Next de pagamento seria descontinuado.

### O que fica no Next de qualquer forma

Não some tudo. O Payment Element da Stripe precisa de um `clientSecret` e o PIX precisa do QR
code chegando ao navegador — então as rotas continuam existindo, agora como proxy fino, que é o
padrão documentado do projeto.

---

## 8. Alternativa mais barata, para comparação

Havia um caminho intermediário: **manter a cadeia no Next e dar ao Java um endpoint que aceite
credencial de serviço**, para os webhooks conseguirem chegar lá.

| | Mover tudo para o Java | Só destravar o webhook |
|---|---|---|
| Trabalho no Java | grande | pequeno |
| Resolve renovação e cancelamento | sim | sim |
| Elimina os dois catálogos de preço | sim | não |
| Chaves de pagamento em um só lugar | sim | não |
| Alinha com a arquitetura do `CLAUDE.md` | sim | não |
| Prazo para destravar | semanas | dias |
| Trabalho descartado depois | nenhum | vira retrabalho se a migração acontecer |

**O critério de desempate é um só: o time Java vai assumir pagamento em algum momento?**

- **Se sim** → ir direto. O caminho barato vira retrabalho, e o custo da migração só cresce com
  a base de assinantes.
- **Se não, ou não agora** → destravar o webhook resolve o prejuízo imediato, e o código atual
  do Next fica documentado como a especificação de uma migração futura.

---

## 9. Pontos de decisão

- [ ] Mover a cadeia de pagamento para o Java, ou apenas destravar o webhook?
- [ ] Se mover: quem implementa, em qual sprint, e como é a janela de transição?
- [ ] Os passos 11–14 (webhook e ciclo de vida) entram no mesmo escopo ou vêm depois?
- [ ] Quem responde por incidente de cobrança durante a transição?
- [ ] Qual a grafia oficial do tier no banco? (hoje o frontend normaliza porque nunca foi
      acordada — ver item 7 da tabela de vulnerabilidades)
- [ ] Os itens 1–7 entram como critério de aceite da implementação Java?

---

## 10. Referências no código

| Assunto | Onde |
|---|---|
| Arquitetura e regras do projeto | [`CLAUDE.md`](../CLAUDE.md) |
| Contrato exigido do BFF Java | [`CHANGES.md`](../CHANGES.md) — 1ª seção, item 1 |
| O que a migração fez no frontend | [`CHANGES.md`](../CHANGES.md) — 1ª seção |
| Histórico das correções de segurança | [`CHANGES.md`](../CHANGES.md) — 2ª seção |
| Encaminhamento das rotas de pagamento | `front/src/app/service/bffPayments.ts` |
