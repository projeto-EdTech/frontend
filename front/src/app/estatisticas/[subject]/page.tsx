import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import EstatisticasDados from "@/components/Estatisticas/EstatisticasDados";
import EstatisticasSkeleton from "@/components/Skeletons/EstatisticasSkeleton";

const Footer = dynamic(() => import("@/components/Footer"));

const FiltrosEstatisticas = dynamic(
  () => import("@/components/Filtros/FiltrosEstatisticas"),
  {
    loading: () => (
      <div className="h-32 animate-pulse rounded-2xl bg-gray-100 mb-10" />
    ),
  }
);

export default async function EstatisticasPage(props: {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const subject = params.subject;
  const vestibularParam = typeof searchParams.vestibular === 'string' ? searchParams.vestibular : 'all';

  const subjectsConfig = [
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
  
  const currentSubject = subjectsConfig.find(s => s.name === subject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
        {/* Renderiza Filtros Interativos (Client Component) */}
        <FiltrosEstatisticas subject={subject} />

        {/* Header com nome da matéria */}
        <div className="flex flex-col items-center justify-center gap-6 mb-12 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">    
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight text-center">
              Estatísticas de {currentSubject ? currentSubject.label : subject}
            </h1>
          </div>
        </div>

        {/* 
          Suspense Boundary:
          Enquanto o componente Server EstatisticasDados espera o Java BFF responder
          o Next.js fará o streaming do EstatisticasSkeleton imediatamente!
        */}
        <Suspense fallback={<EstatisticasSkeleton />}>
          <EstatisticasDados subject={subject} vestibularSelecionado={vestibularParam} />
        </Suspense>

      </main>
      <Footer />
      
      {/* Estilos Globais mantidos da versão original */}
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 10px; transition: background 0.2s; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }
      `}</style>
    </div>
  );
}