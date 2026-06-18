'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Building2, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  ChevronsLeft,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Trophy
} from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import LoginModal from '@/components/Login-modal';
import LoadingScreen from '@/components/LoadingScreen';

import { type University } from '@/types/university';
import { YEARS, ESTADOS_POR_REGIAO } from './Library.constants';
import { getRegionColorClass, getUniversityLink } from './Library.utils';

interface Props {
  initialUniversities: University[];
}

export function UniversityLibraryClient({ initialUniversities }: Props) {
  const router = useRouter();
  const { status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("todas");
  const [selectedState, setSelectedState] = useState<string>("todas");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Verificar autenticação
  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    }
  }, [status]);

  // Filtro combinado
  const filteredUniversities = useMemo(() => {
    return initialUniversities.filter((u) => {
      if (!u) return false;

      const universityName = u.name || '';
      const matchesSearch = universityName.toLowerCase().includes(searchText.toLowerCase()) ||
                           (u.fullName && u.fullName.toLowerCase().includes(searchText.toLowerCase()));
      
      const matchesType = selectedInstitution === "todas" || u.type === selectedInstitution;
      const matchesYear = selectedYear === null || (Array.isArray(u.year) && u.year.includes(selectedYear));
      const matchesState = selectedState === "todas" || u.state === selectedState;
      
      return matchesSearch && matchesType && matchesYear && matchesState;
    });
  }, [initialUniversities, searchText, selectedInstitution, selectedYear, selectedState]);

  // Lógica de paginação
  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUniversities = filteredUniversities.slice(startIndex, startIndex + itemsPerPage);

  // Reset para página 1 quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedInstitution, selectedYear, selectedState]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedInstitution("todas");
    setSelectedYear(null);
    setSelectedState("todas");
  };

  if (isNavigating) {
    return <LoadingScreen message="Preparando sua jornada..." />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative overflow-hidden transition-colors duration-300">
      {/* Background Decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-purple-400/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:w-80 shrink-0">
            <Sidebar />
          </aside>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            <div className="bg-[var(--color-bg-alt)] backdrop-blur-xl rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-gray-200 p-6 md:p-10 relative overflow-hidden">
              
              {/* Hero Section Local — Revertido para o design original */}
              <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 relative">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-start gap-6 md:gap-8 max-w-5xl mx-auto">
                  {/* Mascote de boas-vindas - posicionado à esquerda */}
                  <div className="relative flex-shrink-0 mx-auto md:mx-0 md:ml-8 order-2 md:order-1">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44">
                      <Image
                        src="/Mascote/banners/Camaleão_1.png"
                        alt="Mascote Vestibuline"
                        width={180}
                        height={180}
                        className="object-contain filter drop-shadow-2xl animate-in zoom-in duration-1000"
                        priority
                      />
                    </div>
                    {/* Balão de fala original */}
                    <div className="absolute -top-2 -right-2 md:-top-4 md:-right-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl px-3 py-2 md:px-4 md:py-2.5 shadow-lg animate-in slide-in-from-right duration-700 delay-500 z-10">
                      <p className="text-xs md:text-sm font-bold whitespace-nowrap">Bora estudar? 📚</p>
                      <div className="absolute left-1/2 bottom-0 translate-y-full -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-600"></div>
                    </div>
                  </div>
                  
                  {/* Conteúdo de texto - Título e subtítulo originais */}
                  <div className="flex-1 text-center md:text-left order-1 md:order-2">
                    <div className="relative inline-block">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 animate-in fade-in slide-in-from-top-2 duration-1000 delay-200 relative tracking-tight leading-tight">
                        Conheça os seus desafios
                        {/* Linha decorativa sob o título */}
                        <div className="absolute -bottom-1 left-0 md:left-0 w-24 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full"></div>
                      </h1>
                    </div>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-1000 delay-400 mt-4">
                      Explore nossa biblioteca completa de simulados das principais universidades do Brasil. 
                      Prepare-se com questões reais e teste seus conhecimentos.
                    </p>
                  </div>
                </div>

                {/* Estatísticas rápidas adaptadas */}
                <div className="mt-10 flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm text-gray-600 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-600">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200">
                    <div className="w-2 h-2 bg-[var(--color-blue-500)] rounded-full animate-pulse"></div>
                    <span className="font-medium">{initialUniversities.length} Universidades</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200">
                    <div className="w-2 h-2 bg-[var(--color-success)] rounded-full animate-pulse delay-300"></div>
                    <span className="font-medium">Simulados Reais</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200">
                    <div className="w-2 h-2 bg-[var(--color-innovation)] rounded-full animate-pulse delay-600"></div>
                    <span className="font-medium">Acesso Gratuito</span>
                  </div>
                </div>
              </div>

              {/* Filtros Originais */}
              <div className="mb-10 w-full">
                <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 items-center bg-white backdrop-blur-xl rounded-2xl shadow-lg px-4 py-4 md:py-3 relative animate-in fade-in slide-in-from-top-4 duration-600 border border-gray-200">
                  {/* Busca */}
                  <div className="flex items-center flex-1 min-w-[180px]">
                    <span className="mr-2 text-blue-500">
                      <Search className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar universidade..."
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-400/30 transition text-gray-900 placeholder-gray-400 text-sm outline-none"
                    />
                  </div>

                  {/* Ano */}
                  <div className="flex items-center min-w-[140px]">
                    <span className="mr-2 text-purple-500">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <select
                      value={selectedYear ?? ""}
                      onChange={e => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/30 transition text-gray-900 text-sm appearance-none cursor-pointer outline-none"
                    >
                      <option value="">Todos os anos</option>
                      {YEARS.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Estado (agrupado por região) */}
                  <div className="flex items-center min-w-[170px]">
                    <span className="mr-2 text-green-500">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <select
                      value={selectedState}
                      onChange={e => setSelectedState(e.target.value)}
                      className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400/50 focus:border-green-400 focus:shadow-lg focus:shadow-green-400/30 transition text-gray-900 text-sm appearance-none cursor-pointer outline-none"
                    >
                      <option value="todas">Todos os estados</option>
                      {ESTADOS_POR_REGIAO.map(({ regiao, estados }) => (
                        <optgroup key={regiao} label={regiao}>
                          {estados.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de instituição */}
                  <div className="flex items-center min-w-[140px]">
                    <span className="mr-2 text-indigo-500">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <select
                      value={selectedInstitution}
                      onChange={e => setSelectedInstitution(e.target.value)}
                      className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 focus:shadow-lg focus:shadow-indigo-400/30 transition text-gray-900 text-sm appearance-none cursor-pointer outline-none"
                    >
                      <option value="todas">Todas</option>
                      <option value="federal">Federal</option>
                      <option value="estadual">Estadual</option>
                      <option value="particular">Particular</option>
                      <option value="militar">Militar</option>
                    </select>
                  </div>

                  {/* Botão Limpar Filtros */}
                  {(searchText || selectedInstitution !== "todas" || selectedYear !== null || selectedState !== "todas") && (
                    <button
                      onClick={clearFilters}
                      className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm font-medium"
                      title="Limpar todos os filtros"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Grid de universidades original */}
              <div className="space-y-8">
                {/* Header da seção de resultados original */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Universidades Encontradas
                      <span className="ml-3 text-sm font-medium text-gray-500">
                        ({filteredUniversities.length} resultado{filteredUniversities.length !== 1 ? 's' : ''})
                      </span>
                    </h2>
                  </div>
                  {filteredUniversities.length > 0 && (
                    <div className="hidden md:flex items-center gap-2 text-sm text-blue-600 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 font-bold tracking-wide">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>CLIQUE PARA PRATICAR</span>
                    </div>
                  )}
                </div>

                {currentUniversities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-800 delay-300">
                    {currentUniversities.map((university, index) => {
                      const link = getUniversityLink(university, selectedYear);
                      return (
                        <Link 
                          href={link} 
                          key={university.slug || index}
                          onClick={(e) => handleNavigation(e, link)}
                        >
                          <div 
                            className="group bg-white backdrop-blur-xl border border-gray-200 rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center h-full relative overflow-hidden min-h-[220px] animate-in fade-in slide-in-from-bottom-4 hover:border-blue-500 hover:shadow-blue-500/20"
                            style={{
                              animationDelay: `${index * 80}ms`,
                              animationDuration: '600ms',
                              animationFillMode: 'both'
                            }}
                          >
                            {/* Background decorativo sutil */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Indicador de região no canto superior */}
                            <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${getRegionColorClass(university.state)} shadow-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
                            
                            {/* Container do logo original */}
                            <div className="relative z-10 w-20 h-20 !bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center mb-4 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:scale-110 p-0">
                              <Image
                                src={university.logo ? (university.logo.startsWith('http') || university.logo.startsWith('/') ? university.logo : `/${university.logo}`) : "/placeholder.svg"}
                                alt={university.name}
                                fill
                                className="object-contain p-1 relative z-10 transition-all duration-300"
                              />
                            </div>
                            
                            {/* Conteúdo do card original */}
                            <div className="relative z-10 flex-1 flex flex-col justify-between space-y-3">
                              <div className="space-y-2">
                                <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                                  {university.name}
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors duration-300 line-clamp-2">
                                  {university.fullName}
                                </p>
                                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                                    university.type === 'federal' ? 'bg-blue-100 text-blue-700 group-hover:bg-blue-200' :
                                    university.type === 'estadual' ? 'bg-green-100 text-green-700 group-hover:bg-green-200' :
                                    university.type === 'particular' ? 'bg-purple-100 text-purple-700 group-hover:bg-purple-200' :
                                    university.type === 'militar' ? 'bg-red-100 text-red-700 group-hover:bg-red-200' :
                                    'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                                  }`}>
                                    {university.type || 'N/A'}
                                  </span>
                                  {university.state && (
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-all duration-300">
                                      {university.state}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Indicador de ação original */}
                              <div className="flex items-center justify-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 mt-4">
                                <span className="text-sm font-bold tracking-wide">ACESSAR PROVAS</span>
                                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400">
                      <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Nenhum resultado encontrado</h3>
                    <p className="text-gray-500">Tente ajustar seus filtros para encontrar o que procura.</p>
                    <button
                      onClick={clearFilters}
                      className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                )}

                {/* Paginação Original */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-4 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-600">
                    <div className="text-sm text-gray-600 font-medium">
                      Página {currentPage} de {totalPages}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                        title="Primeira página"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none flex items-center gap-2 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer text-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </button>
                      
                      <div className="hidden md:flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          const showPage = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                          if (!showPage) return null;
                          
                          return (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`min-w-[40px] h-10 px-3 rounded-xl font-semibold transition-all duration-300 ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-110'
                                  : 'bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 hover:bg-white hover:scale-105 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer text-sm'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none flex items-center gap-2 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer text-sm"
                      >
                        Próximo
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
