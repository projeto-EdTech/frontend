import { useState, useEffect, useCallback } from 'react';
import { 
  WORD_LENGTH, 
  MAX_GUESSES, 
  MAX_GUESSES_DUETO,
  getRandomWord,
  getDailyWord,
  isValidWord,
  type LetterStatus, 
  type FormattedLetter,
  type GameStats,
  type GameWord // Importamos a nova interface
} from '../lib/lexooData';

// Hook para Countdown até Meia-Noite
export const useCountdownToMidnight = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const difference = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
};

// Interface para o estado do jogo salvo
interface SavedGameState {
  mode: 'classic' | 'dulex';
  solution: string;
  solutionDefinition?: string; // NOVO: Salva a definição
  solutionB: string;
  solutionBDefinition?: string; // NOVO: Salva a definição B
  guesses: FormattedLetter[][];
  guessesB: FormattedLetter[][];
  currentGuess: string;
  isGameOver: boolean;
  turn: number;
  history: string[];
  isSolvedA: boolean;
  isSolvedB: boolean;
  keyboardStatus: Record<string, LetterStatus>;
  keyboardStatusA: Record<string, LetterStatus>; 
  keyboardStatusB: Record<string, LetterStatus>;
  savedAt: string;
}

// Chaves do localStorage
const getGameStateKey = (mode: 'classic' | 'dulex') => `lexoo_game_state_v2_${mode}`;
const GAME_STATS_KEY = 'lexoo_game_stats';

// Função para carregar estado salvo
const loadGameState = (currentMode: 'classic' | 'dulex'): SavedGameState | null => {
  try {
    const key = getGameStateKey(currentMode);
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    
    const state: SavedGameState = JSON.parse(saved);
    
    if (state.mode !== currentMode) {
      return null;
    }
    
    // Verifica validade do dia (para Daily Words)
    const savedDate = new Date(state.savedAt);
    const today = new Date();
    const isSameDay = savedDate.toDateString() === today.toDateString();
    
    if (!isSameDay) {
      console.log('📅 Jogo de outro dia detectado, iniciando novo jogo');
      localStorage.removeItem(key);
      return null;
    }
    
    console.log('✅ Estado do jogo carregado do localStorage');
    
    return {
      ...state,
      // Garante que campos opcionais existam (fallback)
      keyboardStatusA: state.keyboardStatusA || {},
      keyboardStatusB: state.keyboardStatusB || {},
      solutionDefinition: state.solutionDefinition || '',
      solutionBDefinition: state.solutionBDefinition || ''
    };

  } catch (error) {
    console.error('❌ Erro ao carregar estado do jogo:', error);
    try {
      const key = getGameStateKey(currentMode);
      localStorage.removeItem(key);
    } catch {}
    return null;
  }
};

// Função para salvar estado do jogo
const saveGameState = (state: SavedGameState) => {
  try {
    const key = getGameStateKey(state.mode);
    localStorage.setItem(key, JSON.stringify(state));
    // console.log('💾 Estado do jogo salvo'); // Comentado para reduzir logs
  } catch (error) {
    console.error('❌ Erro ao salvar estado do jogo:', error);
  }
};

const loadStats = (): GameStats => {
  try {
    const saved = localStorage.getItem(GAME_STATS_KEY);
    if (!saved) return { gamesPlayed: 0, winPercentage: 0, currentStreak: 0, maxStreak: 0, guessDistribution: [0, 0, 0, 0, 0, 0] };
    return JSON.parse(saved);
  } catch {
    return { gamesPlayed: 0, winPercentage: 0, currentStreak: 0, maxStreak: 0, guessDistribution: [0, 0, 0, 0, 0, 0] };
  }
};

const saveStats = (stats: GameStats) => {
  try {
    localStorage.setItem(GAME_STATS_KEY, JSON.stringify(stats));
  } catch {}
};

