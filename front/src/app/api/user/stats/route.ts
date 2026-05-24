import { NextResponse } from 'next/server';
import { decodeJWT } from '@/app/service/jwtDecoder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformExternalData = (geralData: any, performanceData: any[]) => {
  return {
    stats: {
      simulados: geralData.totalSimulados || 0,
      questoes: geralData.totalQuestoes || 0,
      acertos: geralData.totalAcertos || 0,
      percentagem: geralData.percentualAcertos || 0,
      trend_simulados: { value: 0, type: 'up' as const },
      trend_questoes: { value: 0, type: 'up' as const },
      trend_acertos: { value: 0, type: 'up' as const },
      trend_percentagem: { value: 0, type: 'up' as const },
    },
    recentExams: [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subjectPerformance: performanceData.map((item: any) => ({
      subject: item.nomeMateria || 'Matéria',
      percentage: item.percentualAcertos || 0,
    })),
    monthlyProgress: [],
    reviewableQuestions: [],
  };
};

export async function GET(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    console.error('[API_USER_STATS_ERROR] BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!userToken) {
      console.warn('[API_USER_STATS] ❌ Requisição sem token JWT.');
      return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
    }

    const decodedToken = decodeJWT(userToken);
    const userId = decodedToken?.id;

    if (!userId) {
      console.error('[API_USER_STATS] ❌ Não foi possível extrair o UserID do token.');
      return NextResponse.json({ error: 'Erro ao processar identificação do usuário.' }, { status: 400 });
    }

    const authHeaders = { 'Authorization': `Bearer ${userToken}` };

    const urlGeral = `${externalApiUrl}/usuarios/${userId}/estatisticas/geral`;
    const urlPerformance = `${externalApiUrl}/usuarios/${userId}/estatisticas/performance-materia`;

    console.log('[API_USER_STATS] 📤 Requisição ao backend:');
    console.log('[API_USER_STATS]    Backend URL (base):', externalApiUrl);
    console.log('[API_USER_STATS]    UserID:', userId);
    console.log('[API_USER_STATS]    Endpoint 1:', urlGeral);
    console.log('[API_USER_STATS]    Endpoint 2:', urlPerformance);

    const [geralResponse, performanceResponse] = await Promise.all([
      fetch(urlGeral, { headers: authHeaders, cache: 'no-store' }),
      fetch(urlPerformance, { headers: authHeaders, cache: 'no-store' }),
    ]);

    console.log('[API_USER_STATS] 📥 Respostas recebidas:');
    console.log('[API_USER_STATS]    /estatisticas/geral →', geralResponse.status, geralResponse.statusText);
    console.log('[API_USER_STATS]    /estatisticas/performance-materia →', performanceResponse.status, performanceResponse.statusText);

    if (!geralResponse.ok) {
      const errorData = await geralResponse.json().catch(() => ({}));
      console.error('[API_USER_STATS] ❌ Erro em /estatisticas/geral. Status:', geralResponse.status, '| Body:', JSON.stringify(errorData));
      return NextResponse.json({ error: errorData?.message || 'Erro ao buscar estatísticas gerais.' }, { status: geralResponse.status });
    }

    if (!performanceResponse.ok) {
      const errorData = await performanceResponse.json().catch(() => ({}));
      console.error('[API_USER_STATS] ❌ Erro em /estatisticas/performance-materia. Status:', performanceResponse.status, '| Body:', JSON.stringify(errorData));
      return NextResponse.json({ error: errorData?.message || 'Erro ao buscar performance por matéria.' }, { status: performanceResponse.status });
    }

    const [geralData, performanceData] = await Promise.all([
      geralResponse.json(),
      performanceResponse.json(),
    ]);

    console.log('[API_USER_STATS] ✅ Dados recebidos:');
    console.log('[API_USER_STATS]    geral:', JSON.stringify(geralData));
    console.log('[API_USER_STATS]    performance-materia:', JSON.stringify(performanceData).substring(0, 300) + (JSON.stringify(performanceData).length > 300 ? '...' : ''));

    return NextResponse.json(transformExternalData(geralData, performanceData));

  } catch (error) {
    console.error('[API_USER_STATS_ERROR] Erro de comunicação com o back-end:', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}
