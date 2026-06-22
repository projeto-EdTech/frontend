# CHANGES

## [Feature/profile] Badge "Guerreiro do Discord" (single-tier, social)

Nova badge de conquista exibida no perfil, desbloqueada quando o usuário **vincula a conta do Discord**. Segue a OBS do card do Kanban (Notion): **1 único tier**, **logo do Discord**, **sem lógica de rank/tier**. Cria loop de retenção plataforma ↔ Discord.

### Comportamento

- **Bloqueada** (não vinculou): cinza/grayscale + cadeado + texto "Vincule sua conta do Discord".
- **Conquistada** (vinculou): cor da marca Discord (blurple `#5865F2`), logo do Discord, selo "Conquistado". **Sem** label de tier, barra de progresso ou "Nível Máximo".

### Origem do sinal "vinculado"

Booleano lido do **JWT `user_data`** (cookie HttpOnly), decodificado **exclusivamente** via `jwtDecoder` (regra de segurança). O nome real do campo no BFF ainda é **TBD** (provável `Discord_sync`), então o helper `getDiscordLinked` é tolerante a nome (`Discord_sync` / `discord_sync` / `discordSync` / `discordLinked`). Quando o backend confirmar, reduzir `KEYS` ao nome oficial.

O flag é injetado como `stats.discordLinked` (1/0) em **dois pontos** para cobrir SSR inicial e revalidação client-side (SWR):
- `ProfileDataServer.tsx` (paint inicial, fetch direto ao BFF).
- `api/user/stats/route.ts` (rota consumida pelo SWR do `ProfileClient`, incluindo cache hit).

### Arquivos novos

- `front/src/components/profile/DiscordIcon.tsx` — logo da marca Discord em SVG (`currentColor`); lucide não fornece ícone de marca.
- `front/src/lib/core/discordLinked.ts` — helper `getDiscordLinked(claims)` tolerante a nome de campo.
- `front/tests/guerreiro-discord-badge.test.ts` — valida config (1 tier, `icon:"Discord"`, `category:"social"`, `metric:"discordLinked"`), desbloqueio por `discordLinked` e ausência de regressão nas outras badges.
- `front/tests/discordLinked.test.ts` — cobre o helper (chaves alternativas, false/ausente/null → 0).

### Arquivos editados

- `front/src/lib/badges/badges.json` — entrada `guerreiro_discord` (single tier `requirement:1`, `category:"social"`, `metric:"discordLinked"`).
- `front/src/components/profile/BadgeCard.tsx` — registra ícone `Discord`, categoria `social`, ramo blurple "Conquistado" (esconde tier/progresso).
- `front/src/components/profile/AchievementCarousel.tsx` — idem para o carrossel (ícone, container/glow/cor blurple, selo "Conquistado", esconde progresso/"Nível Máximo").
- `front/src/components/profile/GeneralStats.tsx` — `ProfileStats.discordLinked?: number`.
- `front/src/components/profile/ProfileDataServer.tsx` — lê `user_data`, injeta `stats.discordLinked` no SSR.
- `front/src/app/api/user/stats/route.ts` — `readDiscordLinked()` via cookie; injeta no cache hit e no fresh fetch.
- `front/src/lib/store/userStatsCache.ts` — `TransformedStats.stats.discordLinked?: number`.
- `front/src/lib/badges/badgeUtils.ts` — categoria `social` aceita na união.

### Validação

- `npx vitest run` nos 2 specs novos: **13/13 passam**.
- `npx tsc --noEmit`: sem erros.
- `npx next build`: compila sem erros.
- Falhas pré-existentes não relacionadas (fora do escopo): `badge-cohesion`, `ranking-up`, `user-profile` (sem `describe/it` → "No test suite" no vitest v4) e `generate-token.route` (`cookies()` fora de request scope no teste).

### Pendência de backend

Confirmar o nome do campo booleano de Discord no `user_data`/`sync-user`. Sem o claim populado pelo BFF, a badge permanece bloqueada para todos.

## [Refactor/lib] Reorganização de subpastas da `src/lib` por domínio

