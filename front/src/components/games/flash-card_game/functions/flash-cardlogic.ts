import confetti from 'canvas-confetti';
import {
  FlashCard,
  GameScore,
  DIFFICULTY_POINTS,
  COMBO_THRESHOLDS,
  COMBO_MULTIPLIERS,
  COMBO_COLORS,
  SUBJECT_COLORS,
  DEFAULT_SUBJECT_COLOR,
} from '../lib/flash-cardData';

/**
 * Hook personalizado para gerenciar toda a lógica do jogo Flash Card
 */
export class FlashCardGameLogic {
  // Callbacks
  private onScoreUpdate: (score: GameScore) => void;
  private onPointsUpdate: (points: number) => void;
  private onComboUpdate: (combo: number, multiplier: number, isActive: boolean) => void;
  private onReviewedCardsUpdate: (cards: number[]) => void;
  private onCorrectIdsUpdate: (ids: number[]) => void;
  
  constructor(
    onScoreUpdate: (score: GameScore) => void,
    onPointsUpdate: (points: number) => void,
    onComboUpdate: (combo: number, multiplier: number, isActive: boolean) => void,
    onReviewedCardsUpdate: (cards: number[]) => void,
    onCorrectIdsUpdate: (ids: number[]) => void
  ) {
    this.onScoreUpdate = onScoreUpdate;
    this.onPointsUpdate = onPointsUpdate;
    this.onComboUpdate = onComboUpdate;
    this.onReviewedCardsUpdate = onReviewedCardsUpdate;
    this.onCorrectIdsUpdate = onCorrectIdsUpdate;
  }

