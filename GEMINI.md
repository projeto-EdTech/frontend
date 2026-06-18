# Vestibuline - Engineering Guide

Vestibuline is a premium, AI-driven educational platform designed to help students prepare for Brazilian college entrance exams (ENEM and major Universities). It features adaptive simulations, detailed performance analytics, and AI-powered study assistance.

## Workflow obrigatório de funcionamento

1 -> A partir do prompt gere os testes para verificação da feature antes mesmo de começar a desenvolver, todos os testes unitários tem que ser criados dentro da pasta tests na raiz do projeto, caso a pasta não exista crie ela na raiz do repositório.
2 -> Com os testes escritos explore as opções e caminhos nos quais podem ser seguidos para o desenvolvimento
3 -> Escreva o plano de ação para implementar a feature
4 -> Desenvolva o plano proposto, dividindo a atividade do plano em task's
5 -> Após o desenvolvimento execute os testes escritos no passo 1, para validar oque foi gerado, se não passar em algum teste, identifique oque deu problema e conserte e rode o teste novamente
6 -> Após ter ocorrido tudo corretamente por favor crie, edite caso já exista, o arquivo CHANGES.md na raiz do projeto, no qual este por sua vez deve documentar tudo nos mínimos detalhes do que foi feito
7 -> Após ter ter documentado tudo no CHANGES.md prepare para gerar o commit, baseado nas alterações documentadas no CHANGES.md, ou seja deve ser feito baseado neste arquivo o commit mensage, mas espere a validação e comando do usuário
8 -> Com a validação do usuário siga o processo de commit -> push (sync changes) -> Pull Request. Não é necessário abrir uma branch nova para cada feature, apenas utilize a branch Grolla para realizar este processo

## Project Overview

- **Core Mission:** Streamline exam preparation through personalization and high-quality UI/UX.
- **Primary Users:** High school students and "vestibulandos".
- **Visual Identity:** Apple-inspired aesthetics — minimalist, fluid, and high-performance.

## Tech Stack

- **Framework:** Next.js 15 (App Router + Turbopack)
- **Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Animation:** Framer Motion 12 (Spring physics mandatory)
- **Auth:** NextAuth.js
- **Charts:** Recharts
- **IA:** Google Generative AI (Gemini)
- **Payments:** Mercado Pago SDK

## Getting Started

### Prerequisites
- Node.js LTS (>= 18)
- npm or pnpm

### Commands
| Task | Command |
| :--- | :--- |
| **Development** | `npm run dev` (uses Turbopack by default) |
| **Build** | `npm run build` |
| **Production Start** | `npm run start` |
| **Linting** | `npm run lint` |
| **Turbo Mode** | `npm run dev:turbo` |

## Workspace Environment Configuration

To configure and set up your local workspace environment:

### 1. Repository & Installation
Navigate to the `front/` directory and install the dependencies. Due to peer dependency conflicts, you must always run `npm install` with the `--legacy-peer-deps` flag:
```bash
cd front
npm install --legacy-peer-deps
```

### 2. Environment Variables Setup
Create a `.env` file in the `front/` directory. Copy the structure below and populate it with your local credentials. Do not version control or share the `.env` file containing real secrets.

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Backend BFF API URL (Server-side only, never prefix with NEXT_PUBLIC_)
BACKEND_API_URL=http://localhost:8080

# OAuth Integrations (Google, Azure AD, Facebook, Discord)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AZURE_AD_CLIENT_ID=your_azure_ad_client_id
AZURE_AD_CLIENT_SECRET=your_azure_ad_client_secret
AZURE_AD_TENANT_ID=your_azure_ad_tenant_id
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Analytics and Integration Keys (Only active in production)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_CLARITY_ID=your_clarity_id
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Email & Service Keys
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
GOOGLE_API_KEY=your_gemini_api_key
```

### 3. Running the Server Locally
Run the development command inside the `front/` folder to run the application server at `http://localhost:3000`:
```bash
npm run dev:turbo    # Recommended (uses Turbopack)
# Or run standard dev mode:
# npm run dev
```

## Development Conventions

### 1. Architecture
- **App Router:** All routes live in `src/app`.
- **Components:** Reusable UI components in `src/components`. Use composition over inheritance.
- **Contexts:** Global states (Theme, Accessibility, User Profile) in `src/contexts`.
- **Lib:** Utilities, analytics, and static data in `src/lib`.

