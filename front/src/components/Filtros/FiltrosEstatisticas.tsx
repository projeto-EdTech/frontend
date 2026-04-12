"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUniversityStorage } from '@/contexts/UniversityStorage';

type VestibularItem = {
  id: string;
  nome: string;
  icon: string;
  isPlaceholder?: boolean;
};

interface FiltrosProps {
  subject: string;
}

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

export default function FiltrosEstatisticas({ subject }: FiltrosProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vestibularParam = searchParams.get('vestibular') || 'all';

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [showSubjectFilter, setShowSubjectFilter] = useState(false);

  const { universities, loading: loadingUniversities } = useUniversityStorage();

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

  const currentSubject = subjects.find(s => s.name === subject);
  const currentVestibular = vestibulares.find(v => v.id === vestibularParam);

  const handleVestibularSelect = (vestibularId: string) => {
    setDropdownAberto(false);
    // Atualiza o parametro de URL via router navigation, o que forçará o Suspense a reavaliar a Request
    router.push(`/estatisticas/${subject}?vestibular=${vestibularId}`, { scroll: false });
  };

  const handleSubjectSelect = (subjectName: string) => {
    setShowSubjectFilter(false);
    router.push(`/estatisticas/${subjectName}?vestibular=${vestibularParam}`);
  };

  return (
    <>
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
              className="w-full bg-white backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-3.5 text-left shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{currentSubject?.icon || "📝"}</span>
                  <span className="text-gray-900 font-medium tracking-tight">
                    {currentSubject ? currentSubject.label : subject}
                  </span>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showSubjectFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`w-full px-5 py-3.5 text-left hover:bg-gray-50 focus:bg-gray-50 transition-all duration-150 border-b border-gray-100 last:border-b-0 cursor-pointer ${
                      s.name === subject ? "bg-blue-50 text-blue-700" : "text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{s.icon}</span>
                      <span className="font-medium tracking-tight">{s.label}</span>
                      {s.name === subject && <span className="ml-auto text-blue-600 font-bold">✓</span>}
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
              className="w-full bg-white backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-3.5 text-left shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className={`tracking-tight ${currentVestibular?.isPlaceholder ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                  {currentVestibular?.nome || "Escolha uma instituição..."}
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`w-full px-5 py-3.5 text-left hover:bg-gray-50 transition-all duration-150 border-b border-gray-100 last:border-b-0 cursor-pointer ${
                      vest.id === vestibularParam ? "bg-blue-50 text-blue-700" : "text-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium tracking-tight">{vest.nome}</span>
                      {vest.id === vestibularParam && <span className="text-blue-600 font-bold">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação Desktop */}
      <div className="hidden md:flex flex-wrap gap-3 mb-10 justify-center">
        {subjects.map((s) => (
          <button
            key={s.name}
            onClick={() => handleSubjectSelect(s.name)}
            className={`px-6 py-3 rounded-xl font-semibold tracking-tight transition-all duration-200 border backdrop-blur-sm hover:scale-105 hover:shadow-md cursor-pointer ${
              s.name === subject 
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30" 
                : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Seletor de Vestibular Desktop */}
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
              className="w-full bg-white backdrop-blur-sm border border-gray-200 rounded-xl px-5 py-4 text-left shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className={`tracking-tight ${currentVestibular?.isPlaceholder ? 'text-gray-500' : 'text-gray-900 font-medium text-base'}`}>
                  {currentVestibular?.nome || "Escolha uma instituição..."}
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`w-full px-5 py-4 text-left hover:bg-gray-50 transition-all duration-150 border-b border-gray-100 last:border-b-0 cursor-pointer ${
                      vest.id === vestibularParam ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`tracking-tight ${vest.id === vestibularParam ? 'text-blue-700 font-semibold' : 'text-gray-900 font-medium'}`}>
                        {vest.nome}
                      </span>
                      {vest.id === vestibularParam && <span className="text-blue-600 font-bold">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside invisível */}
      {(dropdownAberto || showSubjectFilter) && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/5" 
          onClick={() => {
            setDropdownAberto(false);
            setShowSubjectFilter(false);
          }}
        />
      )}
    </>
  );
}