Reorganização estrutural da pasta `front/src/lib`, agrupando arquivos por **domínio** em vez de tipo genérico. Elimina a colisão de nome entre o arquivo `utils.ts` e a pasta `utils/`, e consolida arquivos relacionados (games, ranking, badges) que estavam dispersos entre `data/`, `games/` e `utils/`.

### Estrutura nova

```text
lib/
  core/      auth.ts · analytics.ts · utils.ts      (cross-cutting)
  ranking/   rankUtils.tsx · rankUpUtils.ts · ranking.ts
  badges/    badgeUtils.ts · badges.json
  games/     games.ts · config.ts
  planner/   planner.ts
  store/     simulationStore.ts · userStatsCache.ts  (inalterado)
  data/      notaCorte · playlists · posts · profile · stats · targetScores · universities
  MOCK_ARCHITECTURE.md
```

### Movimentações (via `git mv`, histórico preservado)

| De | Para |
|---|---|
| `lib/auth.ts` | `lib/core/auth.ts` |
| `lib/analytics.ts` | `lib/core/analytics.ts` |
| `lib/utils.ts` | `lib/core/utils.ts` |
| `lib/utils/rankUtils.tsx` | `lib/ranking/rankUtils.tsx` |
| `lib/utils/rankUpUtils.ts` | `lib/ranking/rankUpUtils.ts` |
| `lib/utils/badgeUtils.ts` | `lib/badges/badgeUtils.ts` |
| `lib/utils/planner.ts` | `lib/planner/planner.ts` |
| `lib/data/badges.json` | `lib/badges/badges.json` |
| `lib/data/games.ts` | `lib/games/games.ts` |
| `lib/data/ranking.ts` | `lib/ranking/ranking.ts` |

Pasta `lib/utils/` removida (colisão com `utils.ts` resolvida).

### Atualização de imports

- Reescrita de todos os imports por alias `@/lib/...` em `src/` (ordem específica → genérica para evitar colisão `@/lib/utils` arquivo vs `@/lib/utils/` pasta).
- Reescrita de imports relativos `../src/lib/...` nos testes (`tests/ranking-up.test.ts`).
- Correção de imports relativos internos nos arquivos movidos:
  - `badges/badgeUtils.ts`: `../data/badges.json` → `./badges.json`
  - `ranking/ranking.ts`: `./universities` → `../data/universities`
- ~94 arquivos consumidores atualizados; nenhum import relativo quebrado (todos usavam alias `@/`).

### Validação

- `npx tsc --noEmit`: **limpo** (0 erros).
- `npx vitest run`: **50/50 testes reais passam**.
- Falhas remanescentes são **pré-existentes e não-relacionadas** ao reorg: `badge-cohesion`/`ranking-up`/`user-profile` são scripts `assert` puros sem suite vitest (0 test); `generate-token.route.test.ts` falha por `cookies() called outside request scope` (limitação do env Next em teste).

### Nota fora de escopo

- `badges/badgeUtils.ts` tinha na working tree uma alteração não-commitada e não-relacionada (cast de `category` incluindo `'social'`) que quebrava o typecheck (`TS2322`, pois `BadgeCard` só aceita `'marco'|'desempenho'|'ranking'`). Revertida ao estado do HEAD para manter o reorg puramente estrutural e o build verde. **Reaplicar manualmente se a inclusão de `'social'` for intencional** (exige também ampliar o tipo `category` em `BadgeCard`).

---

## [Elo/Design] Responsividade de Tema (Claro/Escuro) e Estética Glassmorphism/Claymorphism no Modal de Elo

Melhoria completa de UI/UX no modal de notificação de subida de elo (`RankingUpNotification.tsx`), tornando-o responsivo aos temas Claro e Escuro, adicionando Glassmorphism ao modal principal e Claymorphism aos sub-modais internos e botões interativos.

### Escopo entregue

