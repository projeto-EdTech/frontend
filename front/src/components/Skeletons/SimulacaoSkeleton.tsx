import React from 'react';
import Image from 'next/image';

export default function SimulacaoSkeleton() {
  return (
    <div className="flex-1 w-full animate-pulse">
      {/* Header do Simulado */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 mb-8 flex justify-between items-center relative overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0"></div>
          <div className="h-8 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="w-40 h-10 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Carousel Spacer */}
      <div className="h-16 bg-white/60 rounded-xl border border-gray-100 mb-6 flex items-center justify-between px-4">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="w-10 h-10 bg-gray-200 rounded-md"></div>
          ))}
      </div>
      
      {/* Corpo da Prova */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 relative min-h-[500px]">
        {/* Placeholder de carregamento no centro da prova (casca) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
          <Image 
            src="/Mascote/banners/Camaleão_16.png" 
            alt="Carregando documentação da prova..."
            width={180} height={180}
            className="mb-6 drop-shadow-xl animate-float"
          />
          <p className="text-xl font-bold tracking-tight text-gray-500">
            Gerando a sua prova...
          </p>
        </div>

        {/* Linhas da questão para dar formatação Skeleton */}
        <div className="flex items-start gap-4 mb-10 w-full relative z-10 opacity-60">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="space-y-4 flex-1">
            <div className="h-5 bg-gray-200 rounded w-full"></div>
            <div className="h-5 bg-gray-200 rounded w-11/12"></div>
            <div className="h-5 bg-gray-200 rounded w-4/5"></div>
            <div className="h-5 bg-gray-200 rounded w-5/6"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Alternativas Skeleton */}
        <div className="space-y-4 relative z-10 opacity-60">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl bg-gray-50/50">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
