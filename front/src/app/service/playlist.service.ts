import { PLAYLISTS_MOCK, type Playlist } from "@/lib/data/playlists";

/**
 * CACHE STRATEGY: ISR - revalidate 60s
 * Motivo: As playlists da comunidade podem ser atualizadas, mas não mudam a cada segundo.
 */
export async function getPlaylistById(id: string): Promise<Playlist | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const playlist = PLAYLISTS_MOCK.find(p => p.id === id);
  return playlist || null;
}
