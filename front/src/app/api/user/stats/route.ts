import { NextResponse } from 'next/server';
import { getCachedStats, setCachedStats, type TransformedStats } from '@/lib/store/userStatsCache';

// CACHE STRATEGY: in-memory TTL 5min — user-specific, key=userId from JWT sub/email

function extractUserId(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload.sub ?? payload.email ?? null;
  } catch {
    return null;
  }
}

function paginate(data: TransformedStats, page: number, limit: number) {
  const total = data.recentExams.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const slice = data.recentExams.slice(start, start + limit);
  return NextResponse.json({
    ...data,
    recentExams: slice,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformExternalData = (apiData: any): TransformedStats => {
  const createTrendObject = (value: number) => ({
    value: Math.abs(value),
    type: value >= 0 ? 'up' : 'down',
  }) as { value: number; type: 'up' | 'down' };

  return {
    stats: {
      simulados: apiData.user_statistics?.simulations_completed || 0,
      questoes: apiData.user_statistics?.questions_answered || 0,
      acertos: apiData.user_statistics?.correct_answers || 0,
      percentagem: apiData.user_statistics?.hit_percentage || 0,
      trend_simulados: createTrendObject(apiData.user_statistics?.simulations_trend || 0),
      trend_questoes: createTrendObject(apiData.user_statistics?.questions_trend || 0),
      trend_acertos: createTrendObject(apiData.user_statistics?.answers_trend || 0),
      trend_percentagem: createTrendObject(apiData.user_statistics?.percentage_trend || 0),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentExams: (apiData.last_exams || []).map((exam: any) => ({
      name: exam.exam_name || 'Simulado',
      date: exam.completed_at || 'Data não informada',
      score: exam.final_score || 0,
      totalQuestions: exam.total_questions ?? undefined,
      correctAnswers: exam.correct_answers ?? undefined,
      incorrectAnswers: exam.wrong_answers ?? exam.incorrect_answers ?? undefined,
      timeUsed: exam.time_spent ?? exam.time_used ?? undefined,
      accuracy: exam.hit_percentage ?? exam.accuracy ?? undefined,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subjectPerformance: (apiData.performance_by_subject || []).map((subject: any) => ({
      subject: subject.discipline || 'Matéria',
      percentage: subject.accuracy || 0,
      icon: subject.image_url || '/default-icon.svg',
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    monthlyProgress: (apiData.monthly_performance_data || []).map((monthlyPoint: any) => {
      const date = new Date(monthlyPoint.mes);
      const label = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
      const value = Math.round(monthlyPoint.pontuacaoMedia || 0);
      return { label, value };
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewableQuestions: (apiData.incorrectly_answered_questions || []).map((item: any) => {
      const nomeProva = item.questao?.prova?.nome || 'Prova';
      const anoProva = item.questao?.prova?.ano || '';
      const materia = item.questao?.materia || 'Matéria';
      const conteudo = item.questao?.conteudo || 'Geral';
      return {
        id: item.id || `q-${Math.random()}`,
        enunciado: item.questao?.enunciado || 'Enunciado não disponível.',
        suaResposta: item.respostaDoUsuario || 'Não respondeu.',
        gabarito: item.questao?.gabarito || 'Gabarito não disponível.',
        displayLabel: `${nomeProva} ${anoProva}`.trim(),
        displaySubject: `${materia} — ${conteudo}`,
      };
    }),
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

    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, Number(searchParams.get('page')  ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 3)));

    const userId = extractUserId(userToken);

    if (userId) {
      const cached = getCachedStats(userId);
      if (cached) {
        console.log('[API_USER_STATS] ✅ Cache hit para userId:', userId.substring(0, 8) + '...');
        return paginate(cached, page, limit);
      }
    }

    const backendUrl = `${externalApiUrl}/user-data`;

    console.log('[API_USER_STATS] 📤 Enviando requisição ao backend:');
    console.log('[API_USER_STATS]    URL:', backendUrl);
    console.log('[API_USER_STATS]    Token (primeiros 20 chars):', userToken.substring(0, 20) + '...');

    const apiResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      cache: 'no-store',
    });

    console.log('[API_USER_STATS] 📥 Resposta recebida do backend:');
    console.log('[API_USER_STATS]    Status:', apiResponse.status, apiResponse.statusText);

    const contentType = apiResponse.headers.get('content-type');

    let rawData;
    if (contentType && contentType.includes('application/json')) {
      rawData = await apiResponse.json();
      console.log('[API_USER_STATS]    Content-Type: application/json');
      console.log('[API_USER_STATS]    Dados recebidos (raw):', JSON.stringify(rawData).substring(0, 300) + (JSON.stringify(rawData).length > 300 ? '...' : ''));
    } else {
      const textData = await apiResponse.text();
      console.warn('[API_USER_STATS] ⚠️  Resposta não-JSON do backend:', textData);
      return NextResponse.json(
        { error: textData || 'O servidor de destino não enviou uma resposta legível.' },
        { status: apiResponse.status }
      );
    }

    if (!apiResponse.ok) {
      console.error('[API_USER_STATS] ❌ Erro retornado pelo backend. Status:', apiResponse.status, '| Mensagem:', rawData?.message);
      return NextResponse.json(
        { error: rawData?.message || 'Ocorreu um erro no servidor de destino.' },
        { status: apiResponse.status }
      );
    }

    const formattedData = transformExternalData(rawData);

    if (userId) {
      setCachedStats(userId, formattedData);
    }

    console.log('[API_USER_STATS] ✅ Sucesso! Dados adaptados e retornando ao frontend.');

    return paginate(formattedData, page, limit);

  } catch (error) {
    console.error('[API_USER_STATS_ERROR] Erro de comunicação com o back-end:', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}
