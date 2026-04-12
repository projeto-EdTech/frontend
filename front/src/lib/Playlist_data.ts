import { Calculator, BookOpen, Beaker, Globe, Languages, GraduationCap } from "lucide-react";

export interface Question {
  id: number;
  title: string;
  subject: string;
  topic: string;
  difficulty: "Fácil" | "Médio" | "Difícil";
  dateAdded: string;
  duration: string;
  completed: boolean;
  institution: string;
  year: number;
}

export interface Playlist {
  id: string;
  title: string;
  creatorName: string;
  questionCount: number;
  likesCount: number;
  gradient: string;
  category: string;
  tags: string[];
  icon?: any; // Será preenchido no front-end
  description?: string;
  coverGradient?: string;
  mainColor?: string;
  creatorAvatar?: string;
  duration?: string;
  isPublic?: boolean;
  questions?: Question[];
}

export const PLAYLISTS_MOCK: Playlist[] = [
  {
    id: "1",
    title: "Matemática Básica para o ENEM",
    creatorName: "Prof. Gustavo",
    questionCount: 45,
    likesCount: 120,
    gradient: "from-blue-500 to-cyan-500",
    category: "Matemática",
    tags: ["matemática", "enem", "básica"],
    description: "Domine os fundamentos essenciais para garantir 800+ em matemática.",
    coverGradient: "from-blue-700 to-slate-900",
    mainColor: "bg-blue-600",
    creatorAvatar: "/avatars/teacher-1.png",
    duration: "2h 15min",
    questions: [
      { id: 1, title: "Questão 1: Logaritmos e suas Propriedades", subject: "Matemática", topic: "Logaritmos", difficulty: "Fácil", dateAdded: "2 dias atrás", duration: "3 min", completed: true, institution: "FUVEST", year: 2025 },
      { id: 2, title: "Questão 2: Geometria Analítica: Ponto e Reta", subject: "Matemática", topic: "Geometria Analítica", difficulty: "Médio", dateAdded: "2 dias atrás", duration: "4 min", completed: true, institution: "UNICAMP", year: 2024 },
      { id: 3, title: "Questão 3: Análise Combinatória: Princípio Fundamental", subject: "Matemática", topic: "Análise Combinatória", difficulty: "Difícil", dateAdded: "2 dias atrás", duration: "5 min", completed: true, institution: "ITA", year: 2024 },
      { id: 4, title: "Questão 4: Probabilidade Condicional", subject: "Matemática", topic: "Probabilidade", difficulty: "Fácil", dateAdded: "3 dias atrás", duration: "3 min", completed: false, institution: "ENEM", year: 2023 },
      { id: 5, title: "Questão 5: Funções de Segundo Grau", subject: "Matemática", topic: "Funções", difficulty: "Médio", dateAdded: "3 dias atrás", duration: "4 min", completed: false, institution: "FUVEST", year: 2024 },
      { id: 6, title: "Questão 6: Trigonometria no Triângulo Retângulo", subject: "Matemática", topic: "Trigonometria", difficulty: "Difícil", dateAdded: "4 dias atrás", duration: "5 min", completed: false, institution: "IME", year: 2025 },
      { id: 7, title: "Questão 7: Estatística: Média, Moda e Mediana", subject: "Matemática", topic: "Estatística", difficulty: "Fácil", dateAdded: "4 dias atrás", duration: "3 min", completed: false, institution: "ENEM", year: 2024 },
      { id: 8, title: "Questão 8: Matrizes e Determinantes", subject: "Matemática", topic: "Álgebra Linear", difficulty: "Médio", dateAdded: "5 dias atrás", duration: "4 min", completed: false, institution: "UNICAMP", year: 2025 },
      { id: 9, title: "Questão 9: Sistemas Lineares", subject: "Matemática", topic: "Álgebra Linear", difficulty: "Difícil", dateAdded: "5 dias atrás", duration: "5 min", completed: false, institution: "ITA", year: 2025 },
      { id: 10, title: "Questão 10: Geometria Espacial: Prismas", subject: "Matemática", topic: "Geometria Espacial", difficulty: "Fácil", dateAdded: "1 semana atrás", duration: "3 min", completed: false, institution: "FUVEST", year: 2023 },
      { id: 11, title: "Questão 11: Geometria Plana: Áreas", subject: "Matemática", topic: "Geometria Plana", difficulty: "Médio", dateAdded: "1 semana atrás", duration: "4 min", completed: false, institution: "UNESP", year: 2024 },
      { id: 12, title: "Questão 12: Porcentagem e Juros Simples", subject: "Matemática", topic: "Matemática Financeira", difficulty: "Difícil", dateAdded: "1 semana atrás", duration: "5 min", completed: false, institution: "ENEM", year: 2025 },
      { id: 13, title: "Questão 13: Razão e Proporção", subject: "Matemática", topic: "Razões e Proporções", difficulty: "Fácil", dateAdded: "2 semanas atrás", duration: "3 min", completed: false, institution: "FUVEST", year: 2022 },
      { id: 14, title: "Questão 14: Progressão Aritmética", subject: "Matemática", topic: "Progressões", difficulty: "Médio", dateAdded: "2 semanas atrás", duration: "4 min", completed: false, institution: "UNICAMP", year: 2023 },
      { id: 15, title: "Questão 15: Progressão Geométrica", subject: "Matemática", topic: "Progressões", difficulty: "Difícil", dateAdded: "2 semanas atrás", duration: "5 min", completed: false, institution: "ITA", year: 2023 }
    ]
  },
  {
    id: "2",
    title: "Redação Nota 1000",
    creatorName: "Ana Clara",
    questionCount: 12,
    likesCount: 340,
    gradient: "from-purple-500 to-pink-500",
    category: "Redação",
    tags: ["redação", "enem", "escrita"],
    description: "Aprenda as técnicas essenciais para conquistar a nota máxima na redação do ENEM.",
    coverGradient: "from-purple-700 to-pink-900",
    mainColor: "bg-purple-600",
    creatorAvatar: "/avatars/teacher-2.png",
    duration: "1h 30min",
    questions: [
      { id: 1, title: "Questão 1: Estrutura do Texto Dissertativo", subject: "Redação", topic: "Estrutura Textual", difficulty: "Fácil", dateAdded: "1 dia atrás", duration: "5 min", completed: true, institution: "ENEM", year: 2024 },
      { id: 2, title: "Questão 2: Coesão e Coerência Textual", subject: "Redação", topic: "Coesão e Coerência", difficulty: "Médio", dateAdded: "2 dias atrás", duration: "6 min", completed: true, institution: "FUVEST", year: 2025 },
      { id: 3, title: "Questão 3: Argumentação Persuasiva", subject: "Redação", topic: "Argumentação", difficulty: "Difícil", dateAdded: "3 dias atrás", duration: "7 min", completed: false, institution: "UNICAMP", year: 2024 },
      { id: 4, title: "Questão 4: Tese e Desenvolvimento", subject: "Redação", topic: "Tese", difficulty: "Fácil", dateAdded: "4 dias atrás", duration: "5 min", completed: false, institution: "ENEM", year: 2025 },
      { id: 5, title: "Questão 5: Uso de Conectivos", subject: "Redação", topic: "Conectivos", difficulty: "Médio", dateAdded: "5 dias atrás", duration: "5 min", completed: false, institution: "FUVEST", year: 2024 },
      { id: 6, title: "Questão 6: Proposta de Intervenção", subject: "Redação", topic: "Proposta", difficulty: "Difícil", dateAdded: "6 dias atrás", duration: "8 min", completed: false, institution: "UNESP", year: 2024 },
      { id: 7, title: "Questão 7: Competências da Redação ENEM", subject: "Redação", topic: "Competências ENEM", difficulty: "Fácil", dateAdded: "1 semana atrás", duration: "5 min", completed: false, institution: "ENEM", year: 2023 },
      { id: 8, title: "Questão 8: Análise de Tema", subject: "Redação", topic: "Análise Temática", difficulty: "Médio", dateAdded: "1 semana atrás", duration: "6 min", completed: false, institution: "UNICAMP", year: 2025 },
      { id: 9, title: "Questão 9: Repertório Sociocultural", subject: "Redação", topic: "Repertório", difficulty: "Difícil", dateAdded: "1 semana atrás", duration: "7 min", completed: false, institution: "FUVEST", year: 2023 },
      { id: 10, title: "Questão 10: Linguagem Formal", subject: "Redação", topic: "Linguagem", difficulty: "Fácil", dateAdded: "2 semanas atrás", duration: "5 min", completed: false, institution: "ENEM", year: 2022 },
      { id: 11, title: "Questão 11: Conclusão Impactante", subject: "Redação", topic: "Conclusão", difficulty: "Médio", dateAdded: "2 semanas atrás", duration: "6 min", completed: false, institution: "UNESP", year: 2025 },
      { id: 12, title: "Questão 12: Correção Gramatical", subject: "Redação", topic: "Gramática", difficulty: "Difícil", dateAdded: "2 semanas atrás", duration: "5 min", completed: false, institution: "ENEM", year: 2024 }
    ]
  },
  {
    id: "dxtsn9kms",
    title: "matematica 3",
    creatorName: "Felipe Grolla Freitas",
    questionCount: 0,
    likesCount: 0,
    gradient: "from-indigo-500 to-purple-600",
    category: "Geral",
    tags: [
        "matematica"
    ],
    description: "sxfggsd",
    coverGradient: "from-indigo-700 to-purple-900",
    mainColor: "bg-indigo-600",
    creatorAvatar: "",
    duration: "0 min",
    isPublic: true,
    questions: []
  },
  {
    id: "eufb3r8ru",
    title: "Matematica 2",
    creatorName: "Felipe Grolla Freitas",
    questionCount: 0,
    likesCount: 0,
    gradient: "from-indigo-500 to-purple-600",
    category: "Matemática",
    tags: [
        "matemática"
    ],
    description: "sdfgsdf",
    coverGradient: "from-indigo-700 to-purple-900",
    mainColor: "bg-indigo-600",
    creatorAvatar: "",
    duration: "0 min",
    isPublic: true,
    questions: []
  }
];