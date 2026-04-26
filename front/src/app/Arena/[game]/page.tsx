import React, { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameDataServer from "@/components/Arena/GameDataServer";
import GameLoadingSkeleton from "@/components/Skeletons/GameLoadingSkeleton";

export const revalidate = 60;

export default async function GamePage(props: { params: Promise<{ game: string }> }) {
  const params = await props.params;
  const slug = params.game;

  return (
    <div className="themed-main-container min-h-screen force-themed-bg flex flex-col">
      {/* Header */}
      <Header />

      {/* 
        A casca (layout básico, Navbar, plano de fundo) foi renderizada imediatamente.
        O componente GameDataServer validará autenticação via next-auth ou fará o bind
        ao minigame importado nativamente (podendo ser pesado de carregar).
        O Skeleton rodará em Progressive Rendering no interim.
      */}
      <Suspense fallback={<GameLoadingSkeleton />}>
        <GameDataServer slug={slug} />
      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  );
}
