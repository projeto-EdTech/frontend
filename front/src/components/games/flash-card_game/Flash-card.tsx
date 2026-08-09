'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Shuffle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { FlashCardGameLogic } from './functions/flash-cardlogic';
import type { FlashCard, FlashCardGameProps, GameScore } from './lib/flash-cardData';
import { useSession } from 'next-auth/react';

const FlashCardGame: React.FC<FlashCardGameProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const isPro = session?.user?.tier === 'SIMULAPRO';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const DAILY_LIMIT = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [cardLimit, setCardLimit] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState<GameScore>({ correct: 0, incorrect: 0 });
  const [reviewedCards, setReviewedCards] = useState<number[]>([]);
  const [correctIds, setCorrectIds] = useState<number[]>([]);
  const [gameCards, setGameCards] = useState<FlashCard[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);
  const [cardsPlayedToday, setCardsPlayedToday] = useState(0);
  const [dailyScore, setDailyScore] = useState<GameScore>({ correct: 0, incorrect: 0 });
  const [dailyPoints, setDailyPoints] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [points, setPoints] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [isComboActive, setIsComboActive] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  // Instância da lógica do jogo
  const gameLogicRef = useRef<FlashCardGameLogic>(
    new FlashCardGameLogic(
      setScore,
      setPoints,
      (combo, mult, isActive) => {
        setComboCount(combo);
        setMultiplier(mult);
        setIsComboActive(isActive);
      },
      setReviewedCards,
      setCorrectIds
    )
  );

  const gameLogic = gameLogicRef.current;

  // Buscar dados da API ao montar o componente
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        const data = await gameLogic.fetchCards();
        setCards(data.cards);
        setAvailableSubjects(data.subjects);
        if (data.subjects.length > 0) {
          setSelectedSubject(data.subjects[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar cards:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar os dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [gameLogic]);

  // Verifica se o usuário já jogou hoje
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('flashcard_last_date');
    
    if (lastDate !== today) {
      // Novo dia, reseta contadores
      localStorage.setItem('flashcard_last_date', today);
      localStorage.setItem('flashcard_count', '0');
      localStorage.setItem('flashcard_daily_stats', JSON.stringify({ score: { correct: 0, incorrect: 0 }, points: 0 }));
      setCardsPlayedToday(0);
      setDailyScore({ correct: 0, incorrect: 0 });
      setDailyPoints(0);
      setIsDailyLimitReached(false);
    } else {
      // Mesmo dia, recupera contagem e stats
      const count = parseInt(localStorage.getItem('flashcard_count') || '0');
      setCardsPlayedToday(count);
      
      const savedStats = localStorage.getItem('flashcard_daily_stats');
      if (savedStats) {
        const { score: savedScore, points: savedPoints } = JSON.parse(savedStats);
        setDailyScore(savedScore);
        setDailyPoints(savedPoints);
      }

      if (count >= DAILY_LIMIT) {
        setIsDailyLimitReached(true);
      }
    }
  }, []);

  // Timer para o próximo dia
  useEffect(() => {
    if (isComplete || isDailyLimitReached) {
      const updateTimer = () => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = tomorrow.getTime() - now.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [isComplete, isDailyLimitReached]);

  // Inicializa o áudio
  useEffect(() => {
    audioRef.current = new Audio('/fanfare-trumpets.mp3');
  }, []);

  // Dispara confete e áudio quando o jogo é completado
  useEffect(() => {
    if (isComplete) {
      gameLogic.triggerVictoryConfetti(audioRef.current);
      // Não seta isDailyLimitReached aqui, pois é controlado pela contagem de cards
    }
  }, [isComplete, gameLogic]);

  const currentCard = gameCards[currentIndex];
  const progress = gameLogic.calculateProgress(reviewedCards.length, gameCards.length);

  // Função para iniciar o jogo com a matéria selecionada
  const startGame = () => {
    const remaining = isPro ? 99999 : DAILY_LIMIT - cardsPlayedToday;
    if (remaining <= 0) return;

    let limit = cardLimit ? parseInt(cardLimit) : undefined;
    
    // Limita a quantidade de cards ao restante permitido no dia
    if (!limit || limit > remaining) {
      if (isPro && !limit) {
        // Não faz nada, deixa undefined para pegar todos
      } else {
        limit = remaining;
      }
    }

    const filteredCards = gameLogic.startGame(cards, selectedSubject, limit);
    setGameCards(filteredCards);
    setGameStarted(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setReviewedCards([]);
    setCorrectIds([]);
    setIsComplete(false);
    setPoints(0);
    setComboCount(0);
    setIsComboActive(false);
    setMultiplier(1);
  };

  // Embaralhar cartas
  const shuffleCards = () => {
    const shuffled = gameLogic.shuffleCards(gameCards);
    setGameCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setReviewedCards([]);
    setCorrectIds([]);
    setIsComplete(false);
    setPoints(0);
    setComboCount(0);
    setIsComboActive(false);
    setMultiplier(1);
  };

  // Virar carta
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowingAnswer(!showingAnswer);
  };

  // Atualiza progresso diário
  const updateDailyStats = (isCorrect: boolean, pointsToAdd: number = 0) => {
    const newCount = cardsPlayedToday + 1;
    setCardsPlayedToday(newCount);
    localStorage.setItem('flashcard_count', newCount.toString());

    const newDailyScore = {
      correct: dailyScore.correct + (isCorrect ? 1 : 0),
      incorrect: dailyScore.incorrect + (isCorrect ? 0 : 1)
    };
    setDailyScore(newDailyScore);
    
    const newDailyPoints = dailyPoints + pointsToAdd;
    setDailyPoints(newDailyPoints);

    localStorage.setItem('flashcard_daily_stats', JSON.stringify({ 
      score: newDailyScore, 
      points: newDailyPoints 
    }));

    if (newCount >= DAILY_LIMIT) {
      setIsDailyLimitReached(true);
    }
  };

  // Marcar como correta
  const handleCorrect = () => {
    const result = gameLogic.handleCorrect(
      currentCard,
      score,
      reviewedCards,
      correctIds,
      comboCount,
      points
    );
    
    // Atualiza stats diários
    if (!reviewedCards.includes(currentCard.id)) {
      updateDailyStats(true, result.newPoints - points);
    }

    // Dispara confete se necessário
    if (result.shouldTriggerCombo) {
      gameLogic.triggerComboConfetti(result.newComboCount);
      
      // Desativa o visual do combo após 3 segundos (mas mantém o contador)
      setTimeout(() => setIsComboActive(false), 3000);
    }
    
    goToNextCard();
  };

  // Marcar como incorreta
  const handleIncorrect = () => {
    gameLogic.handleIncorrect(currentCard, score, reviewedCards);
    
    // Atualiza stats diários
    if (!reviewedCards.includes(currentCard.id)) {
      updateDailyStats(false, 0);
    }

    goToNextCard();
  };

  // Ir para próxima carta
  const goToNextCard = () => {
    if (currentIndex < gameCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowingAnswer(false);
    } else {
      setIsComplete(true);
      if (onComplete) {
        onComplete({ correct: score.correct, total: gameCards.length });
      }
    }
  };

  // Chama o POST somente quando o jogo for concluído
  useEffect(() => {
    if (isComplete) {
      gameLogic.submitResults(correctIds);
    }
  }, [isComplete, correctIds, gameLogic]);

  // Ir para carta anterior
  const goToPreviousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      setShowingAnswer(false);
    }
  };

  // Reiniciar jogo
  const handleRestart = () => {
    // Se atingiu o limite diário E NÃO É PRO, não permite reiniciar
    if (isDailyLimitReached && !isPro) return;

    setGameStarted(false);
    if (availableSubjects.length > 0) {
      setSelectedSubject(availableSubjects[0]);
    }
    setCardLimit(''); // Reseta o limite ao reiniciar
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setReviewedCards([]);
    setCorrectIds([]);
    setIsComplete(false);
    setShowingAnswer(false);
    setPoints(0);
    setComboCount(0);
    setIsComboActive(false);
    setMultiplier(1);
  };

  // Cores baseadas na dificuldade
  const getDifficultyColor = (difficulty: string) => {
    return gameLogic.getDifficultyColor(difficulty);
  };

  // Cores baseadas na matéria
  const getSubjectColor = (subject?: string) => {
    return gameLogic.getSubjectColor(subject);
  };

  // Tela de carregamento - Mobile-First
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 select-none">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 mx-auto mb-3 sm:mb-4 ${
            theme === 'dark' ? 'border-blue-400' : 'border-blue-500'
          }`}></div>
          <p className={`text-sm sm:text-base font-normal ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Carregando jogo...</p>
        </div>
      </div>
    );
  }

  // Tela de erro - Mobile-First
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 select-none">
        <div className="text-center max-w-md mx-auto">
          <div className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            ⚠️ Erro ao carregar o jogo
          </div>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`mt-5 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Verificar se há cards disponíveis - Mobile-First
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 select-none">
        <div className="text-center max-w-md w-full">
          {/* Ícone */}
          <div className={`w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-5 sm:mb-6 rounded-full flex items-center justify-center ${
            theme === 'dark' 
              ? 'bg-gray-800/50' 
              : 'bg-gray-200/50'
          }`}>
            <svg 
              className={`w-12 h-12 sm:w-16 sm:h-16 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>

          {/* Título */}
          <h2 className={`text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 px-4 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Nenhum Card Disponível
          </h2>

          {/* Descrição */}
          <p className={`text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed px-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Não há flashcards disponíveis para você no momento. Faça um novo Simulado ou tente novamente mais tarde.
          </p>

          {/* Botões de ação */}
          <div className="flex flex-col gap-3 justify-center px-4">
            <button 
              onClick={() => window.location.href = '/library'}
              className={`w-full px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } shadow-sm hover:shadow-md`}
            >
              Biblioteca de Provas
            </button>
            <button 
              onClick={() => window.history.back()}
              className={`w-full px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              } shadow-sm hover:shadow-md`}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Meta Diária Concluída - Mobile-First e Responsivo
  if (isComplete || (!gameStarted && isDailyLimitReached && !isPro)) {
    const showDailyStats = isDailyLimitReached && !isPro;
    const displayScore = showDailyStats ? dailyScore : score;
    const displayPoints = showDailyStats ? dailyPoints : points;

    return (
      <div className="flex flex-col items-center justify-start pt-10 sm:pt-16 min-h-screen px-4 pb-12 select-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className={`rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md w-full text-center backdrop-blur-xl ${
            theme === 'dark' 
              ? 'bg-gray-900/90 border border-gray-700/50' 
              : 'bg-white/95 border border-gray-200/50'
          }`}
          style={{
            boxShadow: theme === 'dark' 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {(isDailyLimitReached && !isPro) ? "Meta Diária Concluída! 🎉" : "Rodada Concluída! 👏"}
          </h2>
          
          {(isDailyLimitReached && !isPro) ? (
            <p className={`text-xs sm:text-sm mb-5 sm:mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Próxima rodada disponível em: <span className="font-mono font-bold text-blue-500">{timeRemaining}</span>
            </p>
          ) : (
            <p className={`text-xs sm:text-sm mb-5 sm:mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {isPro ? (
                <span className="font-bold text-purple-500">Modo Simula PRO: Jogue sem limites! 🚀</span>
              ) : (
                <>Você ainda pode jogar <span className="font-bold text-blue-500">{DAILY_LIMIT - cardsPlayedToday}</span> cards hoje.</>
              )}
            </p>
          )}
          
          <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
            <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
              theme === 'dark' 
                ? 'bg-blue-500/10 border border-blue-500/20' 
                : 'bg-blue-50 border border-blue-200/50'
            }`}>
              <span className={`font-medium text-xs sm:text-sm md:text-base ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
              }`}>{showDailyStats ? "Pontuação Total (Dia)" : "Pontuação (Rodada)"}</span>
              <span className={`text-xl sm:text-2xl font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>{displayPoints} pts</span>
            </div>
            
            <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
              theme === 'dark' 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-green-50 border border-green-200/50'
            }`}>
              <span className={`font-medium text-xs sm:text-sm md:text-base ${
                theme === 'dark' ? 'text-green-400' : 'text-green-700'
              }`}>Corretas</span>
              <span className={`text-xl sm:text-2xl font-semibold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>{displayScore.correct}</span>
            </div>
            
            <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
              theme === 'dark' 
                ? 'bg-red-500/10 border border-red-500/20' 
                : 'bg-red-50 border border-red-200/50'
            }`}>
              <span className={`font-medium text-xs sm:text-sm md:text-base ${
                theme === 'dark' ? 'text-red-400' : 'text-red-700'
              }`}>Incorretas</span>
              <span className={`text-xl sm:text-2xl font-semibold ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>{displayScore.incorrect}</span>
            </div>
          </div>

          {(isDailyLimitReached && !isPro) ? (
            <button 
              onClick={() => window.history.back()}
              className={`w-full py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Voltar
            </button>
          ) : (
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <button 
                onClick={handleRestart}
                className={`w-full py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Jogar Novamente
              </button>
              <button 
                onClick={() => window.history.back()}
                className={`w-full py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                }`}
              >
                Voltar
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Tela de seleção de matéria
  if (!gameStarted) {
    if (isDailyLimitReached && !isPro) {
      return (
        <div className="flex flex-col items-center justify-start pt-10 sm:pt-16 min-h-screen px-4 pb-12 select-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md w-full text-center backdrop-blur-xl ${
              theme === 'dark' 
                ? 'bg-gray-900/90 border border-gray-700/50' 
                : 'bg-white/95 border border-gray-200/50'
            }`}
            style={{
              boxShadow: theme === 'dark' 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Meta Diária Concluída! 🎉
            </h2>
            
            <p className={`text-xs sm:text-sm mb-5 sm:mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Próxima rodada disponível em: <span className="font-mono font-bold text-blue-500">{timeRemaining}</span>
            </p>
            
            <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
              <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
                theme === 'dark' 
                  ? 'bg-blue-500/10 border border-blue-500/20' 
                  : 'bg-blue-50 border border-blue-200/50'
              }`}>
                <span className={`font-medium text-xs sm:text-sm md:text-base ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                }`}>Pontuação Total (Dia)</span>
                <span className={`text-xl sm:text-2xl font-semibold ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>{dailyPoints} pts</span>
              </div>
              
              <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
                theme === 'dark' 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-green-50 border border-green-200/50'
              }`}>
                <span className={`font-medium text-xs sm:text-sm md:text-base ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-700'
                }`}>Corretas</span>
                <span className={`text-xl sm:text-2xl font-semibold ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>{dailyScore.correct}</span>
              </div>
              
              <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
                theme === 'dark' 
                  ? 'bg-red-500/10 border border-red-500/20' 
                  : 'bg-red-50 border border-red-200/50'
              }`}>
                <span className={`font-medium text-xs sm:text-sm md:text-base ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-700'
                }`}>Incorretas</span>
                <span className={`text-xl sm:text-2xl font-semibold ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}>{dailyScore.incorrect}</span>
              </div>
            </div>

            <button 
              onClick={() => window.history.back()}
              className={`w-full py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Voltar
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-start pt-10 sm:pt-16 min-h-screen px-4 pb-12 select-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 max-w-4xl w-full backdrop-blur-xl ${ theme === 'dark' ? 'bg-gray-900' : 'bg-white/95'}`}>
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Flash Cards
            </h2>
            
            <p className={`text-sm sm:text-base md:text-lg font-normal ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Flashcards recomendados com base nos seus erros recentes
            </p>
            {!isPro && (
              <p className={`text-xs sm:text-sm mt-2 font-medium ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Cards restantes hoje: {DAILY_LIMIT - cardsPlayedToday}
              </p>
            )}
          </div>

          {/* Grid de matérias - Mobile-First */}
          <div className="mb-6 sm:mb-8">
            <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/80'
            }`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 max-h-[320px] sm:max-h-[420px] overflow-y-auto scrollbar-thin">
                {availableSubjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`relative p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm md:text-base transition-all duration-200 overflow-hidden cursor-pointer ${
                      selectedSubject === subject
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                        : theme === 'dark'
                        ? 'bg-gray-700/60 hover:bg-gray-700 text-gray-200 hover:shadow-md'
                        : 'bg-white hover:bg-gray-50 text-gray-800 hover:shadow-md'
                    }`}
                    style={{
                      transform: selectedSubject === subject ? 'scale(0.98)' : 'scale(1)',
                    }}
                  >
                    {/* Indicador de seleção*/}
                    {selectedSubject === subject && (
                      <motion.div
                        layoutId="selected-subject"
                        className="absolute inset-0 rounded-lg sm:rounded-xl -z-10"
                        style={{
                          background: theme === 'dark' 
                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        }}
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex flex-col items-center justify-center min-h-[60px] sm:min-h-[80px]">
                      <span className="font-semibold mb-1">{subject}</span>
                      <span className={`text-[10px] sm:text-xs font-medium mb-1.5 px-2 py-0.5 rounded-full ${
                        selectedSubject === subject 
                          ? 'bg-white/20 text-white' 
                          : theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {gameLogic.getTopicsBySubject(subject, cards).join(', ')}
                      </span>
                      <span className={`text-[10px] sm:text-xs font-normal ${
                        selectedSubject === subject 
                          ? 'text-white/75' 
                          : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {cards.filter(c => c.subject === subject).length} cards
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input de Quantidade de Cards */}
          <div className="mb-5 sm:mb-6">
            <label className={`block text-xs sm:text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Quantidade de Cards (Opcional)
            </label>
            <input
              type="number"
              min="1"
              max={Math.min(selectedSubject === 'Todas' ? cards.length : cards.filter(c => c.subject === selectedSubject).length, DAILY_LIMIT - cardsPlayedToday)}
              value={cardLimit}
              onChange={(e) => setCardLimit(e.target.value)}
              placeholder={`Máx: ${Math.min(selectedSubject === 'Todas' ? cards.length : cards.filter(c => c.subject === selectedSubject).length, DAILY_LIMIT - cardsPlayedToday)}`}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base border outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
            <p className={`text-[10px] sm:text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Deixe em branco para jogar com todos os cards disponíveis (limitado a {DAILY_LIMIT - cardsPlayedToday}).
            </p>
          </div>

          {/* Botão Iniciar*/}
          <button
            onClick={startGame}
            disabled={!selectedSubject}
            className={`w-full py-3 sm:py-4 px-5 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-200 cursor-pointer ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-500/30 disabled:bg-gray-700 disabled:text-gray-500'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg shadow-blue-500/40 disabled:bg-gray-200 disabled:text-gray-400'
            } disabled:cursor-not-allowed disabled:shadow-none`}
            style={{
              transform: selectedSubject ? 'scale(1)' : 'scale(0.98)',
            }}
          >
            Iniciar
          </button>
        </motion.div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6 sm:py-8 select-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md w-full text-center backdrop-blur-xl ${
            theme === 'dark' 
              ? 'bg-gray-900/90 border border-gray-700/50' 
              : 'bg-white/95 border border-gray-200/50'
          }`}
          style={{
            boxShadow: theme === 'dark' 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Meta Diária Concluída! 🎉
          </h2>
          
          <p className={`text-xs sm:text-sm mb-5 sm:mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Próxima rodada disponível em: <span className="font-mono font-bold text-blue-500">{timeRemaining}</span>
          </p>
          
          <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
            <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
              theme === 'dark' 
                ? 'bg-blue-500/10 border border-blue-500/20' 
                : 'bg-blue-50 border border-blue-200/50'
            }`}>
              <span className={`font-medium text-xs sm:text-sm md:text-base ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
              }`}>Pontuação Total (Dia)</span>
              <span className={`text-xl sm:text-2xl font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>{dailyPoints} pts</span>
            </div>
            
            <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
              theme === 'dark' 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-green-50 border border-green-200/50'
            }`}>
              <span className={`font-medium text-xs sm:text-sm md:text-base ${
                theme === 'dark' ? 'text-green-400' : 'text-green-700'
              }`}>Corretas</span>
              <span className={`text-xl sm:text-2xl font-semibold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>{dailyScore.correct}</span>
            </div>
            
            <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
              theme === 'dark' 
                ? 'bg-red-500/10 border border-red-500/20' 
                : 'bg-red-50 border border-red-200/50'
            }`}>
              <span className={`font-medium text-xs sm:text-sm md:text-base ${
                theme === 'dark' ? 'text-red-400' : 'text-red-700'
              }`}>Incorretas</span>
              <span className={`text-xl sm:text-2xl font-semibold ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>{dailyScore.incorrect}</span>
            </div>
          </div>

          <button
            onClick={() => window.history.back()}
            className={`w-full py-3 sm:py-4 px-5 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-white shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900 shadow-sm'
            }`}
          >
            Voltar
          </button>
        </motion.div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 select-none">
        <p className={`text-base sm:text-xl font-medium ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
        }`}>Nenhum card disponível</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-4 sm:py-6 px-3 sm:px-4 select-none">
      {/* Efeito de Fogo no Fundo quando Combo Ativo */}
      <AnimatePresence>
        {isComboActive && (
          <>
            {/* Chamas animadas */}
            {[...Array(comboCount >= 5 ? 12 : 8)].map((_, i) => (
              <motion.div
                key={`flame-${i}`}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, comboCount >= 5 ? 2 : 1.5, 0],
                  x: Math.random() * window.innerWidth,
                  y: -100,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: comboCount >= 5 ? 1.5 : 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut"
                }}
                className="fixed pointer-events-none z-0"
                style={{
                  fontSize: comboCount >= 5 ? '3rem' : '2.5rem',
                  filter: 'blur(1px)'
                }}
              >
                {comboCount >= 5 ? '💜' : '🔥'}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
      
      {/* Header com informações - Mobile-First */}
      <div className="w-full max-w-4xl mb-4 sm:mb-6 relative z-10">
        <div className="flex flex-col gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          {/* Nova Linha: Exibição da Matéria e Tópico */}
          <div className="flex flex-col mb-1">
            <span 
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded w-fit mb-1 border"
              style={{ 
                backgroundColor: `${gameLogic.getSubjectColor(currentCard.subject || '')}15`,
                color: gameLogic.getSubjectColor(currentCard.subject || ''),
                borderColor: `${gameLogic.getSubjectColor(currentCard.subject || '')}30`
              }}
            >
              {currentCard.subject}
            </span>
            <span className={`text-sm sm:text-base font-bold leading-tight ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              {currentCard.topic}
            </span>
          </div>

          {/* Linha 1: Contador de cards e dificuldade */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`font-medium text-xs sm:text-sm md:text-base ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Card {currentIndex + 1} de {gameCards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-white text-[10px] sm:text-xs md:text-sm font-medium shadow-sm ${getDifficultyColor(currentCard.difficulty)}`}>
                {currentCard.difficulty === 'easy' 
                  ? `Fácil (+${Math.round(5 * multiplier)} pts)` 
                  : currentCard.difficulty === 'medium' 
                  ? `Médio (+${Math.round(10 * multiplier)} pts)` 
                  : `Difícil (+${Math.round(20 * multiplier)} pts)`}
              </span>
              {multiplier > 1 && (
                <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-white text-[10px] sm:text-xs md:text-sm font-bold shadow-lg ${
                  multiplier >= 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}>
                  🔥 {multiplier}x
                </span>
              )}
            </div>
          </div>
          
          {/* Linha 2: Botão embaralhar */}
          <div className="flex justify-end">
            <button
              onClick={shuffleCards}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 shadow-sm text-xs sm:text-sm cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700/50'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200/50'
              }`}
            >
              <Shuffle size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Embaralhar</span>
            </button>
          </div>
        </div>

        {/* Barra de progresso*/}
        <div className={`w-full rounded-full h-1.5 sm:h-2 overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
        }`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${
              theme === 'dark' 
                ? 'bg-blue-500' 
                : 'bg-blue-500'
            }`}
            style={{
              boxShadow: theme === 'dark' 
                ? '0 0 8px rgba(59, 130, 246, 0.5)' 
                : '0 0 8px rgba(59, 130,246, 0.3)'
            }}
          />
        </div>

        {/* Score - Mobile Optimized */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-5">
          <div className={`flex items-center gap-1.5 sm:gap-2 ${
            theme === 'dark' ? 'text-green-400' : 'text-green-600'
          }`}>
            <CheckCircle size={18} strokeWidth={2} className="sm:w-6 sm:h-6" />
            <span className="font-semibold text-base sm:text-xl">{score.correct}</span>
          </div>
          <div className={`flex items-center gap-1.5 sm:gap-2 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            <XCircle size={18} strokeWidth={2} className="sm:w-6 sm:h-6" />
            <span className="font-semibold text-base sm:text-xl">{score.incorrect}</span>
          </div>
          <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ${
            theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            <span className="font-semibold text-base sm:text-xl">{points}</span>
            <span className="text-xs sm:text-sm font-medium">pts</span>
          </div>
        </div>
        
        {/* Indicador de Combo - Mobile Optimized */}
        <AnimatePresence>
          {comboCount >= 3 && isComboActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="mt-3 sm:mt-4 relative"
            >
              <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg shadow-lg ${
                comboCount >= 5
                  ? theme === 'dark' 
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white' 
                    : 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white'
                  : theme === 'dark' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
              }`}
              style={{
                boxShadow: comboCount >= 5
                  ? '0 0 25px rgba(168, 85, 247, 0.7), 0 0 50px rgba(236, 72, 153, 0.5)'
                  : '0 0 20px rgba(249, 115, 22, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)'
              }}>
                {comboCount >= 5 ? '🔥💜 SUPER COMBO' : '🔥 COMBO'} x{comboCount}! 
                <span className="ml-1 sm:ml-2 text-yellow-300 text-xs sm:text-sm">({multiplier}x pontos)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Principal com Cards Empilhados - Mobile-First */}
      <div className="relative w-full max-w-2xl h-64 xs:h-72 sm:h-80 md:h-96 mb-4 sm:mb-6" style={{ perspective: '1000px' }}>
        {/* Cards de Fundo (Empilhados) - 100% SÓLIDOS */}
        {gameCards.slice(currentIndex + 1, currentIndex + 3).map((card, index) => (
          <motion.div
            key={`background-${card.id}`}
            className="absolute w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${getSubjectColor(card.subject)} 0%, ${getSubjectColor(card.subject)} 100%)`,
              zIndex: -index - 1,
              transformOrigin: 'center bottom',
            }}
            initial={{ y: 15 * (index + 1), scale: 1 - 0.05 * (index + 1), opacity: 1 }}
            animate={{ y: 15 * (index + 1), scale: 1 - 0.05 * (index + 1), opacity: 1 }}
          />
        ))}

        {/* Card Principal Animado */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ 
              y: 0, 
              scale: 1, 
              opacity: 1,
              rotateX: 0
            }}
            animate={{ 
              y: 0, 
              scale: 1, 
              opacity: 1,
              rotateX: 0
            }}
            exit={{ 
              y: -100, 
              scale: 0.95, 
              opacity: 0,
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.4, 0, 0.2, 1],
            }}
            className="relative w-full h-full"
            style={{ zIndex: 10 }}
          >
            <motion.div
              className="relative w-full h-full cursor-pointer"
              onClick={handleFlip}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Frente do Card (Pergunta) - 100% SÓLIDO */}
              <div
                className="absolute w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center backface-hidden"
                style={{ 
                  backfaceVisibility: "hidden",
                  background: `linear-gradient(135deg, ${getSubjectColor(currentCard.subject)} 0%, ${getSubjectColor(currentCard.subject)} 100%)`
                }}
              >
                <span 
                  className="text-[10px] xs:text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3 md:mb-4 font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-white/20 text-white"
                >
                  {currentCard.subject}
                </span>
                <p className="text-sm xs:text-base sm:text-lg md:text-2xl text-white font-semibold text-center px-2 sm:px-4 leading-snug sm:leading-normal">
                  {currentCard.question}
                </p>
                <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 text-white/80 text-[10px] xs:text-xs sm:text-sm">
                  Clique para ver a resposta
                </div>
              </div>

              {/* Verso do Card (Resposta) - 100% SÓLIDO */}
              <div
                className="absolute w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: `linear-gradient(225deg, ${getSubjectColor(currentCard.subject)} 0%, ${getSubjectColor(currentCard.subject)} 100%)`
                }}
              >
                <span className="text-[10px] xs:text-xs sm:text-sm text-white/90 uppercase tracking-wide mb-2 sm:mb-3 md:mb-4 font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-white/20">
                  Resposta - {currentCard.subject}
                </span>
                <p className="text-sm xs:text-base sm:text-lg md:text-2xl text-white font-semibold text-center px-2 sm:px-4 leading-snug sm:leading-normal">
                  {currentCard.answer}
                </p>
                <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 text-white/80 text-[10px] xs:text-xs sm:text-sm">
                  Você acertou?
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles de navegação - Mobile-First */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-4 mb-3 sm:mb-4 flex-wrap">
        <button
          onClick={goToPreviousCard}
          disabled={currentIndex === 0}
          className={`p-2 sm:p-3 rounded-full transition-all duration-200 shadow-sm cursor-pointer ${
            theme === 'dark'
              ? 'bg-gray-800/80 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-gray-200 border border-gray-700/50 disabled:border-gray-800'
              : 'bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 border border-gray-200/50 disabled:border-gray-300'
          } disabled:opacity-40`}
        >
          <ChevronLeft size={18} strokeWidth={2} className="sm:w-6 sm:h-6" />
        </button>

        {showingAnswer && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <button
              onClick={handleIncorrect}
              className="flex items-center gap-1.5 sm:gap-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md shadow-red-500/30 text-xs sm:text-sm cursor-pointer"
            >
              <XCircle size={14} strokeWidth={2} className="sm:w-5 sm:h-5" />
              Errei
            </button>
            <button
              onClick={handleCorrect}
              className="flex items-center gap-1.5 sm:gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md shadow-green-500/30 text-xs sm:text-sm cursor-pointer"
            >
              <CheckCircle size={14} strokeWidth={2} className="sm:w-5 sm:h-5" />
              Acertei
            </button>
          </motion.div>
        )}

        <button
          onClick={goToNextCard}
          disabled={currentIndex === gameCards.length - 1}
          className={`p-2 sm:p-3 rounded-full transition-all duration-200 shadow-sm cursor-pointer ${
            theme === 'dark'
              ? 'bg-gray-800/80 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-gray-200 border border-gray-700/50 disabled:border-gray-800'
              : 'bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 border border-gray-200/50 disabled:border-gray-300'
          } disabled:opacity-40`}
        >
          <ChevronRight size={18} strokeWidth={2} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Botão de Voltar para o Menu - Mobile-First */}
      <button
        onClick={handleRestart}
        className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm text-xs sm:text-sm cursor-pointer ${
          theme === 'dark'
            ? 'bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700/50'
            : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200/50'
        }`}
      >
        <RotateCcw size={14} strokeWidth={2} className="sm:w-4 sm:h-4" />
        Voltar para o Menu
      </button>
    </div>
  );
};

export default FlashCardGame;
