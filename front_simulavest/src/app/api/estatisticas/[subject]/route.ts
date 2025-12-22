import { NextResponse } from "next/server";
import { dataStats } from "@/lib/dataStats";

export async function GET(
  req: Request,
  context: { params: Promise<{ subject: string }> }
) {
  // 1. Verificação explícita e defensiva do parâmetro 'subject'
  const { subject: subjectParam } = await context.params;
  if (!subjectParam) {
    return NextResponse.json(
      { message: "Parâmetro [subject] não encontrado na URL." },
      { status: 400 } // Bad Request
    );
  }
  const subject = subjectParam.toLowerCase();

  // 2. Extração dos query params
  const { searchParams } = new URL(req.url);
  const vestibular = searchParams.get("vestibular")?.toLowerCase();

  // Caso 1: Um vestibular específico foi solicitado
  if (vestibular && vestibular !== "geral") {
    const vestibularData = dataStats.vestibulares[vestibular];
    const subjectData = vestibularData?.[subject];

    if (subjectData) {
      return NextResponse.json({
        subject,
        metricas: subjectData,
        source: "vestibular",
      });
    } else {
      return NextResponse.json({
        subject,
        metricas: [],
        source: "not_found",
      });
    }
  }

  // Caso 2: Nenhum vestibular específico foi solicitado (fallback para o geral)
  const metricasGerais = dataStats.geral[subject] || [];

  if (metricasGerais.length === 0) {
    return NextResponse.json(
      { message: "Matéria não encontrada nos dados gerais" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    subject,
    metricas: metricasGerais,
    source: "geral",
  });
}

// Desabilitar cache para garantir que os dados sejam sempre revalidados
export const revalidate = 0;


/*
import { NextResponse } from "next/server";

// Pega a URL do back-end a partir das variáveis de ambiente
const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function GET(
  req: Request,
  { params }: { params: { subject: string } }
) {
  // 1. Validar se a URL do back-end está configurada
  if (!BACKEND_API_URL) {
    console.error("A variável de ambiente BACKEND_API_URL não está definida.");
    return NextResponse.json(
      { message: "Erro de configuração no servidor." },
      { status: 500 }
    );
  }

  // 2. Extrair os parâmetros da requisição que veio do frontend
  const subject = params.subject?.toLowerCase();
  const { searchParams } = new URL(req.url);
  const vestibular = searchParams.get("vestibular") || undefined;

  // 3. Construir a URL final para o back-end externo
  // Exemplo: http://seu-servidor-backend.com/api/v1/estatisticas/matematica?vestibular=fuvest
  const backendApiUrl = new URL(`/estatisticas/${subject}`, BACKEND_API_URL);
  if (vestibular) {
    backendApiUrl.searchParams.set("vestibular", vestibular);
  }

  try {
    // 4. Fazer a chamada (fetch) para o seu back-end
    const res = await fetch(backendApiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // IMPORTANTE: Se sua API externa precisar de autenticação (API Key, Bearer Token),
        // você deve adicioná-la aqui. O frontend nunca saberá dessa chave.
        // "Authorization": `Bearer ${process.env.BACKEND_API_TOKEN}`
      },
      // Configuração de cache (opcional, 'no-store' busca sempre os dados mais recentes)
      cache: 'no-store',
    });

    // 5. Tratar a resposta do back-end
    // Se o back-end retornou um erro (ex: 404, 500), repasse o erro para o frontend
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: res.statusText }));
      return NextResponse.json(
        {
          message: "Erro ao buscar dados do serviço externo.",
          backendError: errorBody,
        },
        { status: res.status }
      );
    }

    // 6. Se a resposta foi bem-sucedida, extraia o JSON e envie para o frontend
    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erro de conexão com o back-end:", error);
    return NextResponse.json(
      { message: "Não foi possível conectar ao serviço de estatísticas." },
      { status: 503 } // Service Unavailable
    );
  }
}
*/