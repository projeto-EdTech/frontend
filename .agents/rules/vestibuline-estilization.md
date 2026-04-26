---
trigger: always_on
---

## 1. Paleta de Cores (Color Tokens)

Toda cor da aplicação deve ser declarada como CSS Custom Property (variável) e jamais usada como valor hardcoded dentro de componentes. A paleta é dividida em três camadas:

### 1.1 Cores Primárias — Autoridade e Confiança
Utilizadas em gradientes obrigatoriamente. Nunca aplicar azul ou roxo de forma sólida/flat onde houver espaço para gradiente.

```css
:root {
  /* Azul */
  --color-blue-500: #0071e3;
  --color-blue-600: #2563eb;

  /* Roxo / Indigo */
  --color-purple-500: #6366f1;
  --color-purple-600: #8b5cf6;

  /* Gradiente primário padrão (sempre azul → roxo) */
  --gradient-primary: linear-gradient(135deg, #0071e3, #6366f1);
  --gradient-primary-alt: linear-gradient(135deg, #2563eb, #8b5cf6);
}
```

### 1.2 Cores Secundárias — Sistema Funcional de Estados
Cada cor carrega um significado semântico fixo. Não intercambiar.

```css
:root {
  --color-innovation: #7C3AED;   /* Roxo — CTAs, destaques, gradientes */
  --color-success:    #10B981;   /* Verde — feedback positivo, métricas, validação */
  --color-success-alt:#16A34A;
  --color-warning:    #F97316;   /* Laranja — avisos, "em progresso", cautela */
  --color-error:      #EF4444;   /* Vermelho — erros, falhas, feedback negativo */
  --color-info:       #06B6D4;   /* Ciano — badges, links em foco, informativos */
  --color-info-alt:   #60A5FA;
}
```

### 1.3 Neutros — Base Visual da Interface
Garantem contraste e suportam dual theme (light/dark).

```css
:root {
  /* Light Mode */
  --color-bg-light:      #ffffff;
  --color-bg-light-alt:  #f8f9fa;

  /* Dark Mode */
  --color-bg-dark:       #1a1a1a;
  --color-bg-dark-alt:   #242424;
}
```

**Regras de aplicação:**
- Fundos de página: sempre `--color-bg-*` do tema ativo
- Cards e superfícies: `--color-bg-*-alt`
- Textos sobre fundo claro: `--color-bg-dark`
- Textos sobre fundo escuro: `--color-bg-light`

---

## REGRA 2 — Tipografia (Typography System)

A tipografia segue uma hierarquia de três camadas definida pelo brand book, priorizando performance e experiência nativa.

### 2.1 Stack de Fontes

```css
:root {
  /* Títulos e corpo — System Font Stack (performance máxima, feel nativo Apple-like) */
  --font-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Dados técnicos, código, estruturas — System Monospace */
  --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace;

  /* Equações e conteúdo científico — KaTeX */
  --font-math: KaTeX_Main, KaTeX_Math, KaTeX_SansSerif, serif;

  /* Acessibilidade — Dislexia */
  --font-accessible: OpenDyslexic, var(--font-base);
}
```

### 2.2 Escala Tipográfica

```css
:root {
  --text-xs:   0.75rem;    /* 12px — labels, badges */
  --text-sm:   0.875rem;   /* 14px — microcopy, legendas */
  --text-base: 1rem;       /* 16px — corpo padrão */
  --text-lg:   1.125rem;   /* 18px — subtítulos */
  --text-xl:   1.25rem;    /* 20px — títulos de seção */
  --text-2xl:  1.5rem;     /* 24px */
  --text-3xl:  1.875rem;   /* 30px */
  --text-4xl:  2.25rem;    /* 36px — hero/destaque */
}
```

### 2.3 Pesos e Hierarquia

| Uso | Peso | Token |
|---|---|---|
| Títulos principais (H1/H2) | 800 (ExtraBold) | `font-extrabold` |
| Subtítulos (H3/H4) | 700 (Bold) | `font-bold` |
| Corpo de texto | 400 (Regular) | `font-normal` |
| Dados técnicos/mono | 400 | `font-mono` |

**Regra:** Nunca usar fonte em peso abaixo de 400 em corpo de texto. Peso leve (`300`) apenas em elementos decorativos grandes.

---

## REGRA 3 — Identidade Visual e Logotipo

### 3.1 Uso do Logo

| Contexto | Versão |
|---|---|
| Fundo branco, claro ou transparente | Logo colorido |
| Fundo escuro ou sobre foto | Logo totalmente branco |

**Proibições absolutas (nunca fazer):**
- Distorcer ou esticar o logo
- Alterar as cores oficiais
- Aplicar sombras no logo
- Violar a área de respiro (espaço mínimo = altura da letra "S" do nome ao redor)

### 3.2 Iconografia

- Biblioteca padrão: **Lucide React** e **Bootstrap Icons**
- Estilo: **outline/linear** — sem preenchimentos densos ou efeitos 3D
- Consistência de traço obrigatória em toda a interface

---

## REGRA 4 — Componentes e Estados Visuais

Todo componente interativo deve comunicar seu estado via cor semântica definida na Regra 1.2. Nenhum estado pode ficar sem feedback visual.

### 4.1 Mapeamento de Estados

```
✅ Sucesso / Aprovação   → --color-success   (#10B981)
⚠️  Progresso / Cautela  → --color-warning   (#F97316)
❌ Erro / Falha          → --color-error     (#EF4444)
💡 Informação / Destaque → --color-info      (#06B6D4)
🚀 CTA / Inovação        → --color-innovation (#7C3AED) + gradiente primário
```

### 4.2 Botões — Hierarquia

