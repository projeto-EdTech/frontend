import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trophy, Medal, Crown, ShieldCheck, BookOpen } from 'lucide-react';

export type UserRankingData = {
  position: number;
  name: string;
  score: number;
  rank: 'Ouro' | 'Prata' | 'Bronze' | 'Diamante';
  isCurrentUser?: boolean;
};

interface UserRankingProps {
  rankingData: UserRankingData | null;
  isLoading: boolean;
}

const getPositionBadge = (position: number) => {
  if (position === 1) return <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg"><Crown className="w-6 h-6 text-white" /></div>;
  if (position === 2) return <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg"><Medal className="w-6 h-6 text-white" /></div>;
  if (position === 3) return <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg"><Medal className="w-6 h-6 text-white" /></div>;
  return <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg text-white font-bold">#{position}</div>;
};

const getRankIcon = (rank: string) => {
  switch (rank) {
    case 'Diamante': return <Crown className="w-4 h-4 text-blue-600" />;
    case 'Ouro': return <Medal className="w-4 h-4 text-yellow-600" />;
    case 'Prata': return <Medal className="w-4 h-4 text-gray-500" />;
    case 'Bronze': return <Medal className="w-4 h-4 text-orange-600" />;
    default: return <Trophy className="w-4 h-4 text-gray-400" />;
  }
};

const getRankBadgeColor = (rank: string) => {
  switch (rank) {
    case 'Diamante': return 'text-blue-700 border-blue-300 bg-blue-50';
    case 'Ouro': return 'text-yellow-700 border-yellow-300 bg-yellow-50';
    case 'Prata': return 'text-gray-700 border-gray-300 bg-gray-50';
    case 'Bronze': return 'text-orange-700 border-orange-300 bg-orange-50';
    default: return 'text-gray-700 border-gray-300 bg-gray-50';
  }
};

const getRankProgress = (user: UserRankingData) => {
  const rankThresholds = {
    'Bronze': { min: 0, max: 1000, next: 'Prata' },
    'Prata': { min: 1000, max: 2500, next: 'Ouro' },
    'Ouro': { min: 2500, max: 5000, next: 'Diamante' },
    'Diamante': { min: 5000, max: Infinity, next: 'Máximo' }
  };
  
  const current = rankThresholds[user.rank];
  const progress = current.max === Infinity ? 100 : Math.min(((user.score - current.min) / (current.max - current.min)) * 100, 100);
  const pointsToNext = current.max === Infinity ? 0 : Math.max(current.max - user.score, 0);
  
  return {
    progress: Math.round(progress),
    pointsToNext,
    nextRankName: current.next
  };
};

const UserRanking: React.FC<UserRankingProps> = ({ rankingData, isLoading }) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center">
            <Image 
              src="/Mascote/banners/Camaleão_15.png" 
              alt="Carregando..." 
              width={64}
              height={64}
              className="object-contain animate-spin"
              style={{ animationDuration: '3s' }}
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rankingData) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-3xl p-8 text-center shadow-2xl border border-white/20">
        <div className="relative z-10">
          {/* Mascote motivacional */}
          <div className="flex justify-center mb-4">
            <Image 
              src="/Mascote/banners/Camaleão_8.png" 
              alt="Mascote motivacional" 
              width={120}
              height={120}
              className="object-contain drop-shadow-xl animate-bounce"
            />
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full shadow-lg">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                Entre para o Ranking Nacional
              </h2>
              <p className="text-sm text-gray-600">
                Complete seu primeiro simulado e dispute com milhares de estudantes!
              </p>
            </div>
          </div>

          <button 
            onClick={() => router.push('/library')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>Fazer Meu Primeiro Simulado</span>
              <span className="text-blue-200">→</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    // Card premium para usuário no ranking - Versão Compacta para Destaque
    <div className="relative overflow-hidden bg-white rounded-xl p-6 shadow-2xl border border-gray-200">
      {/* Elemento decorativo de fundo */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-full -translate-y-24 translate-x-24"></div>
      
      {/* Mascote comemorativo no canto */}
      <div className="absolute top-0 right-25 z-20">
        <Image 
          src={
            rankingData.position === 1 ? "/Mascote/banners/Camaleão_12.png" :
            rankingData.position <= 3 ? "/Mascote/banners/Camaleão_8.png" :
            rankingData.position <= 10 ? "/Mascote/banners/Camaleão_29.png" :
            "/Mascote/banners/Camaleão_10.png"
          }
          alt="Mascote comemorativo" 
          width={90}
          height={90}
          className="object-contain drop-shadow-xl transform hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      {/* Header com posição e conquista */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="transform hover:scale-110 transition-transform duration-300">
              {getPositionBadge(rankingData.position)}
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                Sua Posição no Ranking Nacional
              </h2>
              <p className="text-blue-600 font-medium text-sm">
                {rankingData.position <= 10 ? '🔥 Top 10 Nacional!' : rankingData.position <= 50 ? '⭐ Top 50 Nacional!' : '💪 Continue escalando!'}
              </p>
            </div>
          </div>
          
          {/* Badge de conquista */}
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            <Trophy className="w-4 h-4" />
            <span>#{rankingData.position}</span>
          </div>
        </div>

        {/* Estatísticas principais em linha */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white backdrop-blur-sm rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all duration-300 text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">Posição</p>
            <p className="text-lg font-bold text-blue-600">#{rankingData.position}</p>
          </div>
          
          <div className="bg-white backdrop-blur-sm rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all duration-300 text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">Pontuação</p>
            <p className="text-lg font-bold text-indigo-600">{rankingData.score.toLocaleString()}</p>
          </div>
          
          <div className="bg-white backdrop-blur-sm rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all duration-300 text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">Rank</p>
            <div className="flex items-center justify-center gap-1">
              {getRankIcon(rankingData.rank)}
              <span className="text-sm font-bold text-gray-900">{rankingData.rank}</span>
            </div>
          </div>
        </div>

        {/* Barra de progresso destacada */}
        <div className="bg-white backdrop-blur-sm rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getRankBadgeColor(rankingData.rank)}`}>
                {getRankIcon(rankingData.rank)}
                {rankingData.rank}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-600">Próximo</p>
              <p className="text-xs font-bold text-blue-600">{getRankProgress(rankingData).nextRankName}</p>
            </div>
          </div>
          
          {/* Barra de progresso com animação */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                style={{ width: `${getRankProgress(rankingData).progress}%` }}
              >
                {/* Efeito de brilho animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs">
              <span className="text-gray-500 font-medium">{getRankProgress(rankingData).progress}% completo</span>
              <span className="text-gray-700 font-semibold">
                {getRankProgress(rankingData).pointsToNext > 0 
                  ? `${getRankProgress(rankingData).pointsToNext.toLocaleString()} pts restantes`
                  : `🎉 Rank máximo!`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRanking;
