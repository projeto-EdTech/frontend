"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BotMessageSquare, BookOpen, AlertCircle, CheckCircle } from "lucide-react";

interface QuestoesIAMockupProps {
  isDark: boolean;
}

// 1. Banco de dados mockado das questões com LOGOS
const questionsData: Record<string, any> = {
  "Física — Eletricidade": {
    exam: "FUVEST 2025",
    subject: "Física",
    // Certifique-se de ter esta imagem em public/Logo_Universidades/fuvest.jpg
    logo: "/Logo_Universidades/fuvest.jpg", 
    question: "Um fio condutor é percorrido por cerca de 2x10⁻¹⁴ C. Determine a intensidade da corrente elétrica média num intervalo de 1 µs.",
    userAnswer: "1 A",
    correctAnswer: "2x10⁻⁸ A",
    explanationSteps: [
      "Aplicar I = Q/t",
      "(2×10⁻¹⁴)/(10⁻⁶) = 2×10⁻⁸ A"
    ]
  },
  "Química — Reações": {
    exam: "UNICAMP 2024",
    subject: "Química",
    // Certifique-se de ter esta imagem em public/Logo_Universidades/unicamp.png
    logo: "/Logo_Universidades/unicamp.png",
    question: "Na combustão completa do metano (CH₄), quais são os produtos formados e qual a estequiometria correta da reação balanceada?",
    userAnswer: "CO + H₂O",
    correctAnswer: "CO₂ + 2H₂O",
    explanationSteps: [
      "Reação geral: CH₄ + O₂ → CO₂ + H₂O",
      "Balanceamento: CH₄ + 2O₂ → CO₂ + 2H₂O"
    ]
  },
  "Matemática — Álgebra": {
    exam: "ENEM 2024",
    subject: "Matemática",
    // Certifique-se de ter esta imagem em public/Logo_Universidades/enem.png
    logo: "/Logo_Universidades/enem.png",
    question: "Quais são as raízes reais da equação quadrática x² - 5x + 6 = 0?",
    userAnswer: "-2 e -3",
    correctAnswer: "2 e 3",
    explanationSteps: [
      "Soma = 5, Produto = 6",
      "Raízes são x' = 2 e x'' = 3"
    ]
  }
};

