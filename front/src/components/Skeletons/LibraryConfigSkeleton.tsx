import React from 'react';

export default function LibraryConfigSkeleton() {
  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 relative overflow-hidden animate-pulse min-h-[500px]">
          {/* Layout de duas colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
            {/* Coluna Esquerda - Configuração da Prova */}
            <div className="order-2 lg:order-1">
              <div className="mb-10 relative">
                <div className="w-11 h-11 mb-5 bg-gray-200 rounded-[11px]"></div>
                <div className="h-8 w-64 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-5 w-48 bg-gray-200 rounded-md"></div>
              </div>

              <div className="space-y-7">
                {/* Seleção de Ano */}
                <div className="space-y-2.5">
                  <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-12 bg-gray-200 rounded-[10px]"></div>
                </div>

                {/* Seleção de Dia */}
                <div className="space-y-2.5">
                  <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
                  <div className="flex flex-wrap gap-2.5">
                    <div className="w-20 h-10 bg-gray-200 rounded-[10px]"></div>
                    <div className="w-20 h-10 bg-gray-200 rounded-[10px]"></div>
                  </div>
                </div>

                {/* Input de tempo */}
                <div className="space-y-2.5">
                  <div className="h-4 w-40 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-12 bg-gray-200 rounded-[10px]"></div>
                </div>

                {/* Botão de iniciar */}
                <div className="relative pt-2">
                  <div className="w-full h-14 bg-gray-200 rounded-[12px]"></div>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Informações da Universidade */}
            <div className="order-1 lg:order-2 lg:border-l lg:border-[#d2d2d7]/50 lg:pl-10 relative">
              <div className="text-center">
                <div className="h-10 w-48 bg-gray-200 rounded-md mx-auto mb-8"></div>
                
                {/* Logo skeleton */}
                <div className="w-40 h-40 mx-auto mb-8 relative">
                   <div className="w-full h-full bg-gray-200 rounded-full"></div>
                </div>

                <div className="h-5 w-64 bg-gray-200 rounded-md mx-auto mb-6"></div>

                {/* Status skeleton */}
                <div className="flex justify-center mb-8">
                  <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
                </div>

                {/* Informações adicionais skeleton */}
                <div className="mt-8 space-y-3">
                  <div className="h-24 w-full bg-gray-200 rounded-[14px]"></div>
                  <div className="h-16 w-full bg-gray-200 rounded-[14px]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
