"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/LoadingScreen";
import LoginModal from "@/components/Login-modal";
import { type MinigameData } from "@/lib/games/games";
import { getGameComponent } from "@/lib/games/config";
import { ArrowLeft } from "lucide-react";

interface ArenaGameClientProps {
  game: MinigameData;
}

export default function ArenaGameClient({ game }: ArenaGameClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Verificar autenticação livre (login modal pop-up se não autenticado)
  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    }
  }, [status]);

  const handleBackToArena = () => {
    setIsNavigating(true);
    router.push('/Arena');
  };

  const handleGameComplete = (score: { correct: number; total: number }) => {
    console.log('Jogo finalizado!', score);
  };

  const GameComponent = getGameComponent(game.slug);

  if (isNavigating) {
    return <LoadingScreen message="Carregando Arena..." />;
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-6 relative flex flex-col items-center">
      {/* Breadcrumb e Info do Jogo */}
      <div className="w-full lg:w-auto lg:absolute lg:left-4 lg:top-6 z-10 mb-6 lg:mb-0 self-start lg:self-auto">
        <button
          onClick={handleBackToArena}
          className="inline-flex items-center gap-2 themed-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-semibold">Voltar para Arena</span>
        </button>
      </div>

      {/* Game Container */}
      <div className="w-full min-h-[600px] flex flex-col bg-transparent relative z-20">
        {GameComponent ? (
          <GameComponent onComplete={handleGameComplete} />
        ) : (
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 text-xl mb-4">
                Jogo não encontrado ou ainda não implementado
              </p>
              <button
                onClick={handleBackToArena}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 cursor-pointer"
              >
                Voltar para Arena
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        redirectTo={`/Arena/${game.slug}`}
        isRequired={status === 'unauthenticated'}
      />
    </main>
  );
}
