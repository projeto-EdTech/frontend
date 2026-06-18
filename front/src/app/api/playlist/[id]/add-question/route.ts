import { PLAYLISTS_MOCK } from "@/lib/data/playlists";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { question } = await request.json();

    const playlistIndex = PLAYLISTS_MOCK.findIndex((p) => p.id === id);
    if (playlistIndex === -1) {
      return NextResponse.json({ error: "Playlist não encontrada" }, { status: 404 });
    }

    if (!PLAYLISTS_MOCK[playlistIndex].questions) {
      PLAYLISTS_MOCK[playlistIndex].questions = [];
    }

    // Extraí as informações duplicadas do rawQuestion
    const { university, year, ...restOfQuestion } = question;

    // Mapeia a questão do formato do simulado para o formato da visualização da playlist
    const mappedQuestion = {
      id: question.id || Date.now(),
      title: typeof question.text === 'string' 
        ? question.text.substring(0, 60) + "..." 
        : (question.text?.principal?.substring(0, 60) + "..." || "Questão Salva"),
      subject: question.materia?.[0] || "Geral",
      topic: question.conteudo?.[0] || "Conteúdo Variado",
      difficulty: "Médio",
      dateAdded: new Date().toISOString(),
      duration: "3 min",
      completed: false,
      institution: university || "Instituição",
      year: year || new Date().getFullYear(),
      // Preservamos o JSON original caso precisemos abrir a questão totalmente depois
      rawQuestion: restOfQuestion 
    };

    // Verifica se a questão já foi salva 
    const exists = PLAYLISTS_MOCK[playlistIndex].questions?.some((q: any) => q.id === mappedQuestion.id);
    if (!exists) {
      PLAYLISTS_MOCK[playlistIndex].questions!.push(mappedQuestion as any);
      PLAYLISTS_MOCK[playlistIndex].questionCount = PLAYLISTS_MOCK[playlistIndex].questions!.length;

      // Salva persistentemente no arquivo Playlist_data.ts (Mock)
      try {
        const filePath = path.join(process.cwd(), "src", "lib", "Playlist_data.ts");
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, "utf8");
          const regex = /export\s+const\s+PLAYLISTS_MOCK\s*:\s*Playlist\[\]\s*=\s*\[[\s\S]*?\];/;
          
          if (regex.test(fileContent)) {
            const updatedArrayString = JSON.stringify(PLAYLISTS_MOCK, null, 2);
            const newContent = fileContent.replace(
              regex,
              `export const PLAYLISTS_MOCK: Playlist[] = ${updatedArrayString};`
            );
            fs.writeFileSync(filePath, newContent, "utf8");
          }
        }
      } catch (fileError) {
        console.error("Erro ao salvar no arquivo Playlist_data.ts:", fileError);
      }
    }

    return NextResponse.json(PLAYLISTS_MOCK[playlistIndex], { status: 200 });
  } catch (error) {
    console.error("Erro interno ao adicionar questão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