### 2. UI/UX Guidelines (Apple Human Interface Guidelines)
- **Minimalism:** Monochromatic palette with a vibrant accent color.
- **Materials:** Use glassmorphism (`backdrop-filter: blur(20px)`) for overlays.
- **Geometry:** Prefer "Squircles" (generous `border-radius: 16px+`).
- **Motion:** 
  - **Mandatory:** Use `framer-motion` for all layout transitions.
  - **Physics:** Always use Spring physics (`type: "spring"`) instead of linear easing.
  - **Interactivity:** Elements must have a subtle scale down on press (`whileTap={{ scale: 0.97 }}`).

### 3. Code Standards
- **Strict Types:** No `any` without strong justification. Define interfaces in `src/types`.
- **Utility-First:** Use the `cn()` utility (from `src/lib/utils.ts`) for conditional class merging.
- **Accessibility:** Use Radix primitives (via shadcn/ui) and ensure ARIA compliance. Use the `AccessibilityProvider` for user-specific accessibility settings.
- **SEO/Metadata:** Define metadata in `layout.tsx` or `page.tsx` using the Next.js Metadata API.

### 4. Analytics & Tracking
- **GA4:** Centralized in `src/lib/analytics.ts`. Only enabled in production.
- **Microsoft Clarity:** Integrated for heatmaps.
- **PostHog:** Used for product analytics.

## Project Structure & Organization

```text
front/
├── public/                 # Static assets (images, fonts, sounds)
│   ├── Logo_Universidades/ # University branding
│   ├── Mascote/            # Project mascot assets (Camaleão)
│   └── Materias/           # Subject-related icons
├── src/
│   ├── app/                # Next.js App Router (Routes & Pages)
│   │   ├── api/            # Backend API routes
│   │   ├── Arena/          # Gamified area
│   │   ├── blog/           # Community/Blog section
│   │   ├── library/        # Exam library
│   │   ├── VestIA/         # AI-powered assistant (Gemini)
│   │   └── ...             # Feature-specific routes (profile, estatisticas, etc.)
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui primitive components
│   │   ├── Arena/          # Components for the Arena feature
│   │   └── ...             # Shared domain-specific components (Header, Sidebar)
│   ├── contexts/           # React Contexts (Theme, Accessibility, Profile)
│   ├── hooks/              # Custom React hooks (useUserTier, useTheme)
│   ├── lib/                # Shared utilities (Analytics, API clients, Utils)
│   ├── providers/          # Context providers (PostHog, Auth, Theme)
│   ├── types/              # TypeScript global definitions and interfaces
│   └── test/               # Test suites and configuration
└── ...                     # Configuration files (next.config.ts, tailwind.config.ts)
```

## Mandatory Development Workflow

Whenever requested to perform any activity (whether a new feature, refactoring, or bug fix), you **MUST** strictly follow the flow below, step by step, without skipping any stage:

1. **Understand and analyze the user's problem/request**:
   * Analyze the request requirements in detail.
   * Ensure complete understanding of the scope and impact before starting to write any code.

2. **Write applicable tests**:
   * Write tests that are applicable to solve what was requested by the user in the prompt, even before writing any line of code or thinking about how the code will be implemented.

3. **Explore and analyze implementation paths**:
   * Explore and analyze all possible paths to implement what was requested.

4. **Elaborate a detailed implementation plan**:
   * Elaborate a detailed implementation plan, breaking it down into step-by-step tasks for execution.

5. **Approval and start of execution**:
   * Once the plan is ready and checked/approved by the user, begin executing the entire plan.

6. **Task execution and testing**:
   * After executing a task from the plan, that specific task must be tested. The test must be the same one defined in Step 2.

7. **Documentation update and CHANGES.md creation**:
   * After all tests are completely run and completed successfully, update all documentation related to the modified files.
   * Then, create a file named `CHANGES.md` in the root `frontend/CHANGES.md` of the project, detailing all changes made up to that point.

8. **Sync & Pull Request confirmation**:
   * Once the documentation is updated, ask the user if you can proceed to the `commit` -> `push (sync changes)` -> `PR` flow.
