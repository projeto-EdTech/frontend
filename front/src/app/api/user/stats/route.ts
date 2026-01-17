import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

// O parâmetro 'request: NextRequest' foi removido da linha abaixo,
// pois não era utilizado dentro da função.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    
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

    // Isso ajuda a ver seus componentes de "loading" em ação.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa de 1 segundo

    // Retornamos os dados de exemplo como se tivessem vindo do backend.
    return NextResponse.json(mockData);

  } catch (error) {
    console.error("[API_USER_STATS_GET] Erro:", error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}


/**
  ===========================================================
  BFF API USER STATS - ROTA REAL PARA O BACKEND EXTERNO
  ===========================================================
/
const transformExternalData = (apiData: any) => {
  // A função auxiliar para tendências permanece a mesma.
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
      trend_simulados: createTrendObject(apiData.user_statistics?.simulations_trend || 0),        // o percentual de simulações concluídas em relação ao periodo anterior
      trend_questoes: createTrendObject(apiData.user_statistics?.questions_trend || 0),           // o percentual de questões respondidas em relação ao periodo anterior
      trend_acertos: createTrendObject(apiData.user_statistics?.answers_trend || 0),              // o percentual de acertos em relação ao periodo anterior
      trend_percentagem: createTrendObject(apiData.user_statistics?.percentage_trend || 0),       // o percentual de acertos em relação ao periodo anterior
    },
    recentExams: (apiData.last_exams || []).map((exam: any) => ({
      name: exam.exam_name || 'Simulado',
      date: exam.completed_at || 'Data não informada',
      score: exam.final_score || 0,
    })),
    subjectPerformance: (apiData.performance_by_subject || []).map((subject: any) => ({
      subject: subject.discipline || 'Matéria',
      percentage: subject.accuracy || 0,
      icon: subject.image_url || '/default-icon.svg',
    })),
    monthlyProgress: (apiData.monthly_performance_data || []).map((monthlyPoint: any) => {
      const date = new Date(monthlyPoint.mes); 
      const label = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
      const value = Math.round(monthlyPoint.pontuacaoMedia || 0);
      return { label, value };
    }),
    reviewableQuestions: (apiData.incorrectly_answered_questions || []).map((item: any) => ({
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
          displaySubject: `${materia} — ${conteudo}`
        };
    }))
  };
};

export async function GET(request: Request) {
  try {
    // 1. Autenticação (continua igual)
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const userId = session.user.id;

    // 2. Chamada para o Backend Externo (continua igual)
    const externalApiUrl = process.env.BACKEND_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;
    if (!externalApiUrl || !apiKey) {
      throw new Error("Variáveis de ambiente não configuradas.");
    }
    
    const requestUrl = `${BACKEND_API_URL}/user-data/${userId}`;
    const externalResponse = await fetch(requestUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!externalResponse.ok) {
      throw new Error(`Erro do backend externo: ${externalResponse.statusText}`);
    }
    
    // Pegamos os dados "crus" do backend externo.
    const rawData = await externalResponse.json();

    // Usamos nossa função adaptadora para limpar e organizar os dados.
    const formattedData = transformExternalData(rawData);

    // Enviamos para o frontend os dados já limpos e estruturados.
    return NextResponse.json(formattedData);

  } catch (error) {
    console.error("[BFF_API_USER_STATS] Erro:", error);
    return new NextResponse('Erro interno ao processar a requisição', { status: 500 });
  }
}*/