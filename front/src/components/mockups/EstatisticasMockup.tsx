"use client";

import React, { useState, useMemo } from "react";

interface EstatisticasMockupProps {
  isDark: boolean;
}

type PeriodType = "bimestral" | "trimestral" | "semestral" | "anual";

// Dados do gráfico por período
const chartDataByPeriod: Record<PeriodType, { months: string[]; values: number[] }> = {
  bimestral: {
    months: ["Dez", "Jan"],
    values: [58, 72],
  },
  trimestral: {
    months: ["Nov", "Dez", "Jan"],
    values: [45, 58, 72],
  },
  semestral: {
    months: ["Ago", "Set", "Out", "Nov", "Dez", "Jan"],
    values: [35, 42, 45, 58, 65, 72],
  },
  anual: {
    months: ["Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez", "Jan"],
    values: [20, 25, 30, 35, 38, 40, 45, 50, 55, 60, 68, 72],
  },
};

// Função para calcular pontos do gráfico
const calculateChartPoints = (values: number[], width: number = 480, height: number = 200) => {
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding;
  const maxValue = 100;

  return values.map((value, index) => ({
    x: padding + (index / (values.length - 1)) * chartWidth,
    y: chartHeight - (value / maxValue) * chartHeight + padding / 2,
  }));
};

export function EstatisticasMockup({ isDark }: EstatisticasMockupProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("semestral");

  // Calcular dados do gráfico baseado no período selecionado
  const chartData = useMemo(() => {
    const data = chartDataByPeriod[selectedPeriod];
    return {
      months: data.months,
      points: calculateChartPoints(data.values),
    };
  }, [selectedPeriod]);

  // Função para obter o texto do período
  const getPeriodText = (period: PeriodType): string => {
    const texts: Record<PeriodType, string> = {
      bimestral: "2 meses",
      trimestral: "3 meses",
      semestral: "Últimos 6 meses",
      anual: "12 meses",
    };
    return texts[period];
  };

  return (
    <div
      className={`rounded-xl h-full flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
    >
      {/* Header com título e filtros */}
      <div
        className={`px-4 py-3 flex-shrink-0 transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3
              className={`font-bold text-sm transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Desempenho
            </h3>
            <p
              className={`text-xs transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {getPeriodText(selectedPeriod)}
            </p>
          </div>
          <div className="flex gap-1.5">
            {(["bimestral", "trimestral", "semestral", "anual"] as PeriodType[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === period
                    ? "bg-purple-600 text-white shadow-md"
                    : isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico de área */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Gráfico com SVG */}
        <div
          className={`relative border-b py-4 flex-1 flex items-end min-h-[300px] transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          {/* SVG Chart */}
          <svg
            className="w-full h-full"
            viewBox="0 0 480 200"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="chartGradientEstatisticas"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#9333EA" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#9333EA" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Linha do gráfico */}
            <path
              d={`M ${chartData.points.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
              stroke="#9333EA"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Área de Preenchimento */}
            <path
              d={`M ${chartData.points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${chartData.points[chartData.points.length - 1].x} 200 L ${chartData.points[0].x} 200 Z`}
              fill="url(#chartGradientEstatisticas)"
              stroke="none"
            />

            {/* Pontos */}
            {chartData.points.map((point, idx) => (
              <circle
                key={idx}
                cx={point.x}
                cy={point.y}
                r="5.5"
                fill="#9333EA"
                stroke="white"
                strokeWidth="2.5"
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))"
              />
            ))}
          </svg>

          {/* Rótulos X */}
          <div
            className={`absolute bottom-3 left-0 right-0 flex justify-between px-4 text-xs font-semibold transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {chartData.months.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>

        {/* Estatísticas em cards */}
        <div className="grid grid-cols-3 gap-2.5 flex-shrink-0 px-4 pb-4">
          {/* Média */}
          <div
            className={`p-3 rounded-lg border shadow-sm hover:shadow-md transition-all ${isDark ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Média
              </span>
              <span className="text-lg">📊</span>
            </div>
            <div className="bg-blue-600 text-white px-2 py-1 rounded font-bold text-xs text-center mb-2">
              62pts
            </div>
          </div>

          {/* Melhor */}
          <div
            className={`p-3 rounded-lg border shadow-sm hover:shadow-md transition-all ${isDark ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Melhor
              </span>
              <span className="text-lg">🏆</span>
            </div>
            <div className="bg-green-600 text-white px-2 py-1 rounded font-bold text-xs text-center mb-2">
              85pts
            </div>
          </div>

          {/* Meta */}
          <div
            className={`p-3 rounded-lg border shadow-sm hover:shadow-md transition-all ${isDark ? "bg-purple-900/30 border-purple-700" : "bg-purple-50 border-purple-200"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Meta
              </span>
              <span className="text-lg">🎯</span>
            </div>
            <div className="bg-purple-600 text-white px-2 py-1 rounded font-bold text-xs text-center mb-2">
              90pts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

