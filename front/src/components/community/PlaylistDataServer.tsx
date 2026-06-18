import { getPlaylistById } from "@/app/service/playlist.service";
import { PlaylistDetail } from "./PlaylistDetail";
import { notFound } from "next/navigation";

interface PlaylistDataServerProps {
  id: string;
}

export async function PlaylistDataServer({ id }: PlaylistDataServerProps) {
  const playlist = await getPlaylistById(id);

  if (!playlist) {
    notFound();
  }

  return <PlaylistDetail playlist={playlist} />;
}
