"use client";

import React, { useState, useEffect } from 'react';
import { Target, Search, Info } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface NotaCorteFormProps {
  initialScore?: number;
  initialCourse?: string;
  initialInstitution?: string;
}

export default function NotaCorteForm({ 
  initialScore = 75, 
  initialCourse = '', 
  initialInstitution = '' 
}: NotaCorteFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [userScore, setUserScore] = useState(initialScore);
  const [localTargetCourse, setLocalTargetCourse] = useState(initialCourse);
  const [localTargetInstitution, setLocalTargetInstitution] = useState(initialInstitution);

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // Sincroniza com parâmetros de URL se existirem, caso contrário busca do profile
    const scoreParam = searchParams.get('score');
    const courseParam = searchParams.get('course');
    const instParam = searchParams.get('institution');

    if (!scoreParam && !courseParam && !instParam) {
      const savedData = sessionStorage.getItem("user_profile_data");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.targetCourse) setLocalTargetCourse(parsedData.targetCourse);
          if (parsedData.targetExam) setLocalTargetInstitution(parsedData.targetExam);
        } catch (err) {}
      }
    }
  }, [searchParams]);

  const handleConsult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localTargetCourse) return;
    setIsPending(true);
    
    // Constrói URLSearchParams
    const params = new URLSearchParams();
    params.set('score', userScore.toString());
    params.set('course', localTargetCourse);
    if (localTargetInstitution) {
      params.set('institution', localTargetInstitution);
    }

    router.push(`/Nota-corte?${params.toString()}`);
    // Vamos desligar o loading em background caso a página carregue, mas nextjs server component
    // re-hidrata a página. No React 18, set timeout fallback
    setTimeout(() => setIsPending(false), 2000); 
  };

  return (
    <form onSubmit={handleConsult} className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
      
      {/* Controle manual da pontuação para fins de teste no topo */}
      <div className={`p-6 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'} rounded-xl shadow-sm border border-gray-200`}>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Simular Porcentagem de Acertos ({userScore}%):
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <input 
            type="range" 
            min="0" max="100" 
            value={userScore} 
            onChange={(e) => setUserScore(Number(e.target.value))}
            className="w-full sm:flex-1 max-w-md h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <input 
            type="number" 
            min="0" max="100" 
            value={userScore} 
            onChange={(e) => setUserScore(Number(e.target.value))}
            className={`w-20 px-3 py-2 border rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white'}`}
          />
        </div>
      </div>

      <div className={`relative backdrop-blur-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/80 border-gray-200/50'} rounded-xl p-7 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300`}>
        <div className={`absolute top-0 right-0 w-80 h-80 ${isDark ? 'bg-gradient-to-bl from-blue-900/15 to-transparent' : 'bg-gradient-to-bl from-blue-100/40 to-transparent'} rounded-full blur-3xl`}></div>
        
        <div className="absolute top-5 right-6 opacity-75 hidden lg:block z-10">
          <Image 
            src="/Mascote/banners/Camaleão_17.png" alt="Mascote Analista" 
            width={120} height={120} className="object-contain drop-shadow-xl"
          />
        </div>
        
        <div className="relative z-10">
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-blue-100'} shadow-md`}>
                <Target size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} strokeWidth={2} />
              </div>
              <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Consulta de Notas de Corte
              </h2>
            </div>
            <p className={`text-[15px] md:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl leading-relaxed`}>
              Descubra suas chances reais de aprovação! Veja onde sua nota atual te levaria e explore oportunidades em diversas instituições.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-end">
            <div className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-700/40' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/40'} p-6 rounded-xl border shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm`}>
              <div className={`absolute top-0 right-0 w-28 h-28 ${isDark ? 'bg-blue-500/10' : 'bg-blue-200/25'} rounded-full blur-2xl`}></div>
              <p className={`text-[13px] font-semibold mb-2.5 ${isDark ? 'text-blue-300' : 'text-blue-700'} uppercase tracking-wider`}>
                📊 Desempenho Geral Atual
              </p>
              <div className="flex items-baseline gap-2.5 relative">
                <span className={`text-5xl md:text-6xl font-bold ${isDark ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} bg-clip-text text-transparent drop-shadow-md`}>
                  {userScore.toFixed(0)}%
                </span>
                <span className={`text-xl font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/ 100</span>
              </div>
              <div className="mt-3.5">
                <div className={`w-full h-2.5 ${isDark ? 'bg-gray-700/60' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-md"
                    style={{ width: `${userScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label htmlFor="targetCourseInput" className={`block text-[13px] font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wide`}>
                  🎯 Seu Curso Alvo *
                </label>
                <input
                  id="targetCourseInput"
                  type="text"
                  required
                  value={localTargetCourse}
                  onChange={(e) => setLocalTargetCourse(e.target.value)}
                  placeholder="Ex: Medicina, Engenharia, Direito..."
                  className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600/60 bg-gray-700/40 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300/60 bg-white/70 text-gray-900 placeholder-gray-400 focus:border-blue-500'} rounded-lg focus:ring-4 focus:ring-blue-500/15 backdrop-blur-sm transition-all duration-300 text-[15px] font-medium shadow-sm`}
                />
              </div>

              <div>
                <label htmlFor="targetInstitutionInput" className={`block text-[13px] font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wide`}>
                  🏛️ Instituição (Opcional)
                </label>
                <input
                  id="targetInstitutionInput"
                  type="text"
                  value={localTargetInstitution}
                  onChange={(e) => setLocalTargetInstitution(e.target.value)}
                  placeholder="Ex: USP, UNICAMP, UFRJ..."
                  className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600/60 bg-gray-700/40 text-white placeholder-gray-400 focus:border-purple-500' : 'border-gray-300/60 bg-white/70 text-gray-900 placeholder-gray-400 focus:border-purple-500'} rounded-lg focus:ring-4 focus:ring-purple-500/15 backdrop-blur-sm transition-all duration-300 text-[15px] font-medium shadow-sm`}
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !localTargetCourse}
                className={`w-full px-6 py-3.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-[15px] shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer`}
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2.5 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} strokeWidth={2} />
                    <span>Consultar Notas de Corte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
