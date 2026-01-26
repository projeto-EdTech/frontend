"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { type Playlist } from "@/lib/Playlist_data";
import { 
  PlaylistDetail, 
  PlaylistDetailSkeleton, 
  PlaylistDetailError 
} from "@/components/community/PlaylistDetail";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch playlist data from API
  useEffect(() => {
    async function fetchPlaylist() {
      try {
        setIsLoading(true);
        const playlistId = Array.isArray(params.id) ? params.id[0] : params.id;
        const response = await fetch(`/api/playlist/${playlistId}`);
        
        if (!response.ok) {
          throw new Error("Playlist não encontrada");
        }
        
        const data = await response.json();
        setPlaylist(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar playlist");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchPlaylist();
    }
  }, [params.id]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <PlaylistDetailSkeleton />
      </>
    );
  }

  // Error state
  if (error || !playlist) {
    return (
      <>
        <Header />
        <PlaylistDetailError 
          error={error || "Playlist não encontrada"} 
          onBack={() => router.back()} 
        />
      </>
    );
  }

  // Success state
  return (
    <>
      <Header />
      <PlaylistDetail playlist={playlist} />
      <Footer />
    </>
  );
}

