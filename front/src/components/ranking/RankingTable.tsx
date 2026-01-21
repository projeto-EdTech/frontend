"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import { BookOpen, Medal, Award, Crown } from "lucide-react";

// --- CONSTANTES ---
const ITEMS_PER_PAGE = 20;

// --- TIPAGENS ---
export type UserRanking = {
  position: number;
  name: string;
  score: number;
  rank: 'Ouro' | 'Prata' | 'Bronze' | 'Diamante';
  isCurrentUser?: boolean;
};

export type FilterOption = {
  id: string;
  name: string;
};

interface RankingTableProps {
  rankingData: UserRanking[];
  isLoading: boolean;
  currentUniversity?: FilterOption;
  currentPeriod?: FilterOption;
  activeUniversityFilter: string;
  activePeriodFilter: string;
  onResetFilters: () => void;
}

// --- FUNÇÕES AUXILIARES DE UI ---
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

export default function RankingTable({
  rankingData,
  isLoading,
  currentUniversity,
  currentPeriod,
  activeUniversityFilter,
  activePeriodFilter,
  onResetFilters,
}: RankingTableProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular dados da página atual
  const totalPages = Math.ceil(rankingData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = rankingData.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <motion.div 
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`rounded-[28px] shadow-lg border p-12 ${
          theme === 'dark'
            ? 'bg-[#1d1d1f]/90 border-white/5'
            : 'bg-white/90 border-black/5'
        }`}
      >
        <LoadingScreen message={`Carregando ranking para ${currentUniversity?.name}...`} />
      </motion.div>
    );
  }

  if (rankingData.length === 0) {
    return (
      <motion.div 
        key="empty"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center rounded-[28px] p-12 shadow-lg border relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#1d1d1f]/90 border-white/5'
            : 'bg-white/90 border-black/5'
        }`}
      >
        {/* Mascote de incentivo */}
        <div className="absolute -top-6 -left-6 hidden lg:block opacity-80">
          <Image 
            src="/Mascote/banners/Camaleão_12.png" 
            alt="Mascote pensativo" 
            width={140} 
            height={140}
            className="drop-shadow-2xl transform rotate-12"
          />
        </div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className={`w-24 h-24 rounded-[12px] flex items-center justify-center mx-auto mb-6 ${
            theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
          }`}>
            <Trophy className={`w-12 h-12 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </div>
          
          <h3 className={`text-3xl font-semibold tracking-tight mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
          }`}>Ranking em Construção</h3>
          
          <p className={`mb-8 leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Ainda não há competidores para <span className={`font-semibold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>{currentUniversity?.name}</span> no período <span className={`font-semibold ${
              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`}>{currentPeriod?.name}</span>. 
            Seja o primeiro a participar desta competição!
          </p>

          <div className="space-y-3">
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/library')}
              className={`w-full py-4 px-8 rounded-[12px] font-semibold transition-all duration-300 shadow-md ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Iniciar Primeiro Simulado</span>
              </div>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onResetFilters}
              className={`w-full font-semibold py-3 px-6 rounded-[12px] border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-black/5'
              }`}
            >
              Ver Ranking Geral
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      key="table"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-[28px] shadow-lg border overflow-hidden relative ${
        theme === 'dark'
          ? 'bg-[#1d1d1f]/90 border-white/5'
          : 'bg-white/90 border-black/5'
      }`}
    >
      {/* Mascote observando */}
      <div className="absolute top-0 right-40 hidden xl:block z-10 opacity-90">
        <Image 
          src="/Mascote/banners/Camaleão_21.png" 
          alt="Mascote observando" 
          width={85} 
          height={85}
          className="drop-shadow-xl"
        />
      </div>
      
      {/* Header da tabela */}
      <div className={`px-8 py-6 border-b ${
        theme === 'dark'
          ? 'bg-[#1d1d1f] border-white/5'
          : 'bg-white border-black/5'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-2xl font-semibold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
            }`}>Ranking de Competidores</h3>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>{rankingData.length} competidores • {currentUniversity?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Atualizado</p>
              <p className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
              }`}>Agora mesmo</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`border-b ${
            theme === 'dark'
              ? 'bg-white/5 border-white/5'
              : 'bg-gray-50 border-black/5'
          }`}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Posição</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Competidor</th>
              <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider hidden sm:table-cell ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Nível</th>
              <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Pontos</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            theme === 'dark' ? 'divide-white/5' : 'divide-black/5'
          }`}>
            {currentPageData.map((user, index) => (
              <motion.tr 
                key={`${activeUniversityFilter}-${activePeriodFilter}-${user.position}`} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`transition-all duration-300 ${
                  user.isCurrentUser 
                    ? (theme === 'dark'
                      ? 'bg-blue-500/10 border-l-4 border-l-blue-500'
                      : 'bg-blue-50 border-l-4 border-l-blue-500')
                    : (theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50')
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {user.position <= 3 ? (
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="transition-transform duration-200"
                      >
                        {getPositionBadge(user.position)}
                      </motion.div>
                    ) : (
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
                      }`}>
                        <span className={`font-semibold text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>{user.position}</span>
                      </div>
                    )}
                    {/* Trending indicator para top performers */}
                    {user.position <= 10 && (
                      <div className="ml-2">
                        <div className="w-1 h-6 bg-gradient-to-t from-green-400 to-green-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <UserAvatar name={user.name} className="w-12 h-12 text-lg shadow-sm" />
                      {user.isCurrentUser && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          
                        </div>
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold flex items-center gap-2 ${
                        theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
                      }`}>
                        {user.name}
                        {user.isCurrentUser && (
                          <span className="sr-only">Você</span>
                        )}
                      </div>
                      {user.position <= 10 && (
                        <p className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}>🔥 Top Performer</p>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-center hidden sm:table-cell">
                  <div className="inline-flex items-center gap-2">
                    {getRankIcon(user.rank)}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRankBadgeColor(user.rank)}`}>
                      {user.rank}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {user.score.toLocaleString()}
                    </span>
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>pts</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer da tabela com paginação */}
      <div className={`px-8 py-6 border-t ${
        theme === 'dark'
          ? 'bg-white/5 border-white/5'
          : 'bg-gray-50 border-black/5'
      }`}>
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {/* Info esquerda */}
          <div className="flex items-center gap-4 text-sm">
            <span>Mostrando {startIndex + 1}–{Math.min(endIndex, rankingData.length)} de {rankingData.length}</span>
            <div className="flex items-center gap-2">
              <span>Ranking atualizado em tempo real</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Controles de paginação */}
          <div className="flex items-center gap-3">
            {/* Botão Anterior */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-[8px] font-semibold transition-all duration-200 cursor-pointer ${
                currentPage === 1
                  ? (theme === 'dark' 
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50')
                  : (theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white')
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </motion.button>

            {/* Indicador de página */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-[8px] ${
              theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
            }`}>
              <span className="font-semibold">{currentPage}</span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>/</span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{totalPages}</span>
            </div>

            {/* Botão Próximo */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-[8px] font-semibold transition-all duration-200 cursor-pointer ${
                currentPage === totalPages
                  ? (theme === 'dark'
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50')
                  : (theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white')
              }`}
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
