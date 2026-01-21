"use client";

import Link from "next/link"
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header"
import LoginModal from "@/components/Login-modal";
import { useState, useEffect } from "react";
import { University } from "@/lib/dataUniversity";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// Variantes de animação estilo Apple - suaves e elegantes
const appleEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1]; // Curva de easing estilo Apple

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: appleEase }
  }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: appleEase }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: appleEase }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: appleEase 
    }
  }
};

const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: appleEase }
  }
};

const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: appleEase }
  }
};

const floatAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }
};

export default function LibraryPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Verificar autenticação ao carregar a página
  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    }
  }, [status]);

  const years = [2026, 2025, 2024, 2023, 2022, ];
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("todas");
  const [selectedState, setSelectedState] = useState<string>("todas");
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const norte = new Set(["Acre","Amapá","Amazonas","Pará","Rondônia","Roraima","Tocantins"]);
  const nordeste = new Set(["Alagoas","Bahia","Ceará","Maranhão","Paraíba","Pernambuco","Piauí","Rio Grande do Norte","Sergipe"]);
  const centroOeste = new Set(["Distrito Federal","Goiás","Mato Grosso","Mato Grosso do Sul"]);
  const sudeste = new Set(["Espírito Santo","Minas Gerais","Rio de Janeiro","São Paulo"]);
  const sul = new Set(["Paraná","Rio Grande do Sul","Santa Catarina"]);
  const regionColorClass = (stateName?: string) => {
    if (!stateName) return "bg-gray-400";
    if (norte.has(stateName)) return "bg-green-500";        // Norte - verde
    if (nordeste.has(stateName)) return "bg-red-500";       // Nordeste - vermelho
    if (centroOeste.has(stateName)) return "bg-amber-700";  // Centro-Oeste - marrom (aproximação)
    if (sudeste.has(stateName)) return "bg-yellow-400";     // Sudeste - amarelo
    if (sul.has(stateName)) return "bg-blue-500";          // Sul - azul
    return "bg-gray-400"; // Default / Nacional / não mapeado
  };

  const estadosPorRegiao = [
    { regiao: "Norte", estados: Array.from(norte) },
    { regiao: "Nordeste", estados: Array.from(nordeste) },
    { regiao: "Centro-Oeste", estados: Array.from(centroOeste) },
    { regiao: "Sudeste", estados: Array.from(sudeste) },
    { regiao: "Sul", estados: Array.from(sul) },
  ];

    useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('/api/universities');
        const data = await response.json();
        setUniversities(data); // Salva os dados no estado
      } catch (error) {
        console.error("Falha ao buscar dados:", error);
      } finally {
        setIsLoading(false); // Finaliza o carregamento (com sucesso ou erro)
      }
    };

    fetchUniversities();
  }, []);

  const filteredUniversities = universities.filter((u: University) => {
    const matchesSearch = u.name.toLowerCase().includes(searchText.toLowerCase()) || u.fullName.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = selectedInstitution === "todas" || u.type === selectedInstitution;
    const matchesYear = selectedYear === null || u.year.includes(selectedYear);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Função para determinar o link correto para a universidade
  const getUniversityLink = (university: University) => {
    let targetYear;
    if (!university.slug) return '#';
    
    if (selectedYear === null) {
      targetYear = Math.max(...university.year);
    } else {
      targetYear = selectedYear;
    }

    return `/library/${university.slug}?year=${targetYear}`;
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#f5f5f7] relative overflow-hidden"
      >
        {/* Background decorativo minimalista */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-30">
            {[
              { top: '10%', left: '10%', delay: 0 },
              { top: '20%', right: '20%', delay: 0.5 },
              { bottom: '20%', left: '25%', delay: 1 },
              { bottom: '10%', right: '33%', delay: 1.5 }
            ].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
                style={{ top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom }}
                animate={{ 
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: pos.delay,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Header component */}
        <Header />

        {/* Main content */}
        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Layout: Sidebar + Card with main content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Card container principal */}
            <div className="flex-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: appleEase }}
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 p-8 md:p-12 relative overflow-hidden"
              >
                {/* Elementos decorativos minimalistas */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-bl-[100px]"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/25 to-transparent rounded-tr-[80px]"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Main content */}
                  <div className="flex-1">
                    {/* Título melhorado com animações */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.2, ease: appleEase }}
                      className="mb-8 text-center relative"
                    >
                      {/* Mascote decorativo durante o carregamento */}
                      <div className="flex justify-center mb-6">
                        <motion.div 
                          className="relative w-32 h-32"
                          animate={{ 
                            y: [-8, 8, -8],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Image
                            src="/Mascote/banners/Camaleão_15.png"
                            alt="Mascote Vestibuline carregando"
                            width={128}
                            height={128}
                            className="object-contain filter drop-shadow-lg"
                          />
                        </motion.div>
                      </div>
                      <motion.h2 
                        className="text-2xl font-bold text-gray-900"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        Carregando universidades...
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-gray-600 mt-2"
                      >
                        Aguarde enquanto preparamos tudo para você!
                      </motion.p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <Footer />
      </motion.div>
  );
}

  if (isNavigating) {
    return (
      <LoadingScreen message="Carregando Configurações..." />
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: appleEase }}
        className="min-h-screen bg-[#f5f5f7] relative overflow-hidden"
      >
        {/* Background decorativo minimalista macOS */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Padrão sutil de fundo */}
          <div className="absolute inset-0 opacity-30">
            {[
              { top: '10%', left: '10%', delay: 0, color: 'bg-blue-400/40' },
              { top: '20%', right: '20%', delay: 0.5, color: 'bg-indigo-400/30' },
              { bottom: '20%', left: '25%', delay: 1, color: 'bg-purple-400/25' },
              { bottom: '10%', right: '33%', delay: 1.5, color: 'bg-blue-400/30' }
            ].map((pos, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${pos.color} rounded-full`}
                style={{ top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom }}
                animate={{ 
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: pos.delay,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Header component */}
        <Header />

        {/* Main content */}
        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Layout: Sidebar + Card with main content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: appleEase }}
              className="hidden lg:block lg:w-80"
            >
              <Sidebar />
            </motion.div>
            {/* Card container principal */}
            <div className="flex-1">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: appleEase }}
                className="bg-white backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 p-8 md:p-12 relative overflow-hidden"
              >
                {/* Elementos decorativos minimalistas */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-bl-[100px]"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/25 to-transparent rounded-tr-[80px]"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Main content */}
                  <div className="flex-1">
                    {/* Título melhorado com animações */}
                    <motion.div 
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      className="mb-10 relative"
                    >
                      {/* Layout com mascote ao lado - alinhado com título e subtítulo */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-start gap-6 md:gap-8 max-w-5xl mx-auto">
                        {/* Mascote de boas-vindas - posicionado à esquerda */}
                        <motion.div 
                          variants={slideInFromLeft}
                          initial="hidden"
                          animate="visible"
                          className="relative flex-shrink-0 mx-auto md:mx-0 md:ml-8 order-2 md:order-1"
                        >
                          <motion.div 
                            className="relative w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44"
                            variants={floatAnimation}
                            initial="initial"
                            animate="animate"
                          >
                            <Image
                              src="/Mascote/banners/Camaleão_1.png"
                              alt="Mascote Vestibuline"
                              width={180}
                              height={180}
                              className="object-contain filter drop-shadow-2xl"
                            />
                          </motion.div>
                          {/* Balão de fala melhorado */}
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.8, ease: appleEase }}
                            className="absolute -top-2 -right-2 md:-top-4 md:-right-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl px-3 py-2 md:px-4 md:py-2.5 shadow-lg z-10"
                          >
                            <p className="text-xs md:text-sm font-bold whitespace-nowrap">Bora estudar? 📚</p>
                            <div className="absolute left-1/2 bottom-0 translate-y-full -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-600"></div>
                          </motion.div>
                        </motion.div>
                        
                        {/* Conteúdo de texto - Título e subtítulo */}
                        <motion.div 
                          variants={slideInFromRight}
                          initial="hidden"
                          animate="visible"
                          className="flex-1 text-center md:text-left order-1 md:order-2"
                        >
                          <div className="relative inline-block">
                            <motion.h1 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.7, delay: 0.3, ease: appleEase }}
                              className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 relative tracking-tight leading-tight"
                            >
                              Conheça os seus desafios
                              {/* Linha decorativa sob o título */}
                              <motion.div 
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.8, ease: appleEase }}
                                className="absolute -bottom-1 left-0 md:left-0 w-24 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full origin-left"
                              />
                            </motion.h1>
                          </div>
                          <motion.p 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5, ease: appleEase }}
                            className="text-base md:text-lg text-gray-600 leading-relaxed mt-4"
                          >
                            Explore nossa biblioteca completa de simulados das principais universidades do Brasil. 
                            Prepare-se com questões reais e teste seus conhecimentos.
                          </motion.p>
                        </motion.div>
                      </div>
                      
                      {/* Estatísticas rápidas */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7, ease: appleEase }}
                        className="mt-10 flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm text-gray-600"
                      >
                        {[
                          { color: 'bg-blue-500', text: `${universities.length} Universidades`, delay: 0 },
                          { color: 'bg-green-500', text: 'Simulados Reais', delay: 0.3 },
                          { color: 'bg-purple-500', text: 'Gratuito', delay: 0.6 }
                        ].map((stat, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.8 + (i * 0.1), ease: appleEase }}
                            className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200"
                          >
                            <motion.div 
                              className={`w-2 h-2 ${stat.color} rounded-full`}
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: stat.delay }}
                            />
                            <span className="font-medium">{stat.text}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>

                    {/* Filtros Modernizados */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3, ease: appleEase }}
                      className="mb-10 w-full"
                    >
                      <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 items-center bg-white backdrop-blur-xl rounded-2xl shadow-lg px-4 py-4 md:py-3 relative border border-gray-200">
                        {/* Busca */}
                        <div className="flex items-center flex-1 min-w-[180px]">
                          <span className="mr-2 text-blue-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-3.5-3.5"/></svg>
                          </span>
                          <input
                            type="text"
                            placeholder="Buscar universidade..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-400/30 transition text-gray-900 placeholder-gray-400 text-sm"
                          />
                        </div>

                        {/* Ano */}
                        <div className="flex items-center min-w-[140px]">
                          <span className="mr-2 text-purple-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                          </span>
                          <select
                            value={selectedYear ?? ""}
                            onChange={e => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/30 transition text-gray-900 text-sm appearance-none cursor-pointer"
                          >
                            <option value="">Todos os anos</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>

                        {/* Estado (agrupado por região) */}
                        <div className="flex items-center min-w-[170px]">
                          <span className="mr-2 text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="Filtrar por estado" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 5h18v1.6L14 13v4.6l-4 3.8V13L3 6.6V5z"/>
                              <path d="M17 11.5a3.6 3.6 0 0 0-3.6 3.6c0 2.7 3.6 6 3.6 6s3.6-3.3 3.6-6A3.6 3.6 0 0 0 17 11.5z"/>
                              <circle cx="17" cy="15.1" r="1.4"/>
                            </svg>
                          </span>
                          <select
                            value={selectedState}
                            onChange={e => setSelectedState(e.target.value)}
                            className="w-full px-3 py-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400/50 focus:border-green-400 focus:shadow-lg focus:shadow-green-400/30 transition text-gray-900 text-sm appearance-none cursor-pointer"
                          >
                            <option value="todas">Todos os estados</option>
                            {estadosPorRegiao.map(({ regiao, estados }) => (
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
                            <svg className="w-4 h-4 text-blue-600 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          </span>
                          <select
                            value={selectedInstitution}
                            onChange={e => setSelectedInstitution(e.target.value)}
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
                        <AnimatePresence>
                          {(searchText || selectedInstitution !== "todas" || selectedYear !== null || selectedState !== "todas") && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2, ease: appleEase }}
                              onClick={() => {
                                setSearchText("");
                                setSelectedInstitution("todas");
                                setSelectedYear(null);
                                setSelectedState("todas");
                              }}
                              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm font-medium"
                              title="Limpar todos os filtros"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Limpar
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Grid de universidades completamente redesenhado */}
                    <div className="space-y-8">
                      {/* Header da seção de resultados */}
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4, ease: appleEase }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Universidades Encontradas
                            <span className="ml-3 text-sm font-medium text-gray-500">
                              ({filteredUniversities.length} resultado{filteredUniversities.length !== 1 ? 's' : ''})
                            </span>
                          </h2>
                        </div>
                        {filteredUniversities.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.5, ease: appleEase }}
                            className="hidden md:flex items-center gap-2 text-sm text-gray-500 px-4 py-2 bg-white backdrop-blur-xl rounded-full border border-gray-200"
                          >
                            <motion.div 
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <span className="font-medium">Clique para acessar</span>
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Grid principal das universidades */}
                      <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      >
                        {currentUniversities.map((university) => (
                          <Link 
                            href={getUniversityLink(university)} 
                            key={university.slug}
                            onClick={(e) => handleNavigation(e, getUniversityLink(university))}
                          >
                            <motion.div 
                              variants={cardVariants}
                              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: appleEase } }}
                              whileTap={{ scale: 0.98 }}
                              className="group bg-white backdrop-blur-xl border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center h-full relative overflow-hidden min-h-[220px] hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer"
                            >
                              {/* Background decorativo sutil */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              
                              {/* Indicador de região no canto superior */}
                              <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${regionColorClass(university.state)} shadow-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
                              
                              {/* Container do logo */}
                              <div className="relative z-10 w-20 h-20 !bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center mb-4 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:scale-110">
                                <Image
                                  src={
                                    university.logo
                                      ? (university.logo.startsWith('/') || university.logo.startsWith('http')
                                          ? university.logo
                                          : `/${university.logo}`)
                                      : "/placeholder.svg"
                                  }
                                  alt={university.name}
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
                                      : university.fullName
                                    }
                                  </p>
                                  
                                  {/* Tags de informação */}
                                  <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                                    {/* Tag do tipo de instituição */}
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                                      university.type === 'federal' ? 'bg-blue-100 text-blue-700 group-hover:bg-blue-200' :
                                      university.type === 'estadual' ? 'bg-green-100 text-green-700 group-hover:bg-green-200' :
                                      university.type === 'particular' ? 'bg-purple-100 text-purple-700 group-hover:bg-purple-200' :
                                      university.type === 'militar' ? 'bg-red-100 text-red-700 group-hover:bg-red-200' :
                                      'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                                    }`}>
                                      {university.type?.charAt(0).toUpperCase() + university.type?.slice(1) || 'N/A'}
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
                                  <span className="text-sm font-bold tracking-wide">ACESSAR PROVAS</span>
                                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </div>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </motion.div>
                      
                      {/* Controles de Paginação */}
                      {filteredUniversities.length > itemsPerPage && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5, ease: appleEase }}
                          className="flex flex-col items-center gap-4 mt-10"
                        >
                          {/* Informações da página atual */}
                          <div className="text-sm text-gray-600 font-medium">
                            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUniversities.length)} de {filteredUniversities.length} universidades
                          </div>
                          
                          {/* Botões de navegação */}
                          <div className="flex items-center gap-2">
                            {/* Botão Primeira Página */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => goToPage(1)}
                              disabled={currentPage === 1}
                              className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                              title="Primeira página"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                              </svg>
                            </motion.button>
                            
                            {/* Botão Anterior */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none flex items-center gap-2 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              Anterior
                            </motion.button>
                            
                            {/* Números das páginas */}
                            <div className="flex items-center gap-2">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // Mostrar apenas páginas próximas à página atual
                                const showPage = 
                                  page === 1 || 
                                  page === totalPages || 
                                  (page >= currentPage - 1 && page <= currentPage + 1);
                                
                                const showEllipsis = 
                                  (page === currentPage - 2 && currentPage > 3) ||
                                  (page === currentPage + 2 && currentPage < totalPages - 2);
                                
                                if (showEllipsis) {
                                  return (
                                    <span key={page} className="px-2 text-gray-400">
                                      ...
                                    </span>
                                  );
                                }
                                
                                if (!showPage) return null;
                                
                                return (
                                  <motion.button
                                    key={page}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => goToPage(page)}
                                    className={`min-w-[40px] h-10 px-3 rounded-xl font-semibold transition-all duration-300 ${
                                      currentPage === page
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-110'
                                        : 'bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 hover:bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer'
                                    }`}
                                  >
                                    {page}
                                  </motion.button>
                                );
                              })}
                            </div>
                            
                            {/* Botão Próximo */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none flex items-center gap-2 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                            >
                              Próximo
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.button>
                            
                            {/* Botão Última Página */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => goToPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:shadow-none hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                              title="Última página"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                              </svg>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Mensagem quando não há resultados */}
                      <AnimatePresence>
                        {filteredUniversities.length === 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: appleEase }}
                            className="text-center py-20"
                          >
                            {/* Mascote triste/pensativo */}
                            <div className="flex justify-center mb-6">
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2, ease: appleEase }}
                                className="relative"
                              >
                                <Image
                                  src="/Mascote/banners/Camaleão_8.png"
                                  alt="Mascote pensativo"
                                  width={150}
                                  height={150}
                                  className="object-contain filter drop-shadow-2xl"
                                />
                              </motion.div>
                            </div>
                            
                            <motion.h3 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.3, ease: appleEase }}
                              className="text-2xl font-bold text-gray-900 mb-3"
                            >
                              Nenhuma universidade encontrada
                            </motion.h3>
                            <motion.p 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.4, ease: appleEase }}
                              className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed"
                            >
                              Não encontramos universidades que correspondam aos seus critérios de busca. 
                              Tente ajustar os filtros ou fazer uma nova pesquisa.
                            </motion.p>
                            <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.5, ease: appleEase }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSearchText("");
                                setSelectedInstitution("todas");
                                setSelectedYear(null);
                                setSelectedState("todas");
                              }}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Ver todas as universidades
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Seção motivacional com mascote no final */}
                    {filteredUniversities.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4, ease: appleEase }}
                        className="mt-16 bg-transparent rounded-3xl p-8 md:p-10 relative overflow-hidden"
                      >
                        {/* Padrão decorativo de fundo minimalista */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-3xl"></div>
                          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full blur-3xl"></div>
                        </div>
                        
                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                          {/* Texto motivacional */}
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.5, ease: appleEase }}
                            className="flex-1 text-center md:text-left"
                          >
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                              Pronto para começar? 🎯
                            </h3>
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                              Escolha uma universidade acima e inicie sua jornada de preparação com simulados reais!
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                              {[
                                { color: 'bg-green-500', text: '100% Gratuito' },
                                { color: 'bg-blue-500', text: 'Questões Reais' },
                                { color: 'bg-purple-500', text: 'Resultados Instantâneos' }
                              ].map((item, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.4, delay: 0.6 + (i * 0.1), ease: appleEase }}
                                  className="flex items-center gap-2 !bg-white backdrop-blur-xl px-4 py-2 rounded-full shadow-sm border border-gray-200"
                                >
                                  <motion.div 
                                    className={`w-2 h-2 ${item.color} rounded-full`}
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                                  />
                                  <span className="text-sm font-semibold !text-gray-700">{item.text}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                          
                          {/* Mascote motivacional */}
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.6, ease: appleEase }}
                            className="relative flex-shrink-0"
                          >
                            <motion.div 
                              className="relative w-40 h-40 md:w-48 md:h-48"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.3, ease: appleEase }}
                            >
                              <Image
                                src="/Mascote/banners/Camaleão_10.png"
                                alt="Mascote motivacional"
                                width={192}
                                height={192}
                                className="object-contain filter drop-shadow-2xl"
                              />
                            </motion.div>
                            {/* Elemento decorativo flutuante */}
                            <motion.div 
                              className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                              animate={{ y: [-3, 3, -3] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <span className="text-2xl">⭐</span>
                            </motion.div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/library"
        isRequired={status === 'unauthenticated'}
      />

      <Footer />
    </>
  );
}