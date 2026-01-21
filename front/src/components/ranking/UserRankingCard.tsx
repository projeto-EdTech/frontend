"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award, Crown, BookOpen, ShieldCheck } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- TIPAGENS ---
export type UserRanking = {
  position: number;
  name: string;
  score: number;
  rank: 'Ouro' | 'Prata' | 'Bronze' | 'Diamante';
  isCurrentUser?: boolean;
};

interface UserRankingCardProps {
  currentUser: UserRanking | null;
  isLoading: boolean;
}

// --- CONSTANTES ---
const RANK_THRESHOLDS: { name: UserRanking['rank'], minScore: number }[] = [
  { name: 'Bronze', minScore: 0 },
  { name: 'Prata', minScore: 10000 },
  { name: 'Ouro', minScore: 25000 },
  { name: 'Diamante', minScore: 50000 },
];

// --- FUNÇÕES AUXILIARES ---
const getRankProgress = (user: UserRanking) => {
  const currentRankIndex = RANK_THRESHOLDS.findIndex(r => r.name === user.rank);
  
  // Se o usuário já está no rank máximo
  if (currentRankIndex === RANK_THRESHOLDS.length - 1) {
    return {
      progress: 100,
      pointsToNext: 0,
      nextRankName: 'Máximo',
    };
  }

  const currentRank = RANK_THRESHOLDS[currentRankIndex];
  const nextRank = RANK_THRESHOLDS[currentRankIndex + 1];
  
  const scoreInCurrentTier = user.score - currentRank.minScore;
  const tierTotalScore = nextRank.minScore - currentRank.minScore;

  // Garante que o progresso não passe de 100% ou seja negativo
  const progress = Math.max(0, Math.min(100, Math.floor((scoreInCurrentTier / tierTotalScore) * 100)));
  const pointsToNext = nextRank.minScore - user.score;

  return {
    progress,
    pointsToNext: pointsToNext > 0 ? pointsToNext : 0,
    nextRankName: nextRank.name,
  };
};

const getRankIcon = (rank: string) => {
  switch (rank) {
    case 'Diamante': return <Crown className="w-5 h-5 text-cyan-500" />;
    case 'Ouro': return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'Prata': return <Medal className="w-5 h-5 text-gray-400" />;
    case 'Bronze': return <Award className="w-5 h-5 text-orange-600" />;
    default: return null;
  }
};

