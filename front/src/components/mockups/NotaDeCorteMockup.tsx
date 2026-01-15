"use client";

import React from "react";
import Image from "next/image";

interface NotaDeCorteMockupProps {
  isDark: boolean;
}

export function NotaDeCorteMockup({ isDark }: NotaDeCorteMockupProps) {
  return (
    <div
      className={`rounded-xl h-full flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
    >
      {/* Header Principal */}
      <div
        className={`border-b px-3 py-2.5 flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-gray-700" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`p-1.5 rounded-lg shadow-sm transition-colors duration-300 ${isDark ? "bg-blue-800" : "bg-blue-100"}`}
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3
              className={`font-bold text-xs transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Consulta de Notas de Corte
            </h3>
          </div>
        </div>
      </div>

      {/* Seção de Input - Curso Alvo */}
      <div
        className={`px-3 py-3 border-b transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <div className="space-y-2">
          <label
            className={`block text-[10px] font-semibold uppercase tracking-wide transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-700"}`}
          >
            🎯 Seu Curso Alvo
          </label>
          <div className="relative">
            <input
              type="text"
              value="Medicina"
              readOnly
              className={`w-full px-3 py-1.5 border rounded-lg text-xs font-medium cursor-not-allowed transition-colors duration-300 ${isDark ? "border-gray-600 bg-gray-700 text-gray-300" : "border-gray-300 bg-white text-gray-700"}`}
            />
          </div>
          <button className="w-full px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Consultar Notas de Corte</span>
          </button>
        </div>
      </div>

      {/* Card de Desempenho Atual */}
      <div
        className={`px-3 py-2 transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30" : "bg-gradient-to-br from-blue-50 to-indigo-50"}`}
      >
        <div
          className={`border rounded-lg p-2.5 transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-700" : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"}`}
        >
          <p
            className={`text-[10px] font-semibold uppercase tracking-wide mb-1 transition-colors duration-300 ${isDark ? "text-blue-400" : "text-blue-700"}`}
          >
            📊 Desempenho Geral Atual
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              72%
            </span>
            <span
              className={`text-xs font-medium transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              / 100
            </span>
          </div>
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
              style={{ width: "72%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Resultado do Curso Alvo */}
      <div
        className={`px-3 py-2 transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-yellow-900/20 to-orange-900/20" : "bg-gradient-to-br from-yellow-50/50 to-orange-50/50"}`}
      >
        <div className="mb-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div
              className={`p-1 rounded-lg border transition-colors duration-300 ${isDark ? "bg-yellow-800/50 border-yellow-700" : "bg-yellow-100 border-yellow-300"}`}
            >
              <svg
                className="w-3 h-3 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-xs font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Resultado: Medicina
            </h4>
          </div>
          <div
            className={`rounded-lg p-2 text-center border transition-colors duration-300 ${isDark ? "bg-blue-900/30 border-blue-700/40" : "bg-blue-50/70 border-blue-200/40"}`}
          >
            <p
              className={`text-[10px] font-medium transition-colors duration-300 ${isDark ? "text-blue-400" : "text-blue-700"}`}
            >
              Encontradas:{" "}
              <span className="font-bold">2 Universidades</span>
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="flex-1 overflow-auto px-3 py-2">
        <div className="space-y-2">
          {/* UNICAMP - Aprovado */}
          <div
            className={`rounded-lg p-2.5 border transition-colors duration-300 ${isDark ? "bg-green-900/30 border-green-700/40" : "bg-green-50/70 border-green-200/40"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src="/Logo_Universidades/unicamp.png"
                    alt="UNICAMP"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h5
                    className={`text-xs font-semibold transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Medicina
                  </h5>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    <svg
                      className="w-2 h-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    UNICAMP
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold border transition-colors duration-300 ${isDark ? "bg-green-800/50 text-green-400 border-green-700" : "bg-green-100 text-green-700 border-green-200"}`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Aprovado</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div
                className={`p-1.5 rounded text-center border transition-colors duration-300 ${isDark ? "bg-gray-700/60 border-gray-600/40" : "bg-white/60 border-gray-200/40"}`}
              >
                <p
                  className={`text-[9px] font-semibold uppercase tracking-wide mb-0.5 transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Sua Nota
                </p>
                <p className="text-sm font-semibold text-blue-600">72%</p>
              </div>
              <div
                className={`p-1.5 rounded text-center border transition-colors duration-300 ${isDark ? "bg-gray-700/60 border-gray-600/40" : "bg-white/60 border-gray-200/40"}`}
              >
                <p
                  className={`text-[9px] font-semibold uppercase tracking-wide mb-0.5 transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Corte
                </p>
                <p
                  className={`text-sm font-semibold transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  68%
                </p>
              </div>
              <div
                className={`p-1.5 rounded text-center border transition-colors duration-300 ${isDark ? "bg-gray-700/60 border-gray-600/40" : "bg-white/60 border-gray-200/40"}`}
              >
                <p
                  className={`text-[9px] font-semibold uppercase tracking-wide mb-0.5 transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Diferença
                </p>
                <p className="text-sm font-semibold text-green-600">+4</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
