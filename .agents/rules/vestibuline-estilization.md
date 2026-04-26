---
trigger: always_on
---

# Antigravity Rules — Estilização & Arquitetura UI
# vestibuline | NextJS + Clean Architecture | v1.0 2026

## IDENTIDADE GERAL DO PROJETO

Você está trabalhando no **vestibuline**, uma plataforma EdTech brasileira de preparação para o vestibular. O público é estudantes de ~17 anos, oriundos de escola pública. A interface deve ser um **Mentor Jovem**: sábia, atual, próxima e sem burocracia. O design segue a estética **Apple-like** com identidade visual tech vibrante.

---

## REGRA 1 — Cores: Use Sempre CSS Variables, Nunca Hardcode

Toda cor deve referenciar uma CSS Custom Property. Jamais escreva valores hex diretamente em componentes.

```css
/* Primárias — sempre em gradiente, nunca flat/sólido */
--color-blue-500: #0071e3;
--color-blue-600: #2563eb;
--color-purple-500: #6366f1;
--color-purple-600: #8b5cf6;
--gradient-primary: linear-gradient(135deg, #0071e3, #6366f1);
--gradient-primary-alt: linear-gradient(135deg, #2563eb, #8b5cf6);

/* Semânticas de estado — cada cor tem significado fixo, não intercambiar */
--color-success: #10B981;   /* verde — aprovação, progresso */
--color-warning: #F97316;   /* laranja — cautela, em progresso */
--color-error:   #EF4444;   /* vermelho — falha, erro */
--color-info:    #06B6D4;   /* ciano — badges, informativos */
--color-innovation: #7C3AED; /* roxo — CTAs, destaques */

/* Neutros de tema */
--color-bg:       /* varia por tema */
--color-bg-alt:   /* varia por tema */
--color-text:     /* varia por tema */
--color-text-muted: /* varia por tema */
--color-border:   /* varia por tema */
```

Ao gerar qualquer componente com cor, use estas variáveis. Se a variável não existir no escopo, crie-a no `:root` do arquivo de tokens antes de usá-la.

---

## REGRA 2 — Tema Dual: Dark e Light via `data-theme`

A aplicação suporta ambos os temas. A troca é feita via atributo `data-theme` no `<html>`. Nunca use `prefers-color-scheme` sozinho — sempre respeite o atributo do DOM.

```css
[data-theme="light"] {
  --color-bg:         #ffffff;
  --color-bg-alt:     #f8f9fa;
  --color-text:       #0a0a0a;
  --color-text-muted: #6b7280;
  --color-border:     rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] {
  --color-bg:         #1a1a1a;
  --color-bg-alt:     #242424;
  --color-text:       #f5f5f7;
  --color-text-muted: #9ca3af;
  --color-border:     rgba(255, 255, 255, 0.08);
}
```

---

## REGRA 3 — Tipografia: System Font Stack Obrigatório

Nunca importar Google Fonts ou fontes externas para o corpo e títulos. Usar o system font stack para máxima performance e feel Apple-like nativo.

```css
--font-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace;
--font-math: KaTeX_Main, KaTeX_Math, KaTeX_SansSerif, serif;
--font-accessible: OpenDyslexic, var(--font-base); /* alternativa para dislexia */
```

Hierarquia de pesos:
- `H1/H2` → `font-weight: 800` (ExtraBold)
- `H3/H4` → `font-weight: 700` (Bold)
- Corpo → `font-weight: 400` (Regular)
- Nunca usar peso abaixo de 400 em texto de leitura

---

## REGRA 4 — Tokens de Espaçamento e Forma

Ao gerar layout, use sempre a escala de tokens abaixo. Nunca valores arbitrários como `margin: 13px` ou `padding: 7px`.

```css
/* Espaçamento */
--space-1: 0.25rem;   --space-2: 0.5rem;
--space-3: 0.75rem;   --space-4: 1rem;
--space-6: 1.5rem;    --space-8: 2rem;
--space-12: 3rem;     --space-16: 4rem;

/* Border radius */
--radius-sm:   6px;
--radius-md:   12px;
--radius-lg:   16px;
--radius-xl:   24px;
--radius-full: 9999px;

/* Sombras Apple-like */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md: 0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.08);
--shadow-lg: 0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08);
--shadow-glow-blue:   0 0 24px rgba(0, 113, 227, 0.35);
--shadow-glow-purple: 0 0 24px rgba(99, 102, 241, 0.35);
```

---

## REGRA 5 — Hierarquia de Botões

Ao criar botões, respeitar esta hierarquia sem exceções:

```tsx
// Primary CTA — gradiente primário obrigatório
<button className="btn-primary">Bora destravar</button>
// CSS: background: var(--gradient-primary); color: white;

// Secondary — borda, sem fundo
<button className="btn-secondary">Ver detalhes</button>
// CSS: border: 1px solid var(--color-blue-500); background: transparent;

// Destructive — apenas para ações irreversíveis
<button className="btn-destructive">Excluir conta</button>
// CSS: background: var(--color-error); color: white;

// Ghost — sem borda, sem fundo, hover sutil
<button className="btn-ghost">Cancelar</button>
```

