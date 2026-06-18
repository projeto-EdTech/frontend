"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/Login-modal";
import { Trophy, BookOpen, Calendar, ChevronDown } from "lucide-react";
import RankingTable, { type UserRanking, type FilterOption } from "@/components/ranking/RankingTable";
import UserRankingCard from "@/components/ranking/UserRankingCard";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { DEV_CONFIG } from "@/lib/data/profile";
import { getRankFromScore } from "@/lib/utils/rankUtils";

type PeriodFilter = 'mensal' | 'semanal' | 'anual';

const PERIOD_OPTIONS: FilterOption[] = [
  { id: 'semanal', name: 'Semanal' },
  { id: 'mensal', name: 'Mensal' },
  { id: 'anual', name: 'Anual' },
];

interface RankingClientProps {
  initialUniversities: FilterOption[];
  initialRankingData: UserRanking[];
}

const getProcessedInitialData = (data: UserRanking[]) => {
  if (DEV_CONFIG.enabled && Array.isArray(data)) {
    const dataCopy = JSON.parse(JSON.stringify(data)) as UserRanking[];
    const currentUser = dataCopy.find((u: any) => u.isCurrentUser);
    if (currentUser) {
      currentUser.score = DEV_CONFIG.devScore;
      currentUser.rank = getRankFromScore(DEV_CONFIG.devScore);
      
      // Re-ordena o array para que a posição fique correta
      dataCopy.sort((a: any, b: any) => b.score - a.score);
      dataCopy.forEach((u: any, index: number) => {
        u.position = index + 1;
      });
    }
    return dataCopy;
  }
  return data;
};