```
Primary CTA   → gradiente primário (--gradient-primary), texto branco
Secondary     → borda com --color-blue-500, fundo transparente
Destructive   → --color-error, reservado para ações irreversíveis
Ghost         → sem borda, sem fundo, hover sutil
```

### 4.3 Microcopy de Erro (UI Copy)

**NÃO usar:** mensagens técnicas frias ("Fatal Error 404", "Unexpected token")

**USAR:** mensagens empáticas e orientadas à solução.

```
❌ "Error 404 - Not Found"
✅ "Ops, essa página sumiu. Vamos te levar de volta?"

❌ "Connection timeout"
✅ "A conexão oscilou. Vamos tentar novamente?"

❌ "Invalid input"
✅ "Hmm, algo ficou faltando aqui. Confere esse campo?"
```

---

## REGRA 5 — Tom Visual nas Interfaces (Design Apple-like + Brand)

### 5.1 Princípios de Layout

- **Minimalismo funcional:** menos elementos, mais foco. A interface deve ser invisível — o conteúdo é o protagonista.
- **Redução de carga cognitiva:** o aluno já está sob pressão; o design não adiciona ruído.
- **Densidade controlada:** espaçamento generoso em áreas de conteúdo didático; densidade maior apenas em dashboards de dados.

### 5.2 Espaçamento (Spacing Scale)

```css
:root {
  --space-1:  0.25rem;  /*  4px */
  --space-2:  0.5rem;   /*  8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### 5.3 Border Radius

```css
:root {
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px; /* pills, badges */
}
```

### 5.4 Sombras (Apple-like Elevation)

```css
:root {
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.08);
  --shadow-lg:  0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08);
  --shadow-glow-blue:   0 0 24px rgba(0, 113, 227, 0.35);
  --shadow-glow-purple: 0 0 24px rgba(99, 102, 241, 0.35);
}
```

---

## REGRA 6 — Dual Theme (Dark / Light Mode)

A aplicação suporta ambos os temas. A troca é feita via atributo `data-theme` no elemento `<html>`.

```css
[data-theme="light"] {
  --color-bg:       var(--color-bg-light);
  --color-bg-alt:   var(--color-bg-light-alt);
  --color-text:     #0a0a0a;
  --color-text-muted: #6b7280;
  --color-border:   rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] {
  --color-bg:       var(--color-bg-dark);
  --color-bg-alt:   var(--color-bg-dark-alt);
  --color-text:     #f5f5f7;
  --color-text-muted: #9ca3af;
  --color-border:   rgba(255, 255, 255, 0.08);
}
```

**Regra:** Nenhum componente deve ter cor hardcoded. Toda cor de texto, fundo e borda deve referenciar as variáveis do tema ativo.

---

## REGRA 7 — Redes Sociais e Marketing Visual

### 7.1 Artes para Instagram/TikTok

- Estética padrão: **Dark Mode** com contraste alto usando azul e roxo vibrantes
- Tipografia maximizada e hierarquizada para leitura imediata em telas pequenas
- Gradiente primário (`--gradient-primary`) como elemento central de destaque

### 7.2 E-mail Marketing

- **Assunto:** curto, personalizado, com nome do aluno + emoji de contexto
  - Exemplo: `"Lucas, acabou de sair [Nome do artigo] 🚀"`
- **Corpo:** blocos concisos, CTA claro, foco no benefício imediato
- **Assinatura:** `"Time vestibuline"` ou `"Seu parceiro de estudos"`

---

## REGRA 8 — Identidade Verbal na Interface (UX Writing)

### 8.1 Tom de Voz

| Atributo | Descrição |
|---|---|
| **Incentivador** | Valida o progresso, nunca pune o erro |
| **Pragmático** | Vai direto ao ponto, sem rodeios acadêmicos |
| **Próximo** | Linguagem nativa da internet, sem forçar gírias |

### 8.2 Vocabulário da Marca

**Usar:** `destravar`, `estratégia`, `level up`, `foco`, `jornada`, `hackear` (no sentido de atalho inteligente), `bora`, `evoluir`

**Evitar:** termos pedantes (`trivial`, `consta na literatura`), falsas promessas (`passe sem estudar`), linguagem punitiva (`você errou de novo`)

### 8.3 Exemplos de Copy na UI

| Contexto | ❌ Evitar | ✅ Usar |
|---|---|---|
| Resolução de questão | "Resposta incorreta" | "Bora ver onde travou pra destravar de vez!" |
| Progresso | "50% concluído" | "Você já tá na metade — bora fechar isso!" |
| Erro técnico | "Fatal Error 404" | "Ops, a conexão oscilou. Vamos tentar novamente?" |
| CTA de estudo | "Iniciar módulo" | "Bora destravar esse módulo" |
| Feedback positivo | "Correto" | "Acertou! +1 no nível 🎯" |

---

## REGRA 9 — Fotografia e Imagens

- Retratar **estudantes reais** em ambientes iluminados, com fones de ouvido e dispositivos móveis
- Vestimenta **casual e confortável** — sem poses corporativas ou formais
- **Evitar:** bancos de imagem genéricos, poses artificiais, estética corporativa
- Composições que transmitem **foco, imersão tecnológica e autenticidade**

---

## REGRA 10 — Acessibilidade

- Fonte alternativa **OpenDyslexic** deve estar disponível como opção na plataforma
- Contraste mínimo de **4.5:1** para textos de corpo (WCAG AA)
- Todo ícone funcional deve ter `aria-label` ou texto acompanhante
- Estados de foco (`:focus-visible`) devem usar `--color-blue-500` como outline
- Hierarquia de headings semântica (`H1 → H2 → H3`) nunca deve ser quebrada por razões estéticas