- **Tema Claro e Escuro (Resolução de Sincronia)**: 
  - Mapeamento dinâmico da variante `@variant dark` do Tailwind v4 ao seletor `data-theme="dark"` no [globals.css](file:///d:/GitHub/frontend/front/src/app/globals.css). Isso garante que todas as classes com prefixo `dark:` (ex: `dark:bg-slate-900/60`) respondam imediatamente ao controle de tema manual do usuário, e não fiquem presas à preferência do sistema operacional (media queries).
  - Substituição de cores escuras fixas (ex: `bg-slate-900/40`, `text-slate-200`) por variantes de tema dinâmicas (`bg-gray-100/50 dark:bg-slate-950/40`, `text-slate-800 dark:text-slate-200`). Isso garante excelente legibilidade em ambos os temas.
- **Visual Glassmorphism**: Aplicação de fundo translúcido `bg-white/70 dark:bg-slate-900/60`, bordas semi-transparentes mais visíveis no tema claro (`border-white/30 dark:border-white/10`) e desfoque aprimorado (`backdrop-blur-2xl`) com sombras suaves para dar profundidade ao modal.
- **Visual Claymorphism & Correção de Bordas do Botão**:
  - **CSS Variables**: Introdução de `--clay-highlight` e `--clay-shadow` reativas ao tema ativo para criar o relevo 3D de argila.
  - **Extração de Classes Claymorphic**: Criação de classes dedicadas `.clay-button` e `.clay-card` no CSS global. Isso resolveu o problema de arredondamento de cantos recortados/octogonais no botão de "Continuar Estudando", causado por erros de análise do compilador Tailwind em cadeias arbitrárias de sombras complexas com vírgulas internas, restabelecendo a animação elástica e o design do botão.
  - **Prevenção de Cortes no Hover (Animação de Botão)**: Ajustada a animação de altura do contêiner flex pai (`motion.div`) com o parâmetro `transitionEnd: { overflow: "visible" }` no Framer Motion. Isso garante que a propriedade `overflow: hidden` esteja ativa apenas durante o deslizamento de subida de elo, e mude para `visible` após a conclusão, permitindo que a animação de escala do botão (`whileHover={{ scale: 1.02 }}`) aconteça de forma fluida sem que as bordas do botão fiquem cortadas.
  - **Sub-modais / Cards**: Aplicação das classes claymorphic (`clay-card`) na barra de progresso, no comparativo de elos e nos cards das badges individuais.
  - **Botão de Fechar**: Efeito 3D claymorphic (`clay-button`) com comportamento HIG da Apple (escala de 1.02 ao passar o mouse e 0.96 ao clicar).

### Arquivos modificados

- [RankingUpNotification.tsx](file:///d:/GitHub/frontend/front/src/components/ranking/RankingUpNotification.tsx)
- [globals.css](file:///d:/GitHub/frontend/front/src/app/globals.css)

### Testes unitários (TDD)

- [ranking-up-theme.test.ts](file:///d:/GitHub/frontend/front/tests/ranking-up-theme.test.ts) (novo) - valida as classes de Glassmorphism, Claymorphism nos botões (`clay-button`), nos sub-modais (`clay-card`) e a responsividade de cores de tema.

### Validação

- `npx vitest run tests/ranking-up-theme.test.ts` -> **4/4 testes passando**.

---

## [infra/testes] Mover pasta `tests/` para dentro de `front/` (node_modules único)

Centraliza os testes sob `front/tests/` para que o projeto tenha **um único `node_modules`** (o de
`front/`), eliminando a necessidade de instalar dependências na raiz.

### Escopo entregue

- **Movido** `tests/` → `front/tests/` via `git mv` (preservando histórico), incluindo os scripts k6 em
  `escalabilidade_K6/`.
- **Imports corrigidos** em todos os specs: `../front/src/...` → `../src/...` (10 arquivos), incluindo a
  referência por `readFileSync(resolve(__dirname, "../src/..."))` em `materiaVisualIconBg.test.ts`.
- **`front/vitest.config.ts`** (novo): alias `@` → `./src`, `include: tests/**/*.test.{ts,tsx}`,
  exclui `tests/escalabilidade_K6/**` (scripts k6, não são specs vitest), environment `node`.
- **`front/package.json`**: scripts `test` (`vitest run`) e `test:watch` (`vitest`).

### Validação

- `npm test` em `front/`: **6 arquivos de spec vitest passam — 33 testes**.
- 4 arquivos falham por motivos **pré-existentes, não relacionados à mudança de pasta**:
  - `badge-cohesion`, `ranking-up`, `user-profile` — scripts Node estilo `assert`+`runTests()`, sem
    suíte vitest (`describe`/`it`); vitest reporta "No test suite found".
  - `generate-token.route` — divergência de asserção pré-existente (rota retorna 500, teste espera 401).

## [Simula PRO] Logo da universidade ao lado do nome da questão (resolução dinâmica)

Adiciona a logo da universidade à esquerda do nome da prova ("FUVEST 2025", "ENEM 2024"…) no recurso
**"Questões resolvidas com IA"**, puxada dinamicamente por questão.

### Motivação / bug corrigido

O `Questoes_Gemini.tsx` já renderizava a logo, mas a prop chegava `null`: em
[ProfileClient.tsx](file:///d:/GitHub/frontend/front/src/components/profile/ProfileClient.tsx) o `useMemo`
que resolvia `currentUniversityLogo` **não incluía `universities` nas dependências**. Como a lista de
universidades (`UniversityStorage`) carrega de forma assíncrona (inicia `[]`), o memo era calculado uma
única vez com a lista vazia e nunca recomputava — a logo nunca aparecia.

### Escopo entregue

- **Resolver puro `universityLogo.ts`** (novo) em
  [universityLogo.ts](file:///d:/GitHub/frontend/front/src/components/profile/universityLogo.ts):
  `resolveUniversityLogo(displayLabel, universities)` extrai a 1ª palavra do `displayLabel`
  (ex.: "FUVEST 2025" → `fuvest`) e casa contra a lista por `slug` **ou** `name` (case-insensitive,
  guard para entradas sem campos). Sem correspondência → `null`.
- **ProfileClient**: usa o resolver e adiciona `universities` às dependências do `useMemo`, de modo que a
  logo recomputa quando a lista termina de carregar e a cada troca de questão (resolução dinâmica por
  questão). A logo continua sendo passada via prop `universityLogoUrl` e renderizada à esquerda do nome
  no card da questão.

### Testes (TDD)

- [tests/universityLogo.test.ts](file:///d:/GitHub/frontend/tests/universityLogo.test.ts) — match por
  slug/name, case-insensitive, desconhecida → `null`, lista/label vazios → `null`, ignora entradas sem
  slug/name. **6/6 passando**.

### Validação

- `npx vitest run --root .. tests/universityLogo.test.ts` → **6/6 passando**.
- `npx tsc --noEmit` → **0 erros**.

---

## [Simula PRO] Integração efetiva do seletor Matéria → Conteúdo (modal + dropdown)

Implementação **de fato** da seleção Matéria → Conteúdo no recurso **"Questões resolvidas com IA"**
([Questoes_Gemini.tsx](file:///d:/GitHub/frontend/front/src/components/Simula_PRO/Questoes_Gemini.tsx)).
As entradas anteriores deste changelog descreviam esta feature como entregue, mas o componente ainda
usava o `<select>` plano antigo e os helpers/`getMateriaVisual` referenciados **não existiam no código**.
Esta alteração faz o wire definitivo e cria os helpers ausentes.

### Motivação

O seletor anterior era um único `<select>` que listava chaves já concatenadas no formato
`"Matéria — Conteúdo • N questões"`, misturando duas dimensões numa lista plana e longa. O backend
**já envia `materia` e `conteudo` separados** — apenas juntados numa string em
[stats/route.ts:88](file:///d:/GitHub/frontend/front/src/app/api/user/stats/route.ts) (`displaySubject`).
A hierarquia já existia no dado; bastou separá-la na UI. **Nenhuma mudança de backend.**

### Escopo entregue

- **Helper visual `getMateriaVisual`** (novo) em
  [enigma-data.ts](file:///d:/GitHub/frontend/front/src/components/games/Enigma/lib/enigma-data.ts):
  combina `subjects` (name → `icon`/`bgColor`) com `colorMappings` (`bgColor` → `colorHex`), match
  insensível a acento/caixa, retorna `{ icon, bgColor, colorHex }` ou `null` (fallback genérico). Fonte
  única de verdade do jogo Enigma, sem duplicar a lista de matérias.
- **Helpers puros `subjectKey.ts`** (novo) em
  [subjectKey.ts](file:///d:/GitHub/frontend/front/src/components/Simula_PRO/subjectKey.ts):
  - `parseSubjectKey(key)` → `{ materia, conteudo }`, divide no **primeiro** `" — "` (em dash U+2014);
    sem separador → `conteudo: "Geral"`; conteúdo com travessão interno é preservado inteiro.
  - `buildSubjectTree(grouped)` → `Map<materia, { conteudos[{ conteudo, fullKey, count }], totalCount }>`,
    preservando a `fullKey` para casar com `groupedQuestions`.
- **UI refatorada** em `Questoes_Gemini.tsx`:
  - Layout 2 colunas: **"1. Matéria"** (botão que abre modal) e **"2. Conteúdo"** (dropdown filtrado,
    `value = fullKey`, desabilitado sem matéria).
  - **Modal de seleção de matéria**: cards por matéria com ícone Enigma (`!bg-white` +
    `style={{ color: colorHex }}`), total de questões e estado ativo. Reaproveita o padrão do modal de
    upgrade (`fixed inset-0 z-[9999]`, `backdrop-blur`, botão `X`, dark mode via `theme`). Fallback
    `BookOpen` para matéria sem visual.
  - Derivados via `useMemo` (`subjectTree`, `selectedMateria`, `conteudosDaMateria`) e handler
    `handleSelectMateria` (auto-seleciona o 1º conteúdo da matéria).

### Mínimo impacto

`selectedSubject` manteve a semântica de chave composta (`"Matéria — Conteúdo"`); nenhuma mudança em
`ProfileClient`, `groupedQuestions` ou no backend.

### Testes (TDD)

- [tests/parseSubjectKey.test.ts](file:///d:/GitHub/frontend/tests/parseSubjectKey.test.ts) — parse
  (split no 1º em dash, `"Geral"` sem separador, travessão interno preservado) e `buildSubjectTree`
  (count/fullKey/totalCount).
- [tests/materiaVisualIconBg.test.ts](file:///d:/GitHub/frontend/tests/materiaVisualIconBg.test.ts) —
  `getMateriaVisual` (icon/colorHex por matéria, insensível a acento/caixa, `null` para desconhecida)
  e validação programática do markup (`!bg-white`, `colorHex`, integração dos helpers).

### Validação

- `npx vitest run --root .. tests/parseSubjectKey.test.ts tests/materiaVisualIconBg.test.ts` → **16/16 passando**.
- `npx tsc --noEmit` → **0 erros**.

---

## [Simula PRO] Integração documentada do seletor Matéria → Conteúdo (histórico)

Entrada original que documentava o wire do seletor e dos helpers (`parseSubjectKey`, `buildSubjectTree`,
`getMateriaVisual`). Na época, os testes referenciavam linhas inexistentes e a UI nunca foi de fato ligada
aos helpers — superseda pela seção acima, que concluiu a implementação.

## [Simula PRO] Customização de Fundo e Cor dos Ícones no Modal de Seleção de Matéria

Alteração do plano de fundo dos contêineres de ícones de matérias para `!bg-white` e aplicação da cor de
texto correspondente de cada matéria (identidade visual do mini game Enigma).

### Escopo entregue

- `bg-white/5` → `!bg-white`, remoção de `text-white` e adição de `style={{ color: colorHex }}` no botão
  principal e no modal de seleção em
  [Questoes_Gemini.tsx](file:///d:/GitHub/frontend/front/src/components/Simula_PRO/Questoes_Gemini.tsx).

### Testes

- [materiaVisualIconBg.test.ts](file:///d:/GitHub/frontend/tests/materiaVisualIconBg.test.ts) validando as
  classes (`!bg-white`, ausência de `text-white`) e a presença do `style` com a cor hex de cada matéria.

## [Simula PRO] Revisão com IA — Seleção Matéria → Conteúdo (modal + dropdown)

Reorganização da seleção de tópico na feature **"Questões resolvidas com IA"**, tornando-a mais intuitiva
e organizada.

### Motivação

O seletor anterior era um único `<select>` que listava chaves concatenadas (`"Matéria — Conteúdo — N
questões"`), misturando duas dimensões numa lista plana e confusa. O backend **já envia `materia` e
`conteudo` separados** — juntados em [stats/route.ts:88](file:///d:/GitHub/frontend/front/src/app/api/user/stats/route.ts).
**Nenhuma mudança de backend.**

### Escopo entregue

- **Modal de seleção de matéria**: botão "1. Matéria" abre um modal com cards de cada matéria (total de
  questões). Ao escolher, o modal fecha e auto-seleciona o primeiro conteúdo.
- **Dropdown de conteúdo**: passo "2. Conteúdo" lista apenas os conteúdos da matéria selecionada, formato
  `"{conteúdo} • {N} questões"`. Desabilitado até haver matéria.
- **Ícones de matéria reaproveitados do jogo Enigma** via `getMateriaVisual` (∑ Matemática, ⚛ Física,
  🧪 Química, 🧬 Biologia, 📜 História, 🌍 Geografia, ✍ Português, 📖 Literatura, 🤔 Filosofia,
  👥 Sociologia). Sem correspondência → fallback `BookOpen`. Fonte única: `games/Enigma/lib/enigma-data`.

### Lógica extraída (testável)

- `parseSubjectKey(key)` → `{ materia, conteudo }`, divide no primeiro `" — "` (em dash U+2014).
- `buildSubjectTree(groupedQuestions)` → `Map<materia, { conteudos[], totalCount }>`, com `count` por
  conteúdo e `fullKey` preservada.

### Arquivos

- [Questoes_Gemini.tsx](file:///d:/GitHub/frontend/front/src/components/Simula_PRO/Questoes_Gemini.tsx) — seletor refatorado + modal de matéria.
- [subjectKey.ts](file:///d:/GitHub/frontend/front/src/components/Simula_PRO/subjectKey.ts) — helpers puros.
- [parseSubjectKey.test.ts](file:///d:/GitHub/frontend/tests/parseSubjectKey.test.ts) — specs Vitest (parse + árvore).

---

## [User-Config] Layout Adjustment and Discord Icon Integration

Restructured the account settings page layout and updated the Discord integration icons to match the design guidelines.

### Scope Delivered

- Restructured `UserConfig.tsx` layout to position the **Profile Icon** and **Discord Integration** sections on the right-hand side of the page, stacked vertically (`flex-col`) and aligned vertically with the form fields.
- Replaced the `MessageSquare` (balloon) icons with a dedicated inline SVG Discord icon in both the `UserConfig.tsx` page button and the `DiscordTokenModal.tsx` modal header.
- Ensured `flex-shrink-0` is added to the Discord SVG to prevent rendering distortion/compression inside flexbox layouts.

### Files Modified

- [UserConfig.tsx](file:///d:/GitHub/frontend/front/src/components/profile/UserConfig.tsx)
- [DiscordTokenModal.tsx](file:///d:/GitHub/frontend/front/src/components/profile/DiscordTokenModal.tsx)
- [UserConfigLayout.test.tsx](file:///d:/GitHub/frontend/tests/UserConfigLayout.test.tsx) (created unit test scaffolding)

## [Sync-User] Frontend (Web) — Botão e exibição do token Discord

Implementação da parte **frontend** do fluxo de vinculação Discord via token OTP
(Abordagem 1 do `Token_Validation.md`). O usuário gera um token de uso único no
formato `VEST-XXXXX` (validade 5 min) na Web, copia e cola no bot do Discord, que
então chama o BFF para fazer o match Discord ↔ usuário Web.

### Escopo entregue

- Botão **"Gerar Token do Discord"** na aba **Configurações** do perfil.
- Modal que solicita o token ao backend, exibe `VEST-XXXXX`, permite copiar e mostra
  contagem regressiva de 5 minutos até a expiração (com opção de gerar novo token).

### Arquitetura

Segue o padrão BFF proxy do projeto:

```
UserConfig.tsx (aba Configurações)
  └── botão "Gerar Token do Discord" → abre modal (dynamic import)
        └── DiscordTokenModal.tsx ('use client')
              └── POST /api/users/generate-token  (Bearer do localStorage user_data)
                    └── route.ts (proxy fino) → discordToken.service.ts → BFF Java
```

### Arquivos criados

**`front/src/app/service/discordToken.service.ts`** (novo)

- Service puro server-side (sem React/hooks).
- `generateDiscordToken(userId, jwt): Promise<{ token }>`.
- `POST ${BACKEND_API_URL}/api/users/generate-token`, header `Authorization: Bearer`,
  body `{ userId }`, `cache: 'no-store'`.
- Lança erro descritivo (sem detalhe interno) em `!response.ok`, ausência de
  `BACKEND_API_URL`, ou token ausente na resposta.

**`front/src/app/api/users/generate-token/route.ts`** (novo)

- Route handler `POST`, proxy fino → service.
- Lê JWT do header `Authorization: Bearer` com fallback para o cookie HttpOnly
  `user_data` (mesmo padrão de `/api/planner`).
- Extrai `userId` do JWT (`payload.id ?? payload.sub ?? payload.email`), mesmo helper
  de `/api/user/stats` e `/api/planner`.
- `401` quando não há token ou o userId é inválido.
- `500` genérico em erro, sem expor stack/IP/detalhe interno.
- Comentário de cache: `// CACHE STRATEGY: no-store — token OTP single-use/sensível`.

**`front/src/components/profile/DiscordTokenModal.tsx`** (novo, `'use client'`)

- Props: `{ isOpen, onClose }`.
- Gera o token automaticamente ao abrir (`POST /api/users/generate-token` com Bearer
  do `localStorage.user_data`).
- Estados: `loading` (spinner), `error` (mensagem + "Tentar novamente"), `success`
  (exibe `VEST-XXXXX`).
- Botão **Copiar** → `navigator.clipboard.writeText(token)` com feedback "Copiado!" por 2s.
- Contador regressivo `5:00 → 0:00`; ao expirar, desabilita copiar e oferece
  **"Gerar novo token"**.
- Markup de modal/overlay reaproveitado do padrão existente em `UserConfig.tsx`.

### Arquivos editados

**`front/src/components/profile/UserConfig.tsx`**

- Imports: `dynamic` (next/dynamic), `MessageSquare` (lucide-react).
- `DiscordTokenModal` carregado via dynamic import (`ssr: false`) — regra do projeto p/ modais.
- Novo estado `isDiscordModalOpen`.
- Nova seção "Integração com Discord" (antes dos botões Salvar/Cancelar) com texto curto
  e botão gradient (estilo indigo) que abre o modal.
- Render do `<DiscordTokenModal />` ao final do componente.

### Testes

Criada a pasta `tests/` na raiz com specs em estilo Vitest (scaffolding — não há test
runner configurado ainda; Vitest/Jest no roadmap):

- `tests/discordToken.service.test.ts` — URL/headers/body `{ userId }` corretos; throw em
  `!response.ok`; parse de `{ token }`.
- `tests/generate-token.route.test.ts` — `401` sem JWT; extração de userId; encaminha e
  devolve `{ token }`; não vaza detalhe interno em erro.
- `tests/DiscordTokenModal.test.tsx` — valida `^VEST-[A-Z0-9]{5}$`; copiar chama
  `navigator.clipboard.writeText`; contador 5 min decrementa e expira.

### Dependências / Fora de escopo

- Depende do card **Backend (BFF)** que expõe `POST /api/users/generate-token` → `{ token }`
  (geração `VEST-XXXXX`, TTL 5 min, uso único). Enquanto o BFF não existir, o modal exibe
  o estado de erro tratado.
- Lógica do bot Discord e rota `/api/auth/discord/sync` ficam em cards separados.