// ==========================================
// LÓGICA PRINCIPAL (HOOK)
// ==========================================
export const useLexooGame = (mode: 'classic' | 'dulex') => {
  const maxGuesses = mode === 'dulex' ? MAX_GUESSES_DUETO : MAX_GUESSES;

  const [solution, setSolution] = useState<string>('');
  const [solutionDefinition, setSolutionDefinition] = useState<string>(''); // NOVO
  
  const [solutionB, setSolutionB] = useState<string>('');
  const [solutionBDefinition, setSolutionBDefinition] = useState<string>(''); // NOVO

  const [guesses, setGuesses] = useState<FormattedLetter[][]>([]);
  const [guessesB, setGuessesB] = useState<FormattedLetter[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [turn, setTurn] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [isSolvedA, setIsSolvedA] = useState(false);
  const [isSolvedB, setIsSolvedB] = useState(false);
  const [keyboardStatus, setKeyboardStatus] = useState<Record<string, LetterStatus>>({});
  const [keyboardStatusA, setKeyboardStatusA] = useState<Record<string, LetterStatus>>({});
  const [keyboardStatusB, setKeyboardStatusB] = useState<Record<string, LetterStatus>>({});
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [revealingRowB, setRevealingRowB] = useState<number | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gameRestored, setGameRestored] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  
  const [stats, setStats] = useState<GameStats>(() => loadStats());

  // Inicializar jogo
  useEffect(() => {
    const savedState = loadGameState(mode);
    
    if (savedState) {
      setSolution(savedState.solution);
      setSolutionDefinition(savedState.solutionDefinition || ''); // Carrega definição
      
      setSolutionB(savedState.solutionB);
      setSolutionBDefinition(savedState.solutionBDefinition || ''); // Carrega definição B
      
      setGuesses(savedState.guesses);
      setGuessesB(savedState.guessesB);
      setCurrentGuess(savedState.currentGuess);
      setIsGameOver(savedState.isGameOver);
      setTurn(savedState.turn);
      setHistory(savedState.history);
      setIsSolvedA(savedState.isSolvedA);
      setIsSolvedB(savedState.isSolvedB);
      setKeyboardStatus(savedState.keyboardStatus);
      setKeyboardStatusA(savedState.keyboardStatusA || {}); 
      setKeyboardStatusB(savedState.keyboardStatusB || {});
      setGameRestored(true);
      
      setTimeout(() => setGameRestored(false), 3000);
    } else {
      // --- NOVO JOGO: ADAPTAÇÃO PARA OBJETOS ---
      // getDailyWord agora retorna { word, definition }
      const wordObjA: GameWord = mode === 'classic' ? getDailyWord() : getRandomWord();
      
      setSolution(wordObjA.word); // Pega só a string para a lógica
      setSolutionDefinition(wordObjA.definition); // Guarda a definição
      
      if (mode === 'dulex') {
        let wordObjB: GameWord = getRandomWord();
        // Garante que B seja diferente de A (comparando as strings)
        while (wordObjB.word === wordObjA.word) {
          wordObjB = getRandomWord();
        }
        setSolutionB(wordObjB.word);
        setSolutionBDefinition(wordObjB.definition);
      } else {
        setSolutionB('');
        setSolutionBDefinition('');
      }
      
      // Reset de estados
      setGuesses([]);
      setGuessesB([]);
      setHistory([]);
      setIsSolvedA(false);
      setIsSolvedB(false);
      setIsGameOver(false);
      setTurn(0);
      setCurrentGuess('');
      setKeyboardStatus({});
      console.log('🎮 Novo jogo iniciado com definições carregadas');
    }
    
    setRevealingRow(null);
    setRevealingRowB(null);
    setPressedKey(null);
    setTimeout(() => setKeyboardVisible(true), 300);
    setIsInitialized(true);
  }, [mode]);

  // Salvar estado
  useEffect(() => {
    if (!isInitialized || !solution) return;
    
    const stateToSave: SavedGameState = {
      mode,
      solution,
      solutionDefinition, // Salva definição
      solutionB,
      solutionBDefinition, // Salva definição B
      guesses,
      guessesB,
      currentGuess,
      isGameOver,
      turn,
      history,
      isSolvedA,
      isSolvedB,
      keyboardStatus,
      keyboardStatusA, 
      keyboardStatusB,
      savedAt: new Date().toISOString()
    };
    
    saveGameState(stateToSave);
  }, [
    mode, solution, solutionDefinition, solutionB, solutionBDefinition, 
    guesses, guessesB, currentGuess, isGameOver, turn, history, 
    isSolvedA, isSolvedB, keyboardStatus, keyboardStatusA, 
    keyboardStatusB, isInitialized
  ]);

  // Salvar Stats
  useEffect(() => {
    if (isInitialized) saveStats(stats);
  }, [stats, isInitialized]);

  // Lógica de cores (mantida igual, pois solution é string)
  const formatGuessFor = useCallback((sol: string, guess: string): FormattedLetter[] => {
    const solutionChars: (string | null)[] = [...sol];
    const formattedGuess: FormattedLetter[] = [...guess].map((l) => ({ 
      key: l, 
      status: 'absent' as LetterStatus 
    }));

    // Verde
    formattedGuess.forEach((l, i) => {
      if (solutionChars[i] === l.key) {
        formattedGuess[i].status = 'correct';
        solutionChars[i] = null;
      }
    });

    // Amarelo
    formattedGuess.forEach((l, i) => {
      if (l.status !== 'correct' && solutionChars.includes(l.key)) {
        formattedGuess[i].status = 'present';
        solutionChars[solutionChars.indexOf(l.key)] = null;
      }
    });

    return formattedGuess;
  }, []);

  // Atualizar Teclado
  const updateKeyboardStatus = useCallback((letters: FormattedLetter[], gameType?: 'A' | 'B') => {
    letters.forEach((letter) => {
      setKeyboardStatus(prev => {
        const currentStatus = prev[letter.key];
        if (!currentStatus || (letter.status === 'correct') || (letter.status === 'present' && currentStatus !== 'correct')) {
          return { ...prev, [letter.key]: letter.status };
        }
        return prev;
      });
      
      if (gameType === 'A') {
        setKeyboardStatusA(prev => {
          const currentStatus = prev[letter.key];
          if (!currentStatus || (letter.status === 'correct') || (letter.status === 'present' && currentStatus !== 'correct')) {
            return { ...prev, [letter.key]: letter.status };
          }
          return prev;
        });
      } else if (gameType === 'B') {
        setKeyboardStatusB(prev => {
          const currentStatus = prev[letter.key];
          if (!currentStatus || (letter.status === 'correct') || (letter.status === 'present' && currentStatus !== 'correct')) {
            return { ...prev, [letter.key]: letter.status };
          }
          return prev;
        });
      }
    });
  }, []);

  const showErrorMessage = useCallback((message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  }, []);

  // Adicionar Tentativa
  const addNewGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH || isGameOver) return;
    if (history.includes(currentGuess)) {
      showErrorMessage('Palavra já foi tentada!');
      return;
    }
    if (!isValidWord(currentGuess)) {
      showErrorMessage('Palavra inexistente!');
      return;
    }

    // --- CLASSIC ---
    if (mode === 'classic') {
      const formattedA = formatGuessFor(solution, currentGuess);
      setRevealingRow(turn);
      setGuesses((prev) => [...prev, formattedA]);
      
      setTimeout(() => {
        updateKeyboardStatus(formattedA); // Sem parâmetro 'A'
        setHistory((prev) => [...prev, currentGuess]);
        setTurn((prev) => prev + 1);
        
        if (currentGuess === solution) {
          setIsGameOver(true);
          setStats(prev => {
            const newStats = {
              ...prev,
              gamesPlayed: prev.gamesPlayed + 1,
              currentStreak: prev.currentStreak + 1,
              maxStreak: Math.max(prev.maxStreak, prev.currentStreak + 1),
            };
            newStats.guessDistribution[turn] = (newStats.guessDistribution[turn] || 0) + 1;
            const wins = newStats.guessDistribution.reduce((a, b) => a + b, 0);
            newStats.winPercentage = Math.round((wins / newStats.gamesPlayed) * 100);
            return newStats;
          });
          setTimeout(() => setShowStatsModal(true), 1500);
        } else if (turn >= maxGuesses - 1) {
          setIsGameOver(true);
          setStats(prev => {
            const newStats = { ...prev, gamesPlayed: prev.gamesPlayed + 1, currentStreak: 0 };
            const wins = newStats.guessDistribution.reduce((a, b) => a + b, 0);
            newStats.winPercentage = Math.round((wins / newStats.gamesPlayed) * 100);
            return newStats;
          });
          setTimeout(() => setShowStatsModal(true), 1500);
        }
        setCurrentGuess('');
        setRevealingRow(null);
      }, WORD_LENGTH * 150 + 500);
      return;
    }

    // --- DULEX ---
    const formattedA = !isSolvedA ? formatGuessFor(solution, currentGuess) : null;
    const formattedB = !isSolvedB ? formatGuessFor(solutionB, currentGuess) : null;
    
    if (!isSolvedA) setRevealingRow(guesses.length);
    if (!isSolvedB) setRevealingRowB(guessesB.length);

    if (formattedA) setGuesses((prev) => [...prev, formattedA]);
    if (formattedB) setGuessesB((prev) => [...prev, formattedB]);
    
    setTimeout(() => {
      if (formattedA) updateKeyboardStatus(formattedA, 'A');
      if (formattedB) updateKeyboardStatus(formattedB, 'B');

      setHistory((prev) => [...prev, currentGuess]);
      setTurn((prev) => prev + 1);

      const justSolvedA = !isSolvedA && currentGuess === solution;
      const justSolvedB = !isSolvedB && currentGuess === solutionB;
      const newSolvedA = isSolvedA || justSolvedA;
      const newSolvedB = isSolvedB || justSolvedB;

      setIsSolvedA(newSolvedA);
      setIsSolvedB(newSolvedB);
      
      if (newSolvedA && newSolvedB) {
        setIsGameOver(true);
        setTimeout(() => setShowStatsModal(true), 1500);
      } else if (turn >= maxGuesses - 1) {
        setIsGameOver(true);
        setTimeout(() => setShowStatsModal(true), 1500);
      }
      
      setCurrentGuess('');
      setRevealingRow(null);
      setRevealingRowB(null);
    }, WORD_LENGTH * 150 + 500);

  }, [currentGuess, isGameOver, mode, solution, solutionB, turn, formatGuessFor, isSolvedA, isSolvedB, updateKeyboardStatus, history, showErrorMessage, maxGuesses, guesses.length, guessesB.length]);

  // Handler Teclado
  const handleKeyup = useCallback(({ key }: { key: string }) => {
    if (isGameOver) return;
    setPressedKey(key.toUpperCase());
    setTimeout(() => setPressedKey(null), 150);

    if (key === 'Enter') {
      if (currentGuess.length < WORD_LENGTH) {
        showErrorMessage('Palavra incompleta!');
        return;
      }
      addNewGuess();
      return;
    }
    if (key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }
    if (/^[A-Za-z]$/.test(key)) {
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => (prev + key).toUpperCase());
      }
    }
  }, [isGameOver, currentGuess, addNewGuess, showErrorMessage]);

  // Reset Game
  const resetGame = useCallback(() => {
    const key = getGameStateKey(mode);
    localStorage.removeItem(key);
    
    // --- LÓGICA DE RESET ADAPTADA ---
    const wordObjA = mode === 'classic' ? getDailyWord() : getRandomWord();
    setSolution(wordObjA.word);
    setSolutionDefinition(wordObjA.definition);
    
    if (mode === 'dulex') {
      let wordObjB = getRandomWord();
      while (wordObjB.word === wordObjA.word) {
        wordObjB = getRandomWord();
      }
      setSolutionB(wordObjB.word);
      setSolutionBDefinition(wordObjB.definition);
    } else {
      setSolutionB('');
      setSolutionBDefinition('');
    }

    setGuesses([]);
    setGuessesB([]);
    setHistory([]);
    setIsSolvedA(false);
    setIsSolvedB(false);
    setIsGameOver(false);
    setTurn(0);
    setCurrentGuess('');
    setKeyboardStatus({});
    setKeyboardStatusA({});
    setKeyboardStatusB({});
    setRevealingRow(null);
    setRevealingRowB(null);
  }, [mode]);

  // Monitorar Meia-Noite
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date().toDateString();
      if (now !== currentDate) {
        setCurrentDate(now);
        resetGame();
      }
    };
    const interval = setInterval(checkMidnight, 1000);
    return () => clearInterval(interval);
  }, [currentDate, resetGame]);

  // Retorno do Hook
  return {
    solution,
    solutionDefinition, // Exportando para usar no Front
    solutionB,
    solutionBDefinition, // Exportando para usar no Front
    guesses,
    guessesB,
    currentGuess,
    isGameOver,
    turn,
    history,
    isSolvedA,
    isSolvedB,
    keyboardStatus,
    keyboardStatusA,
    keyboardStatusB,
    revealingRow,
    revealingRowB,
    showStatsModal,
    setShowStatsModal,
    stats,
    setStats,
    pressedKey,
    keyboardVisible,
    errorMessage,
    showError,
    gameRestored,
    handleKeyup,
    resetGame,
    maxGuesses
  };
};