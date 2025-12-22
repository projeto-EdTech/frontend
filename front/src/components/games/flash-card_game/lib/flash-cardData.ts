export interface FlashCard {
  id: number;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface FlashCardGameProps {
  onComplete?: (score: { correct: number; total: number }) => void;
}

export interface GameScore {
  correct: number;
  incorrect: number;
}

export interface GameState {
  cards: FlashCard[];
  availableSubjects: string[];
  error: string | null;
  gameStarted: boolean;
  selectedSubject: string;
  currentIndex: number;
  isFlipped: boolean;
  score: GameScore;
  reviewedCards: number[];
  correctIds: number[];
  gameCards: FlashCard[];
  isComplete: boolean;
  showingAnswer: boolean;
  points: number;
  comboCount: number;
  isComboActive: boolean;
  multiplier: number;
  isLoading: boolean;
}

// Constantes
export const SUBJECT_COLORS: Record<string, string> = {
  'Matemática': '#ef4444',
  'Física': '#3b82f6',
  'Química': '#10b981',
  'História': '#f59e0b',
  'Geografia': '#8b5cf6',
  'Português': '#f97316',
  'Literatura': '#06b6d4',
  'Biologia': '#84cc16',
  'Inglês': '#ec4899',
  'Filosofia': '#64748b',
};

export const DEFAULT_SUBJECT_COLOR = '#6366f1';

export const DIFFICULTY_POINTS = {
  easy: 5,
  medium: 10,
  hard: 20,
} as const;

export const COMBO_THRESHOLDS = {
  BASIC: 3,
  ADVANCED: 5,
} as const;

export const COMBO_MULTIPLIERS = {
  NONE: 1,
  BASIC: 1.5,
  ADVANCED: 2,
} as const;

export const COMBO_COLORS = {
  BASIC: ['#FFA500', '#FF4500', '#FFD700', '#FF6347'],
  ADVANCED: ['#FFD700', '#FFA500', '#FF4500', '#FF1493'],
} as const;

// Tipos de dados
// Dados dos flash cards
export const flashCardsData = [
  {
    id: 1,
    question: "Qual é a capital do Brasil?",
    answer: "Brasília",
    subject: "Geografia",
    difficulty: "easy",
  },
  {
    id: 2,
    question: "Quem escreveu 'Dom Casmurro'?",
    answer: "Machado de Assis",
    subject: "Literatura",
    difficulty: "medium",
  },
  {
    id: 3,
    question: "Qual é a fórmula da água?",
    answer: "H₂O (duas moléculas de hidrogênio e uma de oxigênio)",
    subject: "Química",
    difficulty: "easy",
  },
  {
    id: 4,
    question: "Em que ano ocorreu a Proclamação da República no Brasil?",
    answer: "1889",
    subject: "História",
    difficulty: "medium",
  },
  {
    id: 5,
    question: "Qual é o teorema que relaciona os lados de um triângulo retângulo?",
    answer: "Teorema de Pitágoras (a² + b² = c²)",
    subject: "Matemática",
    difficulty: "easy",
  },
  {
    id: 6,
    question: "Quem foi o primeiro presidente do Brasil?",
    answer: "Marechal Deodoro da Fonseca",
    subject: "História",
    difficulty: "medium",
  },
  {
    id: 7,
    question: "Qual é a velocidade da luz no vácuo?",
    answer: "Aproximadamente 300.000 km/s",
    subject: "Física",
    difficulty: "hard",
  },
  {
    id: 8,
    question: "Qual é o maior bioma brasileiro?",
    answer: "Amazônia",
    subject: "Geografia",
    difficulty: "easy",
  },
  {
    id: 9,
    question: "Qual é a função do mitocôndria na célula?",
    answer: "Produção de energia (ATP) através da respiração celular",
    subject: "Biologia",
    difficulty: "medium",
  },
  {
    id: 10,
    question: "Quem pintou 'A Última Ceia'?",
    answer: "Leonardo da Vinci",
    subject: "Artes",
    difficulty: "medium",
  },
  {
    id: 11,
    question: "Quem escreveu 'Vidas Secas'?",
    answer: "Graciliano Ramos",
    subject: "Literatura",
    difficulty: "medium",
  },
  {
    id: 12,
    question: "Qual é o elemento químico de símbolo 'Au'?",
    answer: "Ouro",
    subject: "Química",
    difficulty: "easy",
  },
  {
    id: 13,
    question: "Qual é a capital da França?",
    answer: "Paris",
    subject: "Geografia",
    difficulty: "easy",
  },
  {
    id: 14,
    question: "Em que ano o homem pisou na Lua pela primeira vez?",
    answer: "1969",
    subject: "História",
    difficulty: "medium",
  },
  {
    id: 15,
    question: "Qual é a fórmula da área de um círculo?",
    answer: "A = π . r²",
    subject: "Matemática",
    difficulty: "medium",
  },
  {
    id: 16,
    question: "O que estuda a Citologia?",
    answer: "As células",
    subject: "Biologia",
    difficulty: "easy",
  },
  {
    id: 17,
    question: "Qual é a primeira lei de Newton?",
    answer: "Lei da Inércia",
    subject: "Física",
    difficulty: "medium",
  },
  {
    id: 18,
    question: "Quem pintou 'Guernica'?",
    answer: "Pablo Picasso",
    subject: "Artes",
    difficulty: "hard",
  },
  {
    id: 19,
    question: "Qual é o plural de 'cidadão'?",
    answer: "Cidadãos",
    subject: "Português",
    difficulty: "easy",
  },
  {
    id: 20,
    question: "A quem é atribuída a frase 'Só sei que nada sei'?",
    answer: "Sócrates",
    subject: "Filosofia",
    difficulty: "easy",
  },
];