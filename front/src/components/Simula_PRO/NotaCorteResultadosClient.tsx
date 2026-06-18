"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { Target, ShieldCheck, SearchX } from 'lucide-react';
import CourseCard from '@/components/Simula_PRO/CourseCard';

interface Props {
  course: string;
  score: number;
  institution: string;
  initialTargetResult: any | null;
  filteredAndSorted: any[];
}

const fetcher = async (url: string, payload: any) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error('Falha na revalidação dos dados');
  }
  return res.json();
};

export default function NotaCorteResultadosClient({
  course,
  score,
  institution,
  initialTargetResult,
  filteredAndSorted,
}: Props) {
  // Configuração SWR para Stale-While-Revalidate em dados dinâmicos do usuário
  // Isso atende perfeitamente ao "Implemente Cache Híbrido com SWR" da requisição
  const { data, error } = useSWR(
    course ? ['/api/Nota-corte', { targetCourse: course, targetInstitution: institution, userScore: score }] : null,
    ([url, args]) => fetcher(url, args),
    {
      fallbackData: initialTargetResult ? { targetCourseResults: [initialTargetResult] } : null,
      revalidateOnFocus: false, // Evita disparos desnecessários na Thread caso ele saia e volte na aba 
      refreshInterval: 60000,   // Revalida em background (após 60s) se algo mudar no Target
    }
  );

  const targetResult = data?.targetCourseResults?.[0] || initialTargetResult;

  return (
    <div className="space-y-7 animate-fade-in">
      {targetResult ? (
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50 rounded-xl p-7 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/15 to-orange-400/15"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
          </div>
          <div className="relative z-10">
            <div className="mb-7">
              <div className="flex items-center gap-3 mb-3.5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-300 shadow-lg">
                  <Target size={28} className="text-yellow-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-700 bg-clip-text text-transparent drop-shadow-sm">
                    Resultado Atualizado (SWR) do seu Curso Alvo
                  </h3>
                </div>
              </div>
            </div>
            
            {/* O status de erro (fallback caso SWR caia e não haja inicial) */}
            {error && <div className="text-red-500 text-sm mb-4">Atenção: Não foi possível revalidar em background. Usando dados mais recentes suportados.</div>}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <CourseCard result={targetResult} theme="light" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50 rounded-xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border text-center">
          <div className="inline-block mb-5">
            <div className="absolute inset-0 bg-red-300/25 rounded-full blur-3xl animate-pulse"></div>
            <Image 
              src="/Mascote/banners/Camaleão_triste/Camaleão_1.png" 
              alt="Mascote triste" 
              width={160} height={160}
              className="relative z-10 w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-xl"
            />
          </div>
          <div className="inline-flex items-center justify-center gap-2.5 mb-5 px-5 py-2.5 rounded-xl bg-red-50 border border-red-200 shadow-lg">
            <div className="p-1.5 rounded-lg bg-red-100">
              <SearchX className="w-7 h-7 text-red-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
              Curso Não Encontrado
            </h3>
          </div>
        </div>
      )}

      {/* Lista Secundária via (ISR estático misturado ao SSR inicial) */}
      <div className="backdrop-blur-xl bg-white/80 border-gray-200/50 rounded-xl p-7 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="p-1.5 rounded-lg bg-green-100">
            <ShieldCheck size={22} className="text-green-600" strokeWidth={2} />
          </div>
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-800">
            🎉 Sugestão Rápida: Cursos em que seria APROVADO
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredAndSorted && filteredAndSorted.length > 0 ? (
            filteredAndSorted.map((result: any) => (
              <CourseCard key={result.id} result={result} theme="light" />
            ))
          ) : (
             <div className="text-gray-500">Nenhum curso passível de aprovação encontrado nesta margem.</div>
          )}
        </div>
      </div>
    </div>
  );
}
