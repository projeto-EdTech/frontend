"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Target, Search, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Building, Info, SearchX } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { type CourseResult, type ApiResponse } from '@/lib/dataNotaCorte';

// Define as props que o componente recebe do page.tsx
interface Props {
  userScore: number;
  defaultTargetCourse: string;
}

// --- DADOS MOCKADOS E LÓGICA FORAM REMOVIDOS DAQUI ---


// --- COMPONENTES AUXILIARES ---

/**
 * Skeleton para o card de resultado - ATUALIZADO COM TEMA
 */
const ResultSkeleton: React.FC<{ theme: string }> = ({ theme }) => (
  <div className={`${theme === 'dark' ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/70 border-gray-200/40'} p-5 rounded-xl border shadow-[0_2px_12px_rgba(0,0,0,0.04)] animate-pulse backdrop-blur-md`}>
    <div className="flex justify-between items-center mb-5">
      <div className="space-y-2.5 flex-1">
        <div className={`h-5 ${theme === 'dark' ? 'bg-gray-700/60' : 'bg-gray-200'} rounded-lg w-44`}></div>
        <div className={`h-3.5 ${theme === 'dark' ? 'bg-gray-700/60' : 'bg-gray-200'} rounded w-28`}></div>
      </div>
      <div className={`w-11 h-11 ${theme === 'dark' ? 'bg-gray-700/60' : 'bg-gray-200'} rounded-full`}></div>
    </div>
    <div className="grid grid-cols-3 gap-3 text-center">
        <div className={`h-3.5 ${theme === 'dark' ? 'bg-gray-700/60' : 'bg-gray-200'} rounded-lg w-16 mx-auto`}></div>
        <div className={`h-3.5 ${theme === 'dark' ? 'bg-gray-700/60' : 'bg-gray-200'} rounded-lg w-16 mx-auto`}></div>
        <div className={`h-3.5 ${theme === 'dark' ? 'bg-gray-700/60' : 'bg-gray-200'} rounded-lg w-16 mx-auto`}></div>
    </div>
  </div>
);

/**
 * Card de resultado de curso - ATUALIZADO COM TEMA E DESIGN PROFISSIONAL
 */
