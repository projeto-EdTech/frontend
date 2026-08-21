import { NextResponse } from 'next/server';
import { allQuestions, Question } from '@/lib/data/universities';
import { saveSimulation } from '@/lib/store/simulationStore'; // <-- 1. Importar a função de salvar

/**
 * Função para embaralhar um array (continua a mesma)
 */
function shuffleArray(array: Question[]): Question[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { university, count } = body;

    // Validações (continuam as mesmas)
    if (!university || !count) {
      return NextResponse.json({ error: 'Universidade e número de questões são obrigatórios.' }, { status: 400 });
    }
    const questionCount = parseInt(count, 10);
    if (isNaN(questionCount) || questionCount <= 0) {
      return NextResponse.json({ error: 'O número de questões deve ser um valor válido.' }, { status: 400 });
    }

    // Lógica de filtrar e embaralhar (continua a mesma)
    const universityQuestions = allQuestions.filter(q => q.university === university);
    if (universityQuestions.length === 0) {
      return NextResponse.json({ error: 'Nenhuma questão encontrada para esta universidade.' }, { status: 404 });
    }
    const shuffledQuestions = shuffleArray(universityQuestions);
    const mixedQuestions = shuffledQuestions.slice(0, questionCount);

    // --- NOVA LÓGICA ---
    // 2. Salva a lista de questões geradas no nosso store em memória
    const simulationId = saveSimulation(mixedQuestions);

    // 3. Retorna um objeto contendo o ID e também as questões (para o fallback)
    return NextResponse.json({ id: simulationId, questions: mixedQuestions }, { status: 200 });

  } catch (error) {
    console.error('Erro ao criar Simulado Mix:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}