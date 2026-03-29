"use client"

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotaCorteConsulta from "@/components/Simula_PRO/NotaCorteConsulta";

export default function NotaCortePage() {
  // Score padrão para teste
  const [userScore, setUserScore] = useState(75);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                Simulador de Notas de Corte
              </h1>
              <p className="text-base text-gray-600">
                Página de teste para acesso direto à consulta de notas de corte.
              </p>
            </div>
          </div>
        </div>

        {/* Controle manual da pontuação para fins de teste */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Simular Porcentagem de Acertos ({userScore}%):
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={userScore} 
              onChange={(e) => setUserScore(Number(e.target.value))}
              className="w-full max-w-md h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={userScore} 
              onChange={(e) => setUserScore(Number(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <NotaCorteConsulta
            userScore={userScore}
            defaultTargetCourse=""
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
