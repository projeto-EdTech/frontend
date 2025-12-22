# 🎯 Nexo - Documentação Interna

Jogo educativo de conexões inspirado no NYT Connections. O jogador agrupa 16 palavras em 4 categorias temáticas relacionadas a matérias escolares.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Fluxo de Dados](#fluxo-de-dados)
- [Sistema de Persistência](#sistema-de-persistência)
- [Interfaces e Tipos](#interfaces-e-tipos)
- [Mecânicas do Jogo](#mecânicas-do-jogo)
- [Sistema de Estados](#sistema-de-estados)
- [Customização](#customização)
- [Manutenção](#manutenção)

## 🎮 Visão Geral

### Objetivo do Jogo
Identificar e agrupar 16 palavras em 4 categorias de 4 palavras cada, onde cada grupo compartilha uma conexão temática.

### Características Técnicas
- **Framework**: React 18+ com TypeScript
- **Estilização**: Tailwind CSS + CSS customizado
- **Autenticação**: NextAuth.js (sistema de tiers)
- **Persistência**: LocalStorage (chave: `nexo_save_v1`)
- **Animações**: CSS com cubic-bezier + Canvas Confetti
- **Ícones**: Lucide React

### Recursos Principais
- 💾 Salvamento automático a cada ação
- 🎯 Sistema de 10 vidas (corações)
- 💡 Dicas após 5 erros
- 🔄 Embaralhamento com animação
- 🎵 Feedback sonoro
- 📱 Design responsivo

## 🏗️ Arquitetura

### Padrão de Design

O projeto segue uma **separação clara entre UI e Lógica**:

```
┌─────────────────────────────────────────┐
│           Nexo.tsx (UI Layer)           │
│  - Renderização React                   │
│  - Gerenciamento de estados UI          │
│  - Modais e feedback visual             │
└─────────────┬───────────────────────────┘
              │
              ↓ (importa dinamicamente)
┌─────────────────────────────────────────┐
│    NexoLogic.ts (Business Logic)        │
│  - Classe ConnectionsGame               │
│  - Regras do jogo                       │
│  - Persistência LocalStorage            │
│  - Manipulação DOM direta               │
└─────────────┬───────────────────────────┘
              │
              ↓ (consulta)
┌─────────────────────────────────────────┐
│      NexoData.ts (Data Layer)           │
│  - Banco de dados de categorias         │
│  - 11 matérias × 3+ categorias          │
│  - Definição de tipos                   │
└─────────────────────────────────────────┘
```

### Separação de Responsabilidades

| Arquivo | Responsabilidade |
|---------|------------------|
| **Nexo.tsx** | Interface, modais, integração React, estados visuais |
| **NexoLogic.ts** | Lógica de jogo, validações, persistência, manipulação DOM |
| **NexoData.ts** | Fonte de dados, tipos TypeScript |
| **NexoStyle.css** | Animações, estados visuais, temas |

## 📁 Estrutura de Arquivos

### `Nexo.tsx` (Componente Principal)

**Estados React:**
```typescript
const [resultado, setResultado] = useState<ResultadoJogo | null>(null)
const [mostrarAjuda, setMostrarAjuda] = useState(false)
const [gameId, setGameId] = useState(0)
const [tempoRestante, setTempoRestante] = useState<string>("")
```

**Responsabilidades:**
- Renderizar grid 4×4 de botões
- Exibir modal de ajuda (regras)
- Exibir modal de resultado (game over/vitória)
- Gerenciar timer para próximo jogo (tier FREE)
- Tocar sons e disparar confetes

**Hooks Principais:**
```typescript
// Importação dinâmica da lógica
useEffect(() => {
  import("./functions/NexoLogic").then((mod) => {
    const instance = new mod.ConnectionsGame()
    instance.onGameOver = (vitoria, categorias) => {
      setResultado({ vitoria, categorias })
    }
  })
}, [gameId])

// Timer de contagem regressiva
useEffect(() => {
  if (!resultado) return
  // Calcula tempo até meia-noite
  // Atualiza a cada segundo
}, [resultado])
```

### `NexoLogic.ts` (Classe de Lógica)

**Estrutura da Classe:**
```typescript
export class ConnectionsGame {
  // Estado do Jogo
  private categoriasEmJogo: Desafio[]
  private categoriasDescobertas: Desafio[]
  private erros: number
  private tentativas: number
  private isGameOver: boolean
  private bloqueado: boolean
  
  // Mapeamentos
  private botoesEPalavras: Map<HTMLButtonElement, string>
  private botoesSelecionados: HTMLButtonElement[]
  private mapaGradientes: Map<string, string>
  
  // Elementos DOM
  private slots: NodeListOf<HTMLButtonElement>
  private coracoesEl: NodeListOf<SVGElement>
  private acertosContainer: HTMLElement | null
  private btnDica: HTMLElement | null
  private toastEl: HTMLElement | null
  
  // Callback
  public onGameOver: ((vitoria: boolean, dados: Categoria[]) => void) | null
}
```

**Métodos Públicos:**
- `usarDica()` - Revela 2 palavras corretas
- `desmarcarTudo()` - Remove seleção atual
- `embaralhar()` - Reorganiza palavras com animação

**Métodos Privados Principais:**
- `iniciarJogo()` - Configura novo jogo
- `apertou(botao)` - Handler de clique
- `verificar()` - Valida seleção de 4 palavras
- `processarAcerto()` - Lógica de grupo correto
- `processarErro()` - Lógica de erro
- `salvarJogo()` - Persiste estado
- `carregarJogo()` - Restaura estado

### `NexoData.ts` (Banco de Dados)

**Estrutura:**
```typescript
export const dbNexo: MateriaGrupo[] = [
  {
    materia: "Matemática",
    corTema: {
      claro: "linear-gradient(...)",
      escuro: "linear-gradient(...)"
    },
    cards: [
      {
        titulo: "Polígonos (Matemática)",
        palavras: ["Pentágono", "Hexágono", "Heptágono", "Decágono"]
      }
      // ... mais categorias
    ]
  }
  // ... 10 matérias adicionais
]
```

**Matérias Disponíveis:**
1. Matemática (Azul)
2. Literatura e Gramática (Laranja)
3. Biologia (Verde)
4. História (Vermelho)
5. Geografia (Verde-Musgo)
6. Física (Roxo)
7. Química (Amarelo)
8. Inglês (Ciano)
9. Filosofia (Cinza)
10. Sociologia (Verde-Água)
11. Artes (Roxo Vibrante)

### `NexoStyle.css` (Estilos)

**Principais Definições:**

```css
/* Sistema de Estados dos Cards */
.nexo-card           /* Base */
.nexo-card.default   /* Estado padrão */
.nexo-card.selected  /* Selecionado */
.nexo-card.errado    /* Erro */
.nexo-card.dica-visual /* Destacado pela dica */

/* Sistema de Vidas */
.nexo-heart.full     /* Vida cheia */
.nexo-heart.lost     /* Vida perdida */

/* Animações */
@keyframes shake     /* Erro */
@keyframes popIn     /* Entrada */
@keyframes fadeIn    /* Aparição */
@keyframes heartBreak /* Perda de vida */

/* Componentes */
.nexo-toast          /* Notificação "Por uma!" */
.acertos div         /* Barras de categorias descobertas */
```

## 🔄 Fluxo de Dados

### Inicialização do Jogo

```
1. React monta Nexo.tsx
   ↓
2. useEffect importa NexoLogic.ts
   ↓
3. new ConnectionsGame()
   ↓
4. constructor() → carregarJogo()
   ├─ true: Restaura jogo salvo
   └─ false: iniciarJogo()
        ↓
        ├─ Sorteia 4 matérias aleatórias
        ├─ Sorteia 1 categoria de cada
        ├─ Embaralha 16 palavras
        ├─ Popula grid
        └─ salvarJogo()
```

### Fluxo de Jogada

```
1. Jogador clica em botão
   ↓
2. apertou(botao)
   ├─ Adiciona à seleção
   ├─ Aplica classe .selected
   └─ Se 4 selecionados → verificar()
        ↓
3. verificar()
   ├─ Bloqueia interface (bloqueado = true)
   ├─ Busca categoria correspondente
   └─ Decisão:
        ├─ Acerto Total → processarAcerto()
        └─ Erro → processarErro()
             ↓
             verificarQuaseLa()
             (3 de 4 corretas)
        ↓
4. salvarJogo()
   ↓
5. Desbloqueia ou finaliza
```

### Fluxo de Acerto

```
processarAcerto(categoria)
   ↓
1. categoriasDescobertas.push(categoria)
2. Remove botões do DOM (btn.remove())
3. Toca som de acerto
4. renderizarBarraAcerto()
5. salvarJogo()
6. Verifica fim de jogo
   └─ Se 0 botões → finalizarJogo(true)
```

### Fluxo de Erro

```
processarErro()
   ↓
1. erros++, tentativas++
2. Toca som de erro
3. Remove coração (index: 10 - erros)
4. Adiciona classe .errado aos botões
5. salvarJogo()
6. Verifica game over
   ├─ Se erros >= 5 → Mostra botão DICA
   └─ Se erros >= 10 → finalizarJogo(false)
7. setTimeout → limparErro() (1s)
```

## 💾 Sistema de Persistência

### Estrutura do Save (LocalStorage)

**Chave:** `nexo_save_v1`

**Objeto JSON:**
```typescript
interface GameState {
  categoriasEmJogo: Desafio[]        // 4 categorias do jogo
  palavrasNoGrid: string[]           // Palavras visíveis (ordem atual)
  categoriasDescobertas: Desafio[]   // Grupos já encontrados
  erros: number                      // 0-10
  tentativas: number                 // Contador total
  isGameOver: boolean                // Estado final
  vitoria: boolean | null            // null se em andamento
  dicaDisponivel: boolean            // Botão visível?
  mapaGradientes: [string, string][] // [titulo, cor]
}
```

### Quando Ocorre o Salvamento

| Ação | Método | Momento |
|------|--------|---------|
| Novo jogo | `iniciarJogo()` | Após configuração inicial |
| Seleção validada | `verificar()` → `processarAcerto/Erro()` | Após cada tentativa |
| Usar dica | `usarDica()` | Ao clicar no botão DICA |
| Embaralhar | `embaralhar()` | Após animação (500ms) |
| Fim de jogo | `finalizarJogo()` | Ao completar ou perder |

### Lógica de Carregamento

```typescript
private carregarJogo(): boolean {
  const saveRaw = localStorage.getItem("nexo_save_v1")
  if (!saveRaw) return false
  
  try {
    const state: GameState = JSON.parse(saveRaw)
    
    // Restaura estados básicos
    this.erros = state.erros
    this.tentativas = state.tentativas
    // ...
    
    // Restaura UI
    1. Corações (10 - erros perdidos)
    2. Botão DICA (visível se disponível)
    3. Barras de categorias descobertas
    4. Palavras no grid (esconde botões extras)
    
    // Se jogo estava finalizado
    if (state.isGameOver) {
      setTimeout(() => finalizarJogo(state.vitoria!), 500)
    }
    
    return true
  } catch (e) {
    localStorage.removeItem("nexo_save_v1")
    return false
  }
}
```

### Tratamento de Erros

- **Save corrompido**: Deletado automaticamente, novo jogo inicia
- **Chave inexistente**: Retorna `false`, dispara `iniciarJogo()`
- **Validação**: Não há schema validation (considera-se ambiente controlado)

## 🎲 Interfaces e Tipos

### Tipos Core (NexoData.ts)

```typescript
// Categoria individual (4 palavras)
export interface Desafio {
  titulo: string
  palavras: string[]
  dificuldade?: 0 | 1 | 2 | 3  // Opcional
}

// Gradientes claro/escuro por matéria
export interface TemaGradiente {
  claro: string   // "linear-gradient(...)"
  escuro: string
}

// Agrupamento de categorias por matéria
export interface MateriaGrupo {
  materia: string
  corTema: TemaGradiente
  cards: Desafio[]  // Mínimo 3 categorias
}
```

### Tipos UI (Nexo.tsx)

```typescript
type Categoria = {
  titulo: string
  palavras: string[]
  cor: string  // Hex ou gradient
}

type ResultadoJogo = {
  vitoria: boolean
  categorias: Categoria[]  // Todas as 4 categorias
}

type UserWithTier = {
  tier?: string  // "FREE" | "PRO" | outros
}
```

### Tipo Internal (NexoLogic.ts)

```typescript
interface GameState {
  categoriasEmJogo: Desafio[]
  palavrasNoGrid: string[]
  categoriasDescobertas: Desafio[]
  erros: number
  tentativas: number
  isGameOver: boolean
  vitoria: boolean | null
  dicaDisponivel: boolean
  mapaGradientes: [string, string][]
}
```

## 🎮 Mecânicas do Jogo

### Sistema de Seleção

**Estados Possíveis:**
- `default` - Não selecionado
- `selected` - Selecionado (1-4)
- `errado` - Erro temporário (1s)
- `dica-visual` - Destacado pela dica

**Regras:**
1. Máximo 4 palavras selecionadas
2. Clicar novamente desmarca
3. Ao atingir 4, verifica automaticamente
4. Interface bloqueada durante verificação

**Código Simplificado:**
```typescript
private apertou(botao: HTMLButtonElement): void {
  if (this.bloqueado) return
  
  // Desmarcar
  if (this.botoesSelecionados.includes(botao)) {
    this.botoesSelecionados = this.botoesSelecionados.filter(b => b !== botao)
    botao.classList.remove("selected")
    return
  }
  
  // Selecionar (se < 4)
  if (this.botoesSelecionados.length < 4) {
    botao.classList.add("selected")
    this.botoesSelecionados.push(botao)
  }
  
  // Verificar automaticamente
  if (this.botoesSelecionados.length === 4) {
    this.verificar()
  }
}
```

### Sistema de Vidas

**Configuração:**
- Total: 10 corações
- Perda: 1 por erro
- Fim: 10 erros = Game Over

**Renderização:**
```typescript
// React (Nexo.tsx)
{Array.from({ length: 10 }).map((_, i) => (
  <Heart key={i} className="nexo-heart full" />
))}

// Lógica (NexoLogic.ts)
const indiceParaRemover = 10 - this.erros
this.coracoesEl[indiceParaRemover].classList.remove("full")
this.coracoesEl[indiceParaRemover].classList.add("lost")
```

**CSS:**
```css
.nexo-heart.full {
  fill: #ef4444;
  opacity: 1;
}

.nexo-heart.lost {
  fill: transparent;
  color: #cbd5e1;
  transform: scale(0.85);
  opacity: 0.5;
  animation: heartBreak 0.4s ease-out forwards;
}
```

### Sistema de Dicas

**Ativação:**
- Aparece após **5 erros**
- Único uso por jogo

**Comportamento:**
```typescript
public usarDica(): void {
  // 1. Desmarca tudo
  this.desmarcarTudo()
  
  // 2. Pega primeira palavra visível
  const palavraBase = this.botoesEPalavras.get(botoesDisponiveis[0])
  
  // 3. Encontra grupo correspondente
  const gabaritoEncontrado = this.categoriasEmJogo.find(grupo => 
    grupo.palavras.includes(palavraBase!)
  )
  
  // 4. Destaca 2 palavras do grupo
  const parDica = botoesDoGrupo.slice(0, 2)
  parDica.forEach(btn => btn.classList.add("dica-visual"))
  
  // 5. Esconde botão
  this.btnDica.classList.add("hidden")
  
  // 6. Salva estado
  this.salvarJogo()
}
```

### Sistema "Por Uma!"

**Condição:**
Exatamente 3 das 4 palavras pertencem ao mesmo grupo.

**Implementação:**
```typescript
private verificarQuaseLa(palavrasSelecionadas: string[]): void {
  for (const cat of this.categoriasEmJogo) {
    const acertosParciais = palavrasSelecionadas.filter(p => 
      cat.palavras.includes(p)
    ).length
    
    if (acertosParciais === 3) {
      this.toastEl.textContent = "Por uma!"
      this.mostrarAviso()  // 2s na tela
      return
    }
  }
}
```

### Embaralhamento

**Animação em 3 Fases:**

```typescript
public embaralhar(): void {
  this.bloqueado = true
  
  // FASE 1: Calcular posições → centro (0-500ms)
  botoesAtuais.forEach(botao => {
    botao.style.setProperty('--tx', `${centroX - x}px`)
    botao.style.setProperty('--ty', `${centroY - y}px`)
  })
  botoesAtuais.forEach(b => b.classList.add("embaralhando"))
  
  setTimeout(() => {
    // FASE 2: Embaralhar array (Fisher-Yates)
    for (let i = botoesAtuais.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      [botoesAtuais[i], botoesAtuais[j]] = [botoesAtuais[j], botoesAtuais[i]]
    }
    botoesAtuais.forEach(b => container.appendChild(b))
    
    // FASE 3: Calcular novas posições e retornar (500ms-1000ms)
    // ... recalcula --tx e --ty
    botoesAtuais.forEach(b => b.classList.remove("embaralhando"))
    
    setTimeout(() => {
      this.bloqueado = false
      this.salvarJogo()
    }, 500)
  }, 500)
}
```

**CSS:**
```css
.nexo-card.embaralhando {
  transform: translate(var(--tx), var(--ty)) scale(0.2) rotate(180deg);
  opacity: 0.5;
  pointer-events: none;
  z-index: 50;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## 🎨 Sistema de Estados

### Estados dos Cards

| Classe | Cor | Uso |
|--------|-----|-----|
| `.default` | Cinza claro glass | Estado inicial |
| `.selected` | Gradiente azul | Selecionado (1-4) |
| `.errado` | Vermelho | Erro (1s) + shake |
| `.dica-visual` | Amarelo tracejado | Revelado pela dica |

### Transições de Estado

```
default ←→ selected
   ↓
errado (temporário 1s)
   ↓
default

default → dica-visual
   ↓
selected (se clicado)
```

### Gradiente Azul (Selected)

**Implementação com Pseudo-elemento:**
```css
.nexo-card {
  position: relative;
  z-index: 1;
}

/* Fantasma invisível por padrão */
.nexo-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Ao selecionar, aparece suavemente */
.nexo-card.selected {
  background-color: transparent; /* Vê o ::before */
  color: white;
}

.nexo-card.selected::before {
  opacity: 1; /* Fade in */
}
```

**Vantagem:** Transição suave sem reflow de background.

### Barras de Categorias Descobertas

**Estrutura:**
```html
<div class="acertos">
  <!-- Inserido dinamicamente via renderizarBarraAcerto() -->
  <div style="background: linear-gradient(...)">
    <h2>TÍTULO DA CATEGORIA</h2>
    <p>Palavra1, Palavra2, Palavra3, Palavra4</p>
  </div>
</div>
```

**Estilo:**
```css
.acertos div {
  width: 100%;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## 🎨 Customização

### Adicionar Nova Matéria

**1. Editar `NexoData.ts`:**
```typescript
export const dbNexo: MateriaGrupo[] = [
  // ... existentes
  {
    materia: "Economia",
    corTema: {
      claro: "linear-gradient(135deg, #10b981, #059669)",
      escuro: "linear-gradient(135deg, #065f46, #064e3b)"
    },
    cards: [
      {
        titulo: "Indicadores Econômicos",
        palavras: ["PIB", "Inflação", "Desemprego", "Juros"]
      },
      {
        titulo: "Sistemas Econômicos",
        palavras: ["Capitalismo", "Socialismo", "Feudalismo", "Mercantilismo"]
      },
      {
        titulo: "Mercados Financeiros",
        palavras: ["Ações", "Títulos", "Câmbio", "Derivativos"]
      }
    ]
  }
]
```

**Requisitos:**
- ✅ Mínimo 3 categorias por matéria
- ✅ Exatamente 4 palavras por categoria
- ✅ Gradiente claro e escuro
- ✅ Título descritivo com matéria entre parênteses

### Modificar Número de Vidas

**1. `NexoLogic.ts` (linha ~396):**
```typescript
private processarErro(): void {
  this.erros++
  const totalVidas = 12 // Era 10
  // ...
  if (this.erros >= totalVidas) {
    this.finalizarJogo(false)
  }
}
```

**2. `Nexo.tsx` (linha ~XXX):**
```tsx
<div id="nexo-lifes" className="flex gap-1.5">
  {Array.from({ length: 12 }).map((_, i) => ( // Era 10
    <Heart key={i} className="nexo-heart full" />
  ))}
</div>
```

**3. Ajustar lógica de restauração de corações em `carregarJogo()`**

### Alterar Threshold da Dica

**`NexoLogic.ts` (linha ~402):**
```typescript
if (this.erros >= 3 && this.btnDica) { // Era 5
  if (this.btnDica.classList.contains("hidden")) {
    this.btnDica.classList.remove("hidden")
    this.btnDica.classList.add("fade-in-bttn")
  }
}
```

### Customizar Sons

**Substituir arquivos em `public/`:**
- `accept.mp3` - Acerto de grupo
- `error.mp3` - Erro
- `fanfare-trumpets.mp3` - Vitória
- `Game-Over.mp3` - Derrota

**Formato recomendado:** MP3, 44.1kHz, estéreo, ~100kb

### Alterar Cores de Estado

**`NexoStyle.css`:**
```css
/* Card Selecionado - Alterar gradiente */
.nexo-card.selected::before {
  background: linear-gradient(135deg, #f59e0b, #d97706); /* Laranja */
}

/* Card Erro - Alterar cor */
.nexo-card.errado {
  background-color: #fef3c7; /* Amarelo suave */
  color: #92400e;
  border-color: #fbbf24;
}

/* Dica - Alterar cor */
.nexo-card.dica-visual {
  background-color: #dbeafe; /* Azul suave */
  border: 2px dashed #3b82f6;
  color: #1e40af;
}
```

## 🛠️ Manutenção

### Debugging

**Acessar Save Manualmente:**
```javascript
// Console do navegador
JSON.parse(localStorage.getItem('nexo_save_v1'))
```

**Limpar Save:**
```javascript
localStorage.removeItem('nexo_save_v1')
location.reload()
```

**Forçar Estado:**
```javascript
// Acessar instância (se exposta)
const game = window.gameInstance
game.erros = 5 // Ativa dica
game.salvarJogo()
```

### Problemas Comuns

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| Jogo não salva | Save dentro de try/catch falhou | Verificar console, quota do localStorage |
| Botões não aparecem | DOM não montado ao instanciar | useEffect com importação dinâmica |
| Animação travada | `bloqueado` não resetado | Garantir reset após timeouts |
| Categorias repetidas | Random não controlado | Implementar histórico de jogos |

### Checklist de Teste

- [ ] Novo jogo inicia corretamente
- [ ] Seleção de 1-4 palavras funciona
- [ ] Acerto remove palavras e cria barra
- [ ] Erro mostra animação shake
- [ ] "Por uma!" aparece em 3/4 corretas
- [ ] 10 erros = Game Over
- [ ] 4 grupos completos = Vitória
- [ ] Dica aparece após 5 erros
- [ ] Dica destaca 2 palavras corretas
- [ ] Embaralhar mantém palavras corretas
- [ ] Save persiste entre reloads
- [ ] Reload restaura estado visual
- [ ] Modal de resultado exibe categorias
- [ ] Confetes disparam na vitória
- [ ] Sons tocam nos eventos corretos

### Performance

**Otimizações Implementadas:**
- ✅ Importação dinâmica do NexoLogic
- ✅ `bloqueado` previne múltiplos cliques
- ✅ Animações via CSS (GPU)
- ✅ Debounce implícito (bloqueio de interface)
- ✅ Map ao invés de Array.find() para palavras

**Monitoramento:**
```javascript
// Tempo de render
console.time('nexo-init')
// ... inicialização
console.timeEnd('nexo-init')

// Tamanho do save
console.log(
  new Blob([localStorage.getItem('nexo_save_v1')]).size,
  'bytes'
)
```

### Versionamento do Save

**Estratégia Atual:**
- Chave: `nexo_save_v1`
- Sem migração automática

**Para Breaking Changes:**
```typescript
// Incrementar versão
localStorage.setItem("nexo_save_v2",