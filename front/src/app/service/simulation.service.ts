import { dataUniversity } from "@/lib/dataUniversity";
import { getSimulation, saveSimulation } from "@/lib/simulationStore";
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
export async function createSimulation(universityId: string, filters: any): Promise<string> {
  // Busca a universidade no mockup
  const university = dataUniversity.find(u => u.id === universityId);
  if (!university) throw new Error("Universidade não encontrada");

  // Filtra questões (lógica simplificada para o mockup)
  let questions = university.questions;
  if (filters.subject) {
    questions = questions.filter(q => q.subject === filters.subject);
  }

  // Limita a quantidade se especificado
  if (filters.limit) {
    questions = questions.slice(0, filters.limit);
  }

  // Salva no store temporário e retorna o ID
  const id = saveSimulation(questions);
  return id;
}
