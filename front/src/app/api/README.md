# Rotas de API do frontend

`src/app/api/` contém os Route Handlers do Next.js (App Router). Salvo duas exceções listadas no
fim, eles são **proxies finos para o BFF Java**: recebem, encaminham e devolvem. Nenhuma regra de
negócio vive aqui — é a regra do [`CLAUDE.md`](../../../../CLAUDE.md) e vale para todo o diretório.

> **Última revisão:** 18/09/2026 — timeout em toda chamada ao BFF, sessão do NextAuth sem
> fragmentar, explicação de gabarito por IA com gate de tier no servidor e remoção das telas de
> pricing/payment.

---

## Como o frontend fala com o backend

Existem **dois** caminhos, e escolher errado é o erro mais comum neste projeto.

```text
1. Server Component  ──────────────────────────────────►  BFF Java
   lê o cookie com `cookies()` e chama BACKEND_API_URL direto.
   Sem salto intermediário: é o caminho preferido quando não há interatividade.

2. Navegador  ────►  Route Handler (src/app/api)  ────►  BFF Java
   o cookie HttpOnly acompanha sozinho o fetch same-origin;
   a rota o lê com `readUserToken` e repassa como Bearer.
```

**Quando usar cada um:** se o dado é buscado na renderização, use um Server Component
(`*DataServer.tsx`) e chame o BFF direto — uma rota no meio só adiciona latência. Rotas em
`src/app/api/` existem para o que o **navegador** precisa disparar: interação, formulário,
polling.

Server Components que já falam direto com o BFF: `Estatisticas/EstatisticasDados.tsx`,
`Library/LibraryUniversityDataServer.tsx`, `Simula_PRO/NotaCorteResultados.tsx`,
`Simula_PRO/SimulacaoLoader.tsx`, `UniversitiesCountBadge.tsx`, `blog/BlogDataServer.tsx`,
`blog/BlogPostDataServer.tsx`, `profile/ProfileDataServer.tsx`.

---

## Autenticação — leia antes de criar rota nova

O JWT do aluno vive **só** no cookie `user_data`, HttpOnly. O JavaScript não consegue lê-lo, e é
isso que impede um script na página (dependência comprometida, extensão, XSS) de levar a sessão
embora.

**Três consequências práticas:**

1. **O cliente não monta `Authorization`.** O cookie acompanha sozinho todo `fetch` same-origin.
   Um `Authorization: Bearer` montado no navegador só é possível se alguém guardou o token onde
   não devia.
2. **A rota lê o token com `readUserToken(req)`**
   ([`src/app/service/sessionToken.ts`](../service/sessionToken.ts)) — header primeiro, cookie
   depois. Não escreva outro parser: já existe um, e ele é o mesmo em todas as rotas.
3. **Nada de JWT em log.** Nem os primeiros caracteres.

Quem valida o token é o **BFF Java**. O `readUserToken` só prova que existe sessão e entrega o
Bearer a repassar; ele não decodifica nem verifica assinatura.

Quando a rota precisa do **tier** ou do `id` do aluno, use `readSessionClaims(req)`
([`src/app/service/sessionClaims.ts`](../service/sessionClaims.ts)) — o mesmo caminho do
`/api/user/me`, com as duas fontes de sessão e o tier já normalizado. Decidir tier por conta
própria é o que fazia o aluno ser PRO numa tela e FREE na seguinte.

```ts
import { readUserToken } from '@/app/service/sessionToken';

const userToken = readUserToken(request);
if (!userToken) {
  return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
}
```

---

## Timeout — toda chamada ao BFF tem teto

Sem teto próprio, uma chamada só desiste no connect timeout de 10s do undici — e, se o Java
aceitar a conexão sem responder, não desiste nunca. Toda chamada ao BFF (rotas, Server
Components e services) passa o sinal de
[`src/app/service/bffTimeout.ts`](../service/bffTimeout.ts):

```ts
import { bffTimeoutSignal, isBffUnreachable, BFF_UNREACHABLE_MESSAGE } from '@/app/service/bffTimeout';

const res = await fetch(url, { headers, cache: 'no-store', signal: bffTimeoutSignal() }); // 8s
// no catch:
if (isBffUnreachable(error)) {
  return NextResponse.json({ error: BFF_UNREACHABLE_MESSAGE }, { status: 504 });
}
```

