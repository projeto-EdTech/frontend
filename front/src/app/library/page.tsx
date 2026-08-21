"use client";

import Link from "next/link";
import Header from "@/components/Header";
import LoginModal from "@/components/Login-modal";
import { useState, useEffect } from "react";
import { University } from "@/types/university";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation"; // Importa o hook useRouter
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useUniversityStorage } from "@/contexts/UniversityStorage";

export default function LibraryPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    if (status === "unauthenticated") {
      setIsLoginModalOpen(true);
    }
  }, [status]);

  const years = [
    2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
  ];
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // State for selected year - null = todos os anos
  const [searchText, setSearchText] = useState(""); // Estado para busca por texto
  const [selectedInstitution, setSelectedInstitution] =
    useState<string>("todas"); // Estado para filtro de instituição
  const [selectedState, setSelectedState] = useState<string>("todas"); // Estado para filtro por estado
  const { universities, loading: isLoading } = useUniversityStorage();
  const [isNavigating, setIsNavigating] = useState(false);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Mapeamento de regiões por estado (nome completo) para colorir os indicadores e agrupar filtro
  const norte = new Set([
    "Acre",
    "Amapá",
    "Amazonas",
    "Pará",
    "Rondônia",
    "Roraima",
    "Tocantins",
  ]);
  const nordeste = new Set([
    "Alagoas",
    "Bahia",
    "Ceará",
    "Maranhão",
    "Paraíba",
    "Pernambuco",
    "Piauí",
    "Rio Grande do Norte",
    "Sergipe",
  ]);
  const centroOeste = new Set([
    "Distrito Federal",
    "Goiás",
    "Mato Grosso",
    "Mato Grosso do Sul",
  ]);
  const sudeste = new Set([
    "Espírito Santo",
    "Minas Gerais",
    "Rio de Janeiro",
    "São Paulo",
  ]);
  const sul = new Set(["Paraná", "Rio Grande do Sul", "Santa Catarina"]);

  const regionColorClass = (stateName?: string) => {
    if (!stateName) return "bg-gray-400";
    if (norte.has(stateName)) return "bg-green-500"; // Norte - verde
    if (nordeste.has(stateName)) return "bg-red-500"; // Nordeste - vermelho
    if (centroOeste.has(stateName)) return "bg-amber-700"; // Centro-Oeste - marrom (aproximação)
    if (sudeste.has(stateName)) return "bg-yellow-400"; // Sudeste - amarelo
    if (sul.has(stateName)) return "bg-blue-500"; // Sul - azul
    return "bg-gray-400"; // Default / Nacional / não mapeado
  };

  // Agrupamento de estados por região para o filtro
  const estadosPorRegiao = [
    { regiao: "Norte", estados: Array.from(norte) },
    { regiao: "Nordeste", estados: Array.from(nordeste) },
    { regiao: "Centro-Oeste", estados: Array.from(centroOeste) },
    { regiao: "Sudeste", estados: Array.from(sudeste) },
    { regiao: "Sul", estados: Array.from(sul) },
  ];

  // Filtro combinado: texto + tipo de instituição + ano
  // Extend runtime type to include estado (foi adicionado em dataUniversity)
  const filteredUniversities = universities.filter((u: University) => {
    // Verificações de segurança para evitar crash se a API retornar dados incompletos
    if (!u) return false;

    // Adaptação para suportar tanto 'name' quanto 'sigla' (caso a API tenhas mudado)
    const uAny = u as any;
    const universityName = u.name || uAny.sigla || "";

    const matchesSearch =
      universityName.toLowerCase().includes(searchText.toLowerCase()) ||
      (u.fullName &&
        u.fullName.toLowerCase().includes(searchText.toLowerCase()));

    const matchesType =
      selectedInstitution === "todas" || u.type === selectedInstitution;

    // Verificamos se o array de anos da universidade INCLUI o ano selecionado pelo usuário.
    // Adicionada verificação se u.year é array válido
    const matchesYear =
      selectedYear === null ||
      (Array.isArray(u.year) && u.year.includes(selectedYear));

    // Filtro por estado
    const matchesState = selectedState === "todas" || u.state === selectedState;

    return matchesSearch && matchesType && matchesYear && matchesState;
  });

  // Lógica de paginação
  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUniversities = filteredUniversities.slice(startIndex, endIndex);

  // Reset para página 1 quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedInstitution, selectedYear, selectedState]);

  // Função para ir para uma página específica
  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll suave para o topo da lista
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para determinar o link correto para a universidade
  const getUniversityLink = (university: University) => {
    let targetYear;

    // Caso 1: Se "Todos os anos" estiver selecionado
    if (!university.slug) return "#";

    if (selectedYear === null) {
      // Pega o ano mais recente do array de anos da universidade.
      // Math.max(...array) é uma forma segura de encontrar o maior número.
      targetYear = Math.max(...university.year);
    } else {
      // Caso 2: Se um ano específico estiver selecionado
      targetYear = selectedYear;
    }

    // Retorna a URL final com o slug e o ano como um parâmetro de busca (query param)
    return `/library/${university.slug}?year=${targetYear}`;
  };

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault(); // Previne a navegação imediata do <Link>
    setIsNavigating(true); // Ativa a tela de carregamento
    router.push(href); // Inicia a navegação programaticamente
  };

  // feedback de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
        {/* Background decorativo minimalista */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
            <div
              className="absolute top-20 right-20 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-20 left-1/4 w-2 h-2 bg-purple-400/25 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-10 right-1/3 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
          </div>
        </div>

        {/* Header component */}
        <Header />

        {/* Main content */}
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Card container principal */}
            <div className="flex-1">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 p-8 md:p-12 relative overflow-hidden">
                {/* Elementos decorativos minimalistas */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-bl-[100px]"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/25 to-transparent rounded-tr-[80px]"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Main content */}
                  <div className="flex-1">
                    {/* Título melhorado com animações */}
                    <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700 relative">
                      {/* Mascote decorativo durante o carregamento */}
                      <div className="flex justify-center mb-6">
                        <div className="relative w-32 h-32 animate-bounce">
                          <Image
                            src="/Mascote/banners/Camaleão_15.png"
                            alt="Mascote Vestibuline carregando"
                            width={128}
                            height={128}
                            className="object-contain filter drop-shadow-lg"
                          />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 animate-pulse">
                        Carregando universidades...
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Aguarde enquanto preparamos tudo para você!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isNavigating) {
    return <LoadingScreen message="Carregando Configurações..." />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
        {/* Background decorativo minimalista macOS */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Padrão sutil de fundo */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
            <div
              className="absolute top-20 right-20 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-20 left-1/4 w-2 h-2 bg-purple-400/25 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-10 right-1/3 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
          </div>
        </div>

        {/* Header component */}
        <Header />

        {/* Main content */}
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Card container principal */}
            <div className="flex-1">
              <div className="bg-white backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 p-8 md:p-12 relative overflow-hidden">
                {/* Elementos decorativos minimalistas */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-bl-[100px]"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/25 to-transparent rounded-tr-[80px]"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Main content */}
                  <div className="flex-1">
                    {/* Título melhorado com animações */}
                    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 relative">
                      {/* Layout com mascote ao lado - alinhado com título e subtítulo */}
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
                            />
                          </div>
                          {/* Balão de fala melhorado */}
                          <div className="absolute -top-2 -right-2 md:-top-4 md:-right-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl px-3 py-2 md:px-4 md:py-2.5 shadow-lg animate-in slide-in-from-right duration-700 delay-500 z-10">
                            <p className="text-xs md:text-sm font-bold whitespace-nowrap">
                              Bora estudar? 📚
                            </p>
                            <div className="absolute left-1/2 bottom-0 translate-y-full -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-600"></div>
                          </div>
                        </div>

                        {/* Conteúdo de texto - Título e subtítulo */}
                        <div className="flex-1 text-center md:text-left order-1 md:order-2">
                          <div className="relative inline-block">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 animate-in fade-in slide-in-from-top-2 duration-1000 delay-200 relative tracking-tight leading-tight">
                              Conheça os seus desafios
                              {/* Linha decorativa sob o título */}
                              <div className="absolute -bottom-1 left-0 md:left-0 w-24 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full"></div>
                            </h1>
                          </div>
                          <p className="text-base md:text-lg text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-1000 delay-400 mt-4">
                            Explore nossa biblioteca completa de simulados das
                            principais universidades do Brasil. Prepare-se com
                            questões reais e teste seus conhecimentos.
                          </p>
                        </div>
                      </div>

                      {/* Estatísticas rápidas */}
                      <div className="mt-10 flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm text-gray-600 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-600">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="font-medium">
                            {universities.length} Universidades
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
                          <span className="font-medium">Simulados Reais</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-600"></div>
                          <span className="font-medium">Gratuito</span>
                        </div>
                      </div>
                    </div>

                    {/* Filtros Modernizados */}
                    <div className="mb-10 w-full">
                      <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 items-center bg-white backdrop-blur-xl rounded-2xl shadow-lg px-4 py-4 md:py-3 relative animate-in fade-in slide-in-from-top-4 duration-600 border border-gray-200">
                        {/* Busca */}
                        <div className="flex items-center flex-1 min-w-[180px]">
                          <span className="mr-2 text-blue-500">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <path d="M21 21l-3.5-3.5" />
                            </svg>
                          </span>
                          <input
                            type="text"
                            placeholder="Buscar universidade..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-400/30 transition text-gray-900 placeholder-gray-400 text-sm"
                          />
                        </div>

                        {/* Ano */}
                        <div className="flex items-center min-w-[140px]">
                          <span className="mr-2 text-purple-500">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="4" />
                              <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                          </span>
                          <select
                            value={selectedYear ?? ""}
                            onChange={(e) =>
                              setSelectedYear(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                            className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/30 transition text-gray-900 text-sm appearance-none cursor-pointer"
                          >
                            <option value="">Todos os anos</option>
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Estado (agrupado por região) */}
                        <div className="flex items-center min-w-[170px]">
                          <span className="mr-2 text-green-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              role="img"
                              aria-label="Filtrar por estado"
                              fill="none"
                              stroke="#16a34a"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 5h18v1.6L14 13v4.6l-4 3.8V13L3 6.6V5z" />
                              <path d="M17 11.5a3.6 3.6 0 0 0-3.6 3.6c0 2.7 3.6 6 3.6 6s3.6-3.3 3.6-6A3.6 3.6 0 0 0 17 11.5z" />
                              <circle cx="17" cy="15.1" r="1.4" />
                            </svg>
                          </span>
                          <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400/50 focus:border-green-400 focus:shadow-lg focus:shadow-green-400/30 transition text-gray-900 text-sm appearance-none cursor-pointer"
                          >
                            <option value="todas">Todos os estados</option>
                            {estadosPorRegiao.map(({ regiao, estados }) => (
                              <optgroup key={regiao} label={regiao}>
                                {estados.map((estado) => (
                                  <option key={estado} value={estado}>
                                    {estado}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        {/* Tipo de instituição */}
                        <div className="flex items-center min-w-[140px]">
                          <span className="mr-2 text-indigo-500">
                            <svg
                              className="w-4 h-4 text-blue-600 transition-transform duration-300 hover:scale-110"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </span>
                          <select
                            value={selectedInstitution}
                            onChange={(e) =>
                              setSelectedInstitution(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 focus:shadow-lg focus:shadow-indigo-400/30 transition text-gray-900 text-sm appearance-none cursor-pointer"
                          >
                            <option value="todas">Todas</option>
                            <option value="federal">Federal</option>
                            <option value="estadual">Estadual</option>
                            <option value="particular">Particular</option>
                            <option value="militar">Militar</option>
                          </select>
                        </div>

                        {/* Botão Limpar Filtros */}
                        {(searchText ||
                          selectedInstitution !== "todas" ||
                          selectedYear !== null ||
                          selectedState !== "todas") && (
                          <button
                            onClick={() => {
                              setSearchText("");
                              setSelectedInstitution("todas");
                              setSelectedYear(null);
                              setSelectedState("todas");
                            }}
                            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm font-medium"
                            title="Limpar todos os filtros"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Grid de universidades completamente redesenhado */}
                    <div className="space-y-8">
                      {/* Header da seção de resultados */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Universidades Encontradas
                            <span className="ml-3 text-sm font-medium text-gray-500">
                              ({filteredUniversities.length} resultado
                              {filteredUniversities.length !== 1 ? "s" : ""})
                            </span>
                          </h2>
                        </div>
                        {filteredUniversities.length > 0 && (
                          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 px-4 py-2 bg-white backdrop-blur-xl rounded-full border border-gray-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="font-medium">
                              Clique para acessar
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Grid principal das universidades */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-800 delay-300">
                        {currentUniversities.map((university, index) => (
                          <Link
                            href={getUniversityLink(university)}
                            key={university.slug}
                            onClick={(e) =>
                              handleNavigation(e, getUniversityLink(university))
                            }
                          >
                            <div
                              className="group bg-white backdrop-blur-xl border border-gray-200 rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center h-full relative overflow-hidden min-h-[220px] animate-in fade-in slide-in-from-bottom-4 hover:border-blue-500 hover:shadow-blue-500/20"
                              style={{
                                animationDelay: `${index * 80}ms`,
                                animationDuration: "600ms",
                                animationFillMode: "both",
                              }}
                            >
                              {/* Background decorativo sutil */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                              {/* Indicador de região no canto superior */}
                              <div
                                className={`absolute top-3 right-3 w-3 h-3 rounded-full ${regionColorClass(university.state)} shadow-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                              ></div>

                              {/* Container do logo */}
                              <div className="relative z-10 w-20 h-20 !bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center mb-4 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:scale-110">
                                <Image
                                  src={
                                    university.logo
                                      ? university.logo.startsWith("/") ||
                                        university.logo.startsWith("http")
                                        ? university.logo
                                        : `/${university.logo}`
                                      : "/placeholder.svg"
                                  }
                                  alt={
                                    university.name || "Logo da universidade"
                                  }
                                  width={48}
                                  height={48}
                                  className="object-contain max-h-12 max-w-12 relative z-10 transition-all duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder.svg";
                                  }}
                                />
                              </div>

                              {/* Conteúdo do card */}
                              <div className="relative z-10 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  {/* Nome da universidade */}
                                  <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                                    {university.name}
                                  </h3>

                                  {/* Nome completo */}
                                  <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors duration-300 line-clamp-2">
                                    {university.fullName.length > 60
                                      ? `${university.fullName.substring(0, 60)}...`
                                      : university.fullName}
                                  </p>

                                  {/* Tags de informação */}
                                  <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                                    {/* Tag do tipo de instituição */}
                                    <span
                                      className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                                        university.type === "federal"
                                          ? "bg-blue-100 text-blue-700 group-hover:bg-blue-200"
                                          : university.type === "estadual"
                                            ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                                            : university.type === "particular"
                                              ? "bg-purple-100 text-purple-700 group-hover:bg-purple-200"
                                              : university.type === "militar"
                                                ? "bg-red-100 text-red-700 group-hover:bg-red-200"
                                                : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                                      }`}
                                    >
                                      {university.type
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        university.type?.slice(1) || "N/A"}
                                    </span>

                                    {/* Tag do estado */}
                                    {university.state && (
                                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-all duration-300">
                                        {university.state}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Indicador de ação */}
                                <div className="flex items-center justify-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 mt-4">
                                  <span className="text-sm font-bold tracking-wide">
                                    ACESSAR PROVAS
                                  </span>
                                  <svg
                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Controles de Paginação */}
                      {filteredUniversities.length > itemsPerPage && (
                        <div className="flex flex-col items-center gap-4 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-600">
                          {/* Informações da página atual */}
                          <div className="text-sm text-gray-600 font-medium">
                            Mostrando {startIndex + 1} a{" "}
                            {Math.min(endIndex, filteredUniversities.length)} de{" "}
                            {filteredUniversities.length} universidades
                          </div>

                          {/* Botões de navegação */}
                          <div className="flex items-center gap-2">
                            {/* Botão Primeira Página */}
                            <button
                              onClick={() => goToPage(1)}
                              disabled={currentPage === 1}
                              className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                              title="Primeira página"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                />
                              </svg>
                            </button>

                            {/* Botão Anterior */}
                            <button
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none flex items-center gap-2 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                              Anterior
                            </button>

                            {/* Números das páginas */}
                            <div className="flex items-center gap-2">
                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                              ).map((page) => {
                                // Mostrar apenas páginas próximas à página atual
                                const showPage =
                                  page === 1 ||
                                  page === totalPages ||
                                  (page >= currentPage - 1 &&
                                    page <= currentPage + 1);

                                const showEllipsis =
                                  (page === currentPage - 2 &&
                                    currentPage > 3) ||
                                  (page === currentPage + 2 &&
                                    currentPage < totalPages - 2);

                                if (showEllipsis) {
                                  return (
                                    <span
                                      key={page}
                                      className="px-2 text-gray-400"
                                    >
                                      ...
                                    </span>
                                  );
                                }

                                if (!showPage) return null;

                                return (
                                  <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`min-w-[40px] h-10 px-3 rounded-xl font-semibold transition-all duration-300 ${
                                      currentPage === page
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-110"
                                        : "bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 hover:bg-white hover:scale-105 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Botão Próximo */}
                            <button
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none flex items-center gap-2 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                            >
                              Próximo
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>

                            {/* Botão Última Página */}
                            <button
                              onClick={() => goToPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                              title="Última página"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Mensagem quando não há resultados */}
                      {filteredUniversities.length === 0 && (
                        <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-600">
                          {/* Mascote triste/pensativo */}
                          <div className="flex justify-center mb-6">
                            <div className="relative">
                              <Image
                                src="/Mascote/banners/Camaleão_8.png"
                                alt="Mascote pensativo"
                                width={150}
                                height={150}
                                className="object-contain filter drop-shadow-2xl animate-in zoom-in duration-700"
                              />
                            </div>
                          </div>

                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Nenhuma universidade encontrada
                          </h3>
                          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                            Não encontramos universidades que correspondam aos
                            seus critérios de busca. Tente ajustar os filtros ou
                            fazer uma nova pesquisa.
                          </p>
                          <button
                            onClick={() => {
                              setSearchText("");
                              setSelectedInstitution("todas");
                              setSelectedYear(null);
                              setSelectedState("todas");
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Ver todas as universidades
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Seção motivacional com mascote no final */}
                    {filteredUniversities.length > 0 && (
                      <div className="mt-16 bg-transparent rounded-3xl p-8 md:p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        {/* Padrão decorativo de fundo minimalista */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-3xl"></div>
                          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                          {/* Texto motivacional */}
                          <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                              Pronto para começar? 🎯
                            </h3>
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                              Escolha uma universidade acima e inicie sua
                              jornada de preparação com simulados reais!
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                              <div className="flex items-center gap-2 !bg-white backdrop-blur-xl px-4 py-2 rounded-full shadow-sm border border-gray-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold !text-gray-700">
                                  100% Gratuito
                                </span>
                              </div>
                              <div className="flex items-center gap-2 !bg-white backdrop-blur-xl px-4 py-2 rounded-full shadow-sm border border-gray-200">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                                <span className="text-sm font-semibold !text-gray-700">
                                  Questões Reais
                                </span>
                              </div>
                              <div className="flex items-center gap-2 !bg-white backdrop-blur-xl px-4 py-2 rounded-full shadow-sm border border-gray-200">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-600"></div>
                                <span className="text-sm font-semibold !text-gray-700">
                                  Resultados Instantâneos
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Mascote motivacional */}
                          <div className="relative flex-shrink-0">
                            <div className="relative w-40 h-40 md:w-48 md:h-48">
                              <Image
                                src="/Mascote/banners/Camaleão_10.png"
                                alt="Mascote motivacional"
                                width={192}
                                height={192}
                                className="object-contain filter drop-shadow-2xl animate-in zoom-in duration-700 hover:scale-110 transition-transform"
                              />
                            </div>
                            {/* Elemento decorativo flutuante */}
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                              <span className="text-2xl">⭐</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/library"
        isRequired={status === "unauthenticated"}
      />

      <Footer />
    </>
  );
}
