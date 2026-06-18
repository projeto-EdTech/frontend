import { universities as dataUniversity } from "@/lib/data/universities";
import { getSimulation, saveSimulation } from "@/lib/store/simulationStore";
import { type Question } from "@/types/university";

/**
 * CACHE STRATEGY: no-store
 * Motivo: Dados de simulados são dinâmicos e dependem da sessão/id do simulado.
 */

export async function getSimulationQuestions(simulationId: string): Promise<Question[] | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Primeiro tenta buscar no store temporário (memória)
  const questions = getSimulation(simulationId);
  if (questions) return questions;

  // Fallback: se não encontrar no store (ex: refresh de página), 
  // no futuro buscaria no BFF Java. Por enquanto retorna null ou mockup.
  return null;
}

/**
 * Gera um novo simulado baseado na universidade e filtros.
 * No futuro, isso será uma chamada POST para o BFF Java.
 */
export async function createSimulation(universityId: string, _filters: Record<string, unknown>): Promise<string> {
  // Stub: future implementation will call BFF Java POST /api/simulations
  const university = dataUniversity.find(u => u.slug === universityId);
  if (!university) throw new Error("Universidade não encontrada");

  const id = saveSimulation([]);
  return id;
}
