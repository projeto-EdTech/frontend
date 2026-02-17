import { NextResponse } from "next/server";

// Pega a URL do back-end a partir das variáveis de ambiente
const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function GET(
  req: Request,
  context: { params: Promise<{ subject: string }> }
) {
  // 1. Validar se a URL do back-end está configurada
  if (!BACKEND_API_URL) {
    console.error("A variável de ambiente BACKEND_API_URL não está definida.");
    return NextResponse.json(
      { message: "Erro de configuração no servidor." },
      { status: 500 }
    );
  }

  // 2. Extrair parâmetros (materia da URL, universidadeId da Query String)
  // Mapa para normalizar a escrita conforme o backend espera (com acentos e maiúsculas)
  const mapaMaterias: Record<string, string> = {
    "matematica": "Matemática",
    "fisica": "Física",
    "quimica": "Química",
    "biologia": "Biologia",
    "portugues": "Língua Portuguesa",
    "historia": "História",
    "geografia": "Geografia",
    "filosofia": "Filosofia",
    "sociologia": "Sociologia",
    "ingles": "Inglês",
  };

  const { subject: subjectParam } = await context.params;
  // Tenta buscar no mapa usando a versão minúscula, senão usa o original
  const materia = mapaMaterias[subjectParam.toLowerCase()] || subjectParam;

  const { searchParams } = new URL(req.url);
  // Agora esperamos que o parâmetro 'vestibular' contenha o ID da universidade ou 'all'
  let universidadeId = searchParams.get("vestibular");

  // Tratamento para "geral" ou vazio -> "all"
  if (!universidadeId || universidadeId === "geral") {
    universidadeId = "all";
  }

  try {
    // 3. Construir a URL final para o back-end externo
    // Caminho solicitado: BACKENDURL/api/sigla/estatiscas/[universidadeID]/[materiaID]
    // Usando string template para manter o acento visível no log (o fetch tratará a codificação necessária)
    const backendApiUrl = `${BACKEND_API_URL}/api/sigla/estatisticas/${universidadeId}/${materia}`;

    console.log(`API Route - Recebido ID: "${universidadeId}", Matéria: "${materia}"`);
    console.log(`API Route - Chamando Backend: ${backendApiUrl}`);

    // 4. Fazer a chamada (fetch) para o seu back-end
    const res = await fetch(backendApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Configuração de cache (opcional, 'no-store' busca sempre os dados mais recentes)
      cache: 'no-store',
    });

    // 5. Tratar a resposta do back-end
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
    const backendData = await res.json();
    
    // Mapear o formato do backend (conteudo, percentual) para o frontend (topico, percentual)
    const metricas = Array.isArray(backendData) 
      ? backendData.map((item: any) => ({
          topico: item.conteudo, // Backend "conteudo" -> Frontend "topico"
          percentual: item.percentual
        }))
      : [];

    return NextResponse.json({
      subject: subjectParam,
      metricas: metricas
    });

  } catch (error) {
    console.error("Erro de conexão com o back-end:", error);
    return NextResponse.json(
      { message: "Não foi possível conectar ao serviço de estatísticas." },
      { status: 503 }
    );
  }
}
