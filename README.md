# Vestibuline — Front-End

Interface web da plataforma Vestibuline: preparação para vestibulares com simulados inteligentes, ranking, mini-games educativos, estatísticas personalizadas e pagamentos integrados.

[Reportar Bug](https://github.com/projeto-EdTech/frontend/issues) · [Solicitar Melhoria](https://github.com/projeto-EdTech/frontend/issues) · [Documentação Técnica Completa](https://github.com/projeto-EdTech/docs/blob/main/architecture/frontend.md)

> **AVISO:** Repositório PRIVADO — uso exclusivo da equipe Vestibuline. Nenhum trecho de código deve ser compartilhado externamente sem aprovação formal.

## Visão Geral

O Vestibuline é uma plataforma EdTech voltada para estudantes de ensino médio de escolas públicas que se preparam para ENEM e vestibulares. O front-end funciona como BFF (Backend for Frontend) — todas as chamadas ao backend Java passam por Route Handlers Next.js, nunca diretamente do browser. Veja o porquê em [ADR-0001](https://github.com/projeto-EdTech/docs/blob/main/adr/0001-bff-proxy-pattern.md).

**Público-alvo:** estudantes ~17 anos, mobile-first, tema claro/escuro, fonte acessível OpenDyslexic disponível.

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui. Autenticação via NextAuth, pagamentos via Stripe/MercadoPago com failover, IA via Google Gemini. Detalhes completos da stack, estrutura de pastas, rotas, camada de serviço e convenções de código estão na [documentação de arquitetura](https://github.com/projeto-EdTech/docs/blob/main/architecture/frontend.md).

## Setup Local

### Pré-requisitos

- Node.js >= 18 LTS
- npm
- Java BFF rodando (para chamadas ao backend)

### Instalação

```bash
git clone https://github.com/projeto-EdTech/frontend.git
cd frontend/front
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` necessário por conflitos de peer deps entre pacotes.

### Configurar `.env`

```bash
cp .env.example .env
```

Ver as variáveis necessárias na [documentação de arquitetura](https://github.com/projeto-EdTech/docs/blob/main/architecture/frontend.md#vari%C3%A1veis-de-ambiente).

### Iniciar

```bash
npm run dev
```

Aplicação: <http://localhost:3000>

## Scripts

Todos os comandos devem ser executados dentro de `front/`:

| Script | Comando | Descrição |
| --- | --- | --- |
| `dev` | `next dev` | Servidor de desenvolvimento |
| `dev:turbo` | `next dev --turbopack` | Dev com Turbopack (mais rápido) |
| `build` | `next build` | Build de produção |
| `start` | `next start` | Serve o build de produção |
| `lint` | `eslint .` | ESLint (flat config nativo) |
| `test` | `vitest run` | Executa todos os testes (uma vez) |
| `test:watch` | `vitest` | Testes em modo watch |

Lint e test rodam automaticamente em todo Pull Request contra `main` via GitHub Actions (`.github/workflows/ci.yml`).

## Contribuindo

### Fluxo de desenvolvimento

1. Crie issue descrevendo objetivo, escopo, critérios de aceite e riscos
2. Branch a partir de `main`:
   - `feat/area-descricao-curta`
   - `fix/area-breve-erro`
   - `chore/infra-ou-build`
   - `refactor/modulo-alvo`
3. Siga o **workflow TDD** do `CLAUDE.md`: escreva testes antes da implementação; build deve passar antes de abrir PR; documente em `CHANGES.md`.
4. Commits semânticos: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`
5. Abra PR vinculando issue (`Closes #ID`), com resumo da mudança, motivação, screenshots/GIF (para UI) e passos de teste manual.

### Checklist antes do PR

- [ ] Build local passou (`npm run build`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Testes passando (`npm test`)
- [ ] Sem secrets hardcoded
- [ ] Variáveis novas documentadas no `.env` e no `CHANGES.md`
- [ ] Acessibilidade básica verificada (se UI nova)

Mudanças de arquitetura relevantes (nova stack, novo padrão, mudança de fluxo de dados) devem ser registradas como [ADR em `projeto-EdTech/docs`](https://github.com/projeto-EdTech/docs/blob/main/adr/README.md).

## Licença

Código proprietário © Vestibuline. Todos os direitos reservados. Uso estritamente interno.

Não distribuir, reproduzir ou derivar sem autorização formal. Para liberação externa (snippet em blog, demo), solicitar aprovação ao responsável técnico e jurídico.

---

**Contato:** vestibuline.contato@gmail.com
**Organização:** [github.com/projeto-EdTech](https://github.com/projeto-EdTech)
