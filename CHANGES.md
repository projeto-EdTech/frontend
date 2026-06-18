# CHANGES

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