const CourseResultCard: React.FC<{ result: CourseResult; theme: string }> = ({ result, theme }) => {
  const isDark = theme === 'dark';
  
  const visuals = {
    approved: {
      icon: CheckCircle,
      iconColor: isDark ? 'text-green-400' : 'text-green-600',
      bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50/70',
      borderColor: isDark ? 'border-green-700/40' : 'border-green-200/40',
      textColor: isDark ? 'text-green-300' : 'text-green-700',
      badgeBg: isDark ? 'bg-green-900/40' : 'bg-green-100',
      label: 'Aprovado',
      gradient: isDark ? 'from-green-900/15 to-transparent' : 'from-green-100/40 to-transparent',
    },
    borderline: {
      icon: AlertTriangle,
      iconColor: isDark ? 'text-yellow-400' : 'text-yellow-600',
      bgColor: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50/70',
      borderColor: isDark ? 'border-yellow-700/40' : 'border-yellow-200/40',
      textColor: isDark ? 'text-yellow-300' : 'text-yellow-700',
      badgeBg: isDark ? 'bg-yellow-900/40' : 'bg-yellow-100',
      label: 'Quase lá',
      gradient: isDark ? 'from-yellow-900/15 to-transparent' : 'from-yellow-100/40 to-transparent',
    },
    reproved: {
      icon: XCircle,
      iconColor: isDark ? 'text-red-400' : 'text-red-600',
      bgColor: isDark ? 'bg-red-900/20' : 'bg-red-50/70',
      borderColor: isDark ? 'border-red-700/40' : 'border-red-200/40',
      textColor: isDark ? 'text-red-300' : 'text-red-700',
      badgeBg: isDark ? 'bg-red-900/40' : 'bg-red-100',
      label: 'Reprovado',
      gradient: isDark ? 'from-red-900/15 to-transparent' : 'from-red-100/40 to-transparent',
    },
  };

  const v = visuals[result.status];
  const Icon = v.icon;

  return (
    <div className={`relative p-5 rounded-xl border ${v.bgColor} ${v.borderColor} shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:scale-[1.02] group`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${v.gradient} opacity-60 group-hover:opacity-80 transition-opacity`}></div>
      
      <div className="relative z-10">
        {/* Header com Badge de Status */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 pr-3">
            <h3 className={`text-lg font-semibold mb-1.5 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {result.courseName}
            </h3>
            <div className="flex items-center gap-1.5">
              <Building size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} strokeWidth={2} />
              <p className={`text-[13px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {result.institution}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${v.badgeBg} ${v.textColor} border ${v.borderColor} shadow-sm`}>
            <Icon size={16} strokeWidth={2} />
            <span>{v.label}</span>
          </div>
        </div>

        {/* Métricas em Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Sua Nota */}
          <div className={`${isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-white/60 border-gray-200/40'} p-3 rounded-lg border text-center transition-all hover:scale-[1.03]`}>
            <p className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Sua Nota
            </p>
            <p className={`text-xl font-semibold tracking-tight ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {result.userScore.toFixed(0)}%
            </p>
          </div>

          {/* Nota de Corte */}
          <div className={`${isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-white/60 border-gray-200/40'} p-3 rounded-lg border text-center transition-all hover:scale-[1.03]`}>
            <p className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Corte
            </p>
            <p className={`text-xl font-semibold tracking-tight ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {result.cutoffScore.toFixed(0)}%
            </p>
          </div>

          {/* Diferença */}
          <div className={`${isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-white/60 border-gray-200/40'} p-3 rounded-lg border text-center transition-all hover:scale-[1.03]`}>
            <p className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Diferença
            </p>
            <p className={`text-xl font-semibold tracking-tight ${result.difference >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
              {result.difference >= 0 ? '+' : ''}{result.difference.toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL ---

const NotaCorteConsulta: React.FC<Props> = ({ userScore, defaultTargetCourse }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [localTargetCourse, setLocalTargetCourse] = useState(defaultTargetCourse);
  const [localTargetInstitution, setLocalTargetInstitution] = useState(''); // Novo estado para instituição
  const [filters, setFilters] = useState({ area: 'todas', institution: 'todas' });
  const [sortBy, setSortBy] = useState('probability');
  
  const [allResults, setAllResults] = useState<CourseResult[]>([]);
  const [targetCourseResults, setTargetCourseResults] = useState<CourseResult[]>([]); // Agora é um array
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const COURSES_PER_PAGE = 10;
  
  // Referência para scroll ao mudar de página
  const approvedSectionRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  // *** INÍCIO DAS ALTERAÇÕES ***
  // Estados para as listas de filtros (agora vêm da API)
  const [availableAreas, setAvailableAreas] = useState<string[]>(['todas']);
  const [institutionOptions, setInstitutionOptions] = useState<string[]>(['todas']);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(true); // Controla o loading do <select>
  // *** FIM DAS ALTERAÇÕES ***

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Função principal de consulta (MODIFICADA)
   */
  const handleConsult = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      // *** INÍCIO DAS ALTERAÇÕES ***
      // Esta é a chamada de API real para o endpoint que criamos
      const apiResponse = await fetch('/api/Nota-corte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userScore: userScore,
          targetCourse: localTargetCourse,
          targetInstitution: localTargetInstitution || undefined // Inclui instituição se preenchida
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || `Falha ao consultar notas (${apiResponse.status})`);
      }
      
      const response: ApiResponse = await apiResponse.json();

      setTargetCourseResults(response.targetCourseResults);
      setAllResults(response.allResults);
      // Atualiza os estados dos filtros com os dados da API
      setAvailableAreas(response.availableAreas);
      // *** FIM DAS ALTERAÇÕES ***

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Memo para filtrar e ordenar os resultados da lista (Sem alterações na lógica)
   */
  const filteredAndSortedResults = useMemo(() => {
    let results = allResults.filter(r => r.status === 'approved'); 

    if (filters.area !== 'todas') {
      results = results.filter(r => r.area === filters.area);
    }
    if (filters.institution !== 'todas') {
      results = results.filter(r => r.institution === filters.institution);
    }

    if (sortBy === 'probability') {
      results.sort((a, b) => b.difference - a.difference);
    } else if (sortBy === 'cutoff') {
      results.sort((a, b) => b.cutoffScore - a.cutoffScore);
    }

    return results;
  }, [allResults, filters, sortBy]);

  /**
   * Memo para paginação dos resultados
   */
  const { paginatedResults, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredAndSortedResults.length / COURSES_PER_PAGE);
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    const endIndex = startIndex + COURSES_PER_PAGE;
    const paginatedResults = filteredAndSortedResults.slice(startIndex, endIndex);
    
    return { paginatedResults, totalPages };
  }, [currentPage, filteredAndSortedResults]);

  /**
   * Effect para scroll ao mudar de página (cursos aprovados)
   */
  useEffect(() => {
    // Impede o scroll no carregamento inicial da página
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Se a referência existir, role suavemente para o início da seção
    if (approvedSectionRef.current) {
      approvedSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [currentPage]);

  /**
   * Effect para resetar a página ao mudar filtros
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  useEffect(() => {
    // Função para carregar as instituições da sua API
    const fetchInstitutions = async () => {
      try {
        setIsLoadingInstitutions(true);
        // 1. Chama a API /api/universities
        const response = await fetch('/api/universities'); 
        if (!response.ok) {
          throw new Error('Falha ao carregar instituições');
        }
        
        // 2. A API retorna um array de OBJETOS, ex: [{ name: 'USP' }, ...]
        const data: { name: string }[] = await response.json();
        
        // 3. Processamos a resposta para extrair apenas os nomes
        const names = data.map(u => u.name);
        const options = ['todas', ...Array.from(new Set(names))];

        // 4. Salva a lista de nomes no estado
        setInstitutionOptions(options);
      } catch (err) {
        console.error(err);
        // Em caso de falha, o estado 'institutionOptions' permanece ['todas']
      } finally {
        // 5. Libera o <select>, mesmo se der erro
        setIsLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []); // O array [] garante que isso rode apenas uma vez

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Card de Desempenho e Consulta Principal - REDESENHADO */}
      <div className={`relative backdrop-blur-xl ${isDark ? 'bg-white border-gray-200' : 'bg-white/80 border-gray-200/50'} rounded-xl p-7 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300`}>
        {/* Gradient Overlay Decorativo */}
        <div className={`absolute top-0 right-0 w-80 h-80 ${isDark ? 'bg-gradient-to-bl from-blue-900/15 to-transparent' : 'bg-gradient-to-bl from-blue-100/40 to-transparent'} rounded-full blur-3xl`}></div>
        
        {/* Mascote */}
        <div className="absolute top-5 right-6 opacity-75 hidden lg:block z-10">
          <Image 
            src="/Mascote/banners/Camaleão_17.png" 
            alt="Mascote Analista" 
            width={120} 
            height={120} 
            className="object-contain drop-shadow-xl"
          />
        </div>
        
        <div className="relative z-10">
          {/* Título Principal */}
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white' : 'bg-blue-100'} shadow-md`}>
                <Target size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} strokeWidth={2} />
              </div>
              <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Consulta de Notas de Corte
              </h2>
            </div>
            <p className={`text-[15px] md:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl leading-relaxed`}>
              Descubra suas chances reais de aprovação! Veja onde sua nota atual te levaria e explore oportunidades em diversas instituições.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-end">
            {/* Card de Desempenho Atual */}
            <div className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-700/40' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/40'} p-6 rounded-xl border shadow-[0_2px_12px_rgba(0,0,0,0.04)] group hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 backdrop-blur-sm`}>
              <div className={`absolute top-0 right-0 w-28 h-28 ${isDark ? 'bg-blue-500/10' : 'bg-blue-200/25'} rounded-full blur-2xl`}></div>
              <p className={`text-[13px] font-semibold mb-2.5 ${isDark ? 'text-blue-300' : 'text-blue-700'} uppercase tracking-wider`}>
                📊 Desempenho Geral Atual
              </p>
              <div className="flex items-baseline gap-2.5 relative">
                <span className={`text-5xl md:text-6xl font-bold ${isDark ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} bg-clip-text text-transparent drop-shadow-md`}>
                  {userScore.toFixed(0)}%
                </span>
                <span className={`text-xl font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/ 100</span>
              </div>
              <div className="mt-3.5">
                <div className={`w-full h-2.5 ${isDark ? 'bg-gray-700/60' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-md"
                    style={{ width: `${userScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Card de Input e Busca */}
            <div className="space-y-3.5">
              {/* Campo Curso Alvo */}
              <div>
                <label htmlFor="targetCourseInput" className={`block text-[13px] font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wide`}>
                  🎯 Seu Curso Alvo
                </label>
                <input
                  id="targetCourseInput"
                  type="text"
                  value={localTargetCourse}
                  onChange={(e) => setLocalTargetCourse(e.target.value)}
                  placeholder="Ex: Medicina, Engenharia, Direito..."
                  className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600/60 bg-gray-700/40 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300/60 bg-white/70 text-gray-900 placeholder-gray-400 focus:border-blue-500'} rounded-lg focus:ring-4 focus:ring-blue-500/15 backdrop-blur-sm transition-all duration-300 text-[15px] font-medium shadow-sm`}
                />
                <p className={`text-[12px] mt-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1.5`}>
                  <Info size={12} strokeWidth={2} />
                  Digite o nome do curso que você deseja cursar
                </p>
              </div>

              {/* Campo Instituição (Opcional) */}
              <div>
                <label htmlFor="targetInstitutionInput" className={`block text-[13px] font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wide`}>
                  🏛️ Instituição (Opcional)
                </label>
                <input
                  id="targetInstitutionInput"
                  type="text"
                  value={localTargetInstitution}
                  onChange={(e) => setLocalTargetInstitution(e.target.value)}
                  placeholder="Ex: USP, UNICAMP, UFRJ..."
                  className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600/60 bg-gray-700/40 text-white placeholder-gray-400 focus:border-purple-500' : 'border-gray-300/60 bg-white/70 text-gray-900 placeholder-gray-400 focus:border-purple-500'} rounded-lg focus:ring-4 focus:ring-purple-500/15 backdrop-blur-sm transition-all duration-300 text-[15px] font-medium shadow-sm`}
                />
                <p className={`text-[12px] mt-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1.5`}>
                  <Info size={12} strokeWidth={2} />
                  Filtre por uma instituição específica (deixe em branco para ver todas)
                </p>
              </div>

              {/* Botão de Consulta */}
              <button
                onClick={handleConsult}
                disabled={isLoading}
                className={`w-full px-6 py-3.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-[15px] shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2.5 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} strokeWidth={2} />
                    <span>Consultar Notas de Corte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Seção de Resultados - LOADING */}
      {isLoading && (
        <div className="space-y-5">
          <ResultSkeleton theme={theme} />
          <div className="grid md:grid-cols-2 gap-5">
            <ResultSkeleton theme={theme} />
            <ResultSkeleton theme={theme} />
          </div>
        </div>
      )}

      {/* 3. Seção de ERRO */}
      {error && (
        <div className={`p-9 text-center ${isDark ? 'text-red-300 bg-red-900/20 border-red-700/40' : 'text-red-700 bg-red-50/70 border-red-200/40'} backdrop-blur-md rounded-xl border shadow-[0_4px_20px_rgba(0,0,0,0.08)]`}>
          <div className={`inline-flex p-3.5 rounded-full ${isDark ? 'bg-red-900/40' : 'bg-red-100'} mb-3.5`}>
            <XCircle className="h-10 w-10" strokeWidth={2} />
          </div>
          <h3 className={`text-xl font-semibold mb-2.5 ${isDark ? 'text-white' : 'text-red-900'}`}>
            Ocorreu um erro
          </h3>
          <p className={`text-[15px] ${isDark ? 'text-red-200' : 'text-red-600'}`}>{error}</p>
        </div>
      )}

      {!isLoading && !error && hasSearched && (
        <div className="space-y-7">
          {/* Resultado do Curso Alvo - REDESENHADO PROFISSIONAL */}
          {targetCourseResults.length > 0 ? (
            <div className={`relative backdrop-blur-xl ${isDark ? 'bg-white border-gray-200' : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'} rounded-xl p-7 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border overflow-hidden transition-all duration-300`}>
              {/* Background Pattern Decorativo */}
              <div className="absolute inset-0 opacity-5">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-yellow-500/15 to-orange-500/15' : 'bg-gradient-to-br from-yellow-400/15 to-orange-400/15'}`}></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
              </div>
              <div className="relative z-10">
                {/* Header Premium */}
                <div className="mb-7">
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-gradient-to-br from-yellow-600/25 to-orange-600/25 border border-yellow-500/40' : 'bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-300'} shadow-lg`}>
                      <Target size={28} className={isDark ? 'text-yellow-400' : 'text-yellow-600'} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={`text-xl md:text-3xl font-bold tracking-tight ${isDark ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500' : 'bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-700'} bg-clip-text text-transparent drop-shadow-sm`}>
                        Resultado do seu Curso Alvo
                      </h3>
                      <p className={`text-[13px] md:text-[15px] font-medium mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Análise detalhada da sua performance
                      </p>
                    </div>
                  </div>
                  
                  {/* Banner Informativo Premium */}
                  <div className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border-blue-700/40' : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-300/40'} border rounded-xl p-5 shadow-md`}>
                    <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex items-center justify-between flex-wrap gap-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-blue-800/40' : 'bg-blue-100'} shadow-sm`}>
                          <svg className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            Instituições Encontradas
                          </p>
                          <p className={`font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {targetCourseResults.length} {targetCourseResults.length === 1 ? 'Universidade' : 'Universidades'}
                          </p>
                        </div>
                      </div>
                      <div className={`px-5 py-2.5 rounded-lg ${isDark ? 'bg-gradient-to-r from-blue-600/25 to-indigo-600/25 border border-blue-500/40' : 'bg-white/80 border border-blue-200'} shadow-md`}>
                        <p className={`text-[13px] font-medium ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                          Curso: <span className={`font-bold text-[15px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{localTargetCourse}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Grid de Resultados Profissional */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {targetCourseResults.map(result => (
                    <CourseResultCard key={result.id} result={result} theme={theme} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`relative backdrop-blur-xl ${isDark ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50' : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'} rounded-xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border overflow-hidden transition-all duration-300`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-red-500/15 to-orange-500/15' : 'bg-gradient-to-br from-red-400/15 to-orange-400/15'}`}></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
              </div>

              {/* Mascote Triste - Maior e mais visível */}
              <div className="relative z-10 text-center">
                <div className="inline-block mb-5">
                  <div className={`absolute inset-0 ${isDark ? 'bg-red-500/15' : 'bg-red-300/25'} rounded-full blur-3xl animate-pulse`}></div>
                  <Image 
                    src="/Mascote/banners/Camaleão_triste/Camaleão_1.png" 
                    alt="Mascote triste" 
                    width={160}
                    height={160}
                    className="relative z-10 w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-xl"
                  />
                </div>

                {/* Ícone e Título */}
                <div className={`inline-flex items-center justify-center gap-2.5 mb-5 px-5 py-2.5 rounded-xl ${isDark ? 'bg-red-900/20 border border-red-700/40' : 'bg-red-50 border border-red-200'} shadow-lg`}>
                  <div className={`p-1.5 rounded-lg ${isDark ? 'bg-red-800/40' : 'bg-red-100'}`}>
                    <SearchX className={`w-7 h-7 ${isDark ? 'text-red-400' : 'text-red-600'}`} strokeWidth={2} />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Curso Não Encontrado
                  </h3>
                </div>

                {/* Mensagem Principal */}
                <div className={`max-w-2xl mx-auto mb-5 p-5 rounded-xl ${isDark ? 'bg-gray-800/40 border border-gray-700/40' : 'bg-white/60 border border-gray-200/40'} shadow-md`}>
                  <p className={`text-[15px] md:text-base font-medium leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Infelizmente, não encontramos o curso <span className={`font-bold text-lg ${isDark ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-yellow-600 to-orange-600'} bg-clip-text text-transparent`}>{localTargetCourse}</span> em nossa base de dados.
                  </p>
                </div>

                {/* Sugestões */}
                <div className={`max-w-xl mx-auto p-5 rounded-xl ${isDark ? 'bg-blue-900/15 border border-blue-700/40' : 'bg-blue-50/70 border border-blue-200/40'} shadow-md`}>
                  <div className="flex items-start gap-3.5">
                    <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-800/40' : 'bg-blue-100'} flex-shrink-0`}>
                      <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className={`text-[13px] font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'} uppercase tracking-wide`}>
                        💡 Dicas
                      </p>
                      <ul className={`text-[13px] ${isDark ? 'text-gray-300' : 'text-gray-700'} space-y-1.5`}>
                        <li className="flex items-start gap-2">
                          <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>•</span>
                          <span>Verifique a ortografia do nome do curso</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>•</span>
                          <span>Tente usar um nome mais genérico (ex: &quot;Engenharia&quot; ao invés de &quot;Engenharia Mecânica&quot;)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>•</span>
                          <span>Explore outros cursos na seção de aprovações abaixo</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Outras Aprovações - REDESENHADO */}
          <div className={`backdrop-blur-xl ${isDark ? 'bg-white border-gray-200' : 'bg-white/80 border-gray-200/50'} rounded-xl p-7 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border transition-all duration-300`} ref={approvedSectionRef}>
            <div className="flex items-center gap-2.5 mb-7">
              <div className={`p-1.5 rounded-lg ${isDark ? 'bg-green-900/40' : 'bg-green-100'}`}>
                <ShieldCheck size={22} className={isDark ? 'text-green-400' : 'text-green-600'} strokeWidth={2} />
              </div>
              <h3 className={`text-xl md:text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>
                🎉 Cursos em que você seria APROVADO
              </h3>
            </div>
            
            {/* Filtros e Ordenação - REDESENHADO */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-7 p-5 ${isDark ? 'bg-white border-gray-200' : 'bg-white/60 border-gray-200/40'} rounded-xl border shadow-sm`}>
              {/* Filtro por Área */}
              <div>
                <label htmlFor="filterArea" className={`block text-[11px] font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  📚 Área de Conhecimento
                </label>
                <select 
                  id="filterArea"
                  value={filters.area}
                  onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 border ${isDark ? 'border-gray-600/60 bg-gray-700/60 text-white focus:border-blue-500' : 'border-gray-300/60 bg-white text-gray-900 focus:border-blue-500'} rounded-lg focus:ring-4 focus:ring-blue-500/15 backdrop-blur-sm font-medium transition-all text-[14px]`}
                >
                  {availableAreas.map(area => (
                    <option key={area} value={area}>{area === 'todas' ? 'Todas as Áreas' : area}</option>
                  ))}
                </select>
              </div>
              
              {/* Filtro por Instituição */}
              <div>
                <label htmlFor="filterInstitution" className={`block text-[11px] font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  🏛️ Instituição
                </label>
                <select 
                    id="filterInstitution"
                    value={filters.institution}
                    onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 border ${isDark ? 'border-gray-600/60 bg-gray-700/60 text-white focus:border-blue-500' : 'border-gray-300/60 bg-white text-gray-900 focus:border-blue-500'} rounded-lg focus:ring-4 focus:ring-blue-500/15 backdrop-blur-sm font-medium transition-all text-[14px]`}
                    disabled={isLoadingInstitutions}
                    >
                    {isLoadingInstitutions ? (
                    <option value="">Carregando...</option>
                    ) : (
                    institutionOptions.map(inst => (
                        <option key={inst} value={inst}>{inst === 'todas' ? 'Todas as Instituições' : inst}</option>
                    ))
                    )}
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label htmlFor="sortBy" className={`block text-[11px] font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  🔄 Ordenar por
                </label>
                <select 
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border ${isDark ? 'border-gray-600/60 bg-gray-700/60 text-white focus:border-blue-500' : 'border-gray-300/60 bg-white text-gray-900 focus:border-blue-500'} rounded-lg focus:ring-4 focus:ring-blue-500/15 backdrop-blur-sm font-medium transition-all text-[14px]`}
                >
                  <option value="probability">Maior Probabilidade (mais fácil)</option>
                  <option value="cutoff">Maior Nota de Corte (mais difícil)</option>
                </select>
              </div>
            </div>

            {/* Lista de Resultados */}
            {paginatedResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {paginatedResults.map(result => (
                    <CourseResultCard key={result.id} result={result} theme={theme} />
                  ))}
                </div>

                {/* Botões de Navegação de Página */}
                {totalPages > 1 && (
                  <div className={`flex items-center justify-between mt-7 pt-5 border-t ${isDark ? 'border-gray-700/60' : 'border-gray-200/60'}`}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 text-[14px] ${
                        currentPage === 1
                          ? isDark 
                            ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Anterior
                    </button>

                    <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-[13px] font-medium">
                        Página <span className="font-bold text-base">{currentPage}</span> de <span className="font-bold text-base">{totalPages}</span>
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({filteredAndSortedResults.length} cursos no total)
                      </span>
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 text-[14px] ${
                        currentPage === totalPages
                          ? isDark 
                            ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                      }`}
                    >
                      Próximo
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={`p-8 text-center ${isDark ? 'text-gray-300 bg-gray-900/40 border-gray-700/40' : 'text-gray-700 bg-gray-50/70 border-gray-200/40'} backdrop-blur-sm rounded-xl border`}>
                <div className={`inline-flex p-3.5 rounded-full ${isDark ? 'bg-gray-700/60' : 'bg-gray-100'} mb-3.5`}>
                  <ShieldCheck className="h-10 w-10" strokeWidth={2} />
                </div>
                <h3 className={`text-lg font-semibold mb-2.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Nenhum resultado encontrado
                </h3>
                <p className={`text-[15px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Não Temos dados ainda para essas combinações.
                  <br />
                  Continue estudando para melhorar seu desempenho!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado Inicial - REDESENHADO */}
      {!isLoading && !hasSearched && (
        <div className={`text-center p-10 md:p-14 backdrop-blur-xl ${isDark ? 'bg-white border-gray-200' : 'bg-white/80 border-gray-200/50'} rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border transition-all duration-300`}>
          <div className="relative inline-block mb-5">
            <div className={`absolute inset-0 ${isDark ? 'bg-blue-500/15' : 'bg-blue-200/25'} rounded-full blur-3xl animate-pulse`}></div>
            <Image 
              src="/Mascote/banners/Camaleão_19.png" 
              alt="Mascote pronto" 
              width={140} 
              height={140} 
              className="relative z-10 mx-auto drop-shadow-xl"
            />
          </div>
          <h3 className={`text-xl md:text-2xl font-semibold mb-3.5 tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Pronto para descobrir seu futuro? 🚀
          </h3>
          <p className={`text-[15px] md:text-base mb-7 max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Clique no botão de consulta acima para ver o status do seu curso alvo e uma lista de todos os cursos em que você seria aprovado com sua nota atual.
          </p>
          <div className={`flex items-center justify-center gap-2.5 px-5 py-3.5 ${isDark ? 'bg-blue-900/20 border-blue-700/40' : 'bg-blue-50/70 border-blue-200/40'} border rounded-xl max-w-md mx-auto shadow-md`}>
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-800/40' : 'bg-blue-100'}`}>
              <Info size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} strokeWidth={2} />
            </div>
            <p className={`text-[15px] font-medium ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
              Sua nota atual de <strong className="font-bold text-base">{userScore.toFixed(0)}%</strong> será usada para a consulta.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotaCorteConsulta;