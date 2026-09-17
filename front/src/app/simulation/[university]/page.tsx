import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import SimulacaoLoader from "@/components/Simula_PRO/SimulacaoLoader";
import SimulacaoSkeleton from "@/components/Skeletons/SimulacaoSkeleton";

const Footer = dynamic(() => import("@/components/Footer"));

export default async function SimulationPage(props: {
  params: Promise<{ university: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const universitySlug = params.university;
  const examYear = typeof searchParams.year === "string" ? searchParams.year : null;
  const day = typeof searchParams.day === "string" ? searchParams.day : "1";
  
  const customQuestionsParam = searchParams.totalQuestions;
  const numberOfQuestions =
    typeof customQuestionsParam === "string" && !isNaN(Number(customQuestionsParam))
      ? parseInt(customQuestionsParam, 10)
      : -1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl flex flex-col">
        {/*
          Aqui estamos usando o Progressive Rendering focado!.
          O Loader (Server Component) vai disparar a requisição ao Java BFF, enquanto a página
          já carrega o simulado e exibe o Skeleton lindão com "gerando a sua prova".
          Assim que o backend responder, a página hidrata com o `SimulationQuizClient`!
        */}
        <Suspense fallback={<SimulacaoSkeleton />}>
          <SimulacaoLoader 
            university={universitySlug} 
            year={examYear} 
            day={day} 
            count={numberOfQuestions} 
          />
        </Suspense>
      </main>

      <Footer />

      {/* Animações Globais */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