const getRankBadgeColor = (rank: string) => {
  switch (rank) {
    case 'Diamante': return 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200';
    case 'Ouro': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200';
    case 'Prata': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200';
    case 'Bronze': return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getPositionBadge = (position: number) => {
  if (position === 1) return <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg"><span className="text-white font-bold text-lg">🥇</span></div>;
  if (position === 2) return <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full shadow-lg"><span className="text-white font-bold text-lg">🥈</span></div>;
  if (position === 3) return <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg"><span className="text-white font-bold text-lg">🥉</span></div>;
  return <div className="flex items-center justify-center w-10 h-10 force-themed-card rounded-full border-2 themed-border"><span className="themed-text font-bold text-sm">#{position}</span></div>;
};

export default function UserRankingCard({ currentUser, isLoading }: UserRankingCardProps) {
  const { theme } = useTheme();
  const router = useRouter();

  // Loading state
  if (isLoading) {
    return (
      <div className={`rounded-[28px] p-10 shadow-lg border animate-pulse ${
        theme === 'dark'
          ? 'bg-[#1d1d1f]/90 border-white/5'
          : 'bg-white/90 border-black/5'
      }`}>
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-full ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
          <div className="flex-1 space-y-3">
            <div className={`h-6 rounded-lg w-1/3 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            <div className={`h-4 rounded w-2/3 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            <div className={`h-3 rounded-full w-full ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          </div>
        </div>
      </div>
    );
  }

  // User without ranking - encourage to start
  if (!currentUser) {
    return (
      <div className={`relative overflow-hidden rounded-[28px] p-10 md:p-12 text-center shadow-lg border ${
        theme === 'dark'
          ? 'bg-[#1d1d1f]/90 border-white/5'
          : 'bg-white/90 border-black/5'
      }`}>
        {/* Mascote */}
        <div className="absolute top-4 right-4 hidden md:block opacity-90">
          <Image 
            src="/Mascote/banners/Camaleão_6.png" 
            alt="Mascote animado" 
            width={100} 
            height={100}
            className="drop-shadow-xl"
          />
        </div>
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-[12px] shadow-md ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50/80 border border-blue-200/50'
            }`}>
              <ShieldCheck className={`w-10 h-10 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
          
          <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
          }`}>
            Comece Sua Jornada no Ranking
          </h2>
          
          <p className={`mb-8 max-w-md mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Complete seu primeiro simulado e entre para a <span className={`font-semibold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>competição nacional</span>. 
            Milhares de estudantes já estão participando!
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
            <div className="text-center">
              <p className={`text-2xl font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>1,247</p>
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Competidores</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-semibold ${
                theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
              }`}>15,892</p>
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Simulados</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-semibold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>94%</p>
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Satisfação</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/library')}
              className={`w-full py-4 px-8 rounded-[12px] font-semibold transition-all duration-300 shadow-md cursor-pointer ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span>Fazer Meu Primeiro Simulado</span>
              </div>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full font-semibold py-3 px-6 rounded-[12px] border transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-black/5'
              }`}>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Ver Como Funciona o Ranking</span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // User with ranking - show position card
  const rankProgress = getRankProgress(currentUser);

  return (
    <div className={`relative overflow-hidden rounded-[28px] p-10 md:p-12 shadow-lg border ${
      theme === 'dark'
        ? 'bg-[#1d1d1f]/90 border-white/5'
        : 'bg-white/90 border-black/5'
    }`}>
      
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              {getPositionBadge(currentUser.position)}
            </div>
            <div>
              <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
              }`}>
                Sua Posição Atual
              </h2>
              <p className={`font-medium text-sm ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {currentUser.position <= 10 ? '🔥 Top 10!' : currentUser.position <= 50 ? '⭐ Top 50!' : '💪 Continue assim!'}
              </p>
            </div>
          </div>
          
          {/* Badge */}
          <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-semibold shadow-md ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'bg-gradient-to-br from-blue-50 to-blue-100/80 text-blue-600 border border-blue-200/50'
          }`}>
            <Trophy className="w-4 h-4" />
            <span>Competidor Ativo</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className={`rounded-[24px] p-5 border shadow-md ${
            theme === 'dark'
              ? 'bg-white/5 border-white/10'
              : 'bg-gray-50/50 border-black/5'
          }`}>
            <div className="text-center">
              <p className={`text-sm font-semibold mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Posição</p>
              <p className={`text-2xl font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>#{currentUser.position}</p>
            </div>
          </div>
          
          <div className={`rounded-[24px] p-5 border shadow-md ${
            theme === 'dark'
              ? 'bg-white/5 border-white/10'
              : 'bg-gray-50/50 border-black/5'
          }`}>
            <div className="text-center">
              <p className={`text-sm font-semibold mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Pontuação</p>
              <p className={`text-2xl font-semibold ${
                theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
              }`}>{currentUser.score.toLocaleString()}</p>
            </div>
          </div>
          
          <div className={`rounded-[24px] p-5 border shadow-md ${
            theme === 'dark'
              ? 'bg-white/5 border-white/10'
              : 'bg-gray-50/50 border-black/5'
          }`}>
            <div className="text-center">
              <p className={`text-sm font-semibold mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Rank Atual</p>
              <div className="flex items-center justify-center gap-2">
                {getRankIcon(currentUser.rank)}
                <span className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
                }`}>{currentUser.rank}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`rounded-[24px] p-6 border shadow-md ${
          theme === 'dark'
            ? 'bg-white/5 border-white/10'
            : 'bg-gray-50/50 border-black/5'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-[12px] text-sm font-semibold border ${getRankBadgeColor(currentUser.rank)}`}>
                {getRankIcon(currentUser.rank)}
                {currentUser.rank}
              </span>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Próximo Rank</p>
              <p className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>{rankProgress.nextRankName}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className={`w-full rounded-full h-3 overflow-hidden ${
              theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${rankProgress.progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>{rankProgress.progress}% completo</span>
              <span className={`font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {rankProgress.pointsToNext > 0 
                  ? `${rankProgress.pointsToNext.toLocaleString()} pontos restantes`
                  : `🎉 Rank máximo alcançado!`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button 
            onClick={() => router.push('/library')}
            className={`flex-1 py-3.5 px-6 rounded-[12px] font-semibold transition-all duration-300 shadow-md cursor-pointer ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>Fazer Novo Simulado</span>
            </div>
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className={`flex-1 font-semibold py-3.5 px-6 rounded-[12px] border transition-all duration-300 cursor-pointer ${
              theme === 'dark'
                ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-black/5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" />
              <span>Ver Histórico</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
