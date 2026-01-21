"use client"

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header"
import LoginModal from "@/components/Login-modal";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square } from "lucide-react";
import Footer from "@/components/Footer";
import { universities,  allQuestions } from "@/lib/dataUniversity";
import { useRouter } from 'next/navigation';
import LoadingScreen from "@/components/LoadingScreen";
import { motion, AnimatePresence, type Transition } from "framer-motion";

// Apple-like animation configuration
const appleEasing: [number, number, number, number] = [0.25, 0.1, 0.25, 1]; // Apple's signature cubic-bezier curve

const appleTransition: Transition = {
  duration: 0.6,
  ease: appleEasing
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: appleTransition
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: appleEasing }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: appleEasing }
  }
};

const slideInFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: appleEasing }
  }
};

const slideInFromBottom = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: appleEasing }
  }
};

// Função para gerar os dados das disciplinas, agora com ordenação personalizada
const generateSubjectsData = (universitySlug: string | null) => {
  if (!universitySlug) {
    return [];
  }

  const subjectsMap = new Map<string, Set<string>>();
  const questionsForUniversity = allQuestions.filter(q => q.university === universitySlug);
  for (const question of questionsForUniversity) {
    const materias = Array.isArray(question.materia) ? question.materia : [question.materia];
    const conteudos = Array.isArray(question.conteudo) ? question.conteudo : [question.conteudo];

    for (const mainSubject of materias) {
      if (!subjectsMap.has(mainSubject)) {
        subjectsMap.set(mainSubject, new Set<string>());
      }
      
      const topicsSet = subjectsMap.get(mainSubject)!;
      for (const topic of conteudos) {
        topicsSet.add(topic);
      }
    }
  }

  const dynamicSubjectsData = Array.from(subjectsMap.entries()).map(([name, topicsSet]) => ({
    name: name,
    topics: Array.from(topicsSet).sort(),
  }));

  const customOrder = [
    "Matemática", "Física", "Química", "Biologia", "História", 
    "Geografia", "Filosofia", "Sociologia", "Língua Portuguesa", 
    "Inglês", "Arte"
  ];

  dynamicSubjectsData.sort((a, b) => {
    const indexA = customOrder.indexOf(a.name);
    const indexB = customOrder.indexOf(b.name);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return dynamicSubjectsData;
};

export default function CreatePage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedRealUniversity, setSelectedRealUniversity] = useState<string | null>(null);
  const [selectedRealYear, setSelectedRealYear] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const subjectsData = useMemo(() => generateSubjectsData(selectedUniversity), [selectedUniversity]);

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    }
  }, [status]);

  // Função para lidar com a seleção de todos os tópicos de uma matéria
  const handleSelectAll = (subjectName: string, topics: string[]) => {
    const topicKeys = topics.map(topic => `${subjectName}-${topic}`);
    const allSelected = topicKeys.every(key => selectedSubjects.includes(key));

    if (allSelected) {
      // Desmarcar tudo desta matéria
      setSelectedSubjects(prev => prev.filter(key => !topicKeys.includes(key)));
    } else {
      // Selecionar tudo desta matéria (evitando duplicatas)
      setSelectedSubjects(prev => {
        const newSelection = [...prev];
        topicKeys.forEach(key => {
          if (!newSelection.includes(key)) {
            newSelection.push(key);
          }
        });
        return newSelection;
      });
    }
  };

  // Função para lidar com a seleção de universidade no simulado real
  const handleRealUniversityChange = (slug: string) => {
    setSelectedRealUniversity(slug);
    const university = universities.find(u => u.slug === slug);
    if (university) {
      setAvailableYears(university.year);
    } else {
      setAvailableYears([]);
    }
    setSelectedRealYear(null); // Reseta o ano ao trocar de universidade
  };

  // Função para lidar com seleção de tópicos
  const handleTopicChange = (subject: string, topic: string, checked: boolean) => {
    const key = `${subject}-${topic}`;
    setSelectedSubjects((prev) =>
      checked ? [...prev, key] : prev.filter((item) => item !== key)
    );
  };

  interface CompiledQuestionsResponse {
    id?: string;
  questions?: unknown[]; // Substitua unknown[] pelo tipo correto se souber
  }

  const handleStartPersonalizedSimulado = async () => {
    if (!isValid || isCreating) return;
    setIsLoading(true);
    setIsCreating(true);

    try {
      const response = await fetch('/api/simulations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university: selectedUniversity,
          questions: selectedQuestions,
          subjects: selectedSubjects,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar as questões na API.');
      }

      const compiledQuestions: CompiledQuestionsResponse = await response.json();

      // Debug: log compiled questions count for troubleshooting
      try {
        console.log('CreatePage: compiledQuestions received length=', Array.isArray(compiledQuestions.questions) ? compiledQuestions.questions.length : 'not-array', 'requested=', selectedQuestions);
      } catch {
        /* noop */
      }

      // If server returned an id (handshake), use it and redirect with simId; otherwise fallback to sessionStorage
      if (compiledQuestions && typeof compiledQuestions.id === 'string') {
        const simId = String(compiledQuestions.id);
        console.log('CreatePage: received simId=', simId);
        router.push(`/simulation/${selectedUniversity}?simId=${simId}`);
      } else {
        // Salva a prova compilada no sessionStorage do navegador (fallback)
        sessionStorage.setItem('personalizedSimulationQuestions', JSON.stringify(compiledQuestions));
        // Redireciona para a página de simulação
        router.push(`/simulation/${selectedUniversity}`);
      }

    } catch (error) {
      console.error("Erro ao criar simulado personalizado:", error);
      setIsLoading(false);
      // Opcional: Adicionar um alerta/toast para o usuário aqui
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartSimuladoMix = async () => {
    if (!isValidReal || isCreating) return;
    setIsLoading(true);
    setIsCreating(true);

    try {
      const response = await fetch('/api/simulations/create-mix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          university: selectedRealUniversity,
          count: selectedQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar as questões no servidor.');
      }

      const result = await response.json();

      if (result && typeof result.id === 'string') {
        const simId = result.id;
        console.log('CreatePage (Mix): simId recebido=', simId);
        router.push(`/simulation/${selectedRealUniversity}?simId=${simId}`);
      } else {
        console.log('CreatePage (Mix): simId não recebido, usando fallback para sessionStorage.');
        const questions = result.questions || result;
        sessionStorage.setItem('personalizedSimulationQuestions', JSON.stringify(questions));
        router.push(`/simulation/${selectedRealUniversity}?totalQuestions=${questions.length}`);
      }

    } catch (error) {
      console.error("Erro ao iniciar Simulado Mix:", error);
      setIsLoading(false);
    } finally {
      setIsCreating(false);
    }
  };

  // Validação: todos os campos obrigatórios preenchidos?
  const isValid =
    !!selectedUniversity &&
    !!selectedQuestions &&
    selectedSubjects.length > 0;
  // Validação para simulado real (agora exige ano)
  const isValidReal = !!selectedRealUniversity && !!selectedQuestions;

  if (isLoading) {
    return <LoadingScreen message="Preparando seu simulado personalizado..." />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="flex-1 w-full">
              {/* Header mais simples - Mobile optimized */}
              <motion.div 
                className="mb-6 lg:mb-8 text-center sm:text-left"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <div className="flex items-center justify-center sm:justify-start gap-4 mb-2">
                  <motion.h1 
                    className="text-[28px] sm:text-[32px] font-semibold text-gray-700 tracking-tight"
                    variants={fadeInUp}
                  >
                    Gerador de Simulados
                  </motion.h1>
                </div>
                <motion.p 
                  className="text-[#6e6e73] text-[14px] sm:text-[15px] px-2 sm:px-0 leading-relaxed"
                  variants={fadeInUp}
                >
                  Monte simulados personalizados ou escolha provas reais de vestibulares.
                </motion.p>
              </motion.div>

              <Tabs defaultValue="real" className="mb-6 lg:mb-8">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={scaleIn}
                >
                  <TabsList className="grid w-full grid-cols-2 bg-white backdrop-blur-xl p-1.5 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 h-auto transition-all duration-300">
                    <TabsTrigger 
                      value="real" 
                      className="flex items-center gap-1 sm:gap-2 rounded-[10px] py-2.5 sm:py-3 px-2 sm:px-4 font-semibold text-[13px] sm:text-[14px] transition-all duration-300 ease-in-out
                                data-[state=active]:bg-[#007AFF] data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,122,255,0.25)] data-[state=active]:scale-[1.02]
                                text-gray-700 hover:!text-white hover:bg-blue-500 relative overflow-hidden cursor-pointer"
                    >
                      <span className="text-sm sm:text-lg transition-transform duration-300">🎯</span>
                      <span className="relative z-10 transition-all duration-300">Simulado Mix</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="estudo" 
                      className="flex items-center gap-1 sm:gap-2 rounded-[10px] py-2.5 sm:py-3 px-2 sm:px-4 font-semibold text-[13px] sm:text-[14px] transition-all duration-300 ease-in-out
                                data-[state=active]:bg-[#6366f1] data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(88,86,214,0.25)] data-[state=active]:scale-[1.02]
                                text-gray-700 hover:bg-[#6366f1] hover:!text-white relative overflow-hidden cursor-pointer"
                    >
                      <span className="text-sm sm:text-lg transition-transform duration-300">📚</span>
                      <span className="relative z-10 transition-all duration-300">Simulado Personalizado</span>
                    </TabsTrigger>
                  </TabsList>
                </motion.div>

                {/* Simulado Real */}
                <TabsContent value="real" className="mt-4 sm:mt-6">
                  <motion.div 
                    className="relative"
                    initial="hidden"
                    animate="visible"
                    variants={scaleIn}
                  >
                    <Card className="relative overflow-hidden border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white backdrop-blur-2xl backdrop-saturate-150 rounded-[16px] p-3 sm:p-6 transition-all duration-300">
                      {/* Decorative background - Hidden on mobile */}
                      <motion.div 
                        className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#007AFF]/5 to-transparent rounded-full -mr-16 -mt-16"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: appleEasing, delay: 0.2 }}
                      />
                      <motion.div 
                        className="hidden sm:block absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#007AFF]/5 to-transparent rounded-full -ml-12 -mb-12"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: appleEasing, delay: 0.3 }}
                      />
                      
                      {/* Mascote decorativo no canto superior direito */}
                      <motion.div 
                        className="hidden lg:block absolute top-1 right-1 z-20"
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, ease: appleEasing, delay: 0.4 }}
                      >
                        <Image 
                          src="/Mascote/banners/Camaleão_10.png" 
                          alt="Mascote Vestibuline" 
                          width={120} 
                          height={120}
                          className="w-24 h-24 object-contain opacity-90 hover:opacity-100 transition-opacity"
                        />
                      </motion.div>
                      
                      <CardContent className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-7">
                        {/* University Selection */}
                        <motion.div 
                          className="space-y-2.5"
                          variants={slideInFromLeft}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.1 }}
                        >
                          <label className="flex items-center gap-2 text-[15px] sm:text-[16px] font-semibold text-gray-700">
                            <span className="text-[#007AFF]">🏛️</span>
                            Universidade/Instituição
                          </label>
                          <Select value={selectedRealUniversity ?? undefined} onValueChange={handleRealUniversityChange}>
                            <SelectTrigger className="w-full h-11 sm:h-12 text-[14px] sm:text-[15px] border border-gray-200 rounded-[10px] focus:border-[#007AFF] focus:ring-[3px] focus:ring-[#007AFF]/10 transition-all bg-white hover:border-[#86868b] cursor-pointer shadow-none hover:shadow-xl">
                              <SelectValue placeholder="Escolha uma instituição..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white max-h-60 overflow-y-auto border border-gray-200 rounded-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                              {universities.map((uni) => (
                                <SelectItem 
                                  key={uni.slug} 
                                  value={uni.slug}
                                  className="text-[14px] sm:text-[15px] py-2.5 text-gray-700 hover:!text-blue-500 hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                  {uni.name.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>

                        {/* Number of Questions */}
                        <motion.div 
                          className="space-y-2.5"
                          variants={slideInFromLeft}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.2 }}
                        >
                          <label className="flex items-center gap-2 text-[15px] sm:text-[16px] font-semibold text-gray-700">
                            <span className="text-[#5856D6]">🔢</span>
                            Número de Questões
                          </label>
                          <Select value={selectedQuestions ?? undefined} onValueChange={setSelectedQuestions}>
                            <SelectTrigger className="w-full h-11 sm:h-12 text-[14px] sm:text-[15px] border border-gray-200 rounded-[10px] focus:border-[#5856D6] focus:ring-[3px] focus:ring-[#5856D6]/10 transition-all bg-white hover:border-[#86868b] cursor-pointer shadow-none hover:shadow-xl">
                              <SelectValue placeholder="Quantas questões deseja?" />
                            </SelectTrigger>
                            <SelectContent className="bg-white max-h-60 overflow-y-auto border border-gray-200 rounded-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                              {[10, 20, 30, 40, 50].map((qtd) => (
                                <SelectItem 
                                  key={qtd} 
                                  value={qtd.toString()}
                                  className="text-[14px] sm:text-[15px] py-2.5 text-gray-700 hover:!text-blue-500 hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                  {qtd} questões
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>

                        {/* Info cards - Mobile optimized */}
                        <motion.div 
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6"
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div 
                            className="bg-[#007AFF] rounded-[12px] p-3 sm:p-4 border border-[#007AFF] relative overflow-hidden"
                            variants={slideInFromBottom}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-2 text-white relative z-10">
                              <span>⚡</span>
                              <span className="font-semibold text-[13px] sm:text-[14px]">Experiência Real</span>
                            </div>
                            <p className="text-white text-[12px] sm:text-[13px] mt-1 relative z-10 opacity-90">Mesmo formato da prova original</p>
                          </motion.div>
                          <motion.div 
                            className="bg-[#34C759] rounded-[12px] p-3 sm:p-4 border border-[#34C759] relative overflow-hidden"
                            variants={slideInFromBottom}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-2 text-white relative z-10">
                              <span>🎖️</span>
                              <span className="font-semibold text-[13px] sm:text-[14px]">Preparação Premium</span>
                            </div>
                            <p className="text-white text-[12px] sm:text-[13px] mt-1 relative z-10 opacity-90">Questões validadas e atualizadas</p>
                          </motion.div>
                        </motion.div>
                      </CardContent>
                      
                      <CardFooter className="relative z-10 p-4 sm:p-6 lg:p-8 pt-0">
                        <motion.div 
                          className="w-full"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: appleEasing, delay: 0.4 }}
                        >
                          <Button
                            onClick={handleStartSimuladoMix}
                            className={`w-full h-11 sm:h-12 text-[14px] sm:text-[15px] font-semibold rounded-[12px] transition-all duration-200 transform active:scale-[0.98] cursor-pointer shadow-none hover:shadow-xl hover:shadow-blue-500/30 ${
                              isValidReal 
                                ? 'bg-[#007AFF] hover:bg-[#0051D5] text-white shadow-[0_4px_14px_rgba(0,122,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.5)]' 
                                : 'bg-[#e5e5ea] text-[#86868b]'
                            }`}
                            disabled={!isValidReal || isCreating}
                          >
                            {isCreating ? (
                              'Preparando seu simulado...'
                            ) : isValidReal ? (
                              <span className="flex items-center gap-2 sm:gap-3">
                                <span>🚀</span>
                                <span className="text-[13px] sm:text-[14px] lg:text-[15px]">Iniciar Simulado Mix</span>
                              </span>
                            ) : (
                              'Preencha todos os campos'
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Simulado Estudo */}
                <TabsContent value="estudo" className="mt-4 sm:mt-6">
                  <motion.div 
                    className="relative"
                    initial="hidden"
                    animate="visible"
                    variants={scaleIn}
                  >
                    <Card className="relative overflow-hidden border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white backdrop-blur-2xl backdrop-saturate-150 rounded-[16px] p-3 sm:p-6 transition-all duration-300">
                      {/* Decorative background - Hidden on mobile */}
                      <motion.div 
                        className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#5856D6]/5 to-transparent rounded-full -mr-16 -mt-16"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: appleEasing, delay: 0.2 }}
                      />
                      <motion.div 
                        className="hidden sm:block absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#5856D6]/5 to-transparent rounded-full -ml-12 -mb-12"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: appleEasing, delay: 0.3 }}
                      />
                      
                      {/* Mascote decorativo no canto superior direito */}
                      <motion.div 
                        className="hidden lg:block absolute top-1 right-1 z-20"
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, ease: appleEasing, delay: 0.4 }}
                      >
                        <Image 
                          src="/Mascote/banners/Camaleão_10.png" 
                          alt="Mascote Vestibuline" 
                          width={120} 
                          height={120}
                          className="w-24 h-24 object-contain opacity-90 hover:opacity-100 transition-opacity"
                        />
                      </motion.div>
                      
                      <CardContent className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-7">
                        {/* University Selection */}
                        <motion.div 
                          className="space-y-2.5"
                          variants={slideInFromLeft}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.1 }}
                        >
                          <label className="flex items-center gap-2 text-[15px] sm:text-[16px] font-semibold text-gray-700">
                            <span className="text-[#5856D6]">🏛️</span>
                            Universidade/Instituição
                          </label>
                          <Select value={selectedUniversity ?? undefined} onValueChange={setSelectedUniversity}>
                            <SelectTrigger className="w-full h-11 sm:h-12 text-[14px] sm:text-[15px] border border-gray-200 rounded-[10px] focus:border-[#5856D6] focus:ring-[3px] focus:ring-[#5856D6]/10 transition-all bg-white hover:border-[#86868b] cursor-pointer shadow-none hover:shadow-xl">
                              <SelectValue placeholder="Escolha uma instituição..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white max-h-60 overflow-y-auto border border-gray-200 rounded-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                              {universities.map((uni) => (
                                <SelectItem 
                                  key={uni.slug} 
                                  value={uni.slug}
                                  className="text-[14px] sm:text-[15px] py-2.5 text-gray-700 hover:!text-[#5856D6] hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                  {uni.name.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>

                        {/* Subjects Selection - Mobile optimized */}
                        <motion.div 
                          className="space-y-3 sm:space-y-4"
                          variants={slideInFromLeft}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.2 }}
                        >
                          <label className="flex items-center gap-2 text-[15px] sm:text-[16px] font-semibold text-gray-700">
                            <span className="text-[#5856D6]">🎯</span>
                            Disciplinas e Assuntos Específicos
                          </label>
                          <AnimatePresence mode="wait">
                            {!selectedUniversity ? (
                              // CASO 1: Nenhuma universidade selecionada
                              <motion.div 
                                key="no-university"
                                className="bg-[#f5f5f7] rounded-[12px] p-6 sm:p-8 border border-dashed border-gray-200 text-center cursor-not-allowed"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: appleEasing }}
                              >
                                <div className="flex flex-col items-center gap-4">
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.5 }}
                                    transition={{ duration: 0.5, ease: appleEasing, delay: 0.1 }}
                                  >
                                    <Image 
                                      src="/Mascote/banners/Camaleão_5.png" 
                                      alt="Mascote Vestibuline" 
                                      width={100} 
                                      height={100}
                                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                                    />
                                  </motion.div>
                                  <p className="!text-[#6e6e73] font-medium text-[13px] sm:text-[14px]">
                                    Primeiro, selecione uma universidade para habilitar a escolha das matérias.
                                  </p>
                                </div>
                              </motion.div>
                            ) : subjectsData.length > 0 ? (
                              // CASO 2: Universidade selecionada E HÁ matérias
                              <motion.div 
                                key="has-subjects"
                                className="bg-white rounded-[12px] p-4 sm:p-6 border border-gray-200"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: appleEasing }}
                              >
                                <Accordion type="multiple" className="w-full space-y-2">
                                  {subjectsData.map((subject, index) => {
                                    const topicKeys = subject.topics.map(t => `${subject.name}-${t}`);
                                    const isAllSelected = topicKeys.length > 0 && topicKeys.every(key => selectedSubjects.includes(key));
                                    
                                    return (
                                      <motion.div
                                        key={subject.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, ease: appleEasing, delay: index * 0.05 }}
                                      >
                                        <AccordionItem 
                                          value={subject.name}
                                          className="border border-gray-200 rounded-[10px] px-3 sm:px-4 bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200"
                                        >
                                          <AccordionTrigger className="font-semibold text-[14px] sm:text-[15px] hover:text-[#5856D6] transition-colors py-3 sm:py-4 cursor-pointer">
                                            <span className="flex items-center gap-2">
                                              <span>📖</span>
                                              {subject.name}
                                            </span>
                                          </AccordionTrigger>
                                          <AccordionContent className="pt-3 sm:pt-4 pb-4">
                                            <div className="flex justify-end mb-3">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSelectAll(subject.name, subject.topics)}
                                                className="text-[#5856D6] hover:text-[#4640B8] hover:bg-[#5856D6]/10 text-[12px] font-semibold h-8 px-2 cursor-pointer"
                                              >
                                                {isAllSelected ? (
                                                  <span className="flex items-center gap-1.5">
                                                    <CheckSquare className="w-4 h-4" />
                                                    Desmarcar todos
                                                  </span>
                                                ) : (
                                                  <span className="flex items-center gap-1.5">
                                                    <Square className="w-4 h-4" />
                                                    Selecionar todos
                                                  </span>
                                                )}
                                              </Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                              {subject.topics.map((topic, topicIndex) => {
                                                const key = `${subject.name}-${topic}`;
                                                const isSelected = selectedSubjects.includes(key);
                                                return (
                                                  <motion.label 
                                                    key={key}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, ease: appleEasing, delay: topicIndex * 0.02 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-[8px] border cursor-pointer transition-all duration-200 ${
                                                      isSelected 
                                                        ? 'border-[#5856D6] bg-white text-[#5856D6]' 
                                                        : 'border-gray-200 bg-white hover:border-[#5856D6]/50 hover:bg-[#f5f5f7]'
                                                    }`}
                                                  >
                                                    <Checkbox
                                                      id={key}
                                                      checked={isSelected}
                                                      onCheckedChange={(checked) => handleTopicChange(subject.name, topic, !!checked)}
                                                      className="data-[state=checked]:bg-[#5856D6] data-[state=checked]:border-[#5856D6] mt-0.5 flex-shrink-0"
                                                    />
                                                    <span className="text-[12px] sm:text-[13px] font-medium leading-tight">{topic}</span>
                                                  </motion.label>
                                                );
                                              })}
                                            </div>
                                          </AccordionContent>
                                        </AccordionItem>
                                      </motion.div>
                                    );
                                  })}
                                </Accordion>
                              </motion.div>
                            ) : (
                              // CASO 3: Universidade selecionada MAS NÃO HÁ matérias
                              <motion.div 
                                key="no-subjects"
                                className="bg-white rounded-[12px] p-6 sm:p-8 border border-dashed border-[#FFD60A]/50 text-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: appleEasing }}
                              >
                                <div className="flex flex-col items-center gap-4">
                                  <motion.div
                                    initial={{ scale: 0.8, rotate: -5 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ duration: 0.5, ease: appleEasing }}
                                  >
                                    <Image 
                                      src="/Mascote/banners/Camaleão_7.png" 
                                      alt="Mascote Vestibuline" 
                                      width={100} 
                                      height={100}
                                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                                    />
                                  </motion.div>
                                  <p className="text-[#8B7000] font-semibold text-[13px] sm:text-[14px]">
                                    Ops, ainda não temos matérias analisadas para esta prova :(
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Number of Questions */}
                        <motion.div 
                          className="space-y-2.5"
                          variants={slideInFromLeft}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.3 }}
                        >
                          <label className="flex items-center gap-2 text-[15px] sm:text-[16px] font-semibold text-gray-700">
                            <span className="text-[#5856D6]">🔢</span>
                            Número de Questões
                          </label>
                          <Select value={selectedQuestions ?? undefined} onValueChange={setSelectedQuestions}>
                            <SelectTrigger className="w-full h-11 sm:h-12 text-[14px] sm:text-[15px] border border-gray-200 rounded-[10px] focus:border-[#5856D6] focus:ring-[3px] focus:ring-[#5856D6]/10 transition-all bg-white hover:border-[#86868b] cursor-pointer shadow-none hover:shadow-xl">
                              <SelectValue placeholder="Quantas questões deseja?" />
                            </SelectTrigger>
                            <SelectContent className="bg-white max-h-60 overflow-y-auto border border-gray-200 rounded-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                              {[10, 20, 30, 40, 50].map((qtd) => (
                                <SelectItem 
                                  key={qtd} 
                                  value={qtd.toString()}
                                  className="text-[14px] sm:text-[15px] py-2.5 text-gray-700 hover:!text-[#5856D6] hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                  {qtd} questões
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>

                        {/* Selected subjects preview - Mobile optimized */}
                        <AnimatePresence>
                          {selectedSubjects.length > 0 && (
                            <motion.div 
                              className="bg-[#34C759]/10 rounded-[12px] p-4 sm:p-6 border border-[#34C759]/20 relative overflow-hidden"
                              initial={{ opacity: 0, y: 20, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: "auto" }}
                              exit={{ opacity: 0, y: -20, height: 0 }}
                              transition={{ duration: 0.4, ease: appleEasing }}
                            >
                              <motion.div 
                                className="absolute -right-0 -top-0 opacity-90"
                                initial={{ scale: 0, rotate: 45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.5, ease: appleEasing, delay: 0.2 }}
                              >
                                <Image 
                                  src="/Mascote/banners/Camaleão_18.png" 
                                  alt="" 
                                  width={200} 
                                  height={200}
                                  className="w-25 h-25 object-contain"
                                />
                              </motion.div>
                              <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-3 text-[13px] sm:text-[14px] relative z-10">
                                <span>✅</span>
                                Assuntos Selecionados ({selectedSubjects.length})
                              </h4>
                              <motion.div 
                                className="flex flex-wrap gap-2 relative z-10"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                              >
                                {selectedSubjects.slice(0, 6).map((subject, index) => (
                                  <motion.span 
                                    key={subject}
                                    className="px-2 sm:px-3 py-1 bg-white rounded-full text-[11px] sm:text-[12px] font-medium text-gray-700 border border-gray-200"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, ease: appleEasing, delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {subject.split('-')[1]}
                                  </motion.span>
                                ))}
                                {selectedSubjects.length > 6 && (
                                  <motion.span 
                                    className="px-2 sm:px-3 py-1 bg-[#5856D6]/10 rounded-full text-[11px] sm:text-[12px] font-medium text-[#5856D6]"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, ease: appleEasing, delay: 0.3 }}
                                  >
                                    +{selectedSubjects.length - 6} mais
                                  </motion.span>
                                )}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                      
                      <CardFooter className="relative z-10 p-4 sm:p-6 lg:p-8 pt-0">
                        <motion.div 
                          className="w-full"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: appleEasing, delay: 0.4 }}
                        >
                          <Button
                            onClick={handleStartPersonalizedSimulado}
                            className={`w-full h-11 sm:h-12 text-[14px] sm:text-[15px] font-semibold rounded-[12px] transition-all duration-200 transform active:scale-[0.98] ${
                              isValid 
                                ? 'bg-[#5856D6] hover:bg-[#4640B8] text-white shadow-[0_4px_14px_rgba(88,86,214,0.4)] hover:shadow-[0_6px_20px_rgba(88,86,214,0.5)]' 
                                : 'bg-[#e5e5ea] text-[#86868b] cursor-not-allowed shadow-none'
                            }`}
                            disabled={!isValid || isCreating}
                          >
                            {isCreating ? (
                              'Criando sua prova...'
                            ) : isValid ? (
                              <span className="flex items-center gap-2 sm:gap-3">
                                <span>🎯</span>
                                <span className="text-[13px] sm:text-[14px] lg:text-[15px]">Iniciar Simulado Personalizado</span>
                              </span>
                            ) : (
                              'Complete a configuração'
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/create"
        isRequired={status === 'unauthenticated'}
      />

      <Footer />
    </div>
  )
}