`isBffUnreachable` separa timeout, DNS e conexão recusada de bug nosso — 504 no primeiro caso,
500/503 no segundo. Única exceção de contrato: `GET /api/Nota-corte` continua degradando para
lista vazia, porque a tela de configurações precisa abrir com o BFF fora. Cobertura em
`tests/route-timeouts.test.ts`.

---

## Inventário das rotas

### 🔐 Sessão e identidade

| Rota | Método | Endpoint no BFF | Sessão |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET` `POST` | — | — |
| `/api/sync-user` | `POST` | `POST /auth/google` | NextAuth |
| `/api/user/me` | `GET` | — (só decodifica) | `user_data`, com fallback na sessão NextAuth |
| `/api/user/stats` | `GET` | `GET /usuarios/{id}/estatisticas/geral` + `/performance-materia` | obrigatória |

**`/api/auth/[...nextauth]`** — núcleo do NextAuth. Configuração em [`src/lib/core/auth.ts`](../../lib/core/auth.ts):
Google (escopo só de `userinfo.profile` e `userinfo.email`), Azure AD, Facebook e Discord.
Renovação de token no callback `jwt`.

**`/api/sync-user`** — primeira ponte após o login OAuth. Pega o `id_token` do Google da sessão
NextAuth, manda ao Java, e **grava o JWT devolvido no cookie `user_data` HttpOnly**. É o único
ponto do fluxo que escreve esse cookie: se falhar, toda a aplicação se comporta como deslogada.

> O JWT **não volta no corpo**. A resposta é `{ ok, id, tipo }` — só o que o cliente usa para
> identificar o usuário nos analytics. Devolver o token daria ao navegador como guardá-lo, que é
> exatamente o que esta arquitetura evita.

Aceita o JWT do Java em cinco grafias — `string` crua, `{ token }`, `{ accessToken }`, `{ jwt }` e
`{ data: { token } }` — apara o prefixo `Bearer` e só grava o cookie se `decodeJWT()` devolver
payload válido. Timeout de **8s** (`bffTimeoutSignal`), abaixo dos 10s do undici.

Lê o `id_token` de `googleIdToken` na sessão — o callback `jwt` guarda só esse campo. Sessões
emitidas antes de 18/09/2026 trazem o formato legado `googleAccount.id_token`, que continua
aceito até expirarem.

Os modos de falha são distinguíveis **no log do servidor**, porque na tela são idênticos:

| Log | Significado | Status |
|---|---|---|
| `[sync-user][ABORT]` | sessão NextAuth sem `id_token` do Google | 401 |
| `[sync-user][NET]` | não alcançou o BFF — rede, firewall, host errado | **504** |
| `[sync-user][BFF]` | o Java respondeu, mas com erro | relay do status |
| `[sync-user][SHAPE]` | respondeu OK, sem JWT utilizável no corpo | **502** |
| `[sync-user][BUG]` | exceção nossa | 500 |

Um 401 persistente em `/api/user/me` quase sempre começa aqui — ver a seção de conectividade com
o BFF no [`README.md`](../../../../README.md) da raiz antes de suspeitar da rota `me`.

**`/api/user/me`** — o substituto de decodificar o JWT no navegador. Lê o cookie no servidor,
decodifica com [`jwtDecoder.ts`](../service/jwtDecoder.ts) e devolve **apenas os claims de tela**:

```jsonc
{ "id": "...", "nome": "...", "email": "...", "tier": "SIMULAPRO", "newsletter": true }
```

`tier` já vem normalizado (`FREE` | `SIMULAPRO` | `TEACHER` | `ADMIN`). Nunca devolve `token`,
`exp`, `iat` nem o payload cru.
Consumida por [`src/lib/core/userClaims.ts`](../../lib/core/userClaims.ts), que é quem os componentes usam.

Tem **duas fontes de sessão**, e só responde 401 quando as duas faltam:

| Ordem | Cookie | Traz | Quando entra |
|---|---|---|---|
| 1 | `user_data` | tudo | sempre que existe e decodifica |
| 2 | `next-auth.session-token` | `nome`, `email`, `tier` — `id` é `null` e `newsletter` é `false` | `user_data` ausente, ilegível ou vencido |

A fonte 2 existe porque um `sync-user` que falha deixa o aluno autenticado no OAuth mas sem
`user_data` — e sem ela a aplicação inteira o trata como deslogado. O header
**`X-Claims-Source`** (`user_data` | `next-auth`) diz qual respondeu; `next-auth` é sinal de que
o problema está no `/api/sync-user`.

Esse cookie do NextAuth chegava **fragmentado** (`next-auth.session-token.0`, `.1`, …) porque o
callback `jwt` guardava o `account` inteiro do Google. A origem foi corrigida em 18/09/2026: o
callback guarda só `googleIdToken`, `accessToken`, `refreshToken` e `expires_at`, e a sessão
cifrada cabe num cookie só (`tests/auth-session-cookie.test.ts`). A remontagem continua para
sessões antigas e como defesa. Quem remonta é `readNextAuthSessionToken(req)` de [`sessionToken.ts`](../service/sessionToken.ts), ordenando
pelo sufixo **numérico** e reconhecendo também o nome `__Secure-` de produção. E ele é um **JWE
cifrado**, não um JWT: `jwt-decode` não o lê — quem abre é o `decode` do `next-auth/jwt` com a
`NEXTAUTH_SECRET`. A regra "só o `jwtDecoder` lê JWT" continua valendo: ela é sobre o token do
Java, e o token do NextAuth não é JWT.

O `id` do fallback é **sempre `null`**, nunca o `sub` do NextAuth: `SyncUserEffect` só pula a
sincronização quando `claims.id` é truthy, então preenchê-lo faria o `user_data` nunca ser gravado.

**`/api/user/stats`** — desempenho do aluno para o dashboard do perfil. Extrai o `id` do JWT e
busca as duas fontes do Java **em paralelo** (`Promise.all`), sem cascata: estatísticas gerais e
performance por matéria. A resposta é achatada no formato que a tela consome.

---

### 💳 Pagamento — Simula PRO

A cadeia inteira (resolver preço, criar cobrança na gateway, verificar pagamento, conferir
titularidade, ativar tier) vive **no Java**. Nenhum SDK de gateway existe neste repositório.
As rotas passam por [`src/app/service/bffPayments.ts`](../service/bffPayments.ts).

| Rota | Método | Endpoint no BFF | Sessão |
|---|---|---|---|
| `/api/subscriptions/activate` | `POST` | `POST /subscriptions/activate` | NextAuth **e** JWT |

> **Checkout fora da Fase 1.** As rotas de cobrança (`/api/plans`, `/api/process-subscription/*`)
> saíram em `83575da`, e as telas que as chamavam (`components/pricing/*`, `components/payment/*`)
> saíram em 18/09/2026. O contrato abaixo fica registrado para quando o checkout voltar — o
> `sanitizeCheckoutBody` de `bffPayments.ts` continua pronto para ele.

**Corpo das rotas de cobrança** (quando voltarem) — idêntico para os três métodos:

```jsonc
{
  "planId": "anual",
  "payer": {
    "first_name": "Maria",
    "last_name": "Silva",
    "identification": { "type": "CPF", "number": "12345678909" },
    // só no boleto: o Mercado Pago exige endereço para boleto registrado
    "address": { "zip_code": "...", "street_name": "...", "street_number": "...",
                 "neighborhood": "...", "city": "...", "federal_unit": "..." }
  }
}
```

> **`sanitizeCheckoutBody` remonta esse corpo do zero, por allowlist.** Campo que não estiver
> acima é descartado por não ter sido pedido — inclusive nomes que ninguém previu (`valor`,
> `preco`, `desconto`). **Valor, status e e-mail do pagador nunca saem do navegador:** o preço
> vem da gateway e o e-mail vem da sessão, os dois resolvidos no Java. É o que torna a
> conferência de titularidade possível.

**`/api/subscriptions/activate`** — o passo final. O navegador manda **só um identificador**:

```jsonc
{ "gateway": "stripe" | "mercadopago", "paymentId": "pi_123" }
```

O Java consulta a gateway, confere a titularidade contra a sessão e ativa o tier. O que sobra
para o Next é mecânica de cookie: num `200` com `token`, regrava `user_data` — e o tier passa a
valer sem o aluno relogar. **O token não vai no corpo da resposta.**

Status repassados sem tradução: `200` ativado · `202` pendente · `403` titularidade divergente ·
`404` gateway não conhece o id · `409` falhou.

Hoje uma origem chama esta rota:
[`usePendingPaymentReconciliation`](../../hooks/usePendingPaymentReconciliation.ts) (pagamento
pendente reconciliado no próximo acesso, via `SyncUserEffect`).
[`usePixPaymentStatus`](../../hooks/usePixPaymentStatus.ts) também a chama, mas nenhuma tela
monta o hook desde que o formulário de PIX saiu.

**Erros nunca vazam.** Acima de 2xx, `callBff` substitui o corpo do Java por mensagem genérica do
próprio status — o corpo original pode carregar host, stack ou nome de classe interna. Timeout e
BFF inalcançável viram `504`; outra falha de rede e `BACKEND_API_URL` ausente viram `503`.

---

### 📚 Conteúdo acadêmico

| Rota | Método | Endpoint no BFF | Sessão |
|---|---|---|---|
| `/api/universities` | `GET` | `GET /api/instituicao` | obrigatória |
| `/api/questions/[university]` | `POST` | `POST /api/prova/instituicao` | — |
| `/api/estatisticas/[subject]` | `GET` | `GET /api/instituicao/estatisticas/{id}/{materia}` | — |
| `/api/Nota-corte` | `GET` `POST` | `GET /nota-corte/cursos` · `GET /nota-corte/media` | obrigatória |
| `/api/blog` | `GET` | `GET /api/artigos` | — |
| `/api/blog/[slug]` | `GET` | `GET /api/artigos/{id}` | — |

**`/api/Nota-corte`** — `GET` lista os cursos; `POST` calcula a aprovação:

```jsonc
{ "userScore": 750, "targetCourse": "Medicina", "targetInstitution": "USP" }
```

**`/api/universities`** — consumida por [`UniversityStorage`](../../contexts/UniversityStorage.tsx),
que é provider global.

> ⚠️ **Não existe fallback estático.** O contexto apenas expõe `error` quando a rota falha, e a
> lista fica vazia — nenhum arquivo `src/lib/dataUniversity` existe no repositório, apesar de
> documentação antiga afirmar o contrário. Toda tela que depende de instituição fica vazia com o
> BFF fora do ar.

---

### 🤖 IA

| Rota | Método | Origem | Sessão |
|---|---|---|---|
| `/api/generate-explanation` | `POST` | Gemini 2.5 Flash (streaming) | obrigatória — `readSessionClaims` |

**`/api/generate-explanation`** — explicação do gabarito de uma questão. Corpo
`{ enunciado, gabarito }` (até 20 mil caracteres cada); resposta `text/plain` em streaming.

| Situação | Status |
|---|---|
| sem sessão | 401 |
| corpo inválido, sem `enunciado`/`gabarito` | 400 |
| FREE sem cota no dia | 429 — `{ error, limite }` |
| `GEMINI_API_KEY` ausente | 503 |
| Gemini não respondeu em 30s | 504 |
| Gemini falhou antes de começar | 502 |

O tier sai da sessão, no servidor (`isPaidTier`). PRO não tem cota; FREE tem **5 explicações
por dia** (fuso de Brasília), contadas em cookie HttpOnly `ai_explanations` com `path` restrito à
rota — ver [`aiExplanationQuota.ts`](../service/aiExplanationQuota.ts). O saldo volta no header
`X-AI-Quota-Remaining` (`unlimited` para PRO). A cota só é debitada depois que o Gemini aceitou a
requisição.

> **Limite conhecido:** é cota de navegador — apagar o cookie pelas ferramentas de desenvolvedor
> recomeça a contagem. Medição à prova disso precisa de estado no servidor, que mora no BFF Java.

---

### 🎮 Jogos e utilitários

| Rota | Método | Origem dos dados | Sessão |
|---|---|---|---|
| `/api/games/flash-cards` | `GET` | `GET /flashcards/recomendacao?userId=` | obrigatória |
| `/api/get-logo` | `GET` | sistema de arquivos (`public/Logo_Universidades`) | — |

**`/api/get-logo`** — a única rota que não fala com o BFF. Resolve o caminho da imagem do logo
tolerando variações de nome e slug (`PUC-SP` vs `pucsp`).

---

## Mapa de consumo

| Rota | Quem chama |
|---|---|
| `/api/sync-user` | `components/SyncUserEffect.tsx` |
| `/api/user/me` | `lib/core/userClaims.ts` → `hooks/useUserTier.ts`, `components/blog/SubscribeButton.tsx`, `components/SyncUserEffect.tsx` |
| `/api/user/stats` | `components/profile/ProfileClient.tsx` (SWR) |
| `/api/subscribe` | `components/blog/SubscribeButton.tsx` |
| `/api/subscriptions/activate` | `hooks/usePendingPaymentReconciliation.ts` (e `hooks/usePixPaymentStatus.ts`, que nenhuma tela monta) |
| `/api/generate-explanation` | `components/profile/RevisaoIA.tsx` (aba **Revisão** do perfil) |
| `/api/universities` | `contexts/UniversityStorage.tsx`, `components/Simula_PRO/NotaCorteConsulta.tsx`, `components/profile/UserConfig.tsx` |
| `/api/Nota-corte` | `components/Simula_PRO/NotaCorteConsulta.tsx`, `components/profile/ProfileClient.tsx`, `components/profile/UserConfig.tsx` |
| `/api/games/flash-cards` | `components/games/flash-card_game/functions/flash-cardlogic.ts` |
| `/api/get-logo` | `components/Simula_PRO/CourseCard.tsx`, `components/Simula_PRO/NotaCorteConsulta.tsx` |
| `/api/questions/[university]`, `/api/estatisticas/[subject]`, `/api/blog`, `/api/blog/[slug]` | sem consumidor via `fetch` no cliente — as telas correspondentes usam Server Components que chamam o BFF direto |

---

## ⚠️ Chamadas quebradas conhecidas

Registradas na auditoria de 06/08/2026. Nenhuma foi introduzida por ela, e cada uma tem escopo
próprio — **não invente a rota sem antes conferir o contrato com o time Java**.

| Chamada no cliente | Problema |
|---|---|
| `POST /api/simulations/save-result` (`Simula_PRO/SimulationQuizClient.tsx`) | a rota existe, mas encaminha para o caminho provisório `/CAMINHO DO BACKEND` — o resultado do simulado nunca chega ao backend |
| `POST /api/games/flash-cards` (`flash-card_game/functions/flash-cardlogic.ts`) | a rota exporta **só `GET`** → responde 405; os acertos nunca foram salvos |

Outros pontos abertos: [`src/lib/simulationStore.ts`](../../lib/simulationStore.ts) não é
importado por ninguém, e a grafia do claim de newsletter diverge (`newsletter` na interface do
payload, `newsLetter` no botão do blog — `/api/user/me` aceita as duas como contorno).

---

## Checklist para criar uma rota nova

1. **É mesmo necessária?** Se o dado é buscado na renderização, um Server Component chamando o
   BFF direto é melhor.
2. **Proxy fino.** Recebe, encaminha, devolve. Regra de negócio vai para o Java.
3. **`process.env.BACKEND_API_URL`** — nunca URL no código, nunca `NEXT_PUBLIC_`.
4. **Sessão com `readUserToken(req)`**, 401 antes de qualquer chamada externa. Precisa de tier
   ou `id`? `readSessionClaims(req)`.
5. **Timeout:** `signal: bffTimeoutSignal()` em todo `fetch` ao BFF, e `isBffUnreachable` → 504
   no `catch`.
6. **Erro do BFF não chega ao navegador.** Nada de stack, host ou nome de classe. Rotas de
   pagamento já têm isso pronto em `callBff`.
7. **Comentário de cache strategy** no topo do arquivo:

   ```ts
   // CACHE STRATEGY: no-store — dados financeiros, sem cache
   // CACHE STRATEGY: ISR — revalidate 300s — catálogo público
   ```

8. **Teste** em `front/tests/`, sufixo `.test.ts` (Vitest). Some a rota nova ao `describe.each` de
   `tests/route-timeouts.test.ts`.