export function QuestoesIAMockup({ isDark }: QuestoesIAMockupProps) {
  // 2. Estado para controlar o tópico selecionado
  const [selectedTopic, setSelectedTopic] = useState("Física — Eletricidade");

  // Recupera os dados do tópico atual (Texto + Logo)
  const currentData = questionsData[selectedTopic];

  return (
    <div
      className={`rounded-xl h-full flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
    >
      {/* Header com estilo de Questões Gemini */}
      <div
        className={`border-b px-4 py-3 flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-gray-700" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`p-1.5 rounded-lg shadow-sm transition-colors duration-300 ${isDark ? "bg-blue-800" : "bg-blue-100"}`}
          >
            <BotMessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3
              className={`font-bold text-sm transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Análise Inteligente
            </h3>
            <p
              className={`text-xs transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Explicações de questões erradas
            </p>
          </div>
        </div>
      </div>

      {/* Selector Card para tópico */}
      <div
        className={`border-b px-4 py-3 transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <BookOpen
              size={12}
              className="text-white"
              strokeWidth={2}
            />
          </div>
          <label
            className={`text-xs font-semibold transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Tópico
          </label>
        </div>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)} // Atualiza o estado ao mudar
          className={`w-full p-2 border rounded-lg text-xs font-medium transition-all duration-300 appearance-none cursor-pointer ${isDark ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`}
        >
          {/* Gera as opções baseadas nas chaves do objeto */}
          {Object.keys(questionsData).map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      {/* Question Progress */}
      <div
        className={`border-b px-4 py-3 transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold text-[10px]">
              1
            </div>
            <span
              className={`text-xs font-semibold transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-800"}`}
            >
              Questão Selecionada
            </span>
          </div>
          <div
            className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg ${isDark ? "bg-blue-900/50 text-blue-400" : "bg-blue-50 text-blue-700"}`}
          >
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
            Gerando análise
          </div>
        </div>
        <div
          className={`h-1.5 rounded-full overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
        >
          <div className="h-full w-[100%] bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"></div>
        </div>
      </div>

      {/* Question Card */}
      <div
        className={`border-b px-4 py-3 transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <div className="flex items-start gap-2 mb-3">
          {/* Container da Logo com posicionamento relativo para o Image fill */}
          <div className="w-8 h-8 !bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-200 flex-shrink-0 relative overflow-hidden">
            <Image
              src={currentData.logo}
              alt={currentData.exam}
              fill
              className="object-contain p-1"
              sizes="32px"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`text-xs font-bold transition-colors duration-300 ${isDark ? "text-blue-400" : "text-blue-600"}`}
              >
                {currentData.exam}
              </span>
              <div
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors duration-300 ${isDark ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-700"}`}
              >
                {currentData.subject}
              </div>
            </div>
            <p
              className={`text-xs leading-tight transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {currentData.question}
            </p>
          </div>
        </div>
      </div>

      {/* Answer Comparison */}
      <div
        className={`border-b px-4 py-3 space-y-2 transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <div
          className={`p-2.5 rounded-lg border transition-colors duration-300 ${isDark ? "bg-red-900/20 border-red-700" : "bg-red-50/90 border-red-200/60"}`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-red-700" : "bg-red-500"}`}
            >
              <AlertCircle
                size={14}
                className="text-white"
              />
            </div>
            <span
              className={`text-xs font-semibold transition-colors duration-300 ${isDark ? "text-red-400" : "text-red-700"}`}
            >
              Sua Resposta
            </span>
          </div>
          <div
            className={`text-sm font-semibold transition-colors duration-300 ${isDark ? "text-red-300" : "text-red-800"}`}
          >
            {currentData.userAnswer}
          </div>
        </div>
        <div
          className={`p-2.5 rounded-lg border transition-colors duration-300 ${isDark ? "bg-green-900/20 border-green-700" : "bg-green-50/90 border-green-200/60"}`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-green-700" : "bg-green-500"}`}
            >
              <CheckCircle
                size={14}
                className="text-white"
              />
            </div>
            <span
              className={`text-xs font-semibold transition-colors duration-300 ${isDark ? "text-green-400" : "text-green-700"}`}
            >
              Gabarito
            </span>
          </div>
          <div
            className={`text-sm font-semibold transition-colors duration-300 ${isDark ? "text-green-300" : "text-green-800"}`}
          >
            {currentData.correctAnswer}
          </div>
        </div>
      </div>

      {/* AI Analysis Button & Result */}
      <div
        className={`flex-1 overflow-auto px-4 py-3 transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
      >
        <div
          className={`rounded-lg p-3 border transition-colors duration-300 ${isDark ? "bg-blue-900/20 border-blue-700" : "bg-blue-50/90 border-blue-200/60"}`}
        >
          <div className="flex items-start gap-2 mb-2">
            <BotMessageSquare
              size={16}
              className={`flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-bold transition-colors duration-300 ${isDark ? "text-blue-300" : "text-blue-800"}`}
              >
                Resolução Completa
              </p>
              <p
                className={`text-xs transition-colors duration-300 ${isDark ? "text-blue-400/80" : "text-blue-600/90"}`}
              >
                {/* Renderização dinâmica dos passos */}
                {currentData.explanationSteps.map((step: string, index: number) => (
                  <React.Fragment key={index}>
                    <strong>Passo {index + 1}:</strong> {step}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div
        className={`border-t px-4 py-3 flex-shrink-0 flex justify-between items-center gap-2 transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <button
          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
        >
          Anterior
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors shadow-md cursor-pointer">
          Próxima
        </button>
      </div>
    </div>
  );
}