---

## REGRA 6 — Iconografia

Usar exclusivamente **Lucide React** como biblioteca primária e **Bootstrap Icons** como secundária. Nunca usar ícones com preenchimento sólido (filled) — apenas outline/linear.

```tsx
// ✅ CORRETO
import { BookOpen, TrendingUp, CheckCircle } from 'lucide-react'
<CheckCircle size={20} strokeWidth={1.5} />

// ❌ ERRADO — ícone filled, estilo errado
<FaStar /> // react-icons filled
```

---

## REGRA 7 — Imagens: `next/image` Obrigatório

Nunca usar a tag `<img>` direta (exceto SVGs inline). Toda imagem passa pelo componente `next/image`.

```tsx
import Image from 'next/image'

// Imagem LCP (hero, banner) — sempre com priority
<Image src="/hero.webp" alt="..." width={1200} height={600} priority quality={85} />

// Imagens secundárias — lazy load padrão
<Image src="/avatar.webp" alt="..." width={48} height={48} />
```

Formato preferencial: **WebP**. Qualidade padrão: `85`. Conteúdo didático (fórmulas, diagramas): `quality={95}`.

---

## REGRA 8 — Estados Visuais de Feedback

Todo componente interativo deve ter estado visual explícito. Nunca deixar uma ação sem feedback.

| Estado | Cor | Variável |
|---|---|---|
| Sucesso / Aprovação | Verde | `--color-success` |
| Em progresso / Cautela | Laranja | `--color-warning` |
| Erro / Falha | Vermelho | `--color-error` |
| Informação / Badge | Ciano | `--color-info` |
| CTA / Destaque | Gradiente | `--gradient-primary` |

---

## REGRA 9 — UX Writing nos Componentes

Ao gerar texto de interface (labels, placeholders, mensagens de erro, CTAs), seguir o tom de voz do vestibuline: **incentivador, pragmático e próximo**.

| Contexto | ❌ Nunca escrever | ✅ Sempre escrever |
|---|---|---|
| Erro técnico | `"Fatal Error 404"` | `"Ops, a conexão oscilou. Vamos tentar novamente?"` |
| Input inválido | `"Invalid input"` | `"Hmm, algo ficou faltando aqui 👀"` |
| CTA de ação | `"Iniciar módulo"` | `"Bora destravar esse módulo"` |
| Progresso | `"50% completed"` | `"Você já tá na metade — bora fechar!"` |
| Feedback positivo | `"Correct"` | `"Acertou! 🎯"` |
| Loading | `"Loading..."` | `"Buscando seus dados..."` |

Vocabulário permitido: `destravar`, `bora`, `level up`, `hackear`, `jornada`, `evoluir`, `estratégia`, `foco`.
Vocabulário proibido: `trivial`, `conforme a literatura`, `passe sem estudar`.

---

## REGRA 10 — Acessibilidade Mínima Obrigatória

Todo componente gerado deve atender:

- Todo ícone funcional com `aria-label` ou texto acompanhante
- Estados de foco (`:focus-visible`) com outline usando `--color-blue-500`
- Contraste mínimo **4.5:1** para texto de corpo (WCAG AA)
- Hierarquia de headings nunca quebrada por razões estéticas (`H1 → H2 → H3`)
- Atributo `aria-busy="true"` em Skeleton Screens durante carregamento
- Suporte à fonte `OpenDyslexic` via classe `.font-accessible` no `<body>`

---

## REGRA 11 — Logotipo: Proibições

Ao posicionar o logo do vestibuline em qualquer tela:

- ✅ Logo colorido sobre fundos brancos/claros/transparentes
- ✅ Logo branco sobre fundos escuros ou fotos
- ❌ Nunca distorcer, esticar ou alterar proporções
- ❌ Nunca mudar as cores oficiais
- ❌ Nunca aplicar sombras diretamente no logo
- ❌ Nunca violar a área de respiro (mínimo = altura da letra "S" do nome ao redor)

---

## REGRA 12 — Princípios de Layout (Apple-like)

- **Minimalismo funcional:** menos elementos, mais foco. A interface é invisível — o conteúdo brilha.
- **Nunca adicionar ruído visual** desnecessário. O aluno já está sob pressão.
- **Espaçamento generoso** em áreas de conteúdo didático.
- **Densidade maior** apenas em dashboards de dados e métricas.
- Backgrounds nunca sólidos onde caiba gradiente sutil ou textura leve.
- Superfícies de cards: `--color-bg-alt` com `--shadow-sm` e `--radius-lg`.

---

*vestibuline | antigravity-styling.md | Brand Book v1.0 2026*