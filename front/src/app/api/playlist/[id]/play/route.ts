import { PLAYLISTS_MOCK } from "@/lib/data/playlists";
import { NextResponse } from "next/server";
import { saveSimulation } from "@/lib/store/simulationStore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const playlist = PLAYLISTS_MOCK.find(p => p.id === id);
    
    if (!playlist) {
      return NextResponse.json({ error: "Playlist não encontrada" }, { status: 404 });
    }

    if (!playlist.questions || playlist.questions.length === 0) {
      return NextResponse.json({ error: "A playlist está vazia" }, { status: 400 });
    }

    // Extrai as questões originais guardadas em rawQuestion (que montam a estrutura base do simulado)
    const simulationQuestions = playlist.questions
      .map(q => q.rawQuestion)
      .filter((q): q is NonNullable<typeof q> => Boolean(q));

    if (simulationQuestions.length === 0) {
        return NextResponse.json({ error: "As questões não possuem o formato original (rawQuestion) para gerar o simulado." }, { status: 400 });
    }

    // Salva na store temporária, mesmo método usado na criação de simulados manuais
    const simId = saveSimulation(simulationQuestions as any);

    return NextResponse.json({ id: simId }, { status: 200 });

  } catch (error) {
    console.error("Erro ao iniciar playlist como simulado:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
