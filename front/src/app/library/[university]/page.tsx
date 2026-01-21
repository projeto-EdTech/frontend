"use client";

import { useState, useEffect, useCallback, useMemo, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/Login-modal";
import { universities, type University } from "@/lib/dataUniversity";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";

// Apple-style animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

const smoothTransition: Transition = {
  duration: 0.5,
  ease: [0.25, 0.46, 0.45, 0.94] as const // Apple's easing curve
};

export default function UniversityExamPage({ params }: { params: Promise<{ university: string }> }) {
  const unwrappedParams = use(params);
  return <UniversityExamPageClient params={unwrappedParams} />;
}

function UniversityExamPageClient({ params }: { params: { university: string } }) {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const yearParam = searchParams.get("year");
  const dayParam = searchParams.get("day");
  const timeParam = searchParams.get("time");
  const [selectedYear, setSelectedYear] = useState<number | null>(yearParam ? Number(yearParam) : null);
  const [selectedDay, setSelectedDay] = useState<number | null>(dayParam ? Number(dayParam) : null);
  const [time, setTime] = useState<string>(timeParam || "");
  const slug = params.university;
  const [universityInfo, setUniversityInfo] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Verificar autenticação ao carregar a página
  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    }
  }, [status]);
  const [isNavigating, setIsNavigating] = useState(false);

  // Fetch com fallback local
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const fetchUniversity = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/universities/${slug}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Falha ao buscar API");
        const data: University = await response.json();
        if (!cancelled) setUniversityInfo(data);
      } catch (err) {
        const local = universities.find(u => u.slug === slug) || null;
        if (!cancelled) {
          setUniversityInfo(local);
          setUsedFallback(true);
          if (!local) setError(err instanceof Error ? err.message : "Universidade não encontrada");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchUniversity();
    return () => { cancelled = true; };
  }, [slug]);

  // Ordenar anos desc para UX consistente
  const yearsSorted = useMemo(() => (
    universityInfo ? [...universityInfo.year].sort((a,b)=>b-a) : []
  ), [universityInfo]);

  // Dias disponíveis para o ano selecionado
  const availableDays: number[] = useMemo(() => (
    selectedYear && universityInfo?.dia ? (universityInfo.dia[selectedYear] || []) : []
  ), [selectedYear, universityInfo]);

  // Auto selecionar ano se apenas um
  useEffect(() => {
    if (universityInfo && !selectedYear && yearsSorted.length === 1) {
      setSelectedYear(yearsSorted[0]);
    }
  }, [universityInfo, selectedYear, yearsSorted]);

  // Auto selecionar dia se apenas um ou reset se inválido
  useEffect(() => {
    if (availableDays.length === 1) {
      setSelectedDay(availableDays[0]);
    } else if (selectedDay && !availableDays.includes(selectedDay)) {
      setSelectedDay(null);
    }
  }, [availableDays, selectedDay]);

  // Sincronizar query params (ano, dia, tempo) na URL
  const syncQuery = useCallback((next: { year?: number | null; day?: number | null; time?: string | null }) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const newParams = new URLSearchParams(searchParams.toString());

    if (next.year !== undefined) {
      if (next.year !== null) newParams.set("year", String(next.year)); else newParams.delete("year");
    }
    if (next.day !== undefined) {
      if (next.day !== null) newParams.set("day", String(next.day)); else newParams.delete("day");
    }
    if (next.time !== undefined) {
      if (next.time) newParams.set("time", String(next.time)); else newParams.delete("time");
    }
    
    // Only update if params actually changed
    if (currentParams.toString() !== newParams.toString()) {
      router.replace(`/library/${slug}?${newParams.toString()}`, { scroll: false });
    }
  }, [router, searchParams, slug]);

  useEffect(() => {
    syncQuery({ year: selectedYear, day: selectedDay, time });
  }, [selectedYear, selectedDay, time, syncQuery]);

  const isValidTime = () => {
    if (!time) return false;
    const n = Number(time);
    return !isNaN(n) && n > 0 && n <= 600; // limite 10h
  };

  // Função para verificar se todos os campos obrigatórios estão preenchidos
  const isFormValid = () => selectedYear !== null && selectedDay !== null && isValidTime();

  const handleStartExam = () => {
    if (!isFormValid()) {
      alert("Preencha tempo, ano e dia.");
      return;
    }
    setIsNavigating(true); 
    router.push(`/simulation/${slug}?year=${selectedYear}&day=${selectedDay}&time=${time}`);
  };

  // feedback de carregamento
  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-[#f5f5f7] flex flex-col relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
      {/* macOS-style subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/40 via-transparent to-blue-100/20"></div>
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/3 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/3 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <Header />
      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row gap-6">
            <Sidebar />
              <div className="flex-1">
                <div className="max-w-7xl mx-auto">
                  <div className="flex-1">
                    <div className="max-w-7xl mx-auto">
                      <motion.div 
                        className="bg-white backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/60 relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={smoothTransition}
                      >
                        {/* Mascote animado durante carregamento */}
                        <div className="flex flex-col items-center justify-center py-16">
                          <motion.div
                            animate={{ 
                              y: [0, -15, 0],
                              rotate: [0, 2, -2, 0]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Image 
                              src="/Mascote/banners/Camaleão_15.png" 
                              alt="Mascote Vestibuline" 
                              className="w-40 h-40 object-contain"
                              width={160}
                              height={160}
                            />
                          </motion.div>
                          <motion.p 
                            className="mt-6 text-[#6e6e73] font-medium text-[15px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            Carregando informações...
                          </motion.p>
                          {/* Loading dots animation */}
                          <motion.div 
                            className="flex space-x-2 mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-[#007AFF] rounded-full"
                                animate={{ 
                                  scale: [1, 1.3, 1],
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ 
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.15
                                }}
                              />
                            ))}
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
    );
  }

  if (isNavigating) {
    return (
      <LoadingScreen message="Iniciando o simulado..." />
    );
  }

  if (error || !universityInfo) {
    return (
      <motion.div 
        className="min-h-screen bg-[#f5f5f7] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#FF3B30]/20 max-w-md"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...smoothTransition, delay: 0.1 }}
        >
          <motion.div 
            className="w-14 h-14 mx-auto mb-5 bg-[#FF3B30]/10 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
          >
            <motion.svg 
              className="w-7 h-7 text-[#FF3B30]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </motion.svg>
          </motion.div>
          <motion.h2 
            className="text-[20px] font-semibold text-[#1d1d1f] mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Ops! Algo deu errado
          </motion.h2>
          <motion.p 
            className="text-[#6e6e73] text-[15px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {error || 'Não foi possível carregar os dados da universidade.'}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-[#f5f5f7] flex flex-col relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* macOS-style subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-white"></div>
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/3 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/3 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1.05, 1, 1.05]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header component */}
      <Header />

      {/* Main content */}
      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar */}
            <Sidebar />

            {/* Main content - Contêiner único com layout de duas colunas */}
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothTransition, delay: 0.1 }}
            >
              <div className="max-w-7xl mx-auto">
                <motion.div 
                  className="bg-white backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 relative overflow-hidden"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...smoothTransition, delay: 0.15 }}
                  whileHover={{ boxShadow: "0 12px 40px rgb(0,0,0,0.06)" }}
                >
                  {/* macOS-style subtle top accent */}
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />

                  {/* Layout de duas colunas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    
                    {/* Coluna Esquerda - Configuração da Prova */}
                    <motion.div 
                      className="order-2 lg:order-1"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {/* Header da configuração com mascote */}
                      <motion.div 
                        className="mb-10 relative"
                        variants={fadeInUp}
                        transition={smoothTransition}
                      >
                        <motion.div 
                          className="w-11 h-11 mb-5 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-[11px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,122,255,0.15)]"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          transition={springTransition}
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                          </svg>
                        </motion.div>
                        <h2 className="text-[28px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">Configurar Simulado</h2>
                        <p className="text-[#6e6e73] text-[15px] leading-relaxed">Personalize sua experiência de estudo</p>
                      </motion.div>

                      <motion.div 
                        className="space-y-7"
                        variants={staggerContainer}
                      >
                        {/* Seleção de Ano */}
                        <motion.div 
                          className="space-y-2.5"
                          variants={fadeInUp}
                          transition={smoothTransition}
                        >
                          <label className="text-[13px] font-semibold text-gray-700 flex items-center space-x-2.5">
                            <motion.span 
                              className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"
                              animate={selectedYear ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            />
                            <span>Ano da Prova</span>
                          </label>
                          <motion.select
                            value={selectedYear ?? ''}
                            onChange={(e) => {
                              const val = e.target.value ? Number(e.target.value) : null;
                              setSelectedYear(val);
                              setSelectedDay(null);
                            }}
                            className="w-full px-4 py-3 border border-[#d2d2d7] rounded-[10px] focus:outline-none focus:ring-[3px] focus:ring-[#007AFF]/10 focus:border-[#007AFF] transition-all duration-200 bg-white text-[15px] text-[#1d1d1f] appearance-none cursor-pointer hover:border-[#86868b]"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236e6e73' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 1rem center'
                            }}
                            whileFocus={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <option value="">Selecione o ano</option>
                            {yearsSorted.map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </motion.select>
                        </motion.div>

                        {/* Seleção de Dia */}
                        <motion.div 
                          className="space-y-2.5"
                          variants={fadeInUp}
                          transition={smoothTransition}
                        >
                          <label className="text-[13px] font-semibold text-gray-700 flex items-center space-x-2.5">
                            <motion.span 
                              className="w-1.5 h-1.5 bg-[#5856D6] rounded-full"
                              animate={selectedDay ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            />
                            <span>Dia da Prova</span>
                          </label>
                          <div className="flex flex-wrap gap-2.5">
                            <AnimatePresence mode="popLayout">
                              {availableDays.map((d, index) => (
                                <motion.button
                                  key={d}
                                  type="button"
                                  onClick={() => setSelectedDay(d)}
                                  className={`px-5 py-2.5 rounded-[10px] border text-[14px] font-medium ${
                                    selectedDay === d 
                                      ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-[0_2px_8px_rgba(0,122,255,0.25)]' 
                                      : 'bg-white text-gray-700 border-[#d2d2d7] hover:bg-[#f5f5f7] hover:border-[#86868b]'
                                  }`}
                                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ 
                                    ...springTransition,
                                    delay: index * 0.05
                                  }}
                                  layout
                                >
                                  Dia {d}
                                </motion.button>
                              ))}
                            </AnimatePresence>
                            {selectedYear && availableDays.length === 0 && (
                              <motion.div 
                                className="w-full text-center py-4 bg-[#FFF9E6] rounded-[10px] border border-[#FFD60A]/30"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={smoothTransition}
                              >
                                <span className="text-[13px] text-[#8B7000]">Nenhum dia configurado para este ano.</span>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>

                        {/* Input de tempo */}
                        <motion.div 
                          className="space-y-2.5"
                          variants={fadeInUp}
                          transition={smoothTransition}
                        >
                          <label className="text-[13px] font-semibold text-gray-700 flex items-center space-x-2.5">
                            <motion.span 
                              className="w-1.5 h-1.5 bg-[#34C759] rounded-full"
                              animate={isValidTime() ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            />
                            <span>Duração (minutos)</span>
                          </label>
                          <div className="relative">
                            <motion.input
                              type="number"
                              min={1}
                              max={600}
                              placeholder="Ex: 180"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className={`w-full px-4 py-3 border rounded-[10px] focus:outline-none focus:ring-[3px] transition-all duration-200 bg-white pr-14 text-[15px] ${
                                time && !isValidTime() 
                                  ? 'border-[#FF3B30] focus:ring-[#FF3B30]/10 focus:border-[#FF3B30]' 
                                  : 'border-[#d2d2d7] focus:ring-[#007AFF]/10 focus:border-[#007AFF] hover:border-[#86868b]'
                              }`}
                              whileFocus={{ scale: 1.01 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6e6e73] text-[13px] font-medium">
                              min
                            </div>
                          </div>
                          <AnimatePresence>
                            {time && !isValidTime() && (
                              <motion.p 
                                className="text-[13px] text-[#FF3B30] flex items-center space-x-1.5 mt-1.5"
                                initial={{ opacity: 0, y: -5, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -5, height: 0 }}
                                transition={smoothTransition}
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                </svg>
                                <span>Informe um valor entre 1 e 600 minutos.</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Fallback warning */}
                        <AnimatePresence>
                          {usedFallback && (
                            <motion.div 
                              className="bg-[#FFF9E6] border border-[#FFD60A]/30 rounded-[10px] p-3.5"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={smoothTransition}
                            >
                              <div className="flex items-center space-x-2.5">
                                <motion.svg 
                                  className="w-4 h-4 text-[#FF9500]" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                </motion.svg>
                                <span className="text-[13px] text-[#8B7000] font-medium">
                                  Dados carregados localmente (modo offline)
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Botão de iniciar com mascote */}
                        <motion.div 
                          className="relative pt-2"
                          variants={fadeInUp}
                          transition={smoothTransition}
                        >
                          <motion.button
                            onClick={handleStartExam}
                            disabled={!isFormValid()}
                            className={`w-full font-semibold py-3.5 px-6 rounded-[12px] flex items-center justify-center space-x-2.5 text-[15px] cursor-pointer ${
                              isFormValid() 
                                ? "bg-[#007AFF] text-white shadow-[0_4px_14px_rgba(0,122,255,0.4)]" 
                                : "bg-[#e5e5ea] text-[#86868b] cursor-not-allowed shadow-none"
                            }`}
                            whileHover={isFormValid() ? { 
                              scale: 1.02, 
                              boxShadow: "0 6px 20px rgba(0,122,255,0.5)",
                              backgroundColor: "#0051D5"
                            } : {}}
                            whileTap={isFormValid() ? { scale: 0.98 } : {}}
                            transition={springTransition}
                          >
                            <AnimatePresence mode="wait">
                              {isFormValid() ? (
                                <motion.span
                                  key="ready"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  Iniciar Simulado
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="not-ready"
                                  className="flex items-center space-x-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-9a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  <span>Preencha todos os campos</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </motion.div>

                        {/* Progress indicator */}
                        <motion.div 
                          className="flex justify-center space-x-2 pt-1"
                          variants={fadeInUp}
                          transition={smoothTransition}
                        >
                          {[
                            { active: selectedYear, color: '#007AFF' },
                            { active: selectedDay, color: '#5856D6' },
                            { active: isValidTime(), color: '#34C759' }
                          ].map((dot, index) => (
                            <motion.div
                              key={index}
                              className="w-1.5 h-1.5 rounded-full"
                              animate={{ 
                                backgroundColor: dot.active ? dot.color : '#d2d2d7',
                                scale: dot.active ? [1, 1.3, 1] : 1
                              }}
                              transition={{ duration: 0.3 }}
                            />
                          ))}
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Coluna Direita - Informações da Universidade */}
                    <motion.div 
                      className="order-1 lg:order-2 lg:border-l lg:border-[#d2d2d7]/50 lg:pl-10 relative"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...smoothTransition, delay: 0.2 }}
                    > 
                      {/* Divisória visual no mobile */}
                      <motion.div 
                        className="block lg:hidden w-full h-px bg-gradient-to-r from-transparent via-[#d2d2d7]/50 to-transparent mb-8"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      />
                      
                      <div className="text-center">
                        <motion.h1 
                          className="text-[32px] md:text-[36px] font-semibold text-[#1d1d1f] mb-8 tracking-tight leading-tight"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...smoothTransition, delay: 0.25 }}
                        >
                          {universityInfo.name.toUpperCase()}
                        </motion.h1>

                        {/* Logo com efeitos */}
                        <motion.div 
                          className="w-40 h-40 mx-auto mb-8 relative group"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-br from-[#007AFF]/5 to-[#5856D6]/5 rounded-full blur-xl"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <div className="relative w-full h-full !bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center p-6 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-shadow duration-500 border border-gray-200">
                            <Image 
                              src={
                                universityInfo.logo
                                  ? (universityInfo.logo.startsWith('/') || universityInfo.logo.startsWith('http')
                                      ? universityInfo.logo
                                      : `/${universityInfo.logo}`)
                                  : "/placeholder.svg"
                              }
                              alt={universityInfo.name}
                              width={120}
                              height={120}
                              className="object-contain filter drop-shadow-none"
                            />
                          </div>
                        </motion.div>

                        <motion.p 
                          className="text-[#6e6e73] text-[16px] font-normal mb-6 leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...smoothTransition, delay: 0.35 }}
                        >
                          {universityInfo.fullName}
                        </motion.p>

                        {/* Indicador de status */}
                        <motion.div 
                          className="flex justify-center items-center space-x-2 mb-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <motion.div 
                            className="w-1.5 h-1.5 bg-[#34C759] rounded-full"
                            animate={{ 
                              scale: [1, 1.3, 1],
                              opacity: [1, 0.7, 1]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <span className="text-[13px] text-[#34C759] font-medium">Sistema ativo</span>
                        </motion.div>

                        {/* Informações adicionais da universidade */}
                        <motion.div 
                          className="mt-8 space-y-3"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...smoothTransition, delay: 0.45 }}
                        >
                          <motion.div 
                            className="bg-gradient-to-br from-[#007AFF]/5 to-[#5856D6]/5 rounded-[14px] p-5 relative overflow-hidden border border-[#007AFF]/10"
                            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,122,255,0.1)" }}
                            transition={springTransition}
                          >
                            <div className="flex items-center justify-center space-x-2 mb-3 relative z-10">
                              <motion.svg 
                                className="w-4 h-4 text-[#007AFF]" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </motion.svg>
                              <span className="text-[13px] font-semibold text-[#007AFF]">Anos Disponíveis</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 relative z-10">
                              {yearsSorted.map((year, index) => (
                                <motion.span 
                                  key={year} 
                                  className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-[8px] text-[12px] font-medium text-[#1d1d1f] border border-[#007AFF]/10"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + index * 0.05 }}
                                  whileHover={{ scale: 1.1, y: -2 }}
                                >
                                  {year}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                          
                          {/* Card motivacional com mascote */}
                          <motion.div 
                            className="bg-gradient-to-br from-[#34C759]/8 to-[#30D158]/8 rounded-[14px] p-4 flex items-center space-x-3 border border-[#34C759]/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...smoothTransition, delay: 0.55 }}
                            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(52,199,89,0.15)" }}
                          >
                            <motion.div
                              animate={{ 
                                rotate: [0, 5, -5, 0],
                                y: [0, -3, 0]
                              }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <Image 
                                src="/Mascote/banners/Camaleão_6.png" 
                                alt="Mascote motivacional" 
                                className="w-30 h-30 object-contain flex-shrink-0"
                                width={200}
                                height={200}
                              />
                            </motion.div>
                            <div className="text-left">
                              <span className="text-[13px] font-semibold text-gray-700">Dica do Camaleão</span><br/>
                              <span className="text-[12px] text-gray-500 leading-relaxed">Configure seu simulado e prepare-se para o sucesso!</span>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo={`/library/${slug}`}
        isRequired={status === 'unauthenticated'}
      />
      <Footer />
    </motion.div>
  );
}