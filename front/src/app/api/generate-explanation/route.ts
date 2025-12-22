import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(request: Request) {
  // 1. Extrai os dados (enunciado e gabarito) do corpo da requisição.
  const { enunciado, gabarito } = await request.json();

  // Validação para garantir que os dados necessários foram recebidos.
  if (!enunciado || !gabarito) {
    return NextResponse.json({ error: 'Enunciado e gabarito são obrigatórios.' }, { status: 400 });
  }

  try {
    // 2. Inicializa o cliente da API do Gemini com a chave de API.
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

    // 3. Monta o prompt que será enviado para a IA.
    const prompt = `
      Você receberá uma questão de vestibular com o enunciado e a alternativa correta já conhecida.
      Sua tarefa é explicar, de forma **clara, objetiva e didática**, o raciocínio necessário para chegar até a alternativa correta. Não analise ou mencione as outras alternativas.
      Adapte o estilo da explicação conforme a natureza da questão:
      - Se for uma questão de **exatas** (Matemática, Física, Química), use fórmulas e mostre o passo a passo dos cálculos.
      - Se for uma questão de **biológicas ou humanas** (História, Biologia, Geografia, Filosofia), explique com base nos conceitos teóricos e contexto histórico ou científico.
      - Seja direto, mas sempre **ensine o raciocínio** como se estivesse explicando para um aluno que quer aprender o conteúdo, e não apenas a resposta final.
      - Use uma linguagem acessível, evitando jargões complexos, a menos que sejam necessários para a compreensão.
      - Se a questão envolver **interpretação de texto**, analise o contexto e explique como chegar à resposta correta com base no que foi lido.
      - Se a questão envolver **interpretação de gráficos ou tabelas**, descreva como analisar esses dados para chegar à resposta correta.
      - Se a questão envolver **lógica ou raciocínio lógico**, explique os passos lógicos necessários para chegar à conclusão correta.
      - Seja muito organizado e claro na hora de demonstrar a sua resposta, de modo no qual fique fácil de entender o raciocínio.
      Formato de entrada:
      - **Enunciado:** ${enunciado}
      - **Alternativa correta:** ${gabarito}

      Comece sua resposta com:
      **"Para chegar à alternativa correta, devemos..."**
    `;

    // 4. Obtém o modelo específico que você deseja usar.
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 5. NA INSTÂNCIA DO MODELO, chama a API para gerar o conteúdo em modo streaming.
    const result = await model.generateContentStream(prompt);

    // 6. Cria um ReadableStream para enviar a resposta em tempo real para o frontend.
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      }
    });

    // 7. Retorna a resposta em streaming.
    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Erro na API Route do Gemini:', error);
    return NextResponse.json(
      { error: 'Falha ao se comunicar com a API do Gemini.' },
      { status: 500 }
    );
  }
}