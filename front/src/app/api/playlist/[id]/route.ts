import { PLAYLISTS_MOCK } from "@/lib/data/playlists";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const playlist = PLAYLISTS_MOCK.find(p => p.id === id);
  
  if (!playlist) {
    return NextResponse.json(
      { error: "Playlist não encontrada" },
      { status: 404 }
    );
  }
  
  return NextResponse.json(playlist);
}
