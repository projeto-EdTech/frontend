import { Suspense } from "react";
import { PlaylistDataServer } from "@/components/community/PlaylistDataServer";
import { PlaylistDetailSkeleton } from "@/components/Skeletons/PlaylistDetailSkeleton";
import Header from "@/components/Header";

/**
 * CACHE STRATEGY: ISR - revalidate 60s
 * Motivo: Playlists da comunidade mudam periodicamente.
 */
export const revalidate = 60;

interface PageProps {
  params: {
    id: string;
  };
}

export default function PlaylistPage({ params }: PageProps) {
  return (
    <main>
      <Header />
      <Suspense fallback={<PlaylistDetailSkeleton />}>
        <PlaylistDataServer id={params.id} />
      </Suspense>
    </main>
  );
}
