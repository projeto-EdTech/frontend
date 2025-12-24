"use client";

import Header from "@/components/Header";
import DemoModal from "@/components/DemoModal";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import Link from "next/link";
import { Check, BrainCircuit } from "lucide-react";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Importar o useSession
import LoginModal from "@/components/Login-modal";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";


export default function Home() {
  // Estado para modal de demo (deve estar dentro do componente)
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Estados para a nova funcionalidade de login
  const { data: session, status } = useSession(); // Hook para verificar a sessão
  const isAuthenticated = status === 'authenticated';
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Estado para o modal de login

  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  // Estado para contagem de universidades
  const [universitiesCount, setUniversitiesCount] = useState<number | null>(null);
  const [universitiesError, setUniversitiesError] = useState<boolean>(false);

  // Verificar se o usuário tem plano pago
  const hasPaidPlan = session?.user?.tier && session.user.tier !== 'FREE';

  // Função para navegar para a página de estatísticas da matéria
  const handleSubjectClick = (subjectName: string) => {
    setIsNavigating(true);
    // Mapear os nomes das matérias para os slugs corretos que a API espera
    const subjectMapping: { [key: string]: string } = {
      "Matemática": "matematica",
      "Física": "fisica", 
      "Química": "quimica",
      "Biologia": "biologia",
      "História": "historia",
      "Geografia": "geografia",
      "Inglês": "ingles",
      "Português": "portugues",
      "Literatura": "literatura",
      "Filosofia": "filosofia",
      "Sociologia": "sociologia"
    };
    const subjectSlug = subjectMapping[subjectName] || subjectName.toLowerCase();
    router.push(`/estatisticas/${subjectSlug}`);
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  // Nova função para lidar com o clique nos botões de plano pago
  const handlePlanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Previne a navegação padrão do link
    if (isAuthenticated) {
      setIsNavigating(true);
      router.push('/paidPlan'); // Se autenticado, redireciona
    } else {
      setIsLoginModalOpen(true); // Se não, abre o modal de login
    }
  };

  // Buscar quantidade de universidades
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/universities', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
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
    return () => { cancelled = true; };
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
      console.log('User tier:', session.user.tier);
      console.log('Has paid plan:', hasPaidPlan);
    }
  }, [session, hasPaidPlan]);

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
  { name: "Sociologia", icon: "sociologia.png" }
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
                  <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/60 rounded-full animate-float" style={{animationDelay: '0s', animationDuration: '8s'}}></div>
                  <div className="absolute top-20 right-16 w-1 h-1 bg-purple-400/50 rounded-full animate-float" style={{animationDelay: '2s', animationDuration: '10s'}}></div>
                  <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-indigo-400/40 rounded-full animate-float" style={{animationDelay: '4s', animationDuration: '9s'}}></div>
                  <div className="absolute top-1/2 right-10 w-2 h-2 bg-cyan-400/50 rounded-full animate-float" style={{animationDelay: '1s', animationDuration: '11s'}}></div>
                </div>

                {/* Elementos geométricos decorativos - estáticos */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
                <div className="relative z-10 py-12 px-6">{/* Título principal com hierarquia visual melhorada */}
                  <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 animate-fade-in-up leading-tight" style={{animationDelay: '0.4s'}}>
                      <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                        Transforme Seus Estudos em
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent relative">
                        Aprovação no Vestibular
                        {/* Sublinhado animado */}
                        <div className="absolute bottom-0 left-0 w-full h-0.5 md:h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 animate-scale-x" style={{animationDelay: '1s'}}></div>
                      </span>
                    </h1>
                  </div>
                  
                  {/* Subtítulo com tipografia dinâmica e responsiva */}
                  <p className="text-lg sm:text-xl md:text-2xl themed-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up px-4 sm:px-0" style={{animationDelay: '0.6s'}}>
                    Nosso <span className="font-semibold text-blue-600">agente de IA</span> identifica seus pontos fracos e cria um 
                    <span className="font-semibold text-purple-600"> plano personalizado</span> para você passar no vestibular dos seus sonhos
                  </p>

                  {/* Badges de credibilidade com ícones ilustrativos */}
                  <div className="mb-8 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
                      {/* Universidades parceiras */}
                      <div className="flex items-center gap-2 force-themed-card backdrop-blur-sm px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow select-none">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">🎓</span>
                        </div>
                        <span className="text-xs font-medium themed-text" aria-live="polite">
                          {universitiesError && universitiesCount === null && 'Universidades'}
                          {!universitiesError && universitiesCount === null && '...'}
                          {universitiesCount !== null && `${universitiesCount} Universidades`}
                        </span>
                      </div>
                      {/* Aprovações */}
                      <div className="flex items-center gap-2 force-themed-card backdrop-blur-sm px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow select-none">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="text-xs font-medium themed-text">Maior chance de aprovação</span>
                      </div>
                      {/* IA Avançada */}
                      <div className="flex items-center gap-2 force-themed-card backdrop-blur-sm px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow select-none">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">🧠</span>
                        </div>
                        <span className="text-xs font-medium themed-text">IA Avançada</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview visual da plataforma (mockup responsivo) */}
                  <div className="mb-8 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                    <div className="relative max-w-4xl mx-auto">
                      <div className="force-themed-card rounded-2xl shadow-2xl p-3 md:p-4 transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 md:w-3 md:h-3 bg-red-400 rounded-full"></div>
                          <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full"></div>
                          <div className="ml-2 text-xs themed-text-secondary hidden sm:block">vestibuline.com</div>
                        </div>
                        <div className="rounded-lg p-3 md:p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm md:text-base font-semibold themed-text">Análise de Performance</div>
                            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Em tempo real</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="force-themed-card p-2 md:p-3 rounded text-center transition-shadow cursor-pointer">
                              <div className="text-lg md:text-xl font-bold text-blue-600">85%</div>
                              <div className="text-xs themed-text-secondary">Matemática</div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div className="bg-blue-600 h-1 rounded-full" style={{width: '85%'}}></div>
                              </div>
                            </div>
                            <div className="force-themed-card p-2 md:p-3 rounded text-center transition-shadow cursor-pointer">
                              <div className="text-lg md:text-xl font-bold text-green-600">92%</div>
                              <div className="text-xs themed-text-secondary">Física</div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div className="bg-green-600 h-1 rounded-full" style={{width: '92%'}}></div>
                              </div>
                            </div>
                            <div className="force-themed-card p-2 md:p-3 rounded text-center transition-shadow cursor-pointer">
                              <div className="text-lg md:text-xl font-bold text-yellow-600">78%</div>
                              <div className="text-xs themed-text-secondary">Química</div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div className="bg-yellow-600 h-1 rounded-full" style={{width: '78%'}}></div>
                              </div>
                            </div>
                          </div>
                          {/* Recomendação da IA */}
                          <div className="mt-3 p-2 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">🎯</span>
                              <span className="text-xs font-semibold text-blue-700">Recomendação IA</span>
                            </div>
                            <span className="text-xs text-gray-800">Foque em Química - Para melhorar seu desempenho no vestibular</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTAs melhorados com múltiplos níveis e responsividade */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 animate-fade-in-up px-4 sm:px-0" style={{animationDelay: '1s'}}>
                    <Link 
                      href="/library"
                      onClick={(e) => handleNavigation(e, '/library')}
                      className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 overflow-hidden w-full sm:w-auto text-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300"
                      role="button"
                      aria-label="Começar agora gratuitamente - Acesse nossa biblioteca de provas"
                    >
                      {/* Efeito de brilho animado */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative z-10 text-white font-medium text-sm md:text-base">🎯 Começar Agora - É Grátis</span>
                      <svg className="relative z-10 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    
                    {/* Botão secundário responsivo */}
                    <button 
                      className="group relative force-themed-card border-2 themed-border hover:border-blue-400 themed-text hover:text-blue-600 font-semibold py-3 md:py-4 px-6 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-3 w-full sm:w-auto text-center justify-center focus:outline-none focus:ring-4 focus:ring-gray-300"
                      aria-label="Ver demonstração da plataforma em 30 segundos"
                      onClick={() => setShowDemoModal(true)}
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm md:text-base">Ver Demo (30s)</span>
                    </button>
                  </div>
                  
                  {/* Indicadores de confiança melhorados com acessibilidade */}
                  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm themed-text-secondary animate-fade-in-up px-4 sm:px-0" style={{animationDelay: '1.4s'}}>
                    <div className="group flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-green-300 rounded-lg p-1" tabIndex={0} role="button" aria-label="100% Gratuito">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg" aria-hidden="true"></div>
                      <span className="group-hover:text-green-600 transition-colors text-xs md:text-sm">✓ 100% Gratuito</span>
                    </div>
                    <div className="group flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg p-1" tabIndex={0} role="button" aria-label="Resultados em 7 dias">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full shadow-lg" aria-hidden="true"></div>
                      <span className="group-hover:text-blue-600 transition-colors text-xs md:text-sm">✓ Melhora performance</span>
                    </div>
                    <div className="group flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-lg p-1" tabIndex={0} role="button" aria-label="Suporte 24 horas por dia, 7 dias por semana">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg" aria-hidden="true"></div>
                      <span className="group-hover:text-purple-600 transition-colors text-xs md:text-sm">✓ Suporte 24/7</span>
                    </div>
                  </div>

                  {/* Indicador de scroll responsivo */}
                  <div className="mt-8 md:mt-12 flex flex-col items-center animate-fade-in-up relative" style={{animationDelay: '1.6s'}}>
                    {/* Mascote indicando para rolar - animação sutil */}
                    <div className="flex justify-center mb-4">
                      <Image
                        src="/Mascote/banners/Camaleão_31.png"
                        alt="Mascote indicando para rolar"
                        width={180}
                        height={180}
                      />
                    </div>
                    
                    <div className="text-xs themed-text-secondary mb-2 text-center">Role para baixo para descobrir mais</div>
                    <div className="w-6 h-10 border-2 themed-border rounded-full flex justify-center" role="img" aria-label="Indicador de rolagem">
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
                    Veja o ranking <span className="font-semibold text-blue-600">do que mais cai no</span> 
                    <span className="font-semibold text-purple-600"> vestibular de cada matéria</span>
                  </p>
                </div>

                {/* Grid de matérias com animações e interatividade melhorada */}
                <div className="relative z-10">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                    {loading
                      ? Array.from({ length: 11 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center animate-pulse">
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
                              animationDelay: `${index * 0.1}s`
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`Selecionar matéria de ${subject.name}`}
                            onClick={() => handleSubjectClick(subject.name)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
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
                                      src={subject.icon ? `/Materias/${subject.icon}` : "/placeholder.svg"}
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
                                      {Math.floor(Math.random() * 500) + 100}+ questões
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
                                  {Math.floor(Math.random() * 1000) + 500} estudantes
                                </div>
                              </div>
                              
                              {/* Barra de progresso de dificuldade - responsiva */}
                              <div className="flex gap-0.5 sm:gap-1 mt-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {Array.from({ length: 5 }).map((_, i) => {
                                  const difficulty = Math.floor(Math.random() * 5) + 1;
                                  return (
                                    <div 
                                      key={i}
                                      className={`w-1 h-1 rounded-full transition-all duration-300 ${
                                        i < difficulty 
                                          ? 'bg-gradient-to-r from-blue-400 to-purple-500' 
                                          : 'bg-gray-200'
                                      }`}
                                      style={{transitionDelay: `${i * 50}ms`}}
                                      aria-hidden="true"
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                    }
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left sidebar - Countries */}
            <Sidebar />

            {/* Main content */}
            <div className="flex-1 max-w-6xl mx-auto">
              {/* Hero Section Premium */}
              <div className="text-center mb-16 relative px-4">
                {/* Elementos de fundo decorativos */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>

                {/* Badge de credibilidade profissional */}
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 px-6 py-3 rounded-2xl text-sm font-semibold mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span>🏆 Garanta já o Simula PRO</span>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>

                {/* Título Principal com hierarquia visual clara */}
                <div className="mb-8">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[0.9] tracking-tight">
                    <span className="block bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 bg-clip-text text-transparent mb-2">
                      Você está a
                    </span>
                    <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent relative">
                      Um Passo de
                      <br />
                      <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                        Atingir seu Objetivo
                      </span>
                    </span>
                  </h1>
                </div>

                {/* Subtítulo com prova social melhorada */}
                <div className="mb-10">
                  <p className="text-xl md:text-2xl themed-text-secondary max-w-4xl mx-auto leading-relaxed font-medium">
                    <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-3 py-1 rounded-lg font-bold text-lg shadow-sm">
                      93% dos aprovados
                    </span>
                    {" "}nas melhores universidades utilizam{" "}
                    <span className="font-bold text-blue-600 underline decoration-blue-200 decoration-2 underline-offset-2">
                      ferramentas de IA
                    </span>
                    {" "}para estudar.{" "}
                    <span className="font-bold text-purple-600">E você?</span>
                  </p>
                </div>

                {/* Grid de benefícios melhorado */}
                <div className="mb-12">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <div className="group force-themed-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border themed-border hover:border-green-400">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-bold text-green-700 text-base">Análise Personalizada</span>
                      </div>
                      <p className="text-sm text-green-600 leading-relaxed">
                        IA identifica seus pontos fracos
                      </p>
                    </div>

                    <div className="group force-themed-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border themed-border hover:border-blue-400">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <span className="font-bold text-blue-700 text-base">Simula IA Ilimitado</span>
                      </div>
                      <p className="text-sm text-blue-600 leading-relaxed">
                        Converse sem limites com nossa IA
                      </p>
                    </div>

                    <div className="group force-themed-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border themed-border hover:border-purple-400">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <span className="font-bold text-purple-700 text-base">Flexibilidade Total</span>
                      </div>
                      <p className="text-sm text-purple-600 leading-relaxed">
                        Cancele quando quiser, sem multas
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Principal profissional */}
                <div className="space-y-4">
                  <Link 
                    href="/paidPlan"
                    onClick={handlePlanClick}
                    className="group relative inline-flex items-center justify-center gap-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-5 px-12 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl overflow-hidden min-w-[280px]"
                  >
                    {/* Efeito de brilho animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-black">Começar a minha jornada</div>
                        <div className="text-sm text-white/90 font-medium">Acesso imediato • Sem compromisso</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recursos Exclusivos - Grid de Cards */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent themed-text">
                Recursos Exclusivos do Simula PRO
              </span>
            </h2>
            <p className="text-center themed-text-secondary text-lg mb-12 max-w-2xl mx-auto">
              Ferramentas premium que só você tem acesso
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Card 1 - IA Personalizada */}
              <div className="group relative force-themed-card rounded-2xl p-6 shadow-lg border-2 themed-border hover:border-blue-400 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold themed-text mb-3 flex items-center gap-2">
                    Plano de Estudos Personalizado
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">PRO</span>
                  </h3>
                  
                  <p className="themed-text-secondary text-sm mb-4 leading-relaxed">
                    Nosso sistema analisa seu desempenho e cria um cronograma personalizado, focando exatamente nas suas dificuldades
                  </p>
                  <Link 
                    href="/paidPlan"
                    onClick={handlePlanClick}
                  >
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>Ativar agora</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Card 2 - Questões Resolvidas */}
              <div className="group relative force-themed-card rounded-2xl p-6 shadow-lg border-2 themed-border hover:border-purple-400 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold themed-text mb-3 flex items-center gap-2">
                    Questões Resolvidas por IA
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">PRO</span>
                  </h3>
                  
                  <p className="themed-text-secondary text-sm mb-4 leading-relaxed">
                    Resolução passo a passo de qualquer questão, com explicações detalhadas e dicas de como nunca mais errar
                  </p>
                  <Link 
                    href="/paidPlan"
                    onClick={handlePlanClick}
                  >
                    <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>Experimentar</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Card 3 - Estatísticas Avançadas */}
              <div className="group relative force-themed-card rounded-2xl p-6 shadow-lg border-2 themed-border hover:border-green-400 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold themed-text mb-3 flex items-center gap-2">
                    Análise Preditiva
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">PRO</span>
                  </h3>
                  
                  <p className="themed-text-secondary text-sm mb-4 leading-relaxed">
                    Veja sua probabilidade de aprovação em tempo real e descubra exatamente o que precisa melhorar
                  </p>
                  <Link 
                    href="/paidPlan"
                    onClick={handlePlanClick}
                  >
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm hover:text-green-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>Ver análise</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Card 4 - Suporte Prioritário */}
              <div className="group relative force-themed-card rounded-2xl p-6 shadow-lg border-2 themed-border hover:border-orange-400 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold themed-text mb-3 flex items-center gap-2">
                    Suporte Prioritário 24/7
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">PRO</span>
                  </h3>
                  
                  <p className="themed-text-secondary text-sm mb-4 leading-relaxed">
                    Atendimento exclusivo e imediato sempre que precisar, com respostas em minutos
                  </p>
                  <Link 
                    href="/paidPlan"
                    onClick={handlePlanClick}
                  >
                    <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm hover:text-orange-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>Falar agora</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Card 5 - Simulados Ilimitados */}
              <div className="group relative force-themed-card rounded-2xl p-6 shadow-lg border-2 themed-border hover:border-cyan-400 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold themed-text mb-3 flex items-center gap-2">
                    Simulados Sem Limites
                    <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-medium">PRO</span>
                  </h3>
                  
                  <p className="themed-text-secondary text-sm mb-4 leading-relaxed">
                    Pratique quantas vezes quiser com simulados de todas as universidades do Brasil e analisando seu desempenho detalhadamente.
                  </p>
                  <Link 
                    href="/paidPlan"
                    onClick={handlePlanClick}
                  >
                    <div className="flex items-center gap-2 text-cyan-600 font-semibold text-sm hover:text-cyan-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>Fazer simulado</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Card 6 - Simula IA */}
              <div className="group relative force-themed-card rounded-2xl p-6 shadow-lg border-2 themed-border hover:border-violet-400 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400/20 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BrainCircuit className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold themed-text mb-3 flex items-center gap-2">
                    Acesso Ilimitado ao Simula IA
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-medium">PRO</span>
                  </h3>
                  
                  <p className="themed-text-secondary text-sm mb-4 leading-relaxed">
                    Converse com nossa IA avançada para tirar dúvidas, resolver questões e obter orientação personalizada de estudos
                  </p>
                  <Link 
                    href="/paidPlan"
                    onClick={handlePlanClick}
                  >
                    <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm hover:text-violet-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>Conversar com IA</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Comparação PRO vs FREE */}
          <div className="mb-16 relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent themed-text">
                  Compare os benefícios do plano PRO com o gratuito
                </span>
              </h2>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Plano Gratuito */}
                <div className="force-themed-card rounded-2xl p-6 shadow-lg border-2 themed-border opacity-80">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🆓</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold themed-text">Plano Gratuito</h3>
                      <p className="text-sm themed-text-secondary">Recursos básicos</p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {[
                      { text: "Simulados limitados", available: true },
                      { text: "Estatísticas básicas", available: true },
                      { text: "Plano de estudos Personalizado", available: false },
                      { text: "Questões resolvidas por IA", available: false },
                      { text: "Análise preditiva", available: false },
                      { text: "Suporte prioritário", available: false },
                      { text: "Acesso Ilimitado ao Simula IA", available: false }
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {item.available ? (
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <span className={`text-sm ${item.available ? 'themed-text' : 'text-gray-400 line-through'}`}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plano PRO - Destacado */}
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-2xl border-2 border-yellow-400 transform scale-105">
                  {/* Badge de destaque */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      PLANO PRO - Mais Popular
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6 mt-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👑</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Simula PRO</h3>
                      <p className="text-sm text-white/80">Todos os recursos premium</p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {[
                      "Simulados ilimitados",
                      "Estatísticas avançadas completas",
                      "Plano de estudos personalizado",
                      "Questões resolvidas passo a passo",
                      "Análise preditiva de aprovação",
                      "Suporte prioritário 24/7",
                      "Acesso Ilimitado ao Simula IA"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-white font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas e Prova Social */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer-slow"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
                    Você estará entre os melhores!
                  </h2>
                  <p className="text-xl text-white/90 max-w-2xl mx-auto">
                    Membros PRO têm em média <span className="font-bold text-yellow-300">3x mais chances</span> de aprovação
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                  {[
                    { number: "10.000+", label: "Questões disponíveis", icon: "📚" },
                    { number: "95%", label: "Taxa de satisfação", icon: "⭐" },
                    { number: "24/7", label: "Suporte dedicado", icon: "💬" },
                    { number: "95+", label: "Universidades cobertas", icon: "🎓" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="text-4xl mb-2">{stat.icon}</div>
                      <div className="text-3xl md:text-4xl font-black mb-2 text-white">{stat.number}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center">
            <div className="inline-block force-themed-card rounded-3xl p-8 md:p-12 shadow-xl border themed-border">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold themed-text mb-3">
                  Pronto para Virar um PRO?
                </h3>
                <p className="themed-text-secondary text-lg max-w-xl mx-auto">
                  Aproveite e desfrute de todos os recursos e turbine seus estudos agora mesmo
                </p>
              </div>

              <Link 
                href="/paidPlan"
                  onClick={(e) => handleNavigation(e, '/paidPlan')}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="text-lg">Começar minha jornada</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <p className="text-sm themed-text-secondary mt-4">
                Você tem acesso imediato a todos os recursos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- SECÇÃO DE RANKING MELHORADA --- */}
      <div className="py-16 themed-section relative overflow-hidden" id="ranking-cta">
        {/* Background com partículas animadas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-4 h-4 bg-yellow-400/60 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400/50 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-32 w-2 h-2 bg-purple-400/40 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-60 right-40 w-5 h-5 bg-green-400/50 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="force-themed-card bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 animate-fade-in-up relative overflow-hidden">
            
            {/* Efeito de brilho animado no fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer-slow"></div>
            
            {/* Lado Esquerdo: Textos e CTA */}
            <div className="text-center lg:text-left flex-1 relative z-10">
              <a href="/ranking"><div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 hover:bg-white/30 transition-colors duration-300 cursor-pointer">
                <span>🏆</span>
                <span>Competição Saudável</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></div>
              </div></a>
              
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                <span className="block">Veja sua Posição</span>
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent animate-gradient-x">
                  no Ranking Nacional!
                </span>
              </h2>
              
              <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
                Compare seu desempenho com estudantes de todo o país, suba no placar e 
                <span className="font-bold text-yellow-300"> motive-se a alcançar o topo</span>. 
                Você está pronto para o desafio?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                <Link 
                  href="/ranking"
                  onClick={(e) => handleNavigation(e, '/ranking')}
                  className="group relative bg-white text-blue-600 font-bold py-4 px-8 rounded-full transition-all duration-500 transform hover:scale-110 hover:shadow-2xl flex items-center gap-3 overflow-hidden w-full sm:w-auto text-center justify-center focus:outline-none focus:ring-4 focus:ring-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-yellow-500"
                  role="button"
                  aria-label="Consultar o ranking agora"
                >
                  {/* Efeito de onda no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-full"></div>
                  
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="group-hover:animate-bounce">🚀</span>
                    Consultar o Ranking
                  </span>
                  <svg className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
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
                  <div className="bg-gradient-to-t from-gray-400 to-gray-300 w-16 h-32 rounded-t-lg relative animate-slide-up z-30" style={{animationDelay: '0.5s'}}>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl z-40">🥈</div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm z-40">2º</div>
                  </div>
                  
                  {/* 1º lugar (centro) */}
                  <div className="bg-gradient-to-t from-yellow-500 to-yellow-400 w-20 h-40 rounded-t-lg relative animate-slide-up z-40" style={{animationDelay: '0.2s'}}>
                    <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl z-50">🏆</div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white font-bold z-50">1º</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-yellow-200/50 rounded-t-lg animate-pulse z-30"></div>
                  </div>
                  
                  {/* 3º lugar */}
                  <div className="bg-gradient-to-t from-orange-600 to-orange-500 w-16 h-24 rounded-t-lg relative animate-slide-up z-30" style={{animationDelay: '0.8s'}}>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl z-40">🥉</div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm z-40">3º</div>
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

      <div id="about" className="themed-section relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 relative z-10">
          {/* Header da seção */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Sua Jornada para a Aprovação
            </h2>
            <p className="themed-text text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra como milhares de estudantes transformaram seus sonhos em realidade
            </p>
          </div>

          {/* Timeline Interativa */}
          <div className="mb-16">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
              {/* Ilustração lateral */}
              <div className="w-full lg:w-2/5 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-lg h-96 lg:h-[550px] mb-6">
                  {/* Imagem de aprovações em vestibulares com novo visual */}
                  <div className="absolute inset-0 w-full h-full rounded-3xl overflow-visible flex items-center justify-center">
                    {/* Novo bloco de fundo com efeito glassmorphism */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-3/4 bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 z-0"></div>
                    {/* Imagem com borda, sombra e leve rotação */}
                    <img
                      src="https://www.sistemapoliedro.com.br/app/uploads/2024/05/aprovacoes-em-vestibulares.jpg"
                      alt="Aprovações em vestibulares - estudantes celebrando"
                      width={800}
                      height={500}
                      className="object-cover w-[98%] h-[94%] rounded-2xl shadow-2xl border-black border-4 relative z-10 rotate-[-2deg]"
                      style={{ objectFit: 'cover', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    {/* Overlay com gradiente para melhor visual */}
                    <div className="absolute inset-0 bg-gradient-to-t transparent/30 via-transparent to-transparent rounded-2xl pointer-events-none z-20"></div>
                  </div>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="flex-1 space-y-4 md:space-y-6">
                {[
                  {
                    step: "01",
                    title: "Comece com alguns simulados",
                    description: "Faça seus primeiros simulados para avaliar seu conhecimento atual e se familiarizar com a plataforma",
                    icon: "🎯",
                    color: "from-blue-700 to-cyan-700"
                  },
                  {
                    step: "02", 
                    title: "Veja onde você está errando",
                    description: "Nossa IA analisa seus erros e identifica exatamente quais assuntos precisam de mais atenção",
                    icon: "📊",
                    color: "from-blue-600 to-cyan-600"
                  },
                  {
                    step: "03",
                    title: "Prática Intensiva (minimize seus erros)", 
                    description: "Foque nos seus pontos fracos com exercícios direcionados e personalizados para seu perfil",
                    icon: "💪",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    step: "04",
                    title: "Aprovação garantida",
                    description: "Com a prática consistente e foco nos pontos certos, sua aprovação na universidade dos sonhos é certa",
                    icon: "🎓",
                    color: "from-blue-400 to-cyan-400"
                  }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 md:gap-6 group animate-in fade-in slide-in-from-right-8 duration-700"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    {/* Step number e linha */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {item.step}
                      </div>
                      {index < 3 && (
                        <div className="w-0.5 h-8 md:h-12 bg-gradient-to-b from-gray-300 to-transparent mt-3"></div>
                      )}
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1">
                      <div className="themed-card bg-white rounded-xl p-4 md:p-5 shadow-md border border-gray-100 group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg md:text-xl">{item.icon}</span>
                          <h3 className="themed-text text-base md:text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                        </div>
                        <p className="themed-text text-gray-600 leading-relaxed text-sm md:text-base">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid de benefícios com ícones e micro-animações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: "🧠",
                title: "Simulados Inteligentes",
                description: "IA que de da feedbacks instataneos e encontrando seus erros",
                stats: "100% de precisão"
              },
              {
                icon: "📈",
                title: "Estatísticas Avançadas",
                description: "Acompanhe seu progresso com métricas detalhadas",
                stats: "Vários indicadores"
              },
              {
                icon: "📚",
                title: "Biblioteca Completa",
                description: "Acervo com provas dos últimos 10 anos de todos os vestibulares",
                stats: "10.000+ questões"
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="group relative themed-card bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-700 ease-out transform hover:-translate-y-3 overflow-hidden"
                style={{ 
                  animation: `fadeInUp 0.8s ease-out forwards ${index * 0.2}s`,
                  opacity: 0,
                  transform: 'translateY(30px)'
                }}
              >
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-purple-400/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Ícone fixo sem overflow */}
                <div className="text-3xl md:text-4xl mb-3 md:mb-4 transition-all duration-300 ease-out">
                  {benefit.icon}
                </div>

                <h4 className="themed-text font-bold text-base md:text-lg mb-2 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{benefit.title}</h4>
                <p className="themed-text text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base group-hover:text-gray-700 transition-colors duration-300">{benefit.description}</p>
                
                {/* Badge com animação sutil */}
                <div className="inline-flex items-center px-2 md:px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 group-hover:from-blue-500 group-hover:to-indigo-500 text-blue-700 group-hover:text-white text-xs md:text-sm font-medium rounded-full transition-all duration-500 ease-out">
                  {benefit.stats}
                </div>

                {/* Indicador de interatividade */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-100"></div>
              </div>
            ))}
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
            <h3 className="themed-text text-xl md:text-2xl font-bold text-center mb-8 md:mb-12">Antes e Depois do Vestibuline</h3>
            
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
                    "Falta de feedback sobre desempenho"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 themed-text text-gray-600 text-sm md:text-base">
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
                    "Feedback em tempo real com IA"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 themed-text text-gray-600 text-sm md:text-base">
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
                badge: "100% Seguro"
              },
              {
                icon: "⚡",
                title: "Resultados Rápidos", 
                description: "Veja sua evolução de maneira rápida",
                badge: "Método Comprovado"
              },
              {
                icon: "🏆",
                title: "Não se acostumou com a plataforma?",
                description: "Devolvemos seu dinheiro, cancele quando quiser",
                badge: "Garantia Total"
              }
            ].map((guarantee, index) => (
              <div 
                key={index}
                className="text-center themed-card bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">{guarantee.icon}</div>
                <h4 className="themed-text font-bold text-base md:text-lg mb-2">{guarantee.title}</h4>
                <p className="themed-text text-gray-600 mb-3 md:mb-4 text-sm md:text-base">{guarantee.description}</p>
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
        <div id="planos" className="themed-section py-16 force-themed-bg relative overflow-hidden">
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
                Escolha o plano ideal para sua jornada de aprovação e comece a estudar hoje mesmo.
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
                      
                      <h3 className="themed-text text-xl md:text-2xl font-bold mb-2 text-gray-900">Gratuito</h3>
                      <p className="themed-text text-gray-500 mb-6">Para começar a explorar</p>
                      
                      <div className="mb-6">
                        <p className="text-4xl md:text-5xl font-bold text-green-600">R$ 0</p>
                        <p className="themed-text text-sm text-gray-500 mt-1">Para sempre</p>
                      </div>
                      
                      <ul className="space-y-3 text-left mb-8">
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="themed-text text-gray-700">Acesso ilimitado a simulados</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="themed-text text-gray-700">Biblioteca de provas</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="themed-text text-gray-700">Estatística de desempenho em tempo real</span>
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
                        style={{ animationDuration: '5s' }}
                      />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                        👑
                      </div>
                      
                      <h3 className="themed-text text-xl md:text-2xl font-bold mb-2 text-gray-900">Simula Pro Anual</h3>
                      <p className="text-blue-600 mb-6 font-medium"><b>Economize R$ 103! (Ganhe 2 meses grátis)</b></p>

                      <div className="mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="themed-text text-lg text-gray-400 line-through">R$ 600</span>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">-17%</span>
                        </div>
                        <p className="text-4xl md:text-5xl font-bold text-blue-600">R$ 41,5<span className="themed-text text-lg font-normal text-gray-600">/mês</span></p>
                        <p className="themed-text text-sm text-gray-500 mt-1">(R$ 497 cobrado em parcela unica)</p>
                      </div>
                      
                      <ul className="space-y-3 text-left mb-8">
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="themed-text text-gray-700">Acesso ilimitado a simulados</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="themed-text text-gray-700">Biblioteca de provas</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="themed-text text-gray-700">Estatística de desempenho em tempo real</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="themed-text text-gray-700">Questões de provas resolvidas com IA</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="themed-text text-gray-700">Plano de estudos otimizado</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="themed-text text-gray-700">Estatísticas avançadas</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="themed-text text-gray-700">Suporte prioritário 24/7</span>
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
                      
                      <h3 className="themed-text text-xl md:text-2xl font-bold mb-2 text-gray-900">Simula Pro Mensal</h3>
                      <p className="themed-text text-gray-500 mb-6">Flexibilidade total</p>
                      
                      <div className="mb-6">
                        <p className="text-4xl md:text-5xl font-bold text-purple-600">R$ 50<span className="themed-text text-lg font-normal text-gray-600">/mês</span></p>
                        <p className="themed-text text-sm text-gray-500 mt-1">Cancele quando quiser</p>
                      </div>
                      
                      <ul className="space-y-3 text-left mb-8">
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="themed-text text-gray-700">Acesso ilimitado a simulados</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="themed-text text-gray-700">Biblioteca de provas</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="themed-text text-gray-700">Estatísticas de desempenho em tempo real</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="themed-text text-gray-700">Questões de Provas resolvidas com IA</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="themed-text text-gray-700">Plano de estudos otimizado</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="themed-text text-gray-700">Estatísticas avançadas</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="themed-text text-gray-700">Suporte prioritário 24/7</span>
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
      {/* Footer component */}
  {/* Modal de demonstração - deve ser renderizado aqui para overlay global */}
  <DemoModal open={showDemoModal} onClose={() => setShowDemoModal(false)} />

  {/* Modal de login para a nova funcionalidade */}
  <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} redirectTo="/paidPlan" />

  <Footer />
    </div>
  )
}