export default function RankingClient({ initialUniversities, initialRankingData }: RankingClientProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { status } = useSession();
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeUniversityFilter, setActiveUniversityFilter] = useState<string>('geral');
  const [activePeriodFilter, setActivePeriodFilter] = useState<PeriodFilter>('mensal');
  
  const [universityDropdownOpen, setUniversityDropdownOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const [isFetchingRanking, setIsFetchingRanking] = useState(false); 
  const [cachedData, setCachedData] = useState<Record<string, UserRanking[]>>(() => ({
    'geral-mensal': getProcessedInitialData(initialRankingData)
  }));
  const [rankingData, setRankingData] = useState<UserRanking[]>(() =>
    getProcessedInitialData(initialRankingData)
  );
  const [currentUser, setCurrentUser] = useState<UserRanking | null>(null);
  
  const universityOptions = useMemo(() => [
    { id: 'geral', name: 'Ranking Geral' },
    ...initialUniversities
  ], [initialUniversities]);

  // Handle authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    }
  }, [status]);

  // Fetch ranking data when filters change
  useEffect(() => {
    const cacheKey = `${activeUniversityFilter}-${activePeriodFilter}`;

    // Skip if we already have the data (including initial data)
    if (cachedData[cacheKey]) {
      setRankingData(cachedData[cacheKey]);
      setIsFetchingRanking(false);
      return;
    }

    const fetchRankingData = async () => {
      setIsFetchingRanking(true);
      try {
        const response = await fetch(`/api/ranking?universidade=${activeUniversityFilter}&periodo=${activePeriodFilter}`);
        if (!response.ok) throw new Error("Falha ao buscar ranking");
        const data = await response.json();
        
        // ━━ DEV MODE: Substitui o score e rank do currentUser se ativado ━━
        if (DEV_CONFIG.enabled && Array.isArray(data)) {
          const currentUser = data.find((u: any) => u.isCurrentUser);
          if (currentUser) {
            currentUser.score = DEV_CONFIG.devScore;
            currentUser.rank = getRankFromScore(DEV_CONFIG.devScore);
            
            // Re-ordena o array para que a posição fique correta
            data.sort((a: any, b: any) => b.score - a.score);
            data.forEach((u: any, index: number) => {
              u.position = index + 1;
            });
          }
        }
        
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
  }, [activePeriodFilter, activeUniversityFilter, cachedData]);

  // Update current user state based on ranking data
  useEffect(() => {
    if (rankingData.length > 0) {
      const user = rankingData.find(u => u.isCurrentUser);
      setCurrentUser(user || null);
    } else {
      setCurrentUser(null);
    }
  }, [rankingData]);

  const handleUniversitySelect = useCallback((universityId: string) => {
    setActiveUniversityFilter(universityId);
    setUniversityDropdownOpen(false);
  }, []);
  
  const handlePeriodSelect = useCallback((periodId: PeriodFilter) => {
    setActivePeriodFilter(periodId);
    setPeriodDropdownOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setActiveUniversityFilter('geral');
    setActivePeriodFilter('mensal');
  }, []);

  const currentUniversity = universityOptions.find(u => u.id === activeUniversityFilter);
  const currentPeriod = PERIOD_OPTIONS.find(p => p.id === activePeriodFilter);

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' ? 'bg-[#1d1d1f]' : 'bg-[#f5f5f7]'
    }`}>
      <Header />
      
      <main className="flex-1 container mx-auto px-6 md:px-8 py-12 md:py-20 max-w-7xl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-20 relative"
        >
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
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`text-lg md:text-xl mb-6 max-w-3xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Veja sua posição entre os <span className={`font-semibold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>melhores estudantes</span> do país
          </motion.p>
        </motion.div>

        {/* User Status Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-4xl mx-auto"
        >
          <UserRankingCard 
            currentUser={currentUser}
            isLoading={isFetchingRanking}
          />
        </motion.div>

        {/* --- SEÇÃO DE FILTROS --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 max-w-5xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-semibold tracking-tight mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
            }`}>Explore os Rankings</h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Filtre por vestibular e período para ver diferentes competições
            </p>
          </div>

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
                  onClick={() => { setUniversityDropdownOpen(!universityDropdownOpen); setPeriodDropdownOpen(false); }}
                  className={`w-full border rounded-[12px] px-4 py-4 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10 border-white/10'
                      : 'bg-gray-50 hover:bg-gray-100 border-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentUniversity?.id === 'geral' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[12px] flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div>
                        <span className={`font-semibold text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
                        }`}>
                          {currentUniversity?.name || "Selecione..."}
                        </span>
                        {currentUniversity?.id === 'geral' && (
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

                <AnimatePresence>
                  {universityDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`absolute z-30 w-full mt-2 border rounded-[12px] shadow-xl max-h-64 overflow-y-auto ${
                        theme === 'dark'
                          ? 'bg-[#1d1d1f] border-white/10'
                          : 'bg-white border-black/5'
                      }`}
                    >
                      <div className="p-2">
                        {universityOptions.map((uni) => (
                          <motion.button
                            key={uni.id}
                            whileHover={{ x: 4 }}
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
                              <span className="font-semibold text-sm">{uni.name}</span>
                              {activeUniversityFilter === uni.id && (
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  className={`w-full border rounded-[12px] px-4 py-4 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 cursor-pointer ${
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

                <AnimatePresence>
                  {periodDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`absolute z-30 w-full mt-2 border rounded-[12px] shadow-xl max-h-64 overflow-y-auto ${
                        theme === 'dark'
                          ? 'bg-[#1d1d1f] border-white/10'
                          : 'bg-white border-black/5'
                      }`}
                    >
                      <div className="p-2">
                        {PERIOD_OPTIONS.map((period) => (
                          <motion.button
                            key={period.id}
                            whileHover={{ x: 4 }}
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
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

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
                    onClick={handleResetFilters}
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
        </motion.div>
        
        {/* Tabela de Ranking */}
        <AnimatePresence mode="wait">
          <RankingTable
            rankingData={rankingData}
            isLoading={isFetchingRanking}
            currentUniversity={currentUniversity}
            currentPeriod={currentPeriod}
            activeUniversityFilter={activeUniversityFilter}
            activePeriodFilter={activePeriodFilter}
            onResetFilters={handleResetFilters}
          />
        </AnimatePresence>
        
        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[28px] shadow-lg"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
          
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

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/library')}
                  className="bg-white hover:bg-gray-100 text-blue-700 font-semibold py-4 px-8 rounded-[12px] transition-all duration-300 shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Fazer Novo Simulado</span>
                  </div>
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/profile')}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-[12px] border border-white/20 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <span>Meus Resultados</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />

      {(universityDropdownOpen || periodDropdownOpen) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => { setUniversityDropdownOpen(false); setPeriodDropdownOpen(false); }}
        />
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/ranking"
        isRequired={status === 'unauthenticated'}
      />
    </div>
  );
}
