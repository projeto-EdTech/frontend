# Vestibuline — Front-End

Plataforma de preparação para vestibular e ENEM: simulados, estatísticas de desempenho,
biblioteca de provas e jogos de estudo. Público-alvo são estudantes de escola pública, na faixa
dos 17 anos.

[Documentação Geral](https://github.com/SimulaVest-organization/SimulaVest-Docs) · [Reportar Bug (Interno)](https://github.com/SimulaVest-organization/SimulaVest-Front/issues) · [Solicitar Melhoria](https://github.com/SimulaVest-organization/SimulaVest-Front/issues)

> **Este README é o mapa.** Os documentos abaixo são a fonte de verdade de cada assunto:
>
> | Assunto | Onde |
> |---|---|
> | Arquitetura, convenções e regras obrigatórias | [`CLAUDE.md`](CLAUDE.md) |
> | Setup, scripts, estrutura e testes | [`front/README.md`](front/README.md) |
> | Rota por rota da API | [`front/src/app/api/README.md`](front/src/app/api/README.md) |
> | Histórico detalhado de mudanças | [`CHANGES.md`](CHANGES.md) |
> | Decisão sobre a cadeia de pagamento | [`docs/Pauta_para_reuniao.md`](docs/Pauta_para_reuniao.md) |
> | Testes de carga | [`front/src/test/K6/README.md`](front/src/test/K6/README.md) |

---

## Sumario

1. [Visao Geral](#visao-geral)
2. [Arquitetura](#arquitetura)
3. [Stack](#stack)
4. [Funcionalidades Principais](#funcionalidades-principais)
5. [Estrutura do Repositorio](#estrutura-do-repositorio)
6. [Comencando (Setup Local)](#comencando-setup-local)
7. [Scripts Disponiveis](#scripts-disponiveis)
8. [Variaveis de Ambiente](#variaveis-de-ambiente)
9. [Autenticacao e Sessao](#autenticacao-e-sessao)
10. [Pagamento](#pagamento)
11. [Contextos Globais](#contextos-globais)
12. [Qualidade de Codigo](#qualidade-de-codigo)
13. [Pendencias Conhecidas](#pendencias-conhecidas)
14. [Contribuindo (Uso Interno)](#contribuindo-uso-interno)
15. [Licenca / Direitos de Uso](#licenca--direitos-de-uso)
16. [Contato](#contato)

---

## Visao Geral

Simulados, análise de desempenho, biblioteca de provas históricas e jogos de fixação. Foco em
personalização e em feedback que aponte a lacuna de conhecimento sem o aluno precisar procurar.

> AVISO: Este repositório é PRIVADO e de uso exclusivo da equipe. Nenhum trecho de código deve ser compartilhado externamente sem aprovação formal.

Objetivos:

- Tornar a prática recorrente simples e atrativa.
- Reduzir tempo para identificar lacunas de conhecimento.
- Oferecer métricas claras para evolução contínua.

## Arquitetura

**Este repositório é apenas o frontend.** Ele não tem banco de dados e não é o dono de nenhuma
regra de negócio. Quem guarda estado e decide é o **BFF Java**, alcançado por
`BACKEND_API_URL`.

```text
navegador  ──►  Next.js (este repo)  ──►  BFF Java  ──►  banco
                └── proxy fino:            └── dono das regras,
                    recebe, encaminha,         do estado e das
                    devolve                    chaves de gateway
```

O Next fala com o Java por **dois caminhos**, e escolher o certo importa:

1. **Server Component → BFF direto.** Preferido quando o dado é buscado na renderização. Sem
   salto no meio.
2. **Navegador → Route Handler (`src/app/api/`) → BFF.** Para o que o navegador precisa
   disparar: interação, formulário, polling.

Toda tela que combina dado do BFF com interatividade usa a divisão obrigatória:

```text
page.tsx                  orquestrador fino, só <Suspense>
  └── *DataServer.tsx     Server Component, busca no BFF
        └── *Client.tsx   'use client', estado e interação
```

Detalhamento e checklist de rota nova: [`front/src/app/api/README.md`](front/src/app/api/README.md).

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript 5**
- **Tailwind CSS 4** com `tailwind-merge` e `class-variance-authority`
- **Radix UI** / shadcn adaptado · **Lucide** · **Framer Motion**
- **NextAuth v4** — Google, Azure AD, Facebook, Discord
- **SWR** · **React Hook Form + Zod** · **Recharts** · **react-window**
- **Vitest 4** (unitários) · **k6** (carga)
- **Stripe Payment Element** — só a parte que roda no navegador
- **Google Generative AI** (explicações) · **Resend / EmailJS** (contato)
- Analytics: **GA4**, **PostHog**, **Microsoft Clarity** — só em produção

## Funcionalidades Principais

- Landing com vitrine de planos, com preço vindo do backend (nunca escrito no código).
- Simulados por instituição, com estatísticas de desempenho.
- Biblioteca de provas (`/library`) e consulta de nota de corte.
- Jogos de estudo: Arena, flash cards, Enigma, Lexoo, Nexo.
- Perfil com dashboard de desempenho e configuração de metas.
- Checkout do Simula PRO (`/paidPlan`) — cartão, PIX e boleto.
- Blog com newsletter.
- Tema claro/escuro (`data-theme` no `<html>`), modo escuro só para autenticado.
- Acessibilidade: fonte OpenDyslexic alternável por contexto próprio.

## Estrutura do Repositorio

```text
.
├── front/                  a aplicação Next.js — TODO comando roda daqui
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/        Route Handlers (proxies finos)  → README próprio
│   │   │   └── service/    funções puras de servidor: sessão, JWT, BFF
│   │   ├── components/     por rota, ou em ui/ quando compartilhado
│   │   ├── contexts/       providers globais
│   │   ├── hooks/          use<Nome>.ts
│   │   ├── lib/            utilidades de cliente e dados estáticos
│   │   └── test/           auth/ · payment/ (Vitest) · K6/ (carga)
│   └── vitest.config.mts
├── docs/                   pautas e notas de decisão
├── CLAUDE.md               arquitetura e regras obrigatórias
├── CHANGES.md              histórico detalhado
└── README.md               este arquivo
```

## Comencando (Setup Local)

Pré-requisitos: Node.js LTS (>= 20) e npm.

```bash
git clone https://github.com/SimulaVest-organization/SimulaVest-Front.git
cd SimulaVest-Front/front
npm install --legacy-peer-deps
npm run dev
```

O `--legacy-peer-deps` é **obrigatório**: há conflito de peer dependencies no projeto.

Crie o `.env` em `front/` antes do primeiro `dev`. Sem `BACKEND_API_URL` a aplicação sobe, mas
toda tela que depende do backend fica vazia.

Aplicação: <http://localhost:3000>

## Scripts Disponiveis

Todos rodam de `front/`.

| Script | Descrição |
| ------ | --------- |
| `dev` | Ambiente de desenvolvimento. |
| `dev:turbo` | Idem, com Turbopack. |
| `build` | Build de produção (roda o TypeScript junto). |
| `start` | Serve o build. |
| `test` | Vitest, uma passada. |
| `test:watch` | Vitest em watch. |
| `lint` | ⚠️ **quebrado** — ver [Qualidade de Codigo](#qualidade-de-codigo). |

## Variaveis de Ambiente

`.env` em `front/`. **Nunca versione.** Lista completa e comentada em
[`front/README.md`](front/README.md#variáveis-de-ambiente).

```env
NEXTAUTH_URL=
NEXTAUTH_SECRET=
BACKEND_API_URL=                       # BFF Java — NUNCA com prefixo NEXT_PUBLIC_
GOOGLE_CLIENT_ID= / GOOGLE_CLIENT_SECRET=
AZURE_AD_CLIENT_ID= / AZURE_AD_CLIENT_SECRET= / AZURE_AD_TENANT_ID=
FACEBOOK_CLIENT_ID= / FACEBOOK_CLIENT_SECRET=
DISCORD_CLIENT_ID= / DISCORD_CLIENT_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=    # chave pública do Payment Element
NEXT_PUBLIC_GA_ID= / NEXT_PUBLIC_CLARITY_ID=
NEXT_PUBLIC_POSTHOG_KEY= / NEXT_PUBLIC_POSTHOG_HOST=
```

**Regra:** `NEXT_PUBLIC_` só para identificador público não secreto. `BACKEND_API_URL`, segredos
de JWT e credenciais de provedor ficam sem o prefixo.

**Chaves de gateway não existem mais aqui.** `STRIPE_SECRET_KEY` e `MERCADO_PAGO_ACCESS_TOKEN`
passaram a viver só no Java — ver [Pagamento](#pagamento).

## Autenticacao e Sessao

Login por NextAuth (Google, Azure AD, Facebook, Discord). No primeiro login, o `id_token` do
provedor vai ao Java por `/api/sync-user`, que devolve um JWT próprio.

**Esse JWT vive só no cookie `user_data`, HttpOnly.** Nunca em `localStorage` ou
`sessionStorage` — o JavaScript não consegue lê-lo, e é isso que impede um script na página
(dependência comprometida, extensão, XSS) de levar a sessão embora.

Três consequências para quem escreve código:

- **Componente não monta `Authorization`.** O cookie acompanha sozinho todo `fetch`
  same-origin; a rota o lê no servidor com `readUserToken`.
- **Precisa do tier ou de outro claim na tela?** Pergunte a `GET /api/user/me` através de
  `src/lib/userClaims.ts`. O token não chega ao navegador.
- **Decodificação de JWT acontece em um lugar só:** `src/app/service/jwtDecoder.ts`.

Tiers: `FREE` · `Simula PRO` · `TEACHER` · `ADMIN`. O tier chega no claim `tipo`, é normalizado
no servidor (`"Simula PRO"`, `"simula_pro"` e `"SIMULAPRO"` caem no mesmo lugar; desconhecido
vira `FREE`) e chega à tela pelo hook `useUserTier`.

## Pagamento

A cadeia inteira do Simula PRO — resolver preço, criar cobrança na gateway, verificar se o
pagamento aconteceu, conferir titularidade e ativar o tier — **está no BFF Java**. Este
repositório não tem nenhum SDK de gateway server-side, e os webhooks da Stripe e do Mercado Pago
apontam direto para o Java.

O navegador manda **`{ planId }`** para iniciar e **`{ gateway, paymentId }`** para ativar. Nunca
valor, nunca status. O cartão vai direto do navegador para a Stripe pelo Payment Element.

> ⚠️ **Enquanto o Java não expuser os cinco endpoints, o checkout responde 503.** É o custo
> assumido do corte. O contrato exigido do backend está na primeira seção do
> [`CHANGES.md`](CHANGES.md); o raciocínio da decisão, em
> [`docs/Pauta_para_reuniao.md`](docs/Pauta_para_reuniao.md).

## Contextos Globais

Ordem de aninhamento em `layout.tsx`:

```text
NextAuthProvider
  └── ThemeProviderWrapper
        └── ProfileIconProvider
              └── AccessibilityProvider
                    └── UniversityStorage
                          └── PHProvider (PostHog)
```

| Contexto | Arquivo | Descrição |
| -------- | ------- | --------- |
| ThemeContext | `src/contexts/ThemeContext.tsx` | Tema claro/escuro via `data-theme` no `<html>`. Escuro só para autenticado. |
| ProfileIconContext | `src/contexts/ProfileIconContext.tsx` | Estado do ícone/letra do perfil. |
| AccessibilityContext | `src/contexts/AccessibilityContext.tsx` | Alterna a fonte OpenDyslexic. |
| UniversityStorage | `src/contexts/UniversityStorage.tsx` | Busca `/api/universities` na montagem. **Sem fallback estático:** falhando, expõe `error` e a lista fica vazia. |

`src/contexts/LoadingContext.tsx` existe no diretório mas **não está no `layout.tsx` nem é
importado por ninguém** — código morto.

## Qualidade de Codigo

- **Testes:** Vitest, em `front/src/test/**/*.test.ts`. Rode com `npm test`. Cobrem sessão via
  cookie, `/api/user/me`, a garantia de que o JWT não volta ao navegador, e a cadeia de
  pagamento como proxy fino.
- **Tipagem:** `npx tsc --noEmit`. É a rede de segurança principal hoje.
- **Carga:** k6, em `front/src/test/K6/`.
- **Lint:** ⚠️ `npm run lint` **está quebrado**. Chama `next lint`, removido no Next.js 16;
  chamar o ESLint direto falha com `TypeError: Converting circular structure to JSON`,
  incompatibilidade entre `eslint@9` e o `eslint-config-next` do projeto. Pendência aberta.
- **CI:** ainda não existe pipeline.

## Pendencias Conhecidas

Levantadas na auditoria de 06/08/2026 e registradas no [`CHANGES.md`](CHANGES.md). Nenhuma
bloqueia o dia a dia, e cada uma tem escopo próprio.

| Pendência | Efeito |
|---|---|
| Os cinco endpoints de pagamento do BFF Java | **Checkout responde 503** até subirem |
| `POST /api/simulations/save-result` não existe | resultado de simulado nunca chega ao backend |
| `POST /api/games/flash-cards` — a rota exporta só `GET` | acertos de flash card nunca são salvos (405) |
| `POST /api/generate-explanation` não existe | chamada de `ProfileClient` sempre falha |
| `npm run lint` quebrado | sem lint automatizado |
| Grafia do claim de tier e de newsletter não acordada com o Java | contornada por normalização no servidor |
| `src/lib/simulationStore.ts` e `src/contexts/LoadingContext.tsx` sem nenhum importador | código morto |
| `UniversityStorage` sem fallback estático | com o BFF fora do ar, toda tela que depende de instituição fica vazia |

## Contribuindo (Uso Interno)

Fluxo padrão interno:

1. Crie uma issue (se não existir) descrevendo objetivo, escopo, critérios de aceite e riscos.
2. Crie branch a partir de `main`. Convenções:

  - feat/area-descricao-curta
  - fix/area-breve-erro
  - chore/infra-ou-build
  - refactor/modulo-alvo

3. Commits semanticos (prefixos: feat:, fix:, refactor:, docs:, chore:, test:) evitar mensagens vagas.
4. Abra Pull Request vinculando issue (Closes #ID). Incluir:

  - Resumo da mudanca
  - Motivacao / contexto
  - Screenshots (UI) ou GIF
  - Impacto em performance / UX (se houver)
  - Passos de teste manual

5. Checklist antes de pedir review:

  - [ ] Build local passou
  - [ ] Lint sem erros (npm run lint)
  - [ ] Sem secrets hardcoded
  - [ ] Variaveis novas documentadas
  - [ ] Acessibilidade basica verificada (se UI nova)

6. Requer 1+ aprovação (ou 2 em mudanças críticas). Merge via squash.

Políticas rápidas:

- Não subir dependências sem justificar segurança/licença.
- Dados sensíveis: usar `.env` local + segredos no provedor.
- Evitar PII em logs.
- Não expor endpoints internos em comentários públicos.

Labels internas: `bug`, `enhancement`, `performance`, `security`, `design`, `blocked`.

## Licenca / Direitos de Uso

Código proprietário © SimulaVest. Todos os direitos reservados. Uso estritamente interno. 

Não distribuir, reproduzir ou derivar sem autorização formal. Caso seja necessária liberação externa (ex: snippet em blog), solicitar aprovação ao responsável técnico e jurídico.

## Contato

E-mail: <mailto:simulavest.contato@gmail.com>  
Organização: <https://github.com/SimulaVest-organization>

---

> Documento interno. Última atualização: 2026-08-06 — revisão após a cadeia de pagamento sair do
> Next e o JWT sair do `localStorage`.
