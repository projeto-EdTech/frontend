"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import LoginModal from "@/components/Login-modal";
import { minigamesData, MinigameData } from "@/lib/Data_games";
import { getGameComponent } from "@/lib/Games/Games";
import { ArrowLeft } from "lucide-react";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [game, setGame] = useState<MinigameData | null>(null);

  // Verificar se o usuário tem plano pago
  const hasPaidPlan = session?.user?.tier && session.user.tier !== "FREE";

  useEffect(() => {
    // Buscar o jogo pelo slug
    const gameSlug = params.game as string;
    const foundGame = minigamesData.find(g => g.slug === gameSlug);
    
    if (foundGame) {
      setGame(foundGame);
      
      // Verificar se o jogo é premium e o usuário não tem acesso
      if (foundGame.status === 'premium' && !hasPaidPlan) {
        if (!isAuthenticated) {
          setIsLoginModalOpen(true);
        } else {
          // Redirecionar para página de planos
          setIsNavigating(true);
          router.push('/paidPlan');
        }
      }
    } else {
      // Jogo não encontrado, redirecionar para Arena
      router.push('/Arena');
    }
  }, [params.game, hasPaidPlan, isAuthenticated, router]);

  const handleBackToArena = () => {
    setIsNavigating(true);
    router.push('/Arena');
  };

  // Função para lidar com a conclusão do jogo
  const handleGameComplete = (score: { correct: number; total: number }) => {
    console.log('Jogo finalizado!', score);
    // Aqui você pode adicionar lógica para salvar o score, mostrar modal, etc.
  };

  // Obter o componente do jogo dinamicamente
  const GameComponent = game ? getGameComponent(game.slug) : null;

  if (isNavigating || !game) {
    return <LoadingScreen message="Carregando jogo..." />;
  }

  // Se o jogo é premium e o usuário não tem acesso, não renderizar
  if (game.status === 'premium' && !hasPaidPlan) {
    return null;
  }

  return (
    <div className="themed-main-container min-h-screen force-themed-bg flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
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

        {/* Game Container - Aqui será renderizado o componente do jogo */}
        <div className="w-full min-h-[600px] flex flex-col bg-transparent">
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
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
                >
                  Voltar para Arena
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Footer */}
      <Footer />
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        redirectTo={`/Arena/${game.slug}`} 
      />
    </div>
  );
}
