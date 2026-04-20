import React from 'react';
import { ArrowLeft } from "lucide-react";

export default function GameLoadingSkeleton() {
  return (
    <div className="flex-1 container mx-auto px-4 py-6 relative flex flex-col items-center">
      {/* Breadcrumb e Info do Jogo Skeleton */}
      <div className="w-full lg:w-auto lg:absolute lg:left-4 lg:top-6 z-10 mb-6 lg:mb-0 self-start lg:self-auto flex items-center gap-2 text-gray-400">
        <ArrowLeft className="w-5 h-5 opacity-50" />
        <span className="font-semibold px-2">Voltar para Arena</span>
      </div>

      {/* Game Container Skeleton */}
      <div className="w-full min-h-[600px] flex flex-col bg-white/50 backdrop-blur-md rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
        {/* Placeholder do Jogo */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100">
          {/* Header do Jogo Skeleton */}
          <div className="w-full flex justify-between items-center mb-10 px-6">
            <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Área Central Principal */}
          <div className="w-full max-w-2xl bg-white rounded-2xl p-10 shadow-sm border border-gray-100/50">
             <div className="flex flex-col items-center gap-6">
               <div className="w-20 h-20 bg-gray-200 rounded-2xl"></div>
               <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
               <div className="h-4 w-64 bg-gray-200 rounded-md"></div>
             </div>
             
             {/* Opções (se quisermos simular um quiz) ou blocos vazios */}
             <div className="grid grid-cols-2 gap-4 mt-12 w-full">
               <div className="h-16 bg-gray-100 rounded-xl"></div>
               <div className="h-16 bg-gray-100 rounded-xl"></div>
               <div className="h-16 bg-gray-100 rounded-xl"></div>
               <div className="h-16 bg-gray-100 rounded-xl"></div>
             </div>
          </div>
          
          {/* Footer do Jogo Skeleton */}
          <div className="mt-8">
            <div className="h-12 w-48 bg-blue-100/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
