import confetti from 'canvas-confetti';
import {
  FlashCard,
  FlashCardSubject,
  FlashCardTopic,
  GameScore,
  DIFFICULTY_POINTS,
  COMBO_THRESHOLDS,
  COMBO_MULTIPLIERS,
  COMBO_COLORS,
  SUBJECT_COLORS,
  DEFAULT_SUBJECT_COLOR,
  flashCardsData // Importando os dados locais
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
   * Busca as matérias e prepara os dados iniciais com base nas recomendações do backend
   */
  async fetchCards(): Promise<{ cards: FlashCard[]; subjects: string[] }> {
    // Sem Authorization: o cookie `user_data` HttpOnly acompanha sozinho o fetch same-origin.
    const response = await fetch('/api/games/flash-cards', {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido.' }));
      throw new Error(errorData.error || `Falha ao buscar recomendações (${response.status})`);
    }

    const data = await response.json();
    const recommendedMaterias = data.materias || [];

    const filteredCards: FlashCard[] = [];
    const subjectsSet = new Set<string>();

    // Filtra o banco de dados local baseado no que o backend recomendou
    recommendedMaterias.forEach((recMateria: any) => {
      const actualSubject = flashCardsData.find(s => s.subject.toLowerCase() === recMateria.nome.toLowerCase());
      
      if (actualSubject) {
        recMateria.topicos.forEach((recTopic: any) => {
          const actualTopic = actualSubject.topics.find(t => t.name.toLowerCase() === recTopic.nome.toLowerCase());
          
          if (actualTopic) {
            subjectsSet.add(actualSubject.subject);
            actualTopic.cards.forEach(card => {
              filteredCards.push({
                ...card,
                subject: actualSubject.subject,
                topic: actualTopic.name
              });
            });
          }
        });
      }
    });

    return {
      cards: filteredCards,
      subjects: Array.from(subjectsSet),
    };
  }

  /**
   * Inicia o jogo com a matéria selecionada percorrendo a nova estrutura
   */
  startGame(cards: FlashCard[], selectedSubject: string, limit?: number): FlashCard[] {
    let filteredCards: FlashCard[] = [];

    if (selectedSubject === 'Todas') {
      filteredCards = [...cards];
    } else {
      // Filtra diretamente no array de cards recebido do backend (já contém metadata de subject)
      // Lógica anterior usava flashCardsData (dado local) — mantida abaixo como referência:
      // const subjectData = flashCardsData.find(s => s.subject === selectedSubject);
      // if (subjectData) { subjectData.topics.forEach(topic => { filteredCards.push(...topic.cards); }); }
      filteredCards = cards.filter(card => card.subject === selectedSubject);
    }

    // Filtra apenas cards marcados como disponíveis
    filteredCards = filteredCards.filter(card => card.available ?? true);
    
    // Embaralha
    filteredCards = this.shuffleCards(filteredCards);

    // Se houver limite definido, pega a quantidade solicitada
    if (limit && limit > 0 && limit < filteredCards.length) {
      filteredCards = filteredCards.slice(0, limit);
    }
    
    return filteredCards;
  }

  /**
   * Retorna os tópicos de uma matéria específica.
   * @param allCards Array completo de cards recebidos do backend (contém metadata de subject/topic)
   */
  getTopicsBySubject(subjectName: string, allCards: FlashCard[] = []): string[] {
    // Extrai tópicos únicos a partir dos cards recebidos do backend
    // Lógica anterior usava flashCardsData (dado local):
    // const subject = flashCardsData.find(s => s.subject === subjectName);
    // return subject ? subject.topics.map(t => t.name) : [];
    const topics = allCards
      .filter(card => card.subject === subjectName && card.topic)
      .map(card => card.topic as string);
    return Array.from(new Set(topics));
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
    // Permite que o mesmo card seja respondido múltiplas vezes.
    // Mantemos apenas a primeira ocorrência de cada id em correctIds
    // para o envio final à API, mas score/points/combo podem subir
    // a cada nova tentativa.

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
  // Também permite múltiplas respostas incorretas para o mesmo card.
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
      console.log('[FlashCardLogic] 📤 submitResults — Enviando resultados ao backend:');
      console.log('[FlashCardLogic]    CorrectIds:', correctIds);

      // Sem Authorization: o cookie `user_data` HttpOnly vai sozinho no fetch same-origin.
      // ATENÇÃO: `api/games/flash-cards/route.ts` exporta só `GET` — este POST responde 405 e
      // os acertos nunca chegaram ao backend. Bug de escopo próprio.
      const response = await fetch('/api/games/flash-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correctIds }),
      });

      console.log('[FlashCardLogic] 📥 submitResults — Status:', response.status, response.statusText);

      const json = await response.json();

      if (response.ok) {
        console.log('[FlashCardLogic] ✅ Resultados enviados com sucesso:', json);
      } else {
        console.error('[FlashCardLogic] ❌ Erro ao salvar resultados:', json.error || json);
      }
    } catch (e) {
      console.error('[FlashCardLogic] ❌ Erro de comunicação ao enviar resultados:', e);
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
  getSubjectColor(subject?: string): string {
    if (!subject) return DEFAULT_SUBJECT_COLOR;
    return SUBJECT_COLORS[subject] || DEFAULT_SUBJECT_COLOR;
  }

  /**
   * Calcula o progresso do jogo
   */
  calculateProgress(reviewedCount: number, totalCards: number): number {
    return (reviewedCount / totalCards) * 100;
  }
}
