type CachedEntry = {
  data: TransformedStats;
  expiresAt: number;
};

export type TransformedStats = {
  stats: {
    simulados: number;
    questoes: number;
    acertos: number;
    percentagem: number;
    trend_simulados: { value: number; type: 'up' | 'down' };
    trend_questoes: { value: number; type: 'up' | 'down' };
    trend_acertos: { value: number; type: 'up' | 'down' };
    trend_percentagem: { value: number; type: 'up' | 'down' };
  };
  recentExams: {
    name: string;
    date: string;
    score: number;
    totalQuestions?: number;
    correctAnswers?: number;
    incorrectAnswers?: number;
    timeUsed?: number;
    accuracy?: number;
  }[];
  subjectPerformance: { subject: string; percentage: number; icon: string }[];
  monthlyProgress: { label: string; value: number }[];
  reviewableQuestions: {
    id: string;
    enunciado: string;
    suaResposta: string;
    gabarito: string;
    displayLabel: string;
    displaySubject: string;
  }[];
};

const CACHE = new Map<string, CachedEntry>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedStats(userId: string): TransformedStats | null {
  const entry = CACHE.get(userId);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    CACHE.delete(userId);
    return null;
  }
  return entry.data;
}

export function setCachedStats(userId: string, data: TransformedStats, ttlMs = DEFAULT_TTL): void {
  const expiresAt = Date.now() + ttlMs;
  CACHE.set(userId, { data, expiresAt });
  setTimeout(() => CACHE.delete(userId), ttlMs + 1000);
}

export function deleteCachedStats(userId: string): void {
  CACHE.delete(userId);
}