  /**
   * Busca os cards da API
   */
  async fetchCards(): Promise<{ cards: FlashCard[]; subjects: string[] }> {
    try {
      const response = await fetch('/api/games/Flash-cards');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar os cards');
      }
      
      const data = await response.json();
      
      if (data.success && data.data.cards) {
        return {
          cards: data.data.cards,
          subjects: data.data.subjects,
        };
      } else {
        throw new Error('Formato de dados inválido');
      }
    } catch (err) {
      console.error('Erro ao buscar cards:', err);
      throw err;
    }
  }

  /**
   * Inicia o jogo com a matéria selecionada
   */
  startGame(cards: FlashCard[], selectedSubject: string, limit?: number): FlashCard[] {
    let filteredCards = selectedSubject === 'Todas' 
      ? cards 
      : cards.filter(card => card.subject === selectedSubject);
    
    // Se houver limite definido, embaralha e pega a quantidade solicitada
    if (limit && limit > 0 && limit < filteredCards.length) {
      filteredCards = this.shuffleCards(filteredCards).slice(0, limit);
    }
    
    return filteredCards;
  }

  /**
   * Embaralha as cartas
   */
  shuffleCards(cards: FlashCard[]): FlashCard[] {
    return [...cards].sort(() => Math.random() - 0.5);
  }

  /**
   * Calcula os pontos baseado na dificuldade e multiplicador
   */
  calculatePoints(difficulty: 'easy' | 'medium' | 'hard', multiplier: number): number {
    const basePoints = DIFFICULTY_POINTS[difficulty];
    return Math.round(basePoints * multiplier);
  }

  /**
   * Atualiza o multiplicador baseado no combo
   */
  getMultiplier(comboCount: number): number {
    if (comboCount >= COMBO_THRESHOLDS.ADVANCED) {
      return COMBO_MULTIPLIERS.ADVANCED;
    } else if (comboCount >= COMBO_THRESHOLDS.BASIC) {
      return COMBO_MULTIPLIERS.BASIC;
    }
    return COMBO_MULTIPLIERS.NONE;
  }

  /**
   * Dispara confete para combo
   */
  triggerComboConfetti(comboCount: number): void {
    const colors = comboCount >= COMBO_THRESHOLDS.ADVANCED 
      ? [...COMBO_COLORS.ADVANCED]
      : [...COMBO_COLORS.BASIC];
    
    const particleCount = comboCount >= COMBO_THRESHOLDS.ADVANCED ? 150 : 100;
    const spread = comboCount >= COMBO_THRESHOLDS.ADVANCED ? 90 : 70;
    
    confetti({
      particleCount,
      spread,
      origin: { y: 0.6 },
      colors,
    });
  }

  /**
   * Dispara confete de vitória
   */
  triggerVictoryConfetti(audioRef: HTMLAudioElement | null): void {
    // Toca o áudio
    if (audioRef) {
      audioRef.currentTime = 0;
      audioRef.volume = 0.4;
      audioRef.play().catch(err => console.log('Erro ao tocar áudio:', err));
    }

    // Dispara confete
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  /**
   * Marca a resposta como correta
   */
  handleCorrect(
    currentCard: FlashCard,
    score: GameScore,
    reviewedCards: number[],
    correctIds: number[],
    comboCount: number,
    points: number
  ): {
    newScore: GameScore;
    newReviewedCards: number[];
    newCorrectIds: number[];
    newComboCount: number;
    newMultiplier: number;
    newPoints: number;
    shouldTriggerCombo: boolean;
  } {
    if (reviewedCards.includes(currentCard.id)) {
      return {
        newScore: score,
        newReviewedCards: reviewedCards,
        newCorrectIds: correctIds,
        newComboCount: comboCount,
        newMultiplier: this.getMultiplier(comboCount),
        newPoints: points,
        shouldTriggerCombo: false,
      };
    }

    const newScore = { ...score, correct: score.correct + 1 };
    const newReviewedCards = [...reviewedCards, currentCard.id];
    const newCorrectIds = correctIds.includes(currentCard.id) 
      ? correctIds 
      : [...correctIds, currentCard.id];
    
    // Incrementa o combo
    const newComboCount = comboCount + 1;
    
    // Define o multiplicador baseado no combo
    const newMultiplier = this.getMultiplier(newComboCount);
    
    // Calcula pontos
    const pointsToAdd = this.calculatePoints(currentCard.difficulty, newMultiplier);
    const newPoints = points + pointsToAdd;
    
    // Verifica se deve ativar combo visual
    const shouldTriggerCombo = newComboCount >= COMBO_THRESHOLDS.BASIC;
    
    // Atualiza os estados via callbacks
    this.onScoreUpdate(newScore);
    this.onReviewedCardsUpdate(newReviewedCards);
    this.onCorrectIdsUpdate(newCorrectIds);
    this.onPointsUpdate(newPoints);
    this.onComboUpdate(newComboCount, newMultiplier, shouldTriggerCombo);
    
    return {
      newScore,
      newReviewedCards,
      newCorrectIds,
      newComboCount,
      newMultiplier,
      newPoints,
      shouldTriggerCombo,
    };
  }

  /**
   * Marca a resposta como incorreta
   */
  handleIncorrect(
    currentCard: FlashCard,
    score: GameScore,
    reviewedCards: number[]
  ): {
    newScore: GameScore;
    newReviewedCards: number[];
  } {
    if (reviewedCards.includes(currentCard.id)) {
      return {
        newScore: score,
        newReviewedCards: reviewedCards,
      };
    }

    const newScore = { ...score, incorrect: score.incorrect + 1 };
    const newReviewedCards = [...reviewedCards, currentCard.id];
    
    // Reseta combo e multiplicador via callback
    this.onComboUpdate(0, 1, false);
    this.onScoreUpdate(newScore);
    this.onReviewedCardsUpdate(newReviewedCards);
    
    return {
      newScore,
      newReviewedCards,
    };
  }

  /**
   * Envia os resultados para a API
   */
  async submitResults(correctIds: number[]): Promise<void> {
    try {
      console.log('[Flash-card][CONCLUIDO] CorrectIds:', correctIds);
      
      const response = await fetch('/api/games/Flash-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctIds }),
      });
      
      const json = await response.json();
      console.log('[Flash-card][POST] correctIds enviados:', correctIds, 'resposta:', json);
    } catch (e) {
      console.error('[Flash-card][POST] erro ao enviar correctIds:', e);
    }
  }

  /**
   * Retorna a cor baseada na dificuldade
   */
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  /**
   * Retorna a cor baseada na matéria
   */
  getSubjectColor(subject: string): string {
    return SUBJECT_COLORS[subject] || DEFAULT_SUBJECT_COLOR;
  }

  /**
   * Calcula o progresso do jogo
   */
  calculateProgress(reviewedCount: number, totalCards: number): number {
    return (reviewedCount / totalCards) * 100;
  }
}
