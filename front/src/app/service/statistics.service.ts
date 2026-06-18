import { dataStats, getStatsData, type Metrica } from "@/lib/data/stats";
import { mockApiData, processCutoffResults, type ApiResponse } from "@/lib/data/notaCorte";

/**
 * CACHE STRATEGY: ISR - revalidate 3600s
 * Motivo: Estatísticas de vestibulares mudam anualmente, não precisam de tempo real.
 */
export async function getGeneralStats(subject: string): Promise<Metrica[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return getStatsData(subject);
}

export async function getVestibularStats(subject: string, vestibular: string): Promise<Metrica[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return getStatsData(subject, vestibular);
}

/**
 * Simula a busca de notas de corte baseada na nota do usuário.
 * No futuro, isso chamará o BFF Java passando o token JWT do aluno.
 */
export async function getCutoffResults(userScore: number, targetCourse: string, targetInstitution?: string): Promise<ApiResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return processCutoffResults(userScore, targetCourse, targetInstitution);
}

export async function getAllAvailableCourses(): Promise<string[]> {
  const courses = Array.from(new Set(mockApiData.map(c => c.courseName)));
  return courses.sort();
}
