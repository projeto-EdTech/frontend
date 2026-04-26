import { NextResponse } from 'next/server';

// ============================================================
// DADOS ESTÁTICOS DE REFERÊNCIA (mock anterior)
// Manter como referência para validar o contrato de dados
// com o backend antes de remover.
// ============================================================
/*
const mockData = {
  stats: {
    simulados: 12,
    questoes: 540,
    acertos: 378,
    percentagem: 70,
    trend_simulados: { value: 15, type: 'up' as const },
    trend_questoes: { value: 8, type: 'up' as const },
    trend_acertos: { value: 12, type: 'up' as const },
    trend_percentagem: { value: 5, type: 'up' as const },
  },
  recentExams: [
    { name: "ENEM Simulado (Exemplo)", date: "10/07/2025", score: 82 },
    { name: "FUVEST (Exemplo)", date: "22/06/2025", score: 68 },
    { name: "Simulado Personalizado (Exemplo)", date: "15/06/2025", score: 75 }
  ],
  subjectPerformance: [
    { subject: "Matemática", percentage: 80 },
    { subject: "Física", percentage: 75 },
    { subject: "Química", percentage: 65 },
    { subject: "Biologia", percentage: 88 },
    { subject: "Inglês", percentage: 72 },
    { subject: "História", percentage: 68 },
    { subject: "Geografia", percentage: 75 },
    { subject: "Filosofia", percentage: 60 },
    { subject: "Sociologia", percentage: 65 },
    { subject: "Língua Portuguesa", percentage: 90 },
    { subject: "Literatura", percentage: 85 },
  ],
  monthlyProgress: [
    { label: 'Jan', value: 600 },
    { label: 'Fev', value: 750 },
    { label: 'Mar', value: 700 },
    { label: 'Abr', value: 805 },
    { label: 'Mai', value: 905 },
    { label: 'Jun', value: 570 },
    { label: 'Jul', value: 880 },
    { label: 'Ago', value: 900 },
    { label: 'Set', value: 800 },
    { label: 'Out', value: 700 },
    { label: 'Nov', value: 650 },
    { label: 'Dez', value: 800 },
  ],
  reviewableQuestions: [
    {
      id: 'q1',
      enunciado: "Um fio condutor é percorrido por cerca de 2x10⁻¹⁴ C a cada microssegundo (10⁻⁶ s). Determine a intensidade da corrente.",
      suaResposta: "1 A",
      gabarito: "2x10⁻⁸ A",
      displayLabel: "FUVEST 2025",
      displaySubject: "Física — Életrica e Eletromagnetismo",
    },
    {
      id: 'q2',
      enunciado: "Qual o resultado da equação de segundo grau x² - 5x + 6 = 0?",
      suaResposta: "x=1, x=5",
      gabarito: "x=2, x=3",
      displayLabel: "ENEM 2024",
      displaySubject: "Matemática — Funções",
    },
    {
      id: 'q3',
      enunciado: "Quem foi o primeiro presidente do Brasil?",
      suaResposta: "Dom Pedro I",
      gabarito: "Marechal Deodoro da Fonseca",
      displayLabel: "UNICAMP 2023",
      displaySubject: "História — República",
    },
    {
      id: 'q4',
      enunciado: "Qual a fórmula da Lei de Ohm?",
      suaResposta: "R = IV",
      gabarito: "V = IR",
      displayLabel: "ENEM 2024",
      displaySubject: "Física — Életrica e Eletromagnetismo",
    }
  ]
};
*/

// ============================================================
// FUNÇÃO ADAPTADORA — mapeia os campos do backend para o
// contrato de dados esperado pelo frontend.
// TODO: Revisar com o backend os nomes exatos dos campos.
// ============================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformExternalData = (apiData: any) => {
  const createTrendObject = (value: number) => ({
    value: Math.abs(value),
    type: value >= 0 ? 'up' : 'down',
  });

  return {
    stats: {
      simulados: apiData.user_statistics?.simulations_completed || 0,
      questoes: apiData.user_statistics?.questions_answered || 0,
      acertos: apiData.user_statistics?.correct_answers || 0,
      percentagem: apiData.user_statistics?.hit_percentage || 0,
      trend_simulados: createTrendObject(apiData.user_statistics?.simulations_trend || 0),   // % em relação ao período anterior
      trend_questoes: createTrendObject(apiData.user_statistics?.questions_trend || 0),      // % em relação ao período anterior
      trend_acertos: createTrendObject(apiData.user_statistics?.answers_trend || 0),         // % em relação ao período anterior
      trend_percentagem: createTrendObject(apiData.user_statistics?.percentage_trend || 0),  // % em relação ao período anterior
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentExams: (apiData.last_exams || []).map((exam: any) => ({
      name: exam.exam_name || 'Simulado',
      date: exam.completed_at || 'Data não informada',
      score: exam.final_score || 0,
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
    // Lê o token JWT enviado pelo cliente no header Authorization
    const authHeader = request.headers.get('Authorization');
    const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!userToken) {
      console.warn('[API_USER_STATS] ❌ Requisição sem token JWT.');
      return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
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

    // Adapta os dados do backend para o contrato esperado pelo frontend
    const formattedData = transformExternalData(rawData);
    console.log('[API_USER_STATS] ✅ Sucesso! Dados adaptados e retornando ao frontend.');

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('[API_USER_STATS_ERROR] Erro de comunicação com o back-end:', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}