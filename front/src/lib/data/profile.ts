import type { ProfileStats } from "@/components/profile/GeneralStats";

interface RecentExam {
  name: string;
  date: string;
  score: number;
  logo?: string;
  totalQuestions?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  timeUsed?: number;
  accuracy?: number;
}

interface SubjectPerformance {
  subject: string;
  percentage: number;
  icon: string;
}

interface MonthlyProgressPoint {
  label: string;
  value: number;
}

interface ReviewableQuestion {
  id: string;
  enunciado: string;
  suaResposta: string;
  gabarito: string;
  displayLabel: string;
  displaySubject: string;
}

export interface MockProfileData {
  stats: ProfileStats;
  recentExams: RecentExam[];
  subjectPerformance: SubjectPerformance[];
  monthlyProgress: MonthlyProgressPoint[];
  reviewableQuestions: ReviewableQuestion[];
}

/**
 * DEV_CONFIG — Configurações estáticas para ambiente de desenvolvimento.
 * Altere `devScore` para simular diferentes faixas de elo sem precisar
 * modificar o localStorage ou o backend:
 *
 *   0  – 999   → Bronze
 *  1000 – 2499  → Prata
 *  2500 – 4999  → Ouro
 *  5000+        → Diamante
 *
 * Defina `enabled: false` para desativar o mock e usar o score real da API.
 */
export const DEV_CONFIG = {
  enabled: process.env.NODE_ENV === "development",
  /** Pontuação simulada do usuário (substitui o valor vindo da API). */
  devScore: 3500, // → Prata
} as const;

export const mockProfileData: MockProfileData = {
  stats: {
    simulados: 48,
    questoes: 2340,
    acertos: 1990,
    percentagem: 85,
    trend_simulados: { value: 20, type: "up" },
    trend_questoes: { value: 14, type: "up" },
    trend_acertos: { value: 18, type: "up" },
    trend_percentagem: { value: 7, type: "up" },
  },
  recentExams: [
    {
      name: "ENEM Simulado Completo",
      date: "12/05/2026",
      score: 91,
      logo: "enem.png",
      totalQuestions: 90,
      correctAnswers: 82,
      incorrectAnswers: 8,
      timeUsed: 8100,
      accuracy: 91,
    },
    {
      name: "FUVEST — Fase 1",
      date: "28/04/2026",
      score: 87,
      logo: "fuvest.jpg",
      totalQuestions: 90,
      correctAnswers: 78,
      incorrectAnswers: 12,
      timeUsed: 7560,
      accuracy: 87,
    },
    {
      name: "Simulado UNICAMP",
      date: "14/04/2026",
      score: 83,
      logo: "unicamp.png",
      totalQuestions: 72,
      correctAnswers: 60,
      incorrectAnswers: 12,
      timeUsed: 6480,
      accuracy: 83,
    },
    {
      name: "ENEM — Ciências da Natureza",
      date: "30/03/2026",
      score: 89,
      logo: "enem.png",
      totalQuestions: 45,
      correctAnswers: 40,
      incorrectAnswers: 5,
      timeUsed: 4050,
      accuracy: 89,
    },
    {
      name: "UNESP Simulado",
      date: "15/03/2026",
      score: 78,
      logo: "unesp.jpg",
      totalQuestions: 90,
      correctAnswers: 70,
      incorrectAnswers: 20,
      timeUsed: 9000,
      accuracy: 78,
    },
  ],
  subjectPerformance: [
    { subject: "Matemática", percentage: 88, icon: "" },
    { subject: "Física", percentage: 82, icon: "" },
    { subject: "Química", percentage: 79, icon: "" },
    { subject: "Biologia", percentage: 91, icon: "" },
    { subject: "Inglês", percentage: 95, icon: "" },
    { subject: "História", percentage: 80, icon: "" },
    { subject: "Geografia", percentage: 84, icon: "" },
    { subject: "Filosofia", percentage: 76, icon: "" },
    { subject: "Sociologia", percentage: 78, icon: "" },
    { subject: "Língua Portuguesa", percentage: 93, icon: "" },
    { subject: "Literatura", percentage: 90, icon: "" },
  ],
  monthlyProgress: [
    { label: "Jun/25", value: 720 },
    { label: "Jul/25", value: 810 },
    { label: "Ago/25", value: 870 },
    { label: "Set/25", value: 840 },
    { label: "Out/25", value: 920 },
    { label: "Nov/25", value: 880 },
    { label: "Dez/25", value: 750 },
    { label: "Jan/26", value: 960 },
    { label: "Fev/26", value: 990 },
    { label: "Mar/26", value: 1010 },
    { label: "Abr/26", value: 1050 },
    { label: "Mai/26", value: 1100 },
  ],
  reviewableQuestions: [
    {
      id: "q1",
      enunciado:
        "Um fio condutor é percorrido por cerca de 2×10⁻¹⁴ C a cada microssegundo (10⁻⁶ s). Determine a intensidade da corrente elétrica.",
      suaResposta: "1 A",
      gabarito: "2×10⁻⁸ A",
      displayLabel: "FUVEST 2025",
      displaySubject: "Física — Elétrica e Eletromagnetismo",
    },
    {
      id: "q2",
      enunciado: "Qual o conjunto solução da equação x² − 5x + 6 = 0?",
      suaResposta: "x=1 e x=5",
      gabarito: "x=2 e x=3",
      displayLabel: "ENEM 2024",
      displaySubject: "Matemática — Funções",
    },
    {
      id: "q3",
      enunciado: "Quem foi o primeiro presidente da República do Brasil?",
      suaResposta: "Dom Pedro I",
      gabarito: "Marechal Deodoro da Fonseca",
      displayLabel: "UNICAMP 2023",
      displaySubject: "História — República",
    },
  ],
};
