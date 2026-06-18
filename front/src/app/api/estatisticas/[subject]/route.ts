import { NextResponse } from "next/server";
import { getStatsData } from "@/lib/data/stats";

// STATIC DATA MODE — real backend call preserved as comment below.
// To restore live backend: uncomment the fetch block and remove the static return above it.

export async function GET(
  req: Request,
  context: { params: Promise<{ subject: string }> }
) {
  const { subject: subjectParam } = await context.params;
  const { searchParams } = new URL(req.url);
  let vestibular = searchParams.get("vestibular") || "geral";

  // Normalize "geral" / "all" / missing → no vestibular filter
  if (vestibular === "geral" || vestibular === "all") vestibular = "";

  const metricas = getStatsData(subjectParam.toLowerCase(), vestibular || undefined);
  return NextResponse.json({ subject: subjectParam, metricas });

  /*
  REAL BACKEND (restore when Java BFF /api/instituicao/estatisticas is available):

  const BACKEND_API_URL = process.env.BACKEND_API_URL;
  if (!BACKEND_API_URL) {
    return NextResponse.json({ message: "Erro de configuração no servidor." }, { status: 500 });
  }

  const mapaMaterias: Record<string, string> = {
    matematica: "Matemática",
    fisica: "Física",
    quimica: "Química",
    biologia: "Biologia",
    portugues: "Língua Portuguesa",
    historia: "História",
    geografia: "Geografia",
    filosofia: "Filosofia",
    sociologia: "Sociologia",
    ingles: "Inglês",
  };

  const materia = mapaMaterias[subjectParam.toLowerCase()] || subjectParam;
  let universidadeId = searchParams.get("vestibular");
  if (!universidadeId || universidadeId === "geral") universidadeId = "all";

  const authHeader = req.headers.get("Authorization");
  const userToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  if (!userToken) {
    return NextResponse.json({ error: "Não autorizado: Token do backend não encontrado." }, { status: 401 });
  }

  try {
    const backendApiUrl = `${BACKEND_API_URL}/api/instituicao/estatisticas/${universidadeId}/${materia}`;
    const res = await fetch(backendApiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: res.statusText }));
      return NextResponse.json({ message: "Erro ao buscar dados do serviço externo.", backendError: errorBody }, { status: res.status });
    }
    const backendData = await res.json();
    const metricas = Array.isArray(backendData)
      ? backendData.map((item: any) => ({ topico: item.conteudo, percentual: item.percentual }))
      : [];
    return NextResponse.json({ subject: subjectParam, metricas });
  } catch (error) {
    console.error("Erro de conexão com o back-end:", error);
    return NextResponse.json({ message: "Não foi possível conectar ao serviço de estatísticas." }, { status: 503 });
  }
  */
}
