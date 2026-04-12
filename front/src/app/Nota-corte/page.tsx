import React, { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotaCorteForm from "@/components/Simula_PRO/NotaCorteForm";
import NotaCorteResultados from "@/components/Simula_PRO/NotaCorteResultados";
import ResultSkeleton from "@/components/Skeletons/ResultSkeleton";

// Configuração Next 15 para Server Components assíncronos (Aguardar Promise de searchParams)
export default async function NotaCortePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const scoreRaw = searchParams.score;
  const courseRaw = searchParams.course;
  const institutionRaw = searchParams.institution;

  const score = typeof scoreRaw === 'string' ? parseFloat(scoreRaw) : 75;
  const course = typeof courseRaw === 'string' ? courseRaw : '';
  const institution = typeof institutionRaw === 'string' ? institutionRaw : '';

  return (
    <div className="min-h-screen bg-gray-50 relative flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                Simulador de Notas de Corte
              </h1>
              <p className="text-base text-gray-600">
                Teste e descubra suas chances de aprovação direto nas instituições almejadas.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Formulário Interativo via CSR - Dispara mudança nos SearchParams */}
        <NotaCorteForm 
          initialScore={score} 
          initialCourse={course} 
          initialInstitution={institution} 
        />

        {/* 2. Resultados via SSR com Progressive Rendering */}
        {course && (
          <Suspense fallback={<ResultSkeleton />}>
            <NotaCorteResultados 
              course={course} 
              score={score} 
              institution={institution} 
            />
          </Suspense>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
