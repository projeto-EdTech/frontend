import { NextResponse } from "next/server";
import {mockRankingsByUniversity, RawUserData
} from "@/lib/ranking/ranking";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/core/auth";

export type UserRanking = {
  position: number;
  avatarUrl: string;
  name: string;
  score: number;
  rank: 'Ouro' | 'Prata' | 'Bronze' | 'Diamante';
  isCurrentUser?: boolean;
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserName = session?.user?.name;

    const { searchParams } = new URL(request.url);
    const universitySlug = searchParams.get('universidade');
    const periodo = searchParams.get('periodo');

    if (!universitySlug) {
      return new NextResponse("Parâmetro 'universidade' não encontrado na URL", { status: 400 });
    }

    const universityRankings = mockRankingsByUniversity[universitySlug];

    if (!universityRankings) {
      return new NextResponse(`Ranking para a universidade '${universitySlug}' não encontrado`, { status: 404 });
    }
    
    let rawData: RawUserData[];

    switch (periodo) {
      case 'semanal':
        rawData = universityRankings.semanal;
        break;
      case 'anual':
        rawData = universityRankings.anual;
        break;
      case 'mensal':
      default:
        rawData = universityRankings.mensal;
        break;
    }

    const sortedData = [...rawData].sort((a, b) => b.pontos - a.pontos);

    // Etapa 5: Enriquecer os dados para o formato final.
    const enrichedData: UserRanking[] = sortedData.map((rawUser, index) => {
      const position = index + 1;
      let rank: UserRanking['rank'];

      if (position <= 10) rank = 'Diamante';
      else if (position <= 30) rank = 'Ouro';
      else if (position <= 60) rank = 'Prata';
      else rank = 'Bronze';

      return {
        position,
        name: rawUser.usuario,
        score: rawUser.pontos,
        rank,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.usuario}`,
        isCurrentUser: sessionUserName ? rawUser.usuario === sessionUserName : false,
      };
    });

    return NextResponse.json(enrichedData);

  } catch (error) {
    console.error("Erro ao processar dados do ranking:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}