"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/Login-modal";
import { useEffect, useState } from "react";
import { universities } from "@/lib/dataUniversity";
import TopicPieChart from '@/components/Simula_PRO/graficos_stats/TopicPieChart';
import TopicBarChart from '@/components/Simula_PRO/graficos_stats/TopicBarChart';
import RankingMaterias from "@/components/RankingMaterias";

// 1. Definições de Variants (Fora do Componente para Performance)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    }
  }
};

const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 25 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

// 2. Dados Estáticos (Fora do Componente)
const SUBJECTS = [
  { name: "matematica", label: "Matemática", icon: "📐" },
  { name: "fisica", label: "Física", icon: "⚛️" },
  { name: "quimica", label: "Química", icon: "🧪" },
  { name: "biologia", label: "Biologia", icon: "🧬" },
  { name: "portugues", label: "Português", icon: "📔" },
  { name: "literatura", label: "Literatura", icon: "📖" },
  { name: "historia", label: "História", icon: "📚" },
  { name: "geografia", label: "Geografia", icon: "🌍" },
  { name: "filosofia", label: "Filosofia", icon: "🤔" },
  { name: "sociologia", label: "Sociologia", icon: "👥" },
  { name: "ingles", label: "Inglês", icon: "🇺🇸" },
];

const COLORS = [
  "#2563eb", "#10b981", "#f59e42", "#ef4444", "#a21caf", "#0ea5e9", "#fbbf24", "#14b8a6", "#e11d48"
];

// O dropdown de vestibulares também pode ser definido fora por depender de um import estático
const VESTIBULARES_LIST: VestibularItem[] = [
  { id: "geral", nome: "Estatísticas Gerais", icon: "🌐" },
  ...universities.map(university => ({
    id: university.slug,
    nome: university.name,
    icon: "",
  }))
];

type Metrica = {
  topico: string;
  percentual: number;
};

type VestibularItem = {
  id: string;
  nome: string;
  icon: string;
  isPlaceholder?: boolean;
};

