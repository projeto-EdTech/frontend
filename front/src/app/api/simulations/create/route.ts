import { NextResponse } from 'next/server';
import { allQuestions } from '@/lib/data/universities';
import { saveSimulation } from '@/lib/store/simulationStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { university, questions: numQuestionsStr, subjects } = body;
    const numQuestions = parseInt(numQuestionsStr, 10);

    console.log(`/api/simulations/create called with university=${university} numQuestions=${numQuestions} subjectsCount=${Array.isArray(subjects) ? subjects.length : 0}`);

    if (!university || isNaN(numQuestions) || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ error: 'Dados insuficientes para criar o simulado.' }, { status: 400 });
    }

    const availableQuestions = allQuestions.filter(q => {
      const universityMatch = q.university === university;
      if (!universityMatch) return false;
      const subjectMatch = subjects.some((selectedSubject: string) => {
        const parts = selectedSubject.split('-');
        const materia = parts[0] ? parts[0].trim() : '';
        const conteudo = parts.slice(1).join('-').trim();
        const materiaField = (q.materia || '').toString();
        const conteudoField = (q.conteudo || '').toString();
        const materiaMatch = materia ? materiaField.includes(materia) : true;
        const conteudoMatch = conteudo ? conteudoField.includes(conteudo) : true;
        return materiaMatch && conteudoMatch;
      });
      
      return subjectMatch;
    });

    console.log('/api/simulations/create: availableQuestions count=', availableQuestions.length);

    const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
    const take = Math.min(shuffled.length, Math.max(0, numQuestions)); // Garante que não tentará pegar mais questões do que as disponíveis
    const selectedQuestions = shuffled.slice(0, take);

    console.log('/api/simulations/create: selectedQuestions count=', selectedQuestions.length);

    if (selectedQuestions.length === 0) {
      return NextResponse.json({ error: 'Nenhuma questão encontrada para os critérios selecionados.' }, { status: 404 });
    }

    // <-- 2. SALVE AS QUESTÕES E OBTENHA UM ID
    const simId = saveSimulation(selectedQuestions);

    // <-- 3. RETORNE O ID EM UM OBJETO JSON
    return NextResponse.json({ id: simId }, { status: 200 });

  } catch (error) {
    console.error('Erro na API /api/simulations/create:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a solicitação.' }, { status: 500 });
  }
}

/*
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  try {
    // 1. Receber e validar os dados do frontend
    const body = await request.json();
    const { university, questions: numQuestionsStr, subjects } = body;
    const numQuestions = parseInt(numQuestionsStr, 10);

    if (!university || isNaN(numQuestions) || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ error: 'Dados insuficientes para criar o simulado.' }, { status: 400 });
    }

    // Defina a URL do seu serviço de backend externo aqui
    const externalApiUrl = `${process.env.BACKEND_API_URL}/api/simulados/personalizados/iniciar-simulado`;
    console.log(`Repassando pedido para: ${externalApiUrl}`);
    const questions = numQuestions;
    const responseFromExternal = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instituicao_nome: university,
        quantidade_questoes: questions, // Envia o número já convertido
        conteudo: subjects
      })
    });

    // Se a resposta do backend externo não for bem-sucedida, repasse o erro
    if (!responseFromExternal.ok) {
      const errorBody = await responseFromExternal.text();
      console.error('Erro retornado pelo backend externo:', errorBody);
      return NextResponse.json(
        { error: 'O serviço de criação de provas falhou.', details: errorBody },
        { status: responseFromExternal.status }
      );
    }

    // O backend externo retorna o JSON completo da prova.
    const compiledQuestions = await responseFromExternal.json();

    // Repassamos a resposta do backend externo diretamente para o nosso frontend.
    return NextResponse.json(compiledQuestions, { status: 200 });

  } catch (error) {
    console.error('Erro na API /api/simulations/create:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a solicitação.' }, { status: 500 });
  }
}
*/