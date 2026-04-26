import React from 'react';
import Image from "next/image";

export default function EstatisticasSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full animate-pulse">
      {/* Skeleton Header com Mascote */}
      <div className="flex flex-col justify-center items-center h-48 gap-6 mb-4">
        <div className="opacity-50">
           <Image
              src="/Mascote/banners/Camaleão_16.png"
              alt="Carregando"
              width={200}
              height={200}
              className="w-32 h-32 object-contain drop-shadow-xl"
            />
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-full h-8 w-8 border-b-2 border-blue-600 animate-spin"></div>
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </div>
      </div>

      {/* Card 1: Tabela de Ranking Skeleton */}
      <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative z-10 w-full h-[500px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="w-full h-12 bg-gray-100 rounded-xl"></div>
            ))}
        </div>
      </div>
      
      {/* Gráficos Skeleton */}
      <div className="w-full max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
        <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="w-full h-full bg-gray-50 rounded-xl"></div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="w-full h-full bg-gray-50 rounded-full mx-auto aspect-square max-h-[250px] mt-6"></div>
        </div>
      </div>
    </div>
  );
}
