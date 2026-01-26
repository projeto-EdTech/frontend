import { PLAYLISTS_MOCK } from "@/lib/Playlist_data";
import { NextResponse } from "next/server";

export async function GET() {
  // Agora retornamos os dados puros, a lógica de ícones foi movida para o front-end
  return NextResponse.json(PLAYLISTS_MOCK);
}

export async function GET_COUNT() {
  // Retorna apenas a contagem de playlists
  return NextResponse.json({ count: PLAYLISTS_MOCK.length });
}
