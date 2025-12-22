"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trophy, Medal, Award, Crown, BookOpen, Calendar, ChevronDown, ShieldCheck } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import UserAvatar from "@/components/UserAvatar";
import Image from "next/image";

// --- TIPAGENS ---
type UserRanking = {
  position: number;
  name: string;
  score: number;
  rank: 'Ouro' | 'Prata' | 'Bronze' | 'Diamante';
  isCurrentUser?: boolean;
};

// Tipo para as opções dos filtros, sejam estáticas ou dinâmicas
type FilterOption = {
  id: string;
  name: string;
};

type PeriodFilter = 'mensal' | 'semanal' | 'anual';

// Opções de período podem continuar estáticas pois raramente mudam
const PERIOD_OPTIONS: FilterOption[] = [
  { id: 'semanal', name: 'Semanal' },
  { id: 'mensal', name: 'Mensal' },
  { id: 'anual', name: 'Anual' },
];

export default function RankingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeUniversityFilter, setActiveUniversityFilter] = useState<string>('geral');
  const [activePeriodFilter, setActivePeriodFilter] = useState<PeriodFilter>('mensal');
  
  const [universityDropdownOpen, setUniversityDropdownOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  // Estados para carregar dinamicamente os filtros de universidade
  const [universityOptions, setUniversityOptions] = useState<FilterOption[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Estados para os dados da tabela de ranking
  const [isFetchingRanking, setIsFetchingRanking] = useState(true); 
  const [cachedData, setCachedData] = useState<Record<string, UserRanking[]>>({});
  const [rankingData, setRankingData] = useState<UserRanking[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRanking | null>(null);
  
  // --- EFEITOS (HOOKS) ---

  // Efeito para buscar a LISTA de vestibulares da API (executa apenas uma vez)
  useEffect(() => {
async function fetchUniversityFilters() {
    try {
      const response = await fetch('/api/universities');
      if (!response.ok) throw new Error("Falha ao buscar vestibulares");
      
      // 1. Recebe os dados da API com a tipagem correta (usando 'slug')
      const apiData: { slug: string, name: string }[] = await response.json();

      // 2. Mapeia os dados da API para o formato que o componente espera ('id' e 'name')
      const formattedData: FilterOption[] = apiData.map(university => ({
        id: university.slug, // Transforma 'slug' em 'id'
        name: university.name,
      }));
      
      // 3. Usa os dados já formatados para definir o estado
      setUniversityOptions([
        { id: 'geral', name: 'Ranking Geral' },
        ...formattedData
      ]);
    } catch (error) {
      console.error("Erro ao carregar filtros de universidade:", error);
      setUniversityOptions([{ id: 'geral', name: 'Ranking Geral' }]);
    } finally {
      setFiltersLoading(false);
    }
  }
  fetchUniversityFilters();
}, []); // Array de dependências vazio não muda

  // Efeito para buscar os DADOS do ranking quando um filtro é alterado
  useEffect(() => {
    // Não executa a busca se os filtros ainda não foram carregados
    if (filtersLoading) return;

    const fetchRankingData = async () => {
      const cacheKey = `${activeUniversityFilter}-${activePeriodFilter}`;

      if (cachedData[cacheKey]) {
        setRankingData(cachedData[cacheKey]);
        setIsFetchingRanking(false);
        return;
      }

      setIsFetchingRanking(true);
      try {
        // A chamada para a API de ranking permanece a mesma, usando os filtros ativos
        const response = await fetch(`/api/ranking?universidade=${activeUniversityFilter}&periodo=${activePeriodFilter}`);
        if (!response.ok) throw new Error("Falha ao buscar ranking");
        const data = await response.json();
        
        setCachedData(prevCache => ({ ...prevCache, [cacheKey]: data }));
        setRankingData(data);
      } catch (error) {
        console.error(`Falha ao buscar dados do ranking para ${cacheKey}:`, error);
        setRankingData([]);
      } finally {
        setIsFetchingRanking(false);
      }
    };

    fetchRankingData();
  }, [activePeriodFilter, activeUniversityFilter, filtersLoading, cachedData]); // CORREÇÃO: Removido `cachedData` da lista de dependências

  useEffect(() => {
    if (rankingData.length > 0) {
      const user = rankingData.find(u => u.isCurrentUser);
      setCurrentUser(user || null); // Define o usuário ou nulo se não encontrar
    } else {
      setCurrentUser(null);
    }
  }, [rankingData]); // Esta lógica roda sempre que 'rankingData' muda

  // --- FUNÇÕES HANDLER ---
  const handleUniversitySelect = (universityId: string) => {
  setActiveUniversityFilter(universityId);
  setUniversityDropdownOpen(false); // Adicionado para fechar o dropdown
};
  
  const handlePeriodSelect = (periodId: PeriodFilter) => {
    setActivePeriodFilter(periodId);
    setPeriodDropdownOpen(false);
  };

  const currentUniversity = universityOptions.find(u => u.id === activeUniversityFilter);
  const currentPeriod = PERIOD_OPTIONS.find(p => p.id === activePeriodFilter);

  const RANK_THRESHOLDS: { name: UserRanking['rank'], minScore: number }[] = [
    { name: 'Bronze', minScore: 0 },
    { name: 'Prata', minScore: 10000 },
    { name: 'Ouro', minScore: 25000 },
    { name: 'Diamante', minScore: 50000 },
  ];

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
      pointsToNext: pointsToNext > 0 ? pointsToNext : 0, // Garante que não mostre pontos negativos
      nextRankName: nextRank.name,
    };
  };

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

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' ? 'bg-[#1d1d1f]' : 'bg-[#f5f5f7]'
    }`}>
      <Header />
      
      <main className="flex-1 container mx-auto px-6 md:px-8 py-12 md:py-20 max-w-7xl">
        {/* Hero Section - macOS Style */}
        <div className="text-center mb-16 md:mb-20 relative">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border ${
              theme === 'dark' 
                ? 'bg-gray-800/80 text-gray-300 border-white/10' 
                : 'bg-gray-100/80 text-gray-700 border-black/5'
            }`}>
              <Trophy className="w-4 h-4" />
              <span>Competição Nacional</span>
            </div>
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
            }`}>
              Ranking de Competidores
            </h1>
            <p className={`text-lg md:text-xl mb-6 max-w-3xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Veja sua posição entre os <span className={`font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>melhores estudantes</span> do país
            </p>
        </div>

        {/* User Status Section - macOS Style */}
        <div className="mb-16 max-w-4xl mx-auto">
          {!isFetchingRanking && currentUser ? (
            /* User in ranking card */
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
                      }`}>{getRankProgress(currentUser).nextRankName}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className={`w-full rounded-full h-3 overflow-hidden ${
                      theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                    }`}>
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${getRankProgress(currentUser).progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>{getRankProgress(currentUser).progress}% completo</span>
                      <span className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {getRankProgress(currentUser).pointsToNext > 0 
                          ? `${getRankProgress(currentUser).pointsToNext.toLocaleString()} pontos restantes`
                          : `🎉 Rank máximo alcançado!`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button 
                    onClick={() => router.push('/library')}
                    className={`flex-1 py-3.5 px-6 rounded-[12px] font-semibold transition-all duration-300 shadow-md ${
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
                    className={`flex-1 font-semibold py-3.5 px-6 rounded-[12px] border transition-all duration-300 ${
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
          ) : !isFetchingRanking && !currentUser ? (
            /* User without ranking card */
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
                  <button 
                    onClick={() => router.push('/library')}
                    className={`w-full py-4 px-8 rounded-[12px] font-semibold transition-all duration-300 shadow-md ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <BookOpen className="w-5 h-5" />
                      <span>Fazer Meu Primeiro Simulado</span>
                    </div>
                  </button>
                  
                  <button className={`w-full font-semibold py-3 px-6 rounded-[12px] border transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-black/5'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span>Ver Como Funciona o Ranking</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Loading state */
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
          )}
        </div>

        {/* --- SEÇÃO DE FILTROS --- */}
        <div className="mb-12 max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-semibold tracking-tight mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
            }`}>Explore os Rankings</h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Filtre por vestibular e período para ver diferentes competições
            </p>
          </div>

          {/* Container de filtros */}
          <div className={`rounded-[28px] shadow-lg border p-8 ${
            theme === 'dark'
              ? 'bg-[#1d1d1f]/90 border-white/5'
              : 'bg-white/90 border-black/5'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dropdown de Universidade */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-[12px] ${
                    theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
                  }`}>
                    <BookOpen className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <label className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
                    }`}>Vestibular</label>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Escolha a competição</p>
                  </div>
                </div>
                
                <button
                  onClick={() => { if(!filtersLoading) { setUniversityDropdownOpen(!universityDropdownOpen); setPeriodDropdownOpen(false); }}}
                  disabled={filtersLoading}
                  className={`w-full border rounded-[12px] px-4 py-4 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:cursor-wait ${
                    theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 disabled:bg-white/5'
                      : 'bg-gray-50 hover:bg-gray-100 border-black/5 disabled:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {!filtersLoading && currentUniversity?.id === 'geral' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[12px] flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div>
                        <span className={`font-semibold text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
                        }`}>
                          {filtersLoading ? 'Carregando...' : (currentUniversity?.name || "Selecione...")}
                        </span>
                        {!filtersLoading && currentUniversity?.id === 'geral' && (
                          <p className={`text-xs font-medium ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`}>Competição nacional</p>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-all duration-300 ${universityDropdownOpen ? 'rotate-180' : ''} ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                </button>

                {universityDropdownOpen && (
                  <div className={`absolute z-30 w-full mt-2 border rounded-[12px] shadow-xl max-h-64 overflow-y-auto ${
                    theme === 'dark'
                      ? 'bg-[#1d1d1f] border-white/10'
                      : 'bg-white border-black/5'
                  }`}>
                    <div className="p-2">
                      {universityOptions.map((uni) => (
                        <button
                          key={uni.id}
                          onClick={() => handleUniversitySelect(uni.id)}
                          className={`w-full px-4 py-3 text-left rounded-[12px] transition-all duration-200 ${
                            activeUniversityFilter === uni.id 
                              ? (theme === 'dark'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-blue-50 text-blue-700 border border-blue-200/50')
                              : (theme === 'dark'
                                ? 'text-white hover:bg-white/5'
                                : 'text-[#1d1d1f] hover:bg-gray-50')
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {uni.id === 'geral' && (
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[8px] flex items-center justify-center">
                                  <Trophy className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <span className="font-semibold text-sm">{uni.name}</span>
                            </div>
                            {activeUniversityFilter === uni.id && (
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Dropdown de Período */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-[12px] ${
                    theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'
                  }`}>
                    <Calendar className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                    }`} />
                  </div>
                  <div>
                    <label className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
                    }`}>Período</label>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Intervalo de tempo</p>
                  </div>
                </div>

                <button
                  onClick={() => { setPeriodDropdownOpen(!periodDropdownOpen); setUniversityDropdownOpen(false); }}
                  className={`w-full border rounded-[12px] px-4 py-4 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10 border-white/10'
                      : 'bg-gray-50 hover:bg-gray-100 border-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[12px] flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className={`font-semibold text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
                        }`}>{currentPeriod?.name || "Selecione..."}</span>
                        <p className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                        }`}>Ranking {activePeriodFilter}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-all duration-300 ${periodDropdownOpen ? 'rotate-180' : ''} ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                </button>

                {periodDropdownOpen && (
                  <div className={`absolute z-30 w-full mt-2 border rounded-[12px] shadow-xl max-h-64 overflow-y-auto ${
                    theme === 'dark'
                      ? 'bg-[#1d1d1f] border-white/10'
                      : 'bg-white border-black/5'
                  }`}>
                    <div className="p-2">
                      {PERIOD_OPTIONS.map((period) => (
                        <button
                          key={period.id}
                          onClick={() => handlePeriodSelect(period.id as PeriodFilter)}
                          className={`w-full px-4 py-3 text-left rounded-[12px] transition-all duration-200 ${
                            period.id === activePeriodFilter 
                              ? (theme === 'dark'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50')
                              : (theme === 'dark'
                                ? 'text-white hover:bg-white/5'
                                : 'text-[#1d1d1f] hover:bg-gray-50')
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[8px] flex items-center justify-center">
                                <Calendar className="w-3 h-3 text-white" />
                              </div>
                              <span className="font-semibold text-sm">{period.name}</span>
                            </div>
                            {period.id === activePeriodFilter && (
                              <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Indicador de filtros ativos */}
            <div className={`mt-4 pt-4 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span>Visualizando:</span>
                  <span className={`font-semibold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>{currentUniversity?.name}</span>
                  <span>•</span>
                  <span className={`font-semibold ${
                    theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>{currentPeriod?.name}</span>
                </div>
                {(activeUniversityFilter !== 'geral' || activePeriodFilter !== 'mensal') && (
                  <button 
                    onClick={() => { setActiveUniversityFilter('geral'); setActivePeriodFilter('mensal'); }}
                    className={`text-xs font-medium ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabela de Ranking */}
        {isFetchingRanking ? (
          <div className={`rounded-[28px] shadow-lg border p-12 ${
            theme === 'dark'
              ? 'bg-[#1d1d1f]/90 border-white/5'
              : 'bg-white/90 border-black/5'
          }`}>
            <LoadingScreen message={`Carregando ranking para ${currentUniversity?.name}...`} />
          </div>
        ) : rankingData.length > 0 ? (
          <div className={`rounded-[28px] shadow-lg border overflow-hidden relative ${
            theme === 'dark'
              ? 'bg-[#1d1d1f]/90 border-white/5'
              : 'bg-white/90 border-black/5'
          }`}>
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
                  {rankingData.map((user) => (
                    <tr 
                      key={`${activeUniversityFilter}-${activePeriodFilter}-${user.position}`} 
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
                            <div className="transform hover:scale-110 transition-transform duration-200">
                              {getPositionBadge(user.position)}
                            </div>
                          ) : (
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                              theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
                            }`}>
                              <span className={`font-semibold text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>#{user.position}</span>
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
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className={`font-semibold flex items-center gap-2 ${
                              theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
                            }`}>
                              {user.name}
                              {user.isCurrentUser && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
                                  VOCÊ
                                </span>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer da tabela */}
            <div className={`px-8 py-5 border-t ${
              theme === 'dark'
                ? 'bg-white/5 border-white/5'
                : 'bg-gray-50 border-black/5'
            }`}>
              <div className={`flex items-center justify-between text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span>Mostrando {rankingData.length} competidores</span>
                <div className="flex items-center gap-2">
                  <span>Ranking atualizado em tempo real</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Estado vazio */
          <div className={`text-center rounded-[28px] p-12 shadow-lg border relative overflow-hidden ${
            theme === 'dark'
              ? 'bg-[#1d1d1f]/90 border-white/5'
              : 'bg-white/90 border-black/5'
          }`}>
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
                <button 
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
                </button>
                
                <button 
                  onClick={() => { setActiveUniversityFilter('geral'); setActivePeriodFilter('mensal'); }}
                  className={`w-full font-semibold py-3 px-6 rounded-[12px] border transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-black/5'
                  }`}
                >
                  Ver Ranking Geral
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* CTA Section */}
        <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[28px] shadow-lg">
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
          
          {/* Mascote celebrando */}
          <div className="absolute bottom-0 right-8 hidden lg:block z-20">
            <Image 
              src="/Mascote/banners/Camaleão_8.png" 
              alt="Mascote celebrando" 
              width={220} 
              height={220}
              className="drop-shadow-2xl"
            />
          </div>
          
          <div className="relative z-10 px-8 py-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <Trophy className="w-4 h-4" />
                  <span>Próximo Nível</span>
                </div>
                
                <h3 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
                  Pronto para subir no ranking?
                </h3>
                
                <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
                  Cada simulado é uma oportunidade de melhorar sua posição e se aproximar do seu objetivo. 
                  <span className="font-semibold text-white"> Continue treinando e alcance o topo!</span>
                </p>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-[24px] p-6 border border-white/10">
                  <p className="text-3xl font-semibold text-white">+15%</p>
                  <p className="text-sm text-blue-100 mt-1">Melhoria média</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-[24px] p-6 border border-white/10">
                  <p className="text-3xl font-semibold text-white">24/7</p>
                  <p className="text-sm text-blue-100 mt-1">Disponível sempre</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-[24px] p-6 border border-white/10">
                  <p className="text-3xl font-semibold text-white">∞</p>
                  <p className="text-sm text-blue-100 mt-1">Simulados ilimitados</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/library')}
                  className="bg-white hover:bg-gray-100 text-blue-700 font-semibold py-4 px-8 rounded-[12px] transition-all duration-300 shadow-md"
                >
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Fazer Novo Simulado</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => router.push('/profile')}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-[12px] border border-white/20 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <span>Meus Resultados</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Click outside para fechar dropdowns */}
      {(universityDropdownOpen || periodDropdownOpen) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => { setUniversityDropdownOpen(false); setPeriodDropdownOpen(false); }}
        />
      )}
    </div>
  );
}