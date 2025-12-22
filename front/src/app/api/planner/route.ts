import { NextResponse } from 'next/server'
import { mockEvents } from '@/lib/dataPlanner'

// Interface para definir a estrutura de um "material de estudo"
// que servirá de base para os cards no frontend.
interface SubjectMaterial {
  subject: string;
  priority: 'alta' | 'media' | 'baixa';
  color: string;
  title: string; // Ex: "Estudar Matemática"
}

/**
 * @api {get} /api/planner
 * @description Rota para buscar uma lista única de matérias de estudo.
 * * Esta API serve como um "fornecedor de matérias" para o modo de edição do planner.
 * Ela lê os eventos mockados, extrai as informações essenciais de cada matéria
 * (garantindo que não haja duplicatas) e as retorna.
 * * O frontend usará esses dados para gerar os "Cards de Estudos" arrastáveis.
 */
export async function GET() {
  try {
    // Usamos um Map para garantir que cada matéria seja processada apenas uma vez,
    // criando uma lista de matérias únicas.
    const subjectMap = new Map<string, SubjectMaterial>();

    mockEvents.forEach(event => {
      // Se a matéria ainda não foi adicionada ao mapa, adicione-a.
      // Isso evita duplicatas na resposta da API.
      if (!subjectMap.has(event.subject)) {
        subjectMap.set(event.subject, {
          subject: event.subject,
          priority: event.priority,
          color: event.color,
          title: event.title, 
        });
      }
    });

    // Converte os valores do mapa de volta para um array de objetos.
    const uniqueSubjects = Array.from(subjectMap.values());

    // Retorna a lista de matérias únicas como uma resposta JSON.
    return NextResponse.json(uniqueSubjects);

  } catch (error) {
    // Em caso de erro, loga no console do servidor e retorna uma
    // resposta de erro padronizada para o cliente.
    console.error('Erro ao buscar os materiais de estudo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar materiais de estudo' },
      { status: 500 }
    );
  }
}