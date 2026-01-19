"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import Link from "next/link";
import {BookOpen, Zap, ChartNoAxesCombined, LifeBuoy, Earth, FilePen, ShieldCheck, CalendarX, Lock, AlarmClock} from "lucide-react";
import Footer from "@/components/Footer";
import { PricingPlans } from "@/components/PricingCard";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/Login-modal";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { SimuladoMockup, BancoProvasMockup, NotaDeCorteMockup } from "@/components/mockups";
import SphereCarousel from "@/components/SphereCarousel";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Dados das features para o carrossel 3D da Hero Section
const HERO_FEATURES = [
  { id: 0, name: "Simulado Personalizado" },
  { id: 1, name: "Biblioteca de Provas" },
  { id: 2, name: "Consulta de Nota de Corte" },
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
  const [loginRedirectUrl, setLoginRedirectUrl] = useState<string | undefined>("/paidPlan");
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
      setLoginRedirectUrl("/paidPlan");
      setIsLoginModalOpen(true); // Se não, abre o modal de login
    }
  };

  // Função para lidar com cliques nos botões da landing page
  const handleLandingPageClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    destination: string = "/",
    shouldRedirect: boolean = true
  ) => {
    e.preventDefault();
    if (isAuthenticated) {
      setIsNavigating(true);
      router.push(destination);
    } else {
      setLoginRedirectUrl(shouldRedirect ? "/paidPlan" : undefined);
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
    <DndProvider backend={HTML5Backend}>
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
                  <div className="flex flex-col sm:flex-row gap-4 pt-2 relative">
                    <a
                      href="/profile"
                      onClick={(e) => handleLandingPageClick(e, "/profile", false)}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 !text-white font-bold rounded-full hover:from-blue-700 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.5)] text-center font-sans cursor-pointer z-10"
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
                            case 2: return <NotaDeCorteMockup {...props} />;
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
                      {isAuthenticated ? (
                        <>
                          Com o SimulaPRO, potencialize seus estudos e <br />
                          <span className="text-gray-900">
                            conquiste sua vaga
                          </span>
                        </>
                      ) : (
                        <>
                          O Vestibuline vai ajudar você a <br />
                          <span className="text-gray-900">
                            conquistar sua aprovação
                          </span>
                        </>
                      )}
                    </h2>

                    <div className="prose prose-lg text-gray-600 leading-relaxed font-sans">
                      {isAuthenticated ? (
                        <>
                          <p>
                            Faça seu upgrade de plano e aproveite ao máximo todas as ferramentas disponíveis. 
                            Explore simulados inéditos, analise seu desempenho detalhado e monitore 
                            seus pontos de melhoria, elabore cronograma de estudos personalizados e muito mais.
                          </p>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>

                    <div className="hidden pt-4">
                      {/* Placeholder for future features if needed */}
                    </div>
                  </div>

                  {/* Right: Video/Image Area */}
                  <div className="relative">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video z-10">
                      {/* YouTube Iframe Embed */}
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={
                          isAuthenticated
                            ? "https://www.youtube.com/embed/F3DxOuM7m7k" // Vídeo para usuários logados (VEM AI SABONETE)
                            : "https://www.youtube.com/embed/dQw4w9WgXcQ" // Vídeo demo para visitantes (Rick Astley)
                        }
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

            {/* --- FREE USER SUBJECTS SECTION --- */}
            {isAuthenticated && session?.user?.tier === "FREE" && (
              <section className="bg-white py-16 font-sans relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
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

                                  {/* Indicador de popularidade */}
                                  <div className="hidden sm:flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="text-xs themed-text-secondary">
                                      {Math.floor(Math.random() * 1000) + 500}{" "}
                                      estudantes
                                    </div>
                                  </div>

                                  {/* Barra de progresso de dificuldade */}
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

                      {/* Tooltip flutuante */}
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
              </section>
            )}

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

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative z-10">
                  <div className="hidden md:block transform -scale-x-100">
                    <Image 
                      src="/Mascote/banners/Camaleão_10.png" 
                      alt="Mascote comemorando" 
                      width={160} 
                      height={160}
                    />
                  </div>

                  <div className="text-center">
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

                  <div className="hidden md:block">
                    <Image 
                      src="/Mascote/banners/Camaleão_10.png" 
                      alt="Mascote comemorando" 
                      width={160} 
                      height={160}
                    />
                  </div>
                </div>
            </section>

            {/* --- ITEM 4: FEATURES GRID  --- */}
            <section className="bg-white py-24 font-sans relative overflow-hidden transition-colors duration-500">
              {/* Subtle background pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              ></div>

              <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col items-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 text-center tracking-tight">
                    Funcionalidades pensadas para você
                  </h2>
                  <div className="mt-4 w-20 h-1.5 bg-blue-600 rounded-full"></div>
                </div>
                
                <motion.div
                  variants={MAC_VARIANTS.container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
                >
                  {isAuthenticated ? (
                    <>
                      {/* PRO CARD 1: Acesso Ilimitado */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-full bg-white backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-sm border border-indigo-100/50 group-hover:scale-110 group-hover:shadow-indigo-200/50 transition-all duration-700">
                            <Zap className="w-8 h-8 text-indigo-600" strokeWidth={2.5}/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-4 tracking-tight">
                            Acesso ilimitado
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Simulados sem restrições. Pratique o quanto quiser,
                            quando quiser.
                          </p>
                        </div>
                      </motion.div>

                      {/* PRO CARD 2: Biblioteca de Provas */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-full bg-white backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100/50 group-hover:scale-110 group-hover:shadow-blue-200/50 transition-all duration-700">
                            <BookOpen className="w-8 h-8 text-blue-600" strokeWidth={2.5}/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-4 tracking-tight">
                            Consulta de nota de corte
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Simule se você passaria ou não nos vestibulares, sem precisar "pagar para ver".
                          </p>
                        </div>
                      </motion.div>

                      {/* PRO CARD 3: Suporte 24/7 */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-full bg-white backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-sm border border-pink-100/50 group-hover:scale-110 group-hover:shadow-pink-200/50 transition-all duration-700">
                            <LifeBuoy className="w-8 h-8 text-pink-600" strokeWidth={2.5}/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-4 tracking-tight">
                            Suporte 24/7
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Atendimento prioritário a qualquer momento para
                            tirar suas dúvidas.
                          </p>
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {/* Card 1: ENEM e Vestibulares */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-full bg-white backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-white rounded-2xl shadow-sm border border-cyan-100/50 group-hover:scale-110 group-hover:shadow-cyan-200/50 transition-all duration-700">
                            <Earth className="w-8 h-8 text-cyan-600" strokeWidth={2.5}/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-4 tracking-tight">
                            ENEM e Vestibulares
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Acesso completo a questões do ENEM e dos principais
                            vestibulares do país.
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 2: Listas Personalizadas */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-full bg-white backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-sm border border-emerald-100/50 group-hover:scale-110 group-hover:shadow-emerald-200/50 transition-all duration-700">
                            <BookOpen className="w-8 h-8 text-emerald-600" strokeWidth={2.5}/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-4 tracking-tight">
                            Consulte a sua nota de corte
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Simule se você passaria ou não nos vestibulares, sem precisar "pagar para ver".
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 3: Provas Anteriores */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-full bg-white backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-sm border border-emerald-100/50 group-hover:scale-110 group-hover:shadow-emerald-200/50 transition-all duration-700">
                            <FilePen className="w-8 h-8 text-emerald-600" strokeWidth={2.5}/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-4 tracking-tight">
                            Provas Anteriores
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Simule exames reais com provas anteriores completas
                            para você treinar.
                          </p>
                        </div>
                      </motion.div>

                      {/* Card 4: Foco no Essencial */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-full bg-white backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-sm border border-indigo-100/50 group-hover:scale-110 group-hover:shadow-indigo-200/50 transition-all duration-700">
                            <ChartNoAxesCombined className="w-8 h-8 text-indigo-600" strokeWidth={2.5}/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-4 tracking-tight">
                            Foco no Essencial
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Estude os assuntos que mais caem filtrando por
                            matéria e conteúdo específico.
                          </p>
                        </div>
                      </motion.div>

                      {/* CARD 5: Acompanhe Resultados */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-full bg-white backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-sm border border-purple-100/50 group-hover:scale-110 group-hover:shadow-purple-200/50 transition-all duration-700">
                            <AlarmClock className="w-8 h-8 text-purple-600" strokeWidth={2.5}/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-4 tracking-tight">
                            Resultados em Tempo Real
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Acompanhe seu desempenho e evolução detalhada após
                            cada simulação.
                          </p>
                        </div>
                      </motion.div>

                      {/* PRO CARD 6: Suporte 24/7 */}
                      <motion.div
                        variants={MAC_VARIANTS.item}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-full bg-white backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-default"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          <div className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-sm border border-pink-100/50 group-hover:scale-110 group-hover:shadow-pink-200/50 transition-all duration-700">
                            <LifeBuoy className="w-8 h-8 text-pink-600" strokeWidth={2.5}/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-4 tracking-tight">
                            Suporte 24/7
                          </h3>
                          <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Atendimento prioritário a qualquer momento para
                            tirar suas dúvidas.
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
                    {isAuthenticated ? "Veja os Recursos do Simula PRO" : "Por dentro do Vestibuline"}
                  </h2>
                </div>

                {(() => {
                  // State shared between accordion and mockup
                  const features = isAuthenticated
                    ? [
                        {
                          title: "Simulados Ilimitados",
                          subtitle:
                            "Faça e treina sem nenhuma trava para o vestibular, assim você pode se preparar melhor.",
                          icon: "📖",
                          color: "from-emerald-600 to-emerald-700",
                          borderColor: "border-emerald-600",
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
                          title: "Biblioteca de provas",
                          subtitle:
                            "Acesse provas completas de vestibulares anteriores e simule o exame real.",
                          icon: "📚",
                          color: "from-blue-600 to-blue-700",
                          borderColor: "border-blue-600",
                        },
                      ]
                    : [
                        {
                          title: "Por dentro da simulação",
                          subtitle:
                            "Faça Simulados e treine para os principais vestibulares.",
                          icon: "📖",
                          color: "from-emerald-600 to-emerald-700",
                          borderColor: "border-emerald-600",
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
                          title: "Biblioteca de provas",
                          subtitle:
                            "Acesse provas completas de vestibulares anteriores e simule o exame real.",
                          icon: "📚",
                          color: "from-blue-600 to-blue-700",
                          borderColor: "border-blue-600",
                        },
                      ];

                  // Function to render different mockups based on activeFeaturePlatform
                  const renderMockup = () => {
                    if (isAuthenticated) {
                      switch (activeFeaturePlatform) {
                        case 0: // Simulados Ilimitados - Layout de Simulação
                          return (<SimuladoMockup isDark={isDark} selectedAnswer={selectedAnswer} />);

                        case 1: // Consulta de Nota de Corte
                          return (<NotaDeCorteMockup isDark={isDark} />);

                        case 2: // Biblioteca de provas
                          return (<BancoProvasMockup isDark={isDark} />);

                        default:
                          return null;
                      }
                    } else {
                      // Unauthenticated State (Original)
                      switch (activeFeaturePlatform) {
                        case 0: // Simulado Personalizado - Layout de Simulação
                          return (<SimuladoMockup isDark={isDark} selectedAnswer={selectedAnswer} />);

                        case 1: // Biblioteca de provas - Biblioteca
                          return (<NotaDeCorteMockup isDark={isDark} />);

                        case 2: // Biblioteca de provas
                          return (<BancoProvasMockup isDark={isDark} />);

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

        {/* PONTO DE PULO 4: Adicione o id="garantias" na div da seção de Prova Social e Métricas */}
        <div className="themed-section force-themed-bg py-16" id="garantias">
          <div className="container mx-auto px-6">
            {/* Comparação Antes e Depois */}
            <div className="themed-comparison bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-100 rounded-3xl p-6 md:p-8 lg:p-12 mb-16 shadow-xl border border-blue-100">
              <h3 className="themed-text text-xl md:text-2xl font-bold text-center mb-8 md:mb-12">
                Antes e Depois do Vestibuline
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Antes */}
                <div className="themed-card bg-white rounded-2xl p-4 md:p-6 shadow-lg border-l-4 border-red-400 relative overflow-hidden group">
                  <div className="relative z-10">
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
                  
                  {/* Mascote em camada inferior */}
                  <div className="absolute -bottom-2 -right-6 z-0 transform group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                    <Image 
                      src="/Mascote/banners/Camaleão_triste/Camaleão_2.png" 
                      alt="Mascote desanimado background" 
                      width={200} 
                      height={200}
                    />
                  </div>
                </div>

                {/* Depois */}
                <div className="themed-card bg-white rounded-2xl p-4 md:p-6 shadow-lg border-l-4 border-green-400 relative overflow-hidden group">
                  <div className="relative z-10">
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

                  {/* Mascote em camada inferior */}
                  <div className="absolute -bottom-2 -right-6 z-0 transform group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                    <Image 
                      src="/Mascote/banners/Camaleão_8.png" 
                      alt="Mascote motivado background" 
                      width={200} 
                      height={200}
                    />
                  </div>
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
            className="py-24 relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 100%)' }}
          >
            {/* Background decorativo - Pattern sutil de pontos */}
            <div 
              className="absolute inset-0 opacity-[0.02] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                backgroundSize: '32px 32px' 
              }}
            ></div>

            <div className="container mx-auto px-6 relative z-10">
              {/* Header com urgência */}
              <div className="text-center mb-12 relative">
                <h2 className="text-[40px] font-bold text-[#1d1d1f] mb-3 leading-tight tracking-tight">
                  Escolha Seu Plano
                </h2>
                <p className="text-[18px] text-black/60 font-normal leading-relaxed max-w-[600px] mx-auto">
                  Escolha o plano ideal para sua jornada
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start justify-center max-w-[1120px] mx-auto px-4">
                <PricingPlans 
                  loading={loading} 
                  onPlanClick={handlePlanClick} 
                />
              </div>

              {/* Trust Badges */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
              >
                <div className="flex items-center gap-2 text-black/40">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[13px] font-medium" style={{ fontFamily: 'SF Pro Text, sans-serif' }}>Pagamento 100% Seguro</span>
                </div>
                <div className="flex items-center gap-2 text-black/40">
                  <CalendarX className="w-5 h-5" />
                  <span className="text-[13px] font-medium" style={{ fontFamily: 'SF Pro Text, sans-serif' }}>Cancele a qualquer momento</span>
                </div>
                <div className="flex items-center gap-2 text-black/40">
                  <Lock className="w-5 h-5" />
                  <span className="text-[13px] font-medium" style={{ fontFamily: 'SF Pro Text, sans-serif' }}>Privacidade Protegida</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo={loginRedirectUrl}
      />

      <Footer />
    </div>
    </DndProvider>
  );
}