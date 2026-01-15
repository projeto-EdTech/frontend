"use client";

import Header from "@/components/Header";
import DemoModal from "@/components/DemoModal";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import Link from "next/link";
import {Check, BrainCircuit, BookOpen, AlertCircle, CheckCircle, BotMessageSquare,} from "lucide-react";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Importar o useSession
import LoginModal from "@/components/Login-modal";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { EstatisticasMockup, SimuladoMockup, BancoProvasMockup, CronogramaMockup, NotaDeCorteMockup, QuestoesIAMockup } from "@/components/mockups";
import SphereCarousel from "@/components/SphereCarousel";

// Dados das features para o carrossel 3D da Hero Section
const HERO_FEATURES = [
  { id: 0, name: "Simulado Personalizado" },
  { id: 1, name: "Banco de Provas" },
  { id: 2, name: "Cronograma de Estudos" },
  { id: 3, name: "Consulta de Nota de Corte" },
  { id: 4, name: "Questões com IA" },
  { id: 5, name: "Estatísticas Avançadas" },
];

const MAC_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  },
  mockup: {
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 20,
        delay: 0.4,
      },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
  },
};

export default function Home() {
  // Estado para modal de demo (deve estar dentro do componente)
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Estados para a nova funcionalidade de login
  const { data: session, status } = useSession(); // Hook para verificar a sessão
  const isAuthenticated = status === "authenticated";
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Estado para o modal de login

  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  // Hook para o tema (dark/light mode)
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Estado para contagem de universidades
  const [universitiesCount, setUniversitiesCount] = useState<number | null>(
    null
  );
  const [universitiesError, setUniversitiesError] = useState<boolean>(false);

  // Estado para a seção "Por dentro do Vestibuline" (sem rotação automática)
  const [activeFeaturePlatform, setActiveFeaturePlatform] = useState(0);
  const [isAnimatingPlatform, setIsAnimatingPlatform] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState<
    "bimestral" | "trimestral" | "semestral" | "anual"
  >("semestral");
  const [selectedAnswer, setSelectedAnswer] = useState<number>(3); // Estado para resposta selecionada no mockup (0-4 para A-E)

  // Verificar se o usuário tem plano pago
  const hasPaidPlan = session?.user?.tier && session.user.tier !== "FREE";

  // Função para navegar para a página de estatísticas da matéria
  const handleSubjectClick = (subjectName: string) => {
    setIsNavigating(true);
    // Mapear os nomes das matérias para os slugs corretos que a API espera
    const subjectMapping: { [key: string]: string } = {
      Matemática: "matematica",
      Física: "fisica",
      Química: "quimica",
      Biologia: "biologia",
      História: "historia",
      Geografia: "geografia",
      Inglês: "ingles",
      Português: "portugues",
      Literatura: "literatura",
      Filosofia: "filosofia",
      Sociologia: "sociologia",
    };
    const subjectSlug =
      subjectMapping[subjectName] || subjectName.toLowerCase();
    router.push(`/estatisticas/${subjectSlug}`);
  };

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  // Nova função para lidar com o clique nos botões de plano pago
  const handlePlanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Previne a navegação padrão do link
    if (isAuthenticated) {
      setIsNavigating(true);
      router.push("/paidPlan"); // Se autenticado, redireciona
    } else {
      setIsLoginModalOpen(true); // Se não, abre o modal de login
    }
  };

  // Função para lidar com cliques nos botões da landing page
  const handleLandingPageClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    destination: string = "/"
  ) => {
    e.preventDefault();
    if (isAuthenticated) {
      setIsNavigating(true);
      router.push(destination);
    } else {
      setIsLoginModalOpen(true); // Abre modal de login se não autenticado
    }
  };

  // Buscar quantidade de universidades
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/universities", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) {
          if (Array.isArray(data)) {
            setUniversitiesCount(data.length);
          } else if (Array.isArray(data?.universities)) {
            setUniversitiesCount(data.universities.length);
          } else {
            setUniversitiesError(true);
          }
        }
      } catch (e) {
        if (!cancelled) setUniversitiesError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Simulate loading data with performance optimization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay as needed
    return () => clearTimeout(timer);
  }, []);

  // Debug: Log do tier do usuário para verificar
  useEffect(() => {
    if (session?.user) {
      console.log("User tier:", session.user.tier);
      console.log("Has paid plan:", hasPaidPlan);
    }
  }, [session, hasPaidPlan]);

  // Efeito para controlar a animação macOS na seção "Por dentro do Vestibuline"
  useEffect(() => {
    setIsAnimatingPlatform(true);
    const timer = setTimeout(() => {
      setIsAnimatingPlatform(false);
    }, 400); // Duração da animação de entrada

    return () => clearTimeout(timer);
  }, [activeFeaturePlatform]);

  const subjects = [
    { name: "Matemática", icon: "matematica.png" },
    { name: "Física", icon: "fisica.png" },
    { name: "Química", icon: "quimica.png" },
    { name: "Biologia", icon: "biologia.png" },
    { name: "História", icon: "historia.png" },
    { name: "Geografia", icon: "geografia.png" },
    { name: "Inglês", icon: "ingles.png" },
    { name: "Português", icon: "portugues.png" },
    { name: "Literatura", icon: "literatura.png" },
    { name: "Filosofia", icon: "filosofia.png" },
    { name: "Sociologia", icon: "sociologia.png" },
  ];

  if (isNavigating) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <div className="themed-main-container min-h-screen force-themed-bg flex flex-col">
      {/* Header component */}
      <Header />
      <main className="flex-1" id="inicio">
        {/* Main content */}
        {hasPaidPlan && (
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left sidebar - Countries */}
              <Sidebar />

              {/* Main content */}
              <div className="flex-1">
                {/* Welcome message */}
                <div className="mb-8 text-center relative overflow-hidden">
                  {/* Partículas flutuantes - movimento suave */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                      className="absolute top-10 left-10 w-2 h-2 bg-blue-400/60 rounded-full animate-float"
                      style={{ animationDelay: "0s", animationDuration: "8s" }}
                    ></div>
                    <div
                      className="absolute top-20 right-16 w-1 h-1 bg-purple-400/50 rounded-full animate-float"
                      style={{ animationDelay: "2s", animationDuration: "10s" }}
                    ></div>
                    <div
                      className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-indigo-400/40 rounded-full animate-float"
                      style={{ animationDelay: "4s", animationDuration: "9s" }}
                    ></div>
                    <div
                      className="absolute top-1/2 right-10 w-2 h-2 bg-cyan-400/50 rounded-full animate-float"
                      style={{ animationDelay: "1s", animationDuration: "11s" }}
                    ></div>
                  </div>

                  {/* Elementos geométricos decorativos - estáticos */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
                  <div className="relative z-10 py-12 px-6">
                    {/* Título principal com hierarquia visual melhorada */}
                    <div className="mb-6">
                      <h1
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 animate-fade-in-up leading-tight"
                        style={{ animationDelay: "0.4s" }}
                      >
                        <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                          Transforme Seus Estudos em
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent relative">
                          Aprovação no Vestibular
                          {/* Sublinhado animado */}
                          <div
                            className="absolute bottom-0 left-0 w-full h-0.5 md:h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 animate-scale-x"
                            style={{ animationDelay: "1s" }}
                          ></div>
                        </span>
                      </h1>
                    </div>

                    {/* Subtítulo com tipografia dinâmica e responsiva */}
                    <p
                      className="text-lg sm:text-xl md:text-2xl themed-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up px-4 sm:px-0"
                      style={{ animationDelay: "0.6s" }}
                    >
                      Nosso{" "}
                      <span className="font-semibold text-blue-600">
                        agente de IA
                      </span>{" "}
                      identifica seus pontos fracos e cria um
                      <span className="font-semibold text-purple-600">
                        {" "}
                        plano personalizado
                      </span>{" "}
                      para você passar no vestibular dos seus sonhos
                    </p>

                    {/* Badges de credibilidade com ícones ilustrativos */}
                    <div
                      className="mb-8 animate-fade-in-up"
                      style={{ animationDelay: "0.7s" }}
                    >
                      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
                        {/* Universidades parceiras */}
                        <div className="flex items-center gap-2 force-themed-card backdrop-blur-sm px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow select-none">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              🎓
                            </span>
                          </div>
                          <span
                            className="text-xs font-medium themed-text"
                            aria-live="polite"
                          >
                            {universitiesError &&
                              universitiesCount === null &&
                              "Universidades"}
                            {!universitiesError &&
                              universitiesCount === null &&
                              "..."}
                            {universitiesCount !== null &&
                              `${universitiesCount} Universidades`}
                          </span>
                        </div>
                        {/* Aprovações */}
                        <div className="flex items-center gap-2 force-themed-card backdrop-blur-sm px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow select-none">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          </div>
                          <span className="text-xs font-medium themed-text">
                            Maior chance de aprovação
                          </span>
                        </div>
                        {/* IA Avançada */}
                        <div className="flex items-center gap-2 force-themed-card backdrop-blur-sm px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow select-none">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              🧠
                            </span>
                          </div>
                          <span className="text-xs font-medium themed-text">
                            IA Avançada
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preview visual da plataforma (mockup responsivo) */}
                    <div
                      className="mb-8 animate-fade-in-up"
                      style={{ animationDelay: "0.8s" }}
                    >
                      <div className="relative max-w-4xl mx-auto">
                        <div className="force-themed-card rounded-2xl shadow-2xl p-3 md:p-4 transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 md:w-3 md:h-3 bg-red-400 rounded-full"></div>
                            <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full"></div>
                            <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full"></div>
                            <div className="ml-2 text-xs themed-text-secondary hidden sm:block">
                              vestibuline.com
                            </div>
                          </div>
                          <div className="rounded-lg p-3 md:p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm md:text-base font-semibold themed-text">
                                Análise de Performance
                              </div>
                              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Em tempo real
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="force-themed-card p-2 md:p-3 rounded text-center transition-shadow cursor-pointer">
                                <div className="text-lg md:text-xl font-bold text-blue-600">
                                  85%
                                </div>
                                <div className="text-xs themed-text-secondary">
                                  Matemática
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                  <div
                                    className="bg-blue-600 h-1 rounded-full"
                                    style={{ width: "85%" }}
                                  ></div>
                                </div>
                              </div>
                              <div className="force-themed-card p-2 md:p-3 rounded text-center transition-shadow cursor-pointer">
                                <div className="text-lg md:text-xl font-bold text-green-600">
                                  92%
                                </div>
                                <div className="text-xs themed-text-secondary">
                                  Física
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                  <div
                                    className="bg-green-600 h-1 rounded-full"
                                    style={{ width: "92%" }}
                                  ></div>
                                </div>
                              </div>
                              <div className="force-themed-card p-2 md:p-3 rounded text-center transition-shadow cursor-pointer">
                                <div className="text-lg md:text-xl font-bold text-yellow-600">
                                  78%
                                </div>
                                <div className="text-xs themed-text-secondary">
                                  Química
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                  <div
                                    className="bg-yellow-600 h-1 rounded-full"
                                    style={{ width: "78%" }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            {/* Recomendação da IA */}
                            <div className="mt-3 p-2 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">🎯</span>
                                <span className="text-xs font-semibold text-blue-700">
                                  Recomendação IA
                                </span>
                              </div>
                              <span className="text-xs text-gray-800">
                                Foque em Química - Para melhorar seu desempenho
                                no vestibular
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTAs melhorados com múltiplos níveis e responsividade */}
                    <div
                      className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 animate-fade-in-up px-4 sm:px-0"
                      style={{ animationDelay: "1s" }}
                    >
                      <Link
                        href="/library"
                        onClick={(e) => handleNavigation(e, "/library")}
                        className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 overflow-hidden w-full sm:w-auto text-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300"
                        role="button"
                        aria-label="Começar agora gratuitamente - Acesse nossa biblioteca de provas"
                      >
                        {/* Efeito de brilho animado */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <span className="relative z-10 text-white font-medium text-sm md:text-base">
                          🎯 Começar Agora - É Grátis
                        </span>
                        <svg
                          className="relative z-10 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </Link>

                      {/* Botão secundário responsivo */}
                      <button
                        className="group relative force-themed-card border-2 themed-border hover:border-blue-400 themed-text hover:text-blue-600 font-semibold py-3 md:py-4 px-6 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-3 w-full sm:w-auto text-center justify-center focus:outline-none focus:ring-4 focus:ring-gray-300 cursor-pointer"
                        aria-label="Ver demonstração da plataforma em 30 segundos"
                        onClick={() => setShowDemoModal(true)}
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm md:text-base">
                          Ver Demo (30s)
                        </span>
                      </button>
                    </div>

                    {/* Indicadores de confiança melhorados com acessibilidade */}
                    <div
                      className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm themed-text-secondary animate-fade-in-up px-4 sm:px-0"
                      style={{ animationDelay: "1.4s" }}
                    >
                      <div
                        className="group flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-green-300 rounded-lg p-1"
                        tabIndex={0}
                        role="button"
                        aria-label="100% Gratuito"
                      >
                        <div
                          className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"
                          aria-hidden="true"
                        ></div>
                        <span className="group-hover:text-green-600 transition-colors text-xs md:text-sm">
                          ✓ 100% Gratuito
                        </span>
                      </div>
                      <div
                        className="group flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg p-1"
                        tabIndex={0}
                        role="button"
                        aria-label="Resultados em 7 dias"
                      >
                        <div
                          className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full shadow-lg"
                          aria-hidden="true"
                        ></div>
                        <span className="group-hover:text-blue-600 transition-colors text-xs md:text-sm">
                          ✓ Melhora performance
                        </span>
                      </div>
                      <div
                        className="group flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-lg p-1"
                        tabIndex={0}
                        role="button"
                        aria-label="Suporte 24 horas por dia, 7 dias por semana"
                      >
                        <div
                          className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg"
                          aria-hidden="true"
                        ></div>
                        <span className="group-hover:text-purple-600 transition-colors text-xs md:text-sm">
                          ✓ Suporte 24/7
                        </span>
                      </div>
                    </div>

                    {/* Indicador de scroll responsivo */}
                    <div
                      className="mt-8 md:mt-12 flex flex-col items-center animate-fade-in-up relative"
                      style={{ animationDelay: "1.6s" }}
                    >
                      {/* Mascote indicando para rolar - animação sutil */}
                      <div className="flex justify-center mb-4">
                        <Image
                          src="/Mascote/banners/Camaleão_31.png"
                          alt="Mascote indicando para rolar"
                          width={180}
                          height={180}
                        />
                      </div>

                      <div className="text-xs themed-text-secondary mb-2 text-center">
                        Role para baixo para descobrir mais
                      </div>
                      <div
                        className="w-6 h-10 border-2 themed-border rounded-full flex justify-center"
                        role="img"
                        aria-label="Indicador de rolagem"
                      >
                        <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-12 relative" id="materias">
                  {/* Header da seção melhorado */}
                  <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      <span>📚</span>
                      <span>Escolha sua área de foco</span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                      Selecione a matéria para começar
                    </h2>
                    <p className="themed-text-secondary text-base md:text-lg max-w-2xl mx-auto">
                      Veja o ranking{" "}
                      <span className="font-semibold text-blue-600">
                        do que mais cai no
                      </span>
                      <span className="font-semibold text-purple-600">
                        {" "}
                        vestibular de cada matéria
                      </span>
                    </p>
                  </div>

                  {/* Grid de matérias com animações e interatividade melhorada */}
                  <div className="relative z-10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                      {loading
                        ? Array.from({ length: 11 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center animate-pulse"
                            >
                              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-3 relative overflow-hidden">
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 animate-shimmer"></div>
                              </div>
                              <div className="w-12 sm:w-16 h-3 bg-gray-200 rounded mb-1"></div>
                              <div className="w-8 sm:w-12 h-2 bg-gray-200 rounded"></div>
                            </div>
                          ))
                        : subjects.map((subject, index) => (
                            <div
                              key={subject.name}
                              className="group flex flex-col items-center cursor-pointer transform transition-all duration-500 hover:scale-110 hover:-translate-y-3 animate-fade-in-up focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-2xl"
                              style={{
                                animationDelay: `${index * 0.1}s`,
                              }}
                              tabIndex={0}
                              role="button"
                              aria-label={`Selecionar matéria de ${subject.name}`}
                              onClick={() => handleSubjectClick(subject.name)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleSubjectClick(subject.name);
                                }
                              }}
                            >
                              {/* Container do ícone com efeitos 3D e responsividade */}
                              <div className="relative mb-3">
                                {/* Sombra e brilho de fundo */}
                                <div className="absolute -inset-2 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl scale-0 group-hover:scale-110 transition-all duration-500 ease-out blur-xl opacity-0 group-hover:opacity-100"></div>

                                {/* Anel de progresso simulado */}
                                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-0.5">
                                  <div className="w-full h-full bg-white rounded-2xl"></div>
                                </div>

                                {/* Card da matéria com glassmorphism responsivo */}
                                <div className="relative force-themed-card backdrop-blur-sm rounded-2xl shadow-xl themed-border group-hover:shadow-2xl group-hover:border-blue-300 transition-all duration-500 overflow-hidden">
                                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 relative p-2 sm:p-3">
                                    <div className="w-full h-full relative">
                                      {/* Lazy loading implementation */}
                                      <Image
                                        src={
                                          subject.icon
                                            ? `/Materias/${subject.icon}`
                                            : "/placeholder.svg"
                                        }
                                        alt={`Ícone da matéria ${subject.name}`}
                                        fill
                                        className="object-cover rounded-lg"
                                        sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                                        loading="lazy"
                                        placeholder="blur"
                                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo="
                                      />
                                    </div>

                                    {/* Overlay com estatísticas no hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-2">
                                      <div className="text-white text-xs font-bold">
                                        {Math.floor(Math.random() * 500) + 100}+
                                        questões
                                      </div>
                                    </div>
                                  </div>

                                  {/* Efeito de brilho animado */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </div>
                              </div>

                              {/* Nome da matéria com tipografia melhorada e responsiva */}
                              <div className="text-center px-1">
                                <span className="text-xs sm:text-sm md:text-base font-semibold themed-text group-hover:text-blue-600 transition-colors duration-300 block leading-tight">
                                  {subject.name}
                                </span>

                                {/* Indicador de popularidade - oculto em telas muito pequenas */}
                                <div className="hidden sm:flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="text-xs themed-text-secondary">
                                    {Math.floor(Math.random() * 1000) + 500}{" "}
                                    estudantes
                                  </div>
                                </div>

                                {/* Barra de progresso de dificuldade - responsiva */}
                                <div className="flex gap-0.5 sm:gap-1 mt-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  {Array.from({ length: 5 }).map((_, i) => {
                                    const difficulty =
                                      Math.floor(Math.random() * 5) + 1;
                                    return (
                                      <div
                                        key={i}
                                        className={`w-1 h-1 rounded-full transition-all duration-300 ${
                                          i < difficulty
                                            ? "bg-gradient-to-r from-blue-400 to-purple-500"
                                            : "bg-gray-200"
                                        }`}
                                        style={{
                                          transitionDelay: `${i * 50}ms`,
                                        }}
                                        aria-hidden="true"
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                    </div>

                    {/* Tooltip flutuante com melhor acessibilidade */}
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm opacity-0 pointer-events-none transition-opacity duration-300 whitespace-nowrap z-50"
                      role="tooltip"
                      aria-hidden="true"
                    >
                      Clique para ver estatísticas detalhadas
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!hasPaidPlan && (
          <div className="flex flex-col w-full font-sans">
            {/* --- ITEM 1: HERO SECTION --- */}
            <section className="relative w-full min-h-[90vh] flex items-center bg-white overflow-hidden font-sans">
              {/* Background Effects */}
              <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 rounded-full blur-[100px] pointer-events-none" />

              <div className="container mx-auto px-4 md:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Column: Text & CTA */}
                <div className="text-left space-y-8 animate-fade-in-up">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-sans font-black leading-[1.1] text-gray-900">
                    {isAuthenticated ? (
                      <>
                        Bem-vindo de volta, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                          {session?.user?.name?.split(" ")[0] || "Estudante"}!
                        </span>
                      </>
                    ) : (
                      <>
                        A plataforma para <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                          você treinar para o
                        </span>
                        <br />
                        Enem e vestibular
                      </>
                    )}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed font-light font-sans">
                    {isAuthenticated
                      ? "Continue sua jornada de estudos. Acesse simulados, acompanhe seu progresso em tempo real e conquiste sua aprovação."
                      : "A plataforma completa com IA que personaliza seu estudo. Resolva simulados, acompanhe seu progresso e conquiste sua aprovação."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <a
                      href="/profile"
                      onClick={(e) => handleLandingPageClick(e, "/profile")}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 !text-white font-bold rounded-full hover:from-blue-700 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.5)] text-center font-sans cursor-pointer"
                    >
                      {isAuthenticated ? "Ir para Dashboard" : "Entrar"}
                    </a>
                  </div>
                </div>

                {/* Right Column: Carrossel Dinâmico de Features */}
                <div className="relative w-full mt-12 lg:mt-0 lg:col-span-1">
                  <div
                    className="relative w-full overflow-visible"
                    style={{ minHeight: "600px" }}
                  >
                    <SphereCarousel
                      items={HERO_FEATURES}
                      itemHeight={550}
                      autoRotateInterval={5000}
                      itemSpacing={150}
                      renderItem={(feature: any) => {
                        const props = { isDark };
                        const renderContent = () => {
                          switch (feature.id) {
                            case 0: return <SimuladoMockup {...props} selectedAnswer={3} />;
                            case 1: return <BancoProvasMockup {...props} />;
                            case 2: return <CronogramaMockup {...props} />;
                            case 3: return <NotaDeCorteMockup {...props} />;
                            case 4: return <QuestoesIAMockup {...props} />;
                            case 5: return <EstatisticasMockup {...props} />;
                            default: return null;
                          }
                        };

                        return (
                          <div
                            className={`w-full min-w-[750px] max-w-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-colors duration-300 ${
                              isDark ? "bg-gray-800" : "bg-white"
                            } border ${isDark ? "border-gray-700" : "border-gray-200"}`}
                          >
                            {/* Cabeçalho do Navegador - Gira junto */}
                            <div className="h-10 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
                              <div className="flex gap-2.5">
                                <button className="w-3 h-3 rounded-full bg-red-500 cursor-pointer"></button>
                                <button className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer"></button>
                                <button className="w-3 h-3 rounded-full bg-green-500 cursor-pointer"></button>
                              </div>
                              <div className="flex-1 text-center font-sans text-[10px] text-gray-400 tracking-widest uppercase">
                                vestibuline.com
                              </div>
                            </div>

                            {/* Conteúdo do Mockup */}
                            <div className={`flex-1 p-6 relative ${
                              isDark ? "bg-gray-900" : "bg-slate-50"
                            }`}>
                              {renderContent()}
                            </div>
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* --- ITEM 2: PRESENTATION SECTION --- */}
            <section className="bg-gray-50 py-20 lg:py-28 relative overflow-hidden font-sans">
              <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  {/* Left: Text Content */}
                  <div className="space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight font-sans">
                      O Vestibuline vai ajudar você a <br />
                      <span className="text-gray-900">
                        conquistar sua aprovação
                      </span>
                    </h2>

                    <div className="prose prose-lg text-gray-600 leading-relaxed font-sans">
                      <p>
                        Tenha acesso a mais de 150 mil questões para se preparar
                        para o Enem e vestibulares de todo o Brasil.
                      </p>
                      <p>
                        Monte listas de exercícios personalizadas com os
                        conteúdos de cada matéria, resolva provas de exames
                        anteriores e monitore o seu desempenho com relatórios de
                        erros e acertos.
                      </p>
                    </div>

                    <div className="hidden pt-4">
                      {/* Placeholder for future features if needed */}
                    </div>
                  </div>

                  {/* Right: Video/Image Area */}
                  <div>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
                      {/* YouTube Iframe Embed */}
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Conheça o Vestibuline"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* --- ITEM 3: PROMOTIONAL BANNER --- */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 w-full relative overflow-hidden font-sans">
              {/* Background Pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              ></div>

              <div className="container mx-auto px-4 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight font-sans">
                  {isAuthenticated ? (
                    <>
                      Continue seus estudos,{" "}
                      {session?.user?.name?.split(" ")[0]}!
                      <br />
                      <span className="text-white">
                        Sua aprovação está mais perto
                      </span>
                    </>
                  ) : (
                    <>
                      Comece a estudar agora
                      <br />
                      <span className="text-white">com o Vestibuline</span>
                    </>
                  )}
                </h2>

                <div className="mt-8">
                  <a
                    href={isAuthenticated ? "/library" : "/"}
                    onClick={(e) =>
                      handleLandingPageClick(
                        e,
                        isAuthenticated ? "/library" : "/"
                      )
                    }
                    className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold !text-indigo-600 !bg-white !rounded-full !hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl font-sans cursor-pointer"
                  >
                    {isAuthenticated
                      ? "Ir para biblioteca 📚"
                      : "Acesse o Vestibuline"}
                  </a>
                </div>
              </div>
            </section>

            {/* --- ITEM 4: FEATURES GRID  --- */}
            <section className="bg-white py-24 font-sans relative overflow-hidden">
              {/* Subtle background pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              ></div>

              <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                  variants={MAC_VARIANTS.container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {isAuthenticated ? (
                    <>
                      {/* PRO CARD 1: Acesso Ilimitado */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-gray-200/50 group-hover:scale-110 group-hover:border-gray-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Acesso ilimitado
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Simulados sem restrições. Pratique o quanto quiser,
                            quando quiser.
                          </p>
                        </div>
                      </motion.div>

                      {/* PRO CARD 2: Biblioteca de Provas */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-blue-200/50 group-hover:scale-110 group-hover:border-blue-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Biblioteca de Provas
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Acervo completo de exames anteriores dos maiores
                            vestibulares do país.
                          </p>
                        </div>
                      </motion.div>

                      {/* PRO CARD 3: Questões com IA */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(124,58,237,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-violet-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-violet-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-violet-200/50 group-hover:scale-110 group-hover:border-violet-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-violet-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Resoluções com IA
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Entenda cada questão com explicações detalhadas
                            geradas por Inteligência Artificial.
                          </p>
                        </div>
                      </motion.div>

                      {/* PRO CARD 4: Plano Otimizado */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(5,150,105,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-emerald-200/50 group-hover:scale-110 group-hover:border-emerald-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Plano de Estudos
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Cronograma de estudos personalizado e otimizado para
                            o seu tempo disponível.
                          </p>
                        </div>
                      </motion.div>

                      {/* PRO CARD 5: Estatísticas Avançadas */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(234,88,12,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-orange-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-orange-200/50 group-hover:scale-110 group-hover:border-orange-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-orange-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h3.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Análise Avançada
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Relatórios detalhados e estatísticas de desempenho
                            em tempo real.
                          </p>
                        </div>
                      </motion.div>

                      {/* PRO CARD 6: Suporte 24/7 */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(236,72,153,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-pink-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-pink-200/50 group-hover:scale-110 group-hover:border-pink-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-pink-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Suporte 24/7
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Atendimento prioritário a qualquer momento para
                            tirar suas dúvidas.
                          </p>
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {/* Card 1: Milhares de Questões (Indigo Accent) */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(30,27,75,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        {/* Colored accent gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-indigo-200/50 group-hover:scale-110 group-hover:border-indigo-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Questões Resolvidas com IA
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Questões resolvidas e comentadas com IA para
                            aprimorar seus estudos.
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 2: Questões ENEM e Vestibulares (Cyan Accent) */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(6,182,212,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-cyan-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-full border border-gray-200 shadow-sm group-hover:shadow-cyan-200/50 group-hover:scale-110 group-hover:border-cyan-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-cyan-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            ENEM e Vestibulares
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Acesso completo a questões do ENEM e dos principais
                            vestibulares do país.
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 3: Próprias Listas (Emerald Accent) */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-emerald-200/50 group-hover:scale-110 group-hover:border-emerald-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Listas Personalizadas
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Crie seu próprio simulado sob medida para seus
                            estudos.
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 4: Provas Prontas (Emerald Accent) */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-emerald-200/50 group-hover:scale-110 group-hover:border-emerald-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Provas Anteriores
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Simule exames reais com provas anteriores completas
                            para você treinar.
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 5: Estude Assuntos (Indigo Accent) */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(30,27,75,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-indigo-200/50 group-hover:scale-110 group-hover:border-indigo-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 12l3-3 3 3 4-4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Foco no Essencial
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Estude os assuntos que mais caem filtrando por
                            matéria e conteúdo específico.
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 6: Acompanhe Resultados (Purple Accent) */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        className="group relative h-full bg-white backdrop-blur-xl p-8 rounded-3xl shadow-md border border-gray-200 hover:shadow-[0_20px_60px_-15px_rgba(126,34,206,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-purple-400/30 transition-colors duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-6 w-16 h-16 flex items-center justify-center !bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm group-hover:shadow-purple-200/50 group-hover:scale-110 group-hover:border-purple-300/70 transition-all duration-500">
                            <svg
                              className="w-8 h-8 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Resultados em Tempo Real
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed">
                            Acompanhe seu desempenho e evolução detalhada após
                            cada simulação.
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>
            </section>
            {/* --- ITEM 5: INSIDE THE PLATFORM --- */}
            <section
              className={`py-20 lg:py-28 relative overflow-hidden font-sans transition-colors duration-300 ${isDark ? "bg-gray-900" : "bg-white"}`}
            >
              <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                  <h2
                    className={`text-3xl md:text-5xl font-extrabold mb-6 font-sans transition-colors duration-300 ${isDark ? "text-white" : "text-[#1a103c]"}`}
                  >
                    Por dentro do Vestibuline{hasPaidPlan && " PRO"}
                  </h2>
                </div>

                {(() => {
                  // State shared between accordion and mockup
                  const features = isAuthenticated
                    ? [
                        {
                          title: "Simulados Ilimitados",
                          subtitle:
                            "Acesso total a simulados de todas as bancas do país sem restrições.",
                          icon: "📝",
                          color: "from-blue-600 to-blue-700",
                          borderColor: "border-blue-600",
                        },
                        {
                          title: "Estatísticas Avançadas",
                          subtitle:
                            "Gráficos de desempenho detalhados por matéria, assunto e banca.",
                          icon: "📊",
                          color: "from-purple-600 to-purple-700",
                          borderColor: "border-purple-600",
                        },
                        {
                          title: "Cronograma de estudos",
                          subtitle:
                            "Crie seu próprio cronograma de estudos automatizado para otimizar seu tempo e performance.",
                          icon: "📅",
                          color: "from-indigo-600 to-indigo-700",
                          borderColor: "border-indigo-600",
                        },
                        {
                          title: "Consulta de Nota de Corte",
                          subtitle:
                            "Realize a consulta da nota de corte dos principais vestibulares com a sua performance atual.",
                          icon: "🎯",
                          color: "from-emerald-600 to-emerald-700",
                          borderColor: "border-emerald-600",
                        },
                        {
                          title: "Questões resolvidas com IA",
                          subtitle:
                            "Aprenda com resoluções passo a passo personalizadas por nossa IA avançada.",
                          icon: "🤖",
                          color: "from-blue-600 to-blue-700",
                          borderColor: "border-blue-600",
                        },
                      ]
                    : [
                        {
                          title: "Simulado Personalizado",
                          subtitle:
                            "Crie simulações personalizadas com questões filtradas por matéria e assunto.",
                          icon: "🎓",
                          color: "from-purple-600 to-purple-700",
                          borderColor: "border-purple-600",
                        },
                        {
                          title: "Banco de provas",
                          subtitle:
                            "Acesse provas completas de vestibulares anteriores e simule o exame real.",
                          icon: "📚",
                          color: "from-blue-600 to-blue-700",
                          borderColor: "border-blue-600",
                        },
                        {
                          title: "Cronograma de estudos",
                          subtitle:
                            "Crie seu próprio cronograma de estudos automatizado para otimizar seu tempo e performance.",
                          icon: "📅",
                          color: "from-indigo-600 to-indigo-700",
                          borderColor: "border-indigo-600",
                        },
                        {
                          title: "Questões resolvidas com IA",
                          subtitle:
                            "Aprenda com resoluções passo a passo com IA.",
                          icon: "🤖",
                          color: "from-cyan-600 to-cyan-700",
                          borderColor: "border-cyan-600",
                        },
                      ];

                  // Função auxiliar para obter dados baseado no período selecionado
                  const getChartData = () => {
                    const allMonths = [
                      "JAN",
                      "FEV",
                      "MAR",
                      "ABR",
                      "MAI",
                      "JUN",
                      "JUL",
                      "AGO",
                      "SET",
                      "OUT",
                      "NOV",
                      "DEZ",
                    ];
                    const allYValues = [
                      110, 70, 60, 85, 45, 65, 35, 90, 50, 75, 55, 80,
                    ]; // Valores Y para cada mês

                    let numMonths = 0;

                    switch (selectedPeriod) {
                      case "bimestral":
                        numMonths = 2; // JAN, FEV
                        break;
                      case "trimestral":
                        numMonths = 3; // JAN, FEV, MAR
                        break;
                      case "semestral":
                        numMonths = 6; // JAN a JUN
                        break;
                      case "anual":
                        numMonths = 12; // JAN a DEZ
                        break;
                      default:
                        numMonths = 6;
                    }

                    const months = allMonths.slice(0, numMonths);

                    // Calcular posições X dinamicamente baseado no número de meses
                    // Distribuir equitativamente entre 40 e 430 (para alinhar com rótulos)
                    const startX = 40;
                    const endX = 430;
                    const totalWidth = endX - startX;

                    const points = months.map((_, idx) => {
                      let x: number;
                      if (numMonths === 1) {
                        x = (startX + endX) / 2; // Centro se houver apenas 1 mês
                      } else {
                        x = startX + (totalWidth / (numMonths - 1)) * idx;
                      }
                      const y = allYValues[idx];
                      return { x, y };
                    });

                    return { months, points };
                  };

                  const chartData = getChartData();

                  // Function to render different mockups based on activeFeaturePlatform
                  const renderMockup = () => {
                    if (isAuthenticated) {
                      switch (activeFeaturePlatform) {
                        case 0: // Simulados Ilimitados - Layout de Simulação
                          return (<SimuladoMockup isDark={isDark} selectedAnswer={selectedAnswer} />);

                        case 1: // Estatísticas Avançadas - Layout do MonthlyProgressChart
                          return (<EstatisticasMockup isDark={isDark} />);

                        case 2: // Cronograma de Estudos (Calendar View)
                          return (<CronogramaMockup isDark={isDark} />);

                        case 3: // Consulta de Nota de Corte
                          return (<NotaDeCorteMockup isDark={isDark} />);

                        case 4: // Questões resolvidas com IA (Authenticated)
                          return (<QuestoesIAMockup isDark={isDark} />);

                        default:
                          return null;
                      }
                    } else {
                      // Unauthenticated State (Original)
                      switch (activeFeaturePlatform) {
                        case 0: // Simulado Personalizado - Layout de Simulação
                          return (<SimuladoMockup isDark={isDark} selectedAnswer={selectedAnswer} />);

                        case 1: // Banco de provas - Biblioteca
                          return (<BancoProvasMockup isDark={isDark} />);

                        case 2: // Cronograma de Estudos (Calendar View)
                          return (<CronogramaMockup isDark={isDark} />);

                        case 3: // Questões resolvidas com IA
                          return (<QuestoesIAMockup isDark={isDark} />);

                        default:
                          return null;
                      }
                    }
                  };

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                      {/* Left: Features List (Interactive Accordion) */}
                      <div className="space-y-3 flex flex-col">
                        <div className="mb-2">
                          <p
                            className={`text-xs uppercase tracking-widest font-semibold transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {hasPaidPlan
                              ? "Recursos do Simula PRO"
                              : "Recursos disponíveis"}
                          </p>
                        </div>
                        {features.map((item, idx) => {
                          const isActive = activeFeaturePlatform === idx;

                          return (
                            <div
                              key={idx}
                              onClick={() => setActiveFeaturePlatform(idx)}
                              className={`group p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden relative ${
                                isActive
                                  ? `bg-gradient-to-br ${item.color} border-transparent text-white shadow-xl transform scale-105`
                                  : isDark
                                    ? "bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-600 hover:shadow-md hover:bg-gray-700"
                                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md hover:bg-gray-50"
                              }`}
                            >
                              {/* Background animation for active */}
                              {isActive && (
                                <div className="absolute inset-0 opacity-20 overflow-hidden">
                                  <div className="absolute -right-20 -top-20 w-40 h-40 bg-white rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
                                </div>
                              )}

                              <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4 flex-1">
                                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                                    {item.icon}
                                  </span>
                                  <div className="flex-1">
                                    <span
                                      className={`text-base font-bold block font-sans transition-colors ${isActive ? "text-white" : isDark ? "text-gray-100 group-hover:text-white" : "text-gray-800 group-hover:text-gray-900"}`}
                                    >
                                      {item.title}
                                    </span>
                                    <p
                                      className={`text-xs transition-all duration-300 line-clamp-1 ${
                                        isActive
                                          ? "text-blue-50 opacity-90"
                                          : isDark
                                            ? "text-gray-400 group-hover:text-gray-300"
                                            : "text-gray-500 group-hover:text-gray-600"
                                      }`}
                                    >
                                      {item.subtitle}
                                    </p>
                                  </div>
                                </div>
                                <svg
                                  className={`w-5 h-5 transform transition-all duration-300 flex-shrink-0 ${
                                    isActive
                                      ? "rotate-180 text-white"
                                      : isDark
                                        ? "text-gray-500 group-hover:text-gray-400"
                                        : "text-gray-400 group-hover:text-gray-600"
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          );
                        })}

                        {/* Feature details card */}
                        <div
                          className={`mt-6 pt-6 border-t transition-colors duration-300 ${isDark ? "border-gray-700" : "border-gray-200"}`}
                        >
                          <div
                            className={`rounded-xl p-4 border transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-800" : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"}`}
                          >
                            <p
                              className={`text-xs font-semibold mb-2 transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                            >
                              💡 Dica
                            </p>
                            <p
                              className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                            >
                              {features[activeFeaturePlatform]?.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Dynamic Mockup Based on Active Feature */}
                      <div
                        className={`relative rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
                        style={{ minHeight: "600px" }}
                      >
                        {/* Mock Browser Header */}
                        <div className="h-10 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
                          <div className="flex gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"></div>
                          </div>
                          <div className="flex-1 text-center font-sans">
                            <span className="text-xs text-gray-400 font-medium tracking-wider">
                              vestibuline.com.br
                            </span>
                          </div>
                        </div>

                        {/* Dynamic Mock Dashboard Content with smooth transition */}
                        <div
                          className={`flex-1 overflow-auto p-4 transition-all duration-500 ease-in-out relative ${isDark ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}
                        >
                          <div
                            className={
                              isAnimatingPlatform
                                ? "animate-macos-fade-in"
                                : "opacity-100"
                            }
                            key={activeFeaturePlatform}
                          >
                            {renderMockup()}
                          </div>
                        </div>

                        {/* Navigation Dots */}
                        <div
                          className={`flex justify-center items-center gap-2 px-4 py-4 border-t flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                        >
                          {features.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveFeaturePlatform(idx)}
                              className={`transition-all duration-300 rounded-full ${
                                idx === activeFeaturePlatform
                                  ? "w-8 h-2.5 bg-gradient-to-r from-blue-600 to-indigo-600"
                                  : isDark
                                    ? "w-2.5 h-2.5 bg-gray-600 hover:bg-gray-500"
                                    : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                              }`}
                              aria-label={`Ir para recurso ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* --- ITEM 6: 7 DAYS FREE --- }
          <section className="bg-[#1e1b4b] py-32 relative overflow-hidden flex items-center justify-center min-h-[600px] font-sans">
             {/* 3D Abstract Elements (CSS Gradients) }
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                
                {/* Tube-like shapes }
                <div className="absolute top-[20%] left-[10%] w-32 h-96 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full opacity-20 transform rotate-45 blur-2xl"></div>
                <div className="absolute bottom-[20%] right-[10%] w-32 h-96 bg-gradient-to-b from-purple-500 to-orange-500 rounded-full opacity-20 transform -rotate-45 blur-2xl"></div>
             </div>

             <div className="container mx-auto px-4 text-center relative z-10 flex flex-col items-center">
                 {/* Giant Typography }
                 <div className="mb-12 transform hover:scale-105 transition-transform duration-500">
                    <h2 className="text-[120px] md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 leading-none drop-shadow-2xl select-none font-sans">
                       7 DIAS
                    </h2>
                    <h2 className="text-[80px] md:text-[120px] font-black text-transparent bg-clip-text bg-outline-text leading-none -mt-4 md:-mt-10 select-none tracking-widest font-sans" style={{ WebkitTextStroke: '2px #8b5cf6', color: 'transparent' }}>
                       GRÁTIS
                    </h2>
                 </div>
                 
                 <div className="space-y-6">
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light font-sans">
                       Experimente a plataforma completa sem compromisso.
                    </p>
                    
                    <Link 
                       href="/register" 
                       className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-5 px-16 rounded-full text-xl transition-all duration-300 transform hover:scale-110 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] font-sans"
                    >
                       Comece agora
                       <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                       </svg>
                    </Link>
                 </div>
             </div>
          </section>
          {*/}
          </div>
        )}

        {/* --- SECÇÃO DE RANKING MELHORADA --- */}
        <div
          className="py-16 themed-section relative overflow-hidden"
          id="ranking-cta"
        >
          {/* Background com partículas animadas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-20 left-10 w-4 h-4 bg-yellow-400/60 rounded-full animate-float"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="absolute top-40 right-20 w-3 h-3 bg-blue-400/50 rounded-full animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-32 left-32 w-2 h-2 bg-purple-400/40 rounded-full animate-float"
              style={{ animationDelay: "4s" }}
            ></div>
            <div
              className="absolute top-60 right-40 w-5 h-5 bg-green-400/50 rounded-full animate-float"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="force-themed-card bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 animate-fade-in-up relative overflow-hidden">
              {/* Efeito de brilho animado no fundo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer-slow"></div>

              {/* Lado Esquerdo: Textos e CTA */}
              <div className="text-center lg:text-left flex-1 relative z-10">
                <a href="/ranking">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 hover:bg-white/30 transition-colors duration-300 cursor-pointer">
                    <span>🏆</span>
                    <span>Competição Saudável</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></div>
                  </div>
                </a>

                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                  <span className="block">Veja sua Posição</span>
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent animate-gradient-x">
                    no Ranking Nacional!
                  </span>
                </h2>

                <p className="text-white text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
                  Compare seu desempenho com estudantes de todo o país, suba no
                  placar e
                  <span className="font-bold text-yellow-300">
                    {" "}
                    motive-se a alcançar o topo
                  </span>
                  . Você está pronto para o desafio?
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                  <a
                    href="/ranking"
                    onClick={(e) => handleLandingPageClick(e, "/ranking")}
                    className="group relative bg-white text-blue-600 font-bold py-4 px-8 rounded-full transition-all duration-500 transform hover:scale-110 hover:shadow-2xl flex items-center gap-3 overflow-hidden w-full sm:w-auto text-center justify-center focus:outline-none focus:ring-4 focus:ring-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-yellow-500 cursor-pointer"
                    role="button"
                    aria-label="Consultar o ranking agora"
                  >
                    {/* Efeito de onda no hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-full"></div>

                    <span className="relative z-10 flex items-center gap-2">
                      <span className="group-hover:animate-bounce">🚀</span>
                      Consultar o Ranking
                    </span>
                    <svg
                      className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Lado Direito: Ilustração Interativa Melhorada */}
              <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex-shrink-0">
                {/* Mascote comemorando no ranking */}
                <div className="absolute -top-8 -right-8 z-50 animate-float">
                  <Image
                    src="/Mascote/banners/Camaleão_22.png"
                    alt="Mascote Vestibuline celebrando ranking"
                    width={120}
                    height={120}
                    className="w-20 h-20 md:w-25 md:h-25 object-contain"
                  />
                </div>

                {/* Container do pódio com z-index controlado */}
                <div className="relative z-20 h-full">
                  {/* Pódio animado */}
                  <div className="absolute inset-0 flex items-end justify-center space-x-2 pb-12">
                    {/* 2º lugar */}
                    <div
                      className="bg-gradient-to-t from-gray-400 to-gray-300 w-16 h-32 rounded-t-lg relative animate-slide-up z-30"
                      style={{ animationDelay: "0.5s" }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl z-40">
                        🥈
                      </div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm z-40">
                        2º
                      </div>
                    </div>

                    {/* 1º lugar (centro) */}
                    <div
                      className="bg-gradient-to-t from-yellow-500 to-yellow-400 w-20 h-40 rounded-t-lg relative animate-slide-up z-40"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl z-50">
                        🏆
                      </div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white font-bold z-50">
                        1º
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-yellow-200/50 rounded-t-lg animate-pulse z-30"></div>
                    </div>

                    {/* 3º lugar */}
                    <div
                      className="bg-gradient-to-t from-orange-600 to-orange-500 w-16 h-24 rounded-t-lg relative animate-slide-up z-30"
                      style={{ animationDelay: "0.8s" }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl z-40">
                        🥉
                      </div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm z-40">
                        3º
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Call-to-action secundário */}
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Atualização em tempo real
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Competição nacional
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Rankings por Vestibular
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PONTO DE PULO 4: Adicione o id="garantias" na div da seção de Prova Social e Métricas */}
        <div className="themed-section force-themed-bg py-16" id="garantias">
          <div className="container mx-auto px-6">
            {/* Mascote de garantia - estático para não distrair */}
            <div className="flex justify-center mb-8">
              <Image
                src="/Mascote/banners/Camaleão_6.png"
                alt="Mascote Vestibuline - Garantias"
                width={500}
                height={500}
                className="w-50 h-50 md:w-56 md:h-56 object-contain"
              />
            </div>

            {/* Comparação Antes e Depois */}
            <div className="themed-comparison bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-100 rounded-3xl p-6 md:p-8 lg:p-12 mb-16 shadow-xl border border-blue-100">
              <h3 className="themed-text text-xl md:text-2xl font-bold text-center mb-8 md:mb-12">
                Antes e Depois do Vestibuline
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Antes */}
                <div className="themed-card bg-white rounded-2xl p-4 md:p-6 shadow-lg border-l-4 border-red-400">
                  <h4 className="text-base md:text-lg font-bold text-red-600 mb-3 md:mb-4 flex items-center gap-2">
                    😰 Antes - Estudando Sozinho
                  </h4>
                  <ul className="space-y-2 md:space-y-3">
                    {[
                      "Sem direcionamento de estudos",
                      "Dificuldade para identificar pontos fracos",
                      "Ansiedade antes das provas",
                      "Perda de tempo com materiais desatualizados",
                      "Falta de feedback sobre desempenho",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 themed-text text-gray-600 text-sm md:text-base"
                      >
                        <span className="text-red-500 mt-1">❌</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Depois */}
                <div className="themed-card bg-white rounded-2xl p-4 md:p-6 shadow-lg border-l-4 border-green-400">
                  <h4 className="text-base md:text-lg font-bold text-green-600 mb-3 md:mb-4 flex items-center gap-2">
                    🚀 Depois - Com Vestibuline
                  </h4>
                  <ul className="space-y-2 md:space-y-3">
                    {[
                      "Feedback personalizado e direcionado",
                      "Identificação precisa de lacunas de conhecimento",
                      "Confiança total no dia da prova",
                      "Provas sempre atualizados e relevantes",
                      "Feedback em tempo real com IA",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 themed-text text-gray-600 text-sm md:text-base"
                      >
                        <span className="text-green-500 mt-1">✅</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Garantias e Badges de Confiança */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-16">
              {[
                {
                  icon: "🛡️",
                  title: "Satisfação Garantida",
                  description: "30 dias para testar sem riscos",
                  badge: "100% Seguro",
                },
                {
                  icon: "⚡",
                  title: "Resultados Rápidos",
                  description: "Veja sua evolução de maneira rápida",
                  badge: "Método Comprovado",
                },
                {
                  icon: "🏆",
                  title: "Não se acostumou com a plataforma?",
                  description: "Devolvemos seu dinheiro, cancele quando quiser",
                  badge: "Garantia Total",
                },
              ].map((guarantee, index) => (
                <div
                  key={index}
                  className="text-center themed-card bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="text-3xl md:text-4xl mb-2 md:mb-3">
                    {guarantee.icon}
                  </div>
                  <h4 className="themed-text font-bold text-base md:text-lg mb-2">
                    {guarantee.title}
                  </h4>
                  <p className="themed-text text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
                    {guarantee.description}
                  </p>
                  <span className="inline-flex items-center px-2 md:px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold rounded-full">
                    {guarantee.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* PONTO DE PULO 5: Esta seção já possui o id="planos", está correto. */}
        {/* Exibir seção de planos apenas para usuários FREE ou não autenticados */}
        {!hasPaidPlan && (
          <div
            id="planos"
            className="themed-section py-16 force-themed-bg relative overflow-hidden"
          >
            {/* Background decorativo */}
            <div className="absolute inset-0">
              <div className="absolute top-10 left-20 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-20 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
              {/* Header com urgência */}
              <div className="text-center mb-12 relative">
                {/* Mascote dos planos */}
                <div className="flex justify-center mb-6">
                  <Image
                    src="/Mascote/banners/Camaleão_14.png"
                    alt="Mascote Vestibuline - Escolha seu plano"
                    width={200}
                    height={200}
                    className="w-25 h-25 object-contain animate-wiggle"
                  />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                  Planos feitos para você
                </h2>
                <p className="themed-text text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Escolha o plano ideal para sua jornada de aprovação e comece a
                  estudar hoje mesmo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-96 rounded-2xl" />
                  ))
                ) : (
                  <>
                    {/* Plano Gratuito */}
                    <div className="group relative themed-card bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out">
                      <div className="themed-plan-hover free-plan absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                          🆓
                        </div>

                        <h3 className="themed-text text-xl md:text-2xl font-bold mb-2 text-gray-900">
                          Gratuito
                        </h3>
                        <p className="themed-text text-gray-500 mb-6">
                          Para começar a explorar
                        </p>

                        <div className="mb-6">
                          <p className="text-4xl md:text-5xl font-bold text-green-600">
                            R$ 0
                          </p>
                          <p className="themed-text text-sm text-gray-500 mt-1">
                            Para sempre
                          </p>
                        </div>

                        <ul className="space-y-3 text-left mb-8">
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Acesso ilimitado a simulados
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Biblioteca de provas
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Estatística de desempenho em tempo real
                            </span>
                          </li>
                        </ul>
                        <button
                          disabled
                          className="block w-full bg-gray-200 text-gray-500 font-semibold py-3 px-6 rounded-xl transition-all duration-300 cursor-not-allowed"
                        >
                          FREE
                        </button>
                      </div>
                    </div>

                    {/* Plano Simula Pro Anual (Destaque) */}
                    <div className="group relative themed-card bg-white border-2 border-blue-500 rounded-2xl p-6 md:p-8 flex flex-col text-center shadow-2xl scale-105 hover:scale-110 transition-all duration-500 ease-out">
                      <div className="themed-plan-hover absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Mascote premium - mantém visível com animação sutil pois é o plano destaque */}
                      <div className="absolute -top-0 -right-0 z-20">
                        <Image
                          src="/Mascote/banners/Camaleão_2.png"
                          alt="Mascote plano premium"
                          width={200}
                          height={200}
                          className="w-25 h-25 object-contain animate-float"
                          style={{ animationDuration: "5s" }}
                        />
                      </div>

                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                          👑
                        </div>

                        <h3 className="themed-text text-xl md:text-2xl font-bold mb-2 text-gray-900">
                          Simula Pro Anual
                        </h3>
                        <p className="text-blue-600 mb-6 font-medium">
                          <b>Economize R$ 103! (Ganhe 2 meses grátis)</b>
                        </p>

                        <div className="mb-6">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="themed-text text-lg text-gray-400 line-through">
                              R$ 600
                            </span>
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                              -17%
                            </span>
                          </div>
                          <p className="text-4xl md:text-5xl font-bold text-blue-600">
                            R$ 41,5
                            <span className="themed-text text-lg font-normal text-gray-600">
                              /mês
                            </span>
                          </p>
                          <p className="themed-text text-sm text-gray-500 mt-1">
                            (R$ 497 cobrado em parcela unica)
                          </p>
                        </div>

                        <ul className="space-y-3 text-left mb-8">
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Acesso ilimitado a simulados
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Biblioteca de provas
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Estatística de desempenho em tempo real
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Questões de provas resolvidas com IA
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Plano de estudos otimizado
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Estatísticas avançadas
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Suporte prioritário 24/7
                            </span>
                          </li>
                        </ul>

                        <a
                          href="/paidPlan"
                          onClick={handlePlanClick}
                          className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/40 group-hover:scale-105"
                        >
                          🚀 Quero Economizar
                        </a>
                      </div>
                    </div>

                    {/* Plano Simula Pro Mensal */}
                    <div className="group relative themed-card bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out">
                      <div className="themed-plan-hover absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Mascote plano mensal - aparece no hover */}
                      <div className="absolute -top-0 -right-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Image
                          src="/Mascote/banners/Camaleão_4.png"
                          alt="Mascote plano mensal"
                          width={200}
                          height={200}
                          className="w-25 h-25 object-contain"
                        />
                      </div>

                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                          💎
                        </div>

                        <h3 className="themed-text text-xl md:text-2xl font-bold mb-2 text-gray-900">
                          Simula Pro Mensal
                        </h3>
                        <p className="themed-text text-gray-500 mb-6">
                          Flexibilidade total
                        </p>

                        <div className="mb-6">
                          <p className="text-4xl md:text-5xl font-bold text-purple-600">
                            R$ 50
                            <span className="themed-text text-lg font-normal text-gray-600">
                              /mês
                            </span>
                          </p>
                          <p className="themed-text text-sm text-gray-500 mt-1">
                            Cancele quando quiser
                          </p>
                        </div>

                        <ul className="space-y-3 text-left mb-8">
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Acesso ilimitado a simulados
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Biblioteca de provas
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Estatísticas de desempenho em tempo real
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Questões de Provas resolvidas com IA
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Plano de estudos otimizado
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Estatísticas avançadas
                            </span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="themed-text text-gray-700">
                              Suporte prioritário 24/7
                            </span>
                          </li>
                        </ul>

                        <a
                          href="/paidPlan"
                          onClick={handlePlanClick}
                          className="block w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800 font-semibold py-3 px-6 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105"
                        >
                          Assinar Agora
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de demonstração - deve ser renderizado aqui para overlay global */}
      <DemoModal open={showDemoModal} onClose={() => setShowDemoModal(false)} />

      {/* Modal de login para a nova funcionalidade */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/paidPlan"
      />

      <Footer />
    </div>
  );
}
