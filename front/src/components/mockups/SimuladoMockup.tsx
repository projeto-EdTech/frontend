"use client";

import Image from "next/image";

interface SimuladoMockupProps {
  isDark: boolean;
  selectedAnswer: number;
  setSelectedAnswer?: (index: number) => void;
}

export function SimuladoMockup({ isDark, selectedAnswer, setSelectedAnswer }: SimuladoMockupProps) {
  return (
    <div
      className={`rounded-xl h-full flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
    >
      {/* Header da simulação */}
      <div
        className={`border-b px-4 py-3 flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-gray-700" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Logo ENEM */}
            <div
              className={`w-12 h-12 border rounded-lg flex items-center justify-center relative overflow-hidden shadow-md transition-colors duration-300 !bg-white border-gray-200`}
            >
              <Image
                src="/Logo_Universidades/enem.png"
                alt="ENEM Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div>
              <h3
                className={`font-bold text-sm transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Simulado ENEM
              </h3>
              <p
                className={`text-xs transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                1ª Fase - 2025
              </p>
            </div>
          </div>
          {/* Timer */}
          <div className="flex items-center gap-2 bg-red-100 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono font-bold text-red-700">
              Tempo Restante: 02:30
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-medium transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Questão 3 de 45
            </span>
            <span
              className={`transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              6%
            </span>
          </div>
          <div
            className={`h-2 rounded-full overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
          >
            <div className="h-full w-[6%] bg-blue-600 rounded-full transition-all"></div>
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {/* Question text */}
        <div className="mb-5">
          <p
            className={`font-bold text-base leading-relaxed transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Quanto é 20 x 2?
          </p>
        </div>

        {/* Answer options */}
        <div className="space-y-2">
          {[
            { letter: "A", value: "10" },
            { letter: "B", value: "20" },
            { letter: "C", value: "30" },
            { letter: "D", value: "40" },
            { letter: "E", value: "50" },
          ].map((option, index) => (
            <div
              key={option.letter}
              onClick={() => setSelectedAnswer?.(index)}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all cursor-pointer group ${
                selectedAnswer === index
                  ? isDark
                    ? "border-blue-500 bg-blue-900/30 shadow-md"
                    : "border-blue-500 bg-blue-50 shadow-md"
                  : isDark
                    ? "border-gray-600 hover:border-gray-500 bg-gray-700 group-hover:shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white group-hover:shadow-sm"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  selectedAnswer === index
                    ? "border-blue-500 bg-blue-500 text-white shadow-md"
                    : isDark
                      ? "border-gray-500 text-gray-300 group-hover:border-gray-400"
                      : "border-gray-300 text-gray-500 group-hover:border-gray-400"
                }`}
              >
                {option.letter}
              </div>
              <div
                className={`font-semibold text-sm transition-colors duration-300 ${
                  selectedAnswer === index
                    ? isDark
                      ? "text-blue-300"
                      : "text-blue-700"
                    : isDark
                      ? "text-gray-200"
                      : "text-gray-800"
                }`}
              >
                {option.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div
        className={`border-t px-4 py-3 flex-shrink-0 flex justify-between items-center gap-3 transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <button
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
        >
          Anterior
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-md">
          Próxima
        </button>
      </div>
    </div>
  );
}
