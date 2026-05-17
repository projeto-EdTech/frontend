import { NextResponse } from 'next/server';
import { mockApiData, processCutoffResults } from '@/lib/dataNotaCorte';

// STATIC DATA MODE — real backend calls are preserved as comments below.
// To restore live backend: uncomment the fetch blocks and remove the static returns above them.

export async function GET() {
  const availableAreas = ['todas', ...Array.from(new Set(mockApiData.map(c => c.area)))];
  return NextResponse.json({ allResults: mockApiData, availableAreas });

  /*
  REAL BACKEND (restore when Java BFF /nota-corte/cursos is available):

  const externalApiUrl = process.env.BACKEND_API_URL;
  if (!externalApiUrl) {
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }
  try {
    const authHeader = request.headers.get('Authorization');
    let userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!userToken) {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      userToken = cookieStore.get('user_data')?.value || null;
    }
    if (!userToken) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    const apiResponse = await fetch(`${externalApiUrl}/nota-corte/cursos`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` },
      cache: 'no-store',
    });
    if (!apiResponse.ok) return NextResponse.json({ allResults: [], availableAreas: [] });
    const data = await apiResponse.json();
    const formattedData = {
      allResults: Array.isArray(data) ? data.map((item: any) => ({
        id: item.id || Math.random().toString(),
        courseName: item.curso || item.nomeCurso || 'Curso Desconhecido',
        institution: item.sigla || item.instituicao || 'Instituição',
        cutoffScore: item.notaCorte || 0,
        area: item.area || 'Geral',
      })) : [],
      availableAreas: [],
    };
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('[API_NOTA_CORTE_GET_ERROR]', error);
    return NextResponse.json({ allResults: [], availableAreas: [] });
  }
  */
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userScore, targetCourse, targetInstitution } = body;

    if (userScore === undefined || !targetCourse) {
      return NextResponse.json(
        { error: 'Parâmetros "userScore" e "targetCourse" são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = processCutoffResults(userScore, targetCourse, targetInstitution);
    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('[API_NOTA_CORTE_POST_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao processar requisição.' }, { status: 500 });
  }

  /*
  REAL BACKEND (restore when Java BFF /nota-corte/media is available):

  const externalApiUrl = process.env.BACKEND_API_URL;
  if (!externalApiUrl) {
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }
  try {
    const authHeader = request.headers.get('Authorization');
    let userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!userToken) {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      userToken = cookieStore.get('user_data')?.value || null;
    }
    if (!userToken) return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
    const { userScore: s, targetCourse: c, targetInstitution: i } = await request.json();
    const url = new URL(`${externalApiUrl}/nota-corte/media`);
    url.searchParams.append('curso', c);
    if (i && i.trim() !== '') url.searchParams.append('sigla', i);
    const apiResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` },
      cache: 'no-store',
    });
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({ message: 'Erro no servidor de destino.' }));
      return NextResponse.json({ error: errorData.message }, { status: apiResponse.status });
    }
    const backendData = await apiResponse.json();
    const cutoffScore = backendData.medianNotaCorte || 0;
    const difference = s - cutoffScore;
    const BORDERLINE_MARGIN = 5;
    const calcStatus = difference >= 0 ? 'approved' : difference >= -BORDERLINE_MARGIN ? 'borderline' : 'reproved';
    return NextResponse.json({
      targetCourseResults: [{
        id: `api-result-${Date.now()}`,
        courseName: backendData.curso || c,
        institution: backendData.instituicao || i || 'Instituição não informada',
        cutoffScore,
        userScore: s,
        difference,
        status: calcStatus,
        area: 'Geral',
      }],
      allResults: [],
      availableAreas: ['Geral'],
    });
  } catch (error: unknown) {
    console.error('[API_NOTA_CORTE_ERROR]', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
  */
}
