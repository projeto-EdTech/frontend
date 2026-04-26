import { universities } from "@/lib/dataUniversity";
import { mockRankingsByUniversity, type RawUserData } from "@/lib/DataRanking";

export interface FilterOption {
  id: string;
  name: string;
}

export interface UserRanking {
  position: number;
  name: string;
  score: number;
  rank: 'Ouro' | 'Prata' | 'Bronze' | 'Diamante';
  isCurrentUser?: boolean;
}

/**
 * Helper to assign ranks based on position.
 */
const getRankFromPosition = (position: number): 'Ouro' | 'Prata' | 'Bronze' | 'Diamante' => {
  if (position <= 10) return 'Diamante';
  if (position <= 30) return 'Ouro';
  if (position <= 60) return 'Prata';
  return 'Bronze';
};

/**
 * Fetches the list of universities for filtering from local mock data.
 */
export async function getUniversities(): Promise<FilterOption[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return universities.map(university => ({
    id: university.slug,
    name: university.name,
  }));
}

/**
 * Fetches ranking data based on university and period from local mock data.
 */
export async function getRankingData(university: string = 'geral', period: string = 'mensal'): Promise<UserRanking[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const universityRankings = mockRankingsByUniversity[university];
  if (!universityRankings) return [];

  const rawData = universityRankings[period as 'semanal' | 'mensal' | 'anual'] || [];

  return rawData.map((user, index) => ({
    position: index + 1,
    name: user.usuario,
    score: user.pontos,
    rank: getRankFromPosition(index + 1),
    isCurrentUser: user.usuario === "Felipe Grolla Freitas" // Based on DataRanking.ts mock
  }));
}
