"use client";

import { useState } from "react";
import Image from "next/image";

interface BancoProvasMockupProps {
  isDark: boolean;
}

export function BancoProvasMockup({ isDark }: BancoProvasMockupProps) {
  // 1. Estados para controlar os filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("Todos os anos");
  const [selectedState, setSelectedState] = useState("Todos os estados");
  const [selectedType, setSelectedType] = useState("Todas");

  // 2. Banco de dados mockado (Adicionei o campo 'years' para o filtro funcionar)
  const universidades = [
    {
      name: "FUVEST",
      logo: "/Logo_Universidades/fuvest.jpg",
      state: "SP",
      type: "estadual",
      years: ["2025", "2024", "2023", "2022"],
      dotColor: "bg-yellow-400",
    },
    {
      name: "UNESP",
      logo: "/Logo_Universidades/unesp.jpg",
      state: "SP",
      type: "estadual",
      years: ["2025", "2024"],
      dotColor: "bg-yellow-400",
    },
    {
      name: "UNICAMP",
      logo: "/Logo_Universidades/unicamp.png",
      state: "SP",
      type: "estadual",
      years: ["2024", "2023"],
      dotColor: "bg-yellow-400",
    },
    {
      name: "UFPR",
      logo: "/Logo_Universidades/ufpr.jpg",
      state: "PR",
      type: "federal",
      years: ["2025", "2023"],
      dotColor: "bg-blue-400",
    },
  ];

  // 3. Lógica de Filtragem
  const filteredUniversidades = universidades.filter((uni) => {
    // Filtro de Texto (Nome)
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de Ano (Verifica se o ano selecionado existe na lista de anos da faculdade)
    const matchesYear =
      selectedYear === "Todos os anos" || uni.years.includes(selectedYear);

    // Filtro de Estado (Mapeamento de nome completo para sigla)
    const stateMap: Record<string, string> = {
      "São Paulo": "SP",
      "Paraná": "PR",
      "Minas Gerais": "MG",
    };
    const targetState = stateMap[selectedState];
    const matchesState =
      selectedState === "Todos os estados" || uni.state === targetState;

    // Filtro de Tipo (Normalização para minúsculo)
    const matchesType =
      selectedType === "Todas" || uni.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesYear && matchesState && matchesType;
  });

  return (
    <div
      className={`rounded-xl h-full flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
    >
      {/* Header */}
      <div
        className={`border-b px-4 py-3 flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-gray-700" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"}`}
      >
        <h3
          className={`font-bold text-sm transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Banco de Provas
        </h3>
        <p
          className={`text-xs transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          Conheça seus desafios
        </p>
      </div>

      {/* Filtros */}
      <div
        className={`flex flex-col md:flex-row flex-wrap md:flex-nowrap gap-3 md:gap-4 items-center px-4 py-3 flex-shrink-0 transition-colors duration-300 border-b ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        {/* Busca */}
        <div className="flex items-center flex-1 min-w-[180px]">
          <span className="mr-2 text-blue-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-3.5-3.5" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar universidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 ${isDark ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-blue-400/50 focus:border-blue-400" : "bg-white border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-blue-400/50 focus:border-blue-400"}`}
          />
        </div>

        {/* Ano */}
        <div className="flex items-center min-w-[140px]">
          <span className="mr-2 text-purple-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="4" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer ${isDark ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-purple-400/50 focus:border-purple-400" : "bg-white border-gray-200 text-gray-700 focus:ring-purple-400/50 focus:border-purple-400"}`}
          >
            <option>Todos os anos</option>
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>

        {/* Estado */}
        <div className="flex items-center min-w-[140px]">
          <span className="mr-2 text-green-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 5h18v1.6L14 13v4.6l-4 3.8V13L3 6.6V5z" />
              <path d="M17 11.5a3.6 3.6 0 0 0-3.6 3.6c0 2.7 3.6 6 3.6 6s3.6-3.3 3.6-6A3.6 3.6 0 0 0 17 11.5z" />
              <circle cx="17" cy="15.1" r="1.4" />
            </svg>
          </span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer ${isDark ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-green-400/50 focus:border-green-400" : "bg-white border-gray-200 text-gray-700 focus:ring-green-400/50 focus:border-green-400"}`}
          >
            <option>Todos os estados</option>
            <option>São Paulo</option>
            <option>Paraná</option>
            <option>Minas Gerais</option>
          </select>
        </div>

        {/* Tipo de Instituição */}
        <div className="flex items-center min-w-[130px]">
          <span className="mr-2 text-indigo-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer ${isDark ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-indigo-400/50 focus:border-indigo-400" : "bg-white border-gray-200 text-gray-700 focus:ring-indigo-400/50 focus:border-indigo-400"}`}
          >
            <option>Todas</option>
            <option>Federal</option>
            <option>Estadual</option>
            <option>Particular</option>
          </select>
        </div>
      </div>

      {/* Grid de universidades */}
      <div
        className={`flex-1 overflow-auto px-4 py-4 transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
      >
        {filteredUniversidades.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredUniversidades.map((uni, idx) => (
              <div
                key={idx}
                className={`group relative h-48 rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-md hover:shadow-lg ${
                  isDark
                    ? "bg-gray-700 border-gray-600 hover:border-blue-500"
                    : "bg-white border-gray-200 hover:border-blue-500"
                }`}
              >
                {/* Ponto colorido no canto superior direito */}
                <div
                  className={`absolute top-3 right-3 w-3 h-3 rounded-full ${uni.dotColor} z-10`}
                ></div>

                {/* Conteúdo centralizado */}
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  {/* Logo em destaque */}
                  <div
                    className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 mb-3 shadow-md transition-transform group-hover:scale-110 overflow-hidden relative ${
                      isDark
                        ? "bg-gray-600"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center !bg-white">
                      <Image
                        src={uni.logo}
                        alt={`Logo ${uni.name}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                        quality={85}
                      />
                    </div>
                  </div>

                  {/* Nome da universidade */}
                  <p
                    className={`text-sm font-bold text-center transition-colors mb-2 ${
                      isDark
                        ? "text-gray-100 group-hover:text-blue-400"
                        : "text-gray-900 group-hover:text-blue-600"
                    }`}
                  >
                    {uni.name}
                  </p>

                  {/* Descrição */}
                  <p
                    className={`text-xs text-center mb-3 transition-colors ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Universidade {uni.type === "estadual" ? "Estadual" : "Federal"}
                  </p>

                  {/* Badges */}
                  <div className="flex gap-2 justify-center flex-wrap">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold transition-colors ${
                        uni.type === "estadual"
                          ? isDark
                            ? "bg-green-900/60 text-green-300"
                            : "bg-green-100 text-green-700"
                          : isDark
                            ? "bg-blue-900/60 text-blue-300"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {uni.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        isDark
                          ? "bg-gray-600 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {uni.state}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Estado vazio caso nenhum filtro encontre nada
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className={`text-4xl mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`}>
              🔍
            </div>
            <p className={`font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Nenhuma universidade encontrada
            </p>
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}
      </div>

      {/* Footer com estatísticas dinâmicas */}
      <div
        className={`border-t px-4 py-3 flex-shrink-0 flex items-center justify-between text-xs transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-100 text-gray-600"}`}
      >
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          {filteredUniversidades.length} Universidade{filteredUniversidades.length !== 1 ? 's' : ''} Encontrada{filteredUniversidades.length !== 1 ? 's' : ''}
        </span>
        <span>Simulados Reais</span>
      </div>
    </div>
  );
}