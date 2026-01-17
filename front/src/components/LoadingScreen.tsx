"use client";

import { useEffect, useState } from "react";

type LoadingScreenProps = {
  message?: string;
};

const LoadingScreen = ({ message = "Carregando vestibulares" }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simula progresso suave de 0 a 95%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 95);
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* Grid pattern refinado */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      
      {/* Background com gradientes animados orgânicos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[128px] animate-blob"></div>
        <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[128px] animate-blob-delayed-2"></div>
        <div className="absolute -bottom-24 left-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[128px] animate-blob-delayed-4"></div>
      </div>

      {/* Container principal com glassmorphism refinado */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
        {/* Card com efeito glass premium */}
        <div className="relative backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] rounded-[32px] p-8 sm:p-12 shadow-2xl max-w-md w-full">
          {/* Glow superior sutil */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          {/* Container do mascote com glow refinado */}
          <div className="relative mb-8 flex justify-center">
            <div className="relative w-60 h-60">
              {/* Glow effect gradiente */}
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-indigo-500/20 rounded-full blur-3xl animate-glow"></div>
              
              {/* Container do vídeo com borda suave */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
                <video
                  src="/Mascote/Animações/Camaleão_animate_looping.mp4"
                  className="w-full h-full object-contain scale-180"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Mascote animado do Vestibuline"
                >
                </video>
              </div>
            </div>
          </div>

          {/* Título com gradiente */}
          <h2 className="text-3xl font-bold text-center mb-2 bg-clip-text text-shadow-gray-500 tracking-tight leading-tight">
            {message}
          </h2>

          {/* Subtítulo elegante */}
          <p className="text-slate-400 text-center mb-8 text-sm font-medium">
            Preparando sua experiência...
          </p>

          {/* Barra de progresso refinada */}
          <div className="space-y-3">
            {/* Container da barra */}
            <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
              {/* Barra de progresso com gradiente */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                
                {/* Glow na ponta da barra */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-violet-400/50 rounded-full blur-xl"></div>
              </div>
            </div>
            
            {/* Indicador de porcentagem com dots */}
            <div className="flex items-center justify-center gap-2.5 text-xs font-mono">
              <span className="tabular-nums text-slate-300 font-medium">{Math.round(progress)}%</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse-dot"></div>
                <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse-dot-delayed-1"></div>
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse-dot-delayed-2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Marca Vestibuline discreta e refinada */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-400 font-semibold tracking-[0.2em] mb-1.5">
            vestibuline
          </p>
          <p className="text-[10px] text-slate-500 tracking-wide">
            Plataforma de Simulados
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, -60px) scale(1.15);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .animate-shimmer {
          animation: shimmer 2.5s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }

        .animate-blob-delayed-2 {
          animation: blob 9s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-blob-delayed-4 {
          animation: blob 10s ease-in-out infinite;
          animation-delay: 4s;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .animate-pulse-dot {
          animation: pulse-dot 1.6s ease-in-out infinite;
        }

        .animate-pulse-dot-delayed-1 {
          animation: pulse-dot 1.6s ease-in-out infinite;
          animation-delay: 200ms;
        }

        .animate-pulse-dot-delayed-2 {
          animation: pulse-dot 1.6s ease-in-out infinite;
          animation-delay: 400ms;
        }

        /* Otimização de performance */
        .animate-shimmer,
        .animate-blob,
        .animate-blob-delayed-2,
        .animate-blob-delayed-4,
        .animate-glow,
        .animate-pulse-dot,
        .animate-pulse-dot-delayed-1,
        .animate-pulse-dot-delayed-2 {
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;