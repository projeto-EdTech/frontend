import { PLAYLISTS_MOCK } from "@/lib/Playlist_data";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  // Agora retornamos os dados puros, a lógica de ícones foi movida para o front-end
  return NextResponse.json(PLAYLISTS_MOCK);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, isPublic, creatorName, tags } = body;

    // Validação básica do payload
    if (!title) {
      return NextResponse.json(
        { error: "O título da playlist é obrigatório" },
        { status: 400 }
      );
    }

    // Criando um objeto de playlist simulado seguindo estritamente a interface Playlist 
    // com todos os campos presentes. Campos não preenchidos recebem string vazia ou undefined.
    const newPlaylist = {
      id: Math.random().toString(36).substring(2, 11), 
      title,
      creatorName: creatorName || "Usuário", 
      questionCount: 0,
      likesCount: 0,
      gradient: "from-indigo-500 to-purple-600",
      category: category || "Geral",
      tags: tags && tags.length > 0 ? tags : ["Nova"],
      description: description || "",
      coverGradient: "from-indigo-700 to-purple-900",
      mainColor: "bg-indigo-600",
      creatorAvatar: "",
      duration: "0 min",
      isPublic: isPublic ?? true,
      questions: []
    };

    // Adicionando a nova playlist ao começo do array simulado na memória
    PLAYLISTS_MOCK.unshift(newPlaylist as any);

    // Lógica para escrever de verdade no arquivo Playlist_data.ts (SOMENTE PARA TESTES)
    try {
      const filePath = path.join(process.cwd(), "src", "lib", "Playlist_data.ts");
      let fileContent = await fs.readFile(filePath, "utf-8");
      
      // Escrevendo o objeto no padrão TypeScript sem aspas literais nas keys (limpando o JSON)
      // O utilitário abaixo remove aspas duplas de chaves válidas de objeto JS (ex: "id": -> id:)
      const newPlaylistString = JSON.stringify(newPlaylist, null, 4)
        .replace(/"([^"]+)":/g, "$1:");
      
      // Encontra o fim do array PLAYLISTS_MOCK e insere o novo objeto
      // Como queremos adicionar no final (ou início), aqui vamos adicionar no final do arquivo de mock
      fileContent = fileContent.replace(/];[\s\n]*$/, `,\n  ${newPlaylistString}\n];`);
      
      await fs.writeFile(filePath, fileContent, "utf-8");
      console.log("Arquivo Playlist_data.ts atualizado com sucesso!");
    } catch (fsError) {
      console.error("Erro ao escrever no arquivo:", fsError);
      // Não falhamos a request se der erro ao escrever, apenas logamos
    }

    // Retorna a playlist recém-criada com o status HTTP 201 (Created)
    return NextResponse.json(newPlaylist, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar playlist:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar a playlist" },
      { status: 500 }
    );
  }
}

export async function GET_COUNT() {
  // Retorna apenas a contagem de playlists
  return NextResponse.json({ count: PLAYLISTS_MOCK.length });
}
