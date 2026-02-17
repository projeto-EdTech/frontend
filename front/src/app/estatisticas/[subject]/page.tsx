"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/Login-modal";
import { useEffect, useState } from "react";
import { useUniversityStorage } from "@/contexts/UniversityStorage";
import TopicPieChart from '@/components/Simula_PRO/graficos_stats/TopicPieChart';
import TopicBarChart from '@/components/Simula_PRO/graficos_stats/TopicBarChart';
import RankingMaterias from "@/components/RankingMaterias";

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
  const [vestibularSelecionado, setVestibularSelecionado] = useState<string>("all");
  
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
        const url = `/api/estatisticas/${subject}?vestibular=${vestibularSelecionado}`;
        console.log("Frontend - Buscando estatísticas na URL:", url); // Verifique se o ID está aqui
        const res = await fetch(url, {
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

  const subjects = [
    { name: "matematica", label: "Matemática", icon: "📐" },
    { name: "fisica", label: "Física", icon: "⚛️" },
    { name: "quimica", label: "Química", icon: "🧪" },
    { name: "biologia", label: "Biologia", icon: "🧬" },
    { name: "portugues", label: "Português", icon: "📔" },
    { name: "historia", label: "História", icon: "📚" },
    { name: "geografia", label: "Geografia", icon: "🌍" },
    { name: "filosofia", label: "Filosofia", icon: "🤔" },
    { name: "sociologia", label: "Sociologia", icon: "👥" },
    { name: "ingles", label: "Inglês", icon: "🇺🇸" },
  ];

  // 1. Obter universidades do contexto global (UniversityStorage)
  const { universities, loading: loadingUniversities } = useUniversityStorage();

  // 2. Mapear universidades para o formato do dropdown
  const vestibulares: VestibularItem[] = [
    { id: "all", nome: "Estatísticas Gerais", icon: "🌐" },
    ...(loadingUniversities
      ? [{ id: "loading", nome: "Carregando instituições...", icon: "⏳", isPlaceholder: true }]
      : universities.map((university) => ({
          id: String(university.id),
          nome: university.name || university.slug.toUpperCase(),
          icon: "", 
        }))),
  ];

  const router = useRouter();
  const currentSubject = subjects.find(s => s.name === subject);
  const currentVestibular = vestibulares.find(v => v.id === vestibularSelecionado);

  const colors = [
    "#2563eb", "#10b981", "#f59e42", "#ef4444", "#a21caf", "#0ea5e9", "#fbbf24", "#14b8a6", "#e11d48"
  ];

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
                className="w-full bg-white backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-3.5 text-left shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
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

              {showSubjectFilter && (
                <div className="absolute z-[10000] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                  {subjects.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => handleSubjectSelect(s.name)}
                      className={`w-full px-5 py-3.5 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-all duration-150 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl cursor-pointer ${
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
                </div>
              )}
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
                className="w-full bg-white backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-3.5 text-left shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
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

              {dropdownAberto && (
                <div className="absolute z-[10000] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                  {vestibulares.map((vest) => (
                    <button
                      key={vest.id}
                      onClick={() => handleVestibularSelect(vest.id)}
                      className={`w-full px-5 py-3.5 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-all duration-150 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl cursor-pointer ${
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navegação Desktop - Estilo macOS */}
        <div className="hidden md:flex flex-wrap gap-3 mb-10 justify-center">
          {subjects.map((s) => (
            <button
              key={s.name}
              onClick={() => router.push(`/estatisticas/${s.name}`)}
              className={`px-6 py-3 rounded-xl font-semibold tracking-tight transition-all duration-200 border backdrop-blur-sm hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                s.name === subject 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30" 
                  : "bg-white text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Seletor de Vestibular Desktop - Estilo macOS */}
        <div className={`hidden md:block mb-12 max-w-xl mx-auto relative ${dropdownAberto ? 'z-[10000]' : 'z-10'}`}>
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

              {dropdownAberto && (
                <div className="absolute z-[10000] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                  {vestibulares.map((vest) => (
                    <button
                      key={vest.id}
                      onClick={() => handleVestibularSelect(vest.id)}
                      className={`w-full px-5 py-4 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-all duration-150 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl cursor-pointer ${
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header com nome da matéria e badge - Estilo macOS */}
        <div className="flex flex-col items-center justify-center gap-6 mb-12 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">    
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight text-center">
              Estatísticas de {currentSubject ? currentSubject.label : subject}
            </h1>
            
            {/* Badge do vestibular - estilo macOS */}
            {currentVestibular && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50 to-blue-100/80 border border-gray-200 px-5 py-2.5 rounded-full flex-shrink-0 shadow-lg shadow-blue-500/10">
                <span className="text-blue-700 font-semibold text-xs sm:text-sm tracking-tight">
                  {currentVestibular.nome}
                </span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-6">
            {/* Mascote estudando durante loading */}
            <div className="animate-pulse">
              <Image
                src="/Mascote/banners/Camaleão_16.png"
                alt="Mascote estudando"
                width={200}
                height={200}
                className="w-40 h-40 object-contain drop-shadow-xl"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="text-xl font-medium text-gray-700 tracking-tight">Carregando estatísticas...</span>
            </div>
          </div>
        ) : erro ? (
          <div className="flex flex-col items-center justify-center gap-6 py-16">
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
          </div>
        ) : metricas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-16">
            {/* Mascote para estado vazio */}
            <Image
              src="/Mascote/banners/Camaleão_18.png"
              alt="Mascote - sem dados"
              width={200}
              height={200}
              className="w-40 h-40 md:w-48 md:h-48 object-contain opacity-50 drop-shadow-xl"
            />
            <p className="text-gray-500 text-xl font-medium tracking-tight">Não há dados para esta matéria.</p>
          </div>
        ) : (
          <>
            {/* Card 1: Tabela de Ranking - TOP 10 Conteúdos - Estilo macOS */}
              <div className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 mb-8 relative z-10">
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
                    !item.topico.toLowerCase().includes('demais assuntos (< que') &&
                    item.topico.toLowerCase() !== 'outros'
                  )} 
                  colors={colors} 
                />
              </div>
              
            {/* Container principal para os gráficos - Estilo macOS */}
            <div className="w-full max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
              {/* Card 1: Gráfico de Barras */}
              <div className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-xl">📊</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-600 tracking-tight">
                    Distribuição dos Tópicos
                  </h2>
                </div>
                <TopicBarChart data={metricas} colors={colors} />
              </div>

              {/* Card 2: Gráfico de Pizza */}
              <div className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <span className="text-xl">📈</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-600 tracking-tight">
                    Distribuição Percentual
                  </h2>
                </div>
                <TopicPieChart data={metricas} colors={colors} />
              </div>
            </div>

            {/* Cards animados para cada tópico - Estilo macOS */}
            <div className="relative">
              {/* Mascote comemorativo */}
              {metricas.length > 0 && (
                <div className="flex justify-center mb-10">
                  <div className="backdrop-blur-xl bg-white rounded-2xl px-8 py-4 shadow-xl border border-gray-200 flex items-center gap-4">
                    <Image
                      src="/Mascote/banners/Camaleão_20.png"
                      alt="Mascote comemorando"
                      width={400}
                      height={400}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg"
                    />
                    <span className="text-base md:text-lg font-semibold text-gray-700 tracking-tight">
                      {metricas.length} {metricas.length === 1 ? 'Conteúdo encontrado' : 'Conteúdos encontrados'}!
                    </span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {metricas.map((item, idx) => (
                  <div
                    key={idx}
                    className="backdrop-blur-xl bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 flex flex-col items-center border-t-4 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in"
                    style={{ 
                      borderTopColor: colors[idx % colors.length], 
                      animationDelay: `${idx * 60}ms` 
                    }}
                  >
                    <span className="text-base sm:text-lg font-semibold text-gray-600 mb-3 text-center tracking-tight leading-snug">
                      {item.topico}
                    </span>
                    <span
                      className="text-3xl sm:text-4xl font-bold mb-2"
                      style={{ color: colors[idx % colors.length] }}
                    >
                      {item.percentual}%
                    </span>
                    <div className="w-full bg-gray-200/50 rounded-full h-2.5 mt-3 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${item.percentual}%`, 
                          background: `linear-gradient(90deg, ${colors[idx % colors.length]}, ${colors[(idx + 1) % colors.length]})` 
                        }}
                      >
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        @keyframes fade-in {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

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