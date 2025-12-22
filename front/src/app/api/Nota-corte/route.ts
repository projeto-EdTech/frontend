import { NextResponse } from 'next/server';
import { processCutoffResults } from '@/lib/dataNotaCorte'; // Ajuste o caminho se necessário

/**
 * Simula um atraso de rede
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    // 1. Ler o corpo da requisição (que vem do frontend)
    const body = await request.json();
    const { userScore, targetCourse } = body;

    // 2. Validar os dados recebidos
    if (userScore === undefined || targetCourse === undefined) {
      return NextResponse.json(
        { error: 'Parâmetros "userScore" e "targetCourse" são obrigatórios.' },
        { status: 400 }
      );
    }

    // 3. Simular o atraso da rede (para testar o loading)
    await delay(1500); // 1.5 segundos

    // 4. Chamar a lógica de processamento
    const results = processCutoffResults(userScore, targetCourse);

    // 5. Retornar os resultados como JSON
    return NextResponse.json(results);

  } catch (error) {
    console.error('Erro na API check-approval:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno no servidor.' },
      { status: 500 }
    );
  }
}