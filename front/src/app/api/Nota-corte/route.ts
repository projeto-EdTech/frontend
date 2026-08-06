import { NextResponse } from 'next/server';
import { ApiResponse, CourseResult } from '@/types/nota-corte';
import { readUserToken } from '@/app/service/sessionToken';

export async function GET(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  try {
    // Header ou cookie `user_data`, lidos do próprio `Request` — o parser à mão com
    // `next/headers` saiu daqui e virou `src/app/service/sessionToken.ts`, um lugar só.
    const userToken = readUserToken(request);

    if (!userToken) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // Endpoint fictício ou real para buscar todos os cursos cadastrados
    const backendUrl = `${externalApiUrl}/nota-corte/cursos`;

    const apiResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      cache: 'no-store',
    });

    if (!apiResponse.ok) {
       // Se o endpoint não existir ou falhar, retornamos uma lista vazia ou erro
       return NextResponse.json({ allResults: [], availableAreas: [] });
    }

    const data = await apiResponse.json();
    
    // Formata a resposta do backend para o que o frontend espera no UserConfig.tsx
    // Esperado: { allResults: [ { courseName, ... } ], availableAreas: [] }
    const formattedData = {
        allResults: Array.isArray(data) ? data.map((item: any) => ({
            id: item.id || Math.random().toString(),
            courseName: item.curso || item.nomeCurso || "Curso Desconhecido",
            institution: item.sigla || item.instituicao || "Instituição",
            cutoffScore: item.notaCorte || 0,
            area: item.area || "Geral"
        })) : [],
        availableAreas: [] 
    };

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('[API_NOTA_CORTE_GET_ERROR]', error);
    return NextResponse.json({ allResults: [], availableAreas: [] });
  }
}

export async function POST(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    console.error('[API_NOTA_CORTE_ERROR] BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  try {
    // 1. Lê o token JWT enviado pelo cliente no header Authorization ou via Cookies (para chamadas SWR Client-Side)
    // Header ou cookie `user_data`, lidos do próprio `Request` — o parser à mão com
    // `next/headers` saiu daqui e virou `src/app/service/sessionToken.ts`, um lugar só.
    const userToken = readUserToken(request);

    if (!userToken) {
      console.warn('[API_NOTA_CORTE] ❌ Requisição sem token JWT.');
      return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
    }

    // 2. Lê e valida o body enviado pelo frontend
    const body = await request.json();
    const { userScore, targetCourse, targetInstitution } = body;

    if (userScore === undefined || !targetCourse) {
      console.warn('[API_NOTA_CORTE] ⚠️ Parâmetros obrigatórios ausentes:', { userScore, targetCourse });
      return NextResponse.json(
        { error: 'Parâmetros "userScore" e "targetCourse" são obrigatórios.' },
        { status: 400 }
      );
    }

    // 3. Constrói a URL para o backend baseado na imagem (GET com query params no endpoint /media)
    const url = new URL(`${externalApiUrl}/nota-corte/media`);
    url.searchParams.append('curso', targetCourse);
    
    // Só adiciona 'sigla' se 'targetInstitution' estiver preenchido
    if (targetInstitution && targetInstitution.trim() !== '') {
      url.searchParams.append('sigla', targetInstitution);
    }

    const backendUrl = url.toString();

    console.log('[API_NOTA_CORTE] 📤 Enviando requisição GET ao backend:');
    console.log('[API_NOTA_CORTE]    URL:', backendUrl);

    // 4. Faz a requisição ao backend externo com GET
    const apiResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      cache: 'no-store',
    });

    console.log('[API_NOTA_CORTE] 📥 Resposta recebida do backend:');
    console.log('[API_NOTA_CORTE]    Status:', apiResponse.status, apiResponse.statusText);

    if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ message: 'Erro no servidor de destino.' }));
        return NextResponse.json(
            { error: errorData.message || 'Falha ao buscar dados no backend.' },
            { status: apiResponse.status }
        );
    }

    const backendData = await apiResponse.json();
    console.log('[API_NOTA_CORTE]    Dados brutos recebidos:', JSON.stringify(backendData));

    // 5. Mapeamento e Formatação para o contrato do frontend (ApiResponse)
    // Backend: curso, medianNotaCorte, instituicao
    // Frontend: courseName, cutoffScore, institution, userScore, difference, status
    const cutoffScore = backendData.medianNotaCorte || 0;
    const difference = userScore - cutoffScore;
    
    const BORDERLINE_MARGIN = 5;
    let status: 'approved' | 'borderline' | 'reproved';
    if (difference >= 0) status = 'approved';
    else if (difference >= -BORDERLINE_MARGIN) status = 'borderline';
    else status = 'reproved';

    const formattedResult = {
        id: `api-result-${Date.now()}`,
        courseName: backendData.curso || targetCourse,
        institution: backendData.instituicao || targetInstitution || "Instituição não informada",
        cutoffScore: cutoffScore,
        userScore: userScore,
        difference: difference,
        status: status,
        area: "Geral" // Backend /media não retorna área, usamos um padrão
    };

    // Estrutura ApiResponse esperada pelo frontend
    const finalResponse = {
        targetCourseResults: [formattedResult],
        allResults: [], // O endpoint /media retorna apenas o resultado específico
        availableAreas: ["Geral"]
    };

    console.log('[API_NOTA_CORTE] ✅ Sucesso! Retornando dados formatados ao frontend.');
    return NextResponse.json(finalResponse);

  } catch (error: unknown) {
    console.error('[API_NOTA_CORTE_ERROR] Erro na rota Nota-corte:', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}