export default function EstatisticasPage() {
  const { subject } = useParams();
  const { status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [vestibularSelecionado, setVestibularSelecionado] = useState<string>("geral");
  
  // Verificar autenticação ao carregar a página
  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    }
  }, [status]);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [showSubjectFilter, setShowSubjectFilter] = useState(false);

  useEffect(() => {
    // Reseta estados iniciais
    setErro(null);

    if (!subject || typeof subject !== "string") {
      setMetricas([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function carregar() {
      setLoading(true);
      try {
        const res = await fetch(`/api/estatisticas/${subject}?vestibular=${vestibularSelecionado}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 404) {
            setMetricas([]);
            setErro("Não há dados para esta matéria.");
            return;
          }
          throw new Error("Falha ao carregar dados.");
        }

        const json = await res.json();
        setMetricas(Array.isArray(json.metricas) ? json.metricas : []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return; // navegação rápida
        const msg = err instanceof Error ? err.message : 'Erro inesperado.';
        setErro(msg);
        setMetricas([]);
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, [subject, vestibularSelecionado]);

  const router = useRouter();
  const currentSubject = SUBJECTS.find(s => s.name === subject);
  const currentVestibular = VESTIBULARES_LIST.find(v => v.id === vestibularSelecionado);

  const handleVestibularSelect = (vestibularId: string) => {
    setVestibularSelecionado(vestibularId);
    setDropdownAberto(false);
  };

  const handleSubjectSelect = (subjectName: string) => {
    router.push(`/estatisticas/${subjectName}`);
    setShowSubjectFilter(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
        {/* Filtros para Mobile - Estilo macOS */}
        <div className="block md:hidden mb-8 space-y-4">
          {/* Filtro de Matérias Mobile */}
          <div className="backdrop-blur-xl bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{currentSubject?.icon || "📝"}</span>
              <span className="text-sm font-semibold text-gray-700 tracking-wide">MATÉRIA</span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowSubjectFilter(!showSubjectFilter)}
                className="w-full bg-white backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-3.5 text-left shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{currentSubject?.icon || "📝"}</span>
                    <span className="text-gray-900 font-medium tracking-tight">
                      {currentSubject ? currentSubject.label : subject}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showSubjectFilter ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <AnimatePresence>
                {showSubjectFilter && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                    className="absolute z-[10000] w-full mt-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto origin-top"
                  >
                    {SUBJECTS.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => handleSubjectSelect(s.name)}
                        className={`w-full px-5 py-3.5 text-left hover:bg-black/5 transition-all duration-150 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                          s.name === subject ? "bg-blue-50 text-blue-700" : "text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{s.icon}</span>
                          <span className="font-medium tracking-tight">{s.label}</span>
                          {s.name === subject && (
                            <span className="ml-auto text-blue-600 font-bold">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Seletor de Vestibular Mobile */}
          <div className="backdrop-blur-xl bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🏛️</span>
              <span className="text-sm font-semibold text-gray-700 tracking-wide">INSTITUIÇÃO</span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setDropdownAberto(!dropdownAberto)}
                className="w-full bg-white backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-3.5 text-left shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <div className="flex items-center justify-between">
                  <span className={`tracking-tight ${currentVestibular?.isPlaceholder ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                    {currentVestibular?.nome || "Escolha uma instituição..."}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <AnimatePresence>
                {dropdownAberto && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                    className="absolute z-[10000] w-full mt-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto origin-top"
                  >
                    {VESTIBULARES_LIST.map((vest) => (
                      <button
                        key={vest.id}
                        onClick={() => handleVestibularSelect(vest.id)}
                        className={`w-full px-5 py-3.5 text-left hover:bg-black/5 transition-all duration-150 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                          vest.id === vestibularSelecionado ? "bg-blue-50 text-blue-700" : "text-gray-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium tracking-tight">{vest.nome}</span>
                          {vest.id === vestibularSelecionado && (
                            <span className="text-blue-600 font-bold">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navegação Desktop - Estilo macOS */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-wrap gap-3 mb-10 justify-center"
        >
          {SUBJECTS.map((s) => (
            <motion.button
              key={s.name}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/estatisticas/${s.name}`)}
              className={`px-6 py-3 rounded-xl font-semibold tracking-tight transition-all duration-200 border backdrop-blur-sm shadow-sm cursor-pointer ${
                s.name === subject 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30" 
                  : "bg-white text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Seletor de Vestibular Desktop - Estilo macOS */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`hidden md:block mb-12 max-w-xl mx-auto relative ${dropdownAberto ? 'z-[10000]' : 'z-10'}`}
        >
          <div className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-xl">🏛️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 tracking-tight">
                Universidade / Instituição
              </h3>
            </div>
            
            <div className="relative z-40">
              <button
                onClick={() => setDropdownAberto(!dropdownAberto)}
                className="w-full bg-white backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-4 text-left shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`tracking-tight ${currentVestibular?.isPlaceholder ? 'text-gray-500' : 'text-gray-900 font-medium text-base'}`}>
                    {currentVestibular?.nome || "Escolha uma instituição..."}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <AnimatePresence>
                {dropdownAberto && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                    className="absolute z-[10000] w-full mt-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto origin-top"
                  >
                    {VESTIBULARES_LIST.map((vest) => (
                      <button
                        key={vest.id}
                        onClick={() => handleVestibularSelect(vest.id)}
                        className={`w-full px-5 py-4 text-left hover:bg-black/5 transition-all duration-150 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                          vest.id === vestibularSelecionado ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`tracking-tight ${vest.id === vestibularSelecionado ? 'text-blue-700 font-semibold' : 'text-gray-900 font-medium'}`}>
                            {vest.nome}
                          </span>
                          {vest.id === vestibularSelecionado && (
                            <span className="text-blue-600 font-bold">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Header com nome da matéria e badge - Estilo macOS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-6 mb-12 relative z-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">    
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight text-center">
              Estatísticas de {currentSubject ? currentSubject.label : subject}
            </h1>
            
            {/* Badge do vestibular - estilo macOS */}
            {currentVestibular && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="backdrop-blur-xl bg-gradient-to-br from-blue-50 to-blue-100/80 border border-gray-200 px-5 py-2.5 rounded-full flex-shrink-0 shadow-lg shadow-blue-500/10"
              >
                <span className="text-blue-700 font-semibold text-xs sm:text-sm tracking-tight">
                  {currentVestibular.nome}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-6">
            {/* Mascote estudando durante loading */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, -2, 2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <Image
                src="/Mascote/banners/Camaleão_16.png"
                alt="Mascote estudando"
                width={200}
                height={200}
                className="w-40 h-40 object-contain drop-shadow-xl"
              />
            </motion.div>
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="text-xl font-medium text-gray-700 tracking-tight">Carregando estatísticas...</span>
            </div>
          </div>
        ) : erro ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-6 py-16"
          >
            {/* Mascote confuso para estado de erro */}
            <Image
              src="/Mascote/banners/Camaleão_17.png"
              alt="Mascote confuso"
              width={120}
              height={120}
              className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-xl"
            />
            <p className="text-red-600 text-lg font-semibold backdrop-blur-xl bg-white px-6 py-4 rounded-2xl shadow-xl border border-red-200/50 tracking-tight">
              {erro}
            </p>
          </motion.div>
        ) : metricas.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-6 py-16"
          >
            {/* Mascote para estado vazio */}
            <Image
              src="/Mascote/banners/Camaleão_18.png"
              alt="Mascote - sem dados"
              width={200}
              height={200}
              className="w-40 h-40 md:w-48 md:h-48 object-contain opacity-50 drop-shadow-xl"
            />
            <p className="text-gray-500 text-xl font-medium tracking-tight">Não há dados para esta matéria.</p>
          </motion.div>
        ) : (
          <>
            {/* Card 1: Tabela de Ranking - TOP 10 Conteúdos - Estilo macOS */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 mb-8 relative z-10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                    <span className="text-xl">🏆</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-600 tracking-tight">
                    TOP 10 Conteúdos que mais apareceram em {currentSubject?.label} na {currentVestibular?.nome}
                  </h2>
                </div>
                <RankingMaterias 
                  data={metricas.filter(item => 
                    item.topico.toLowerCase() !== 'demais assuntos' && 
                    !item.topico.toLowerCase().includes('demais assuntos (< que')
                  )} 
                  colors={COLORS} 
                />
              </motion.div>
              
            {/* Container principal para os gráficos - Estilo macOS */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="w-full max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12"
            >
              {/* Card 1: Gráfico de Barras */}
              <motion.div variants={itemVariants} className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-xl">📊</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-600 tracking-tight">
                    Distribuição dos Tópicos
                  </h2>
                </div>
                <TopicBarChart data={metricas} colors={COLORS} />
              </motion.div>

              {/* Card 2: Gráfico de Pizza */}
              <motion.div variants={itemVariants} className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <span className="text-xl">📈</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-600 tracking-tight">
                    Distribuição Percentual
                  </h2>
                </div>
                <TopicPieChart data={metricas} colors={COLORS} />
              </motion.div>
            </motion.div>

            {/* Cards animados para cada tópico - Estilo macOS */}
            <div className="relative">
              {/* Mascote comemorativo */}
              {metricas.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="flex justify-center mb-10"
                >
                  <div className="backdrop-blur-xl bg-white rounded-2xl px-8 py-4 shadow-xl border border-gray-200 flex items-center gap-4">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Image
                        src="/Mascote/banners/Camaleão_20.png"
                        alt="Mascote comemorando"
                        width={400}
                        height={400}
                        className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg"
                      />
                    </motion.div>
                    <span className="text-base md:text-lg font-semibold text-gray-700 tracking-tight">
                      {metricas.length} {metricas.length === 1 ? 'Conteúdo encontrado' : 'Conteúdos encontrados'}!
                    </span>
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              >
                {metricas.map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12)" }}
                    className="backdrop-blur-xl bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border-t-4 transition-shadow duration-300"
                    style={{ borderTopColor: COLORS[idx % COLORS.length] }}
                  >
                    <span className="text-base sm:text-lg font-semibold text-gray-600 mb-3 text-center tracking-tight leading-snug">
                      {item.topico}
                    </span>
                    <span
                      className="text-3xl sm:text-4xl font-bold mb-2"
                      style={{ color: COLORS[idx % COLORS.length] }}
                    >
                      {item.percentual}%
                    </span>
                    <div className="w-full bg-gray-200/50 rounded-full h-2.5 mt-3 overflow-hidden">
                      <motion.div
                        className="h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percentual}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3 + (idx * 0.05), ease: "circOut" }}
                        style={{ 
                          background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]})` 
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </>
        )}
      </main>
      <Footer />
      
      {/* Click outside para fechar dropdowns */}
      {(dropdownAberto || showSubjectFilter) && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/10" 
          onClick={() => {
            setDropdownAberto(false);
            setShowSubjectFilter(false);
          }}
        />
      )}
      
      {/* Animações personalizadas - Estilo macOS */}
      <style jsx global>{`
        /* Estilização da scrollbar - macOS style */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          transition: background 0.2s;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo={`/estatisticas/${subject}`}
        isRequired={status === 'unauthenticated'}
      />
    </div>
  );
}