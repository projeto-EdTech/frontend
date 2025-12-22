# Flash Card Game - Arquitetura do Código

## 📁 Estrutura de Arquivos

```
flash-card_game/
├── Flash-card.tsx              # Componente visual (UI) e Lógica de Estado/Sessão
├── functions/
│   └── flash-cardlogic.ts     # Lógica do jogo (Regras, Pontuação, API)
└── lib/
    └── flash-cardData.ts      # Tipos e constantes
```

## 🎯 Separação de Responsabilidades

### 1. **flash-cardData.ts** - Dados e Tipos
Define toda a estrutura de dados e constantes do jogo:

- **Interfaces/Tipos:**
  - `FlashCard` - Estrutura de um card
  - `FlashCardGameProps` - Props do componente
  - `GameScore` - Pontuação do jogo
  - `GameState` - Estado completo do jogo

- **Constantes:**
  - `SUBJECT_COLORS` - Cores por matéria
  - `DIFFICULTY_POINTS` - Pontos por dificuldade
  - `COMBO_THRESHOLDS` - Limites de combo
  - `COMBO_MULTIPLIERS` - Multiplicadores
  - `COMBO_COLORS` - Cores do confete

### 2. **flash-cardlogic.ts** - Lógica de Negócio
Classe `FlashCardGameLogic` que gerencia a mecânica "core" do jogo:

#### Métodos Principais:
- `fetchCards()` - Busca cards da API
- `startGame(cards, subject, limit?)` - Inicia o jogo com filtro de matéria e limite opcional
- `shuffleCards()` - Embaralha as cartas
- `calculatePoints()` - Calcula pontos baseado em dificuldade
- `getMultiplier()` - Retorna multiplicador do combo
- `handleCorrect()` - Processa resposta correta (pontos, combo, stats)
- `handleIncorrect()` - Processa resposta incorreta
- `submitResults()` - Envia resultados para API
- `triggerComboConfetti()` - Efeitos visuais de combo
- `triggerVictoryConfetti()` - Efeitos de vitória
- `getDifficultyColor()` - Retorna cor por dificuldade
- `getSubjectColor()` - Retorna cor por matéria
- `calculateProgress()` - Calcula progresso do jogo

### 3. **Flash-card.tsx** - Interface Visual e Controle de Sessão

Componente React focado na apresentação e regras de acesso:

#### Responsabilidades

- Renderização da UI (Cards, Feedback, Menus)
- Integração com `NextAuth` (Verificação de Tier PRO)
- Gerenciamento de Limites Diários (LocalStorage)
- Animações e transições
- Telas de carregamento/erro/vitória/limite atingido

#### Estados e Funcionalidades Principais

- **Autenticação:** Verifica `session.user.tier` para determinar se é 'Simula PRO'.
- **Limite Diário:**
  - Usuários Free: Limite de 10 cards por dia (`DAILY_LIMIT`).
  - Usuários PRO: Ilimitado.
- **Persistência Local:**
  - `flashcard_last_date`: Data do último acesso.
  - `flashcard_count`: Cards jogados hoje.
  - `flashcard_daily_stats`: Pontuação acumulada do dia.
- **Timer:** Contagem regressiva para o reset do limite diário.

## 🔄 Fluxo de Dados e Regras

1. **Inicialização:**
   - Carrega sessão (`useSession`).
   - Verifica `localStorage` para restaurar progresso do dia.
   - Busca cards da API via `gameLogic`.

2. **Gameplay:**
   - Usuário seleciona matéria.
   - `startGame` é chamado (aplicando limite se não for PRO).
   - Interações (Flip, Correto, Incorreto) atualizam estados locais e `localStorage`.

3. **Finalização:**
   - Ao completar os cards ou atingir o limite:
     - Envia resultados para API (`submitResults`).
     - Exibe tela de conclusão/meta diária.
     - Bloqueia novo jogo se limite atingido (Free).

## 💡 Benefícios da Arquitetura

### ✅ Manutenibilidade

- Código organizado e fácil de localizar
- Separação entre lógica pura (`flash-cardlogic.ts`) e lógica de estado/UI (`Flash-card.tsx`)

### ✅ Monetização e Engajamento

- Suporte nativo a Tiers (Free vs PRO)
- Sistema de retenção com limites diários e contadores
- Feedback visual imediato (Combos, Confetes)

## 🔧 Como Usar

### Importar tipos

```typescript
import type { FlashCard, GameScore } from './lib/flash-cardData';
```

### Instanciar lógica

```typescript
import { FlashCardGameLogic } from './functions/flash-cardlogic';

const gameLogic = new FlashCardGameLogic(
  setScore,
  setPoints,
  onComboUpdate,
  setReviewedCards,
  setCorrectIds
);
```

### Controle de Limites (Exemplo simplificado)

```typescript
const isPro = session?.user?.tier === 'Simula PRO';
const DAILY_LIMIT = 10;
// ...
const startGame = () => {
  const remaining = isPro ? 99999 : DAILY_LIMIT - cardsPlayedToday;
  // ...
  gameLogic.startGame(cards, selectedSubject, limit);
}
```

---

**Atualizado em:** 08/12/2025
**Versão:** Com suporte a Simula PRO e Limites Diários
