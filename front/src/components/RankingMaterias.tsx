"use client";

import React, { memo } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

type Metrica = {
  topico: string;
  percentual: number;
};

type RankingMateriasProps = {
  data: Metrica[];
  colors: string[];
};

const RankingMaterias = memo(function RankingMaterias({ data, colors }: RankingMateriasProps) {
  const { theme } = useTheme();
  // Pega apenas os top 10 e ordena por percentual decrescente
  // (A filtragem de "Demais Assuntos" já é feita na página antes de passar os dados)
  const top10 = [...data]
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, 10);

  // Valor máximo para normalizar as barras de progresso (escala relativa)
  // Isso faz com que o maior valor ocupe 100% da barra, facilitando a comparação visual
  const maxPercentual = top10[0]?.percentual || 100;

  const isDark = theme === 'dark';

  // Função para retornar o ícone de medalha - Estilo macOS (Clean & Flat/Gradient)
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full shadow-md border border-yellow-400/50 ring-2 ring-white/20">
            <span className="text-white font-bold text-xl drop-shadow-sm filter">🥇</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-md border border-gray-400/50 ring-2 ring-white/20">
            <span className="text-white font-bold text-xl drop-shadow-sm filter">🥈</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-b from-orange-300 to-orange-500 rounded-full shadow-md border border-orange-400/50 ring-2 ring-white/20">
            <span className="text-white font-bold text-xl drop-shadow-sm filter">🥉</span>
          </div>
        );
      default:
        return (
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm shadow-sm border ${
             isDark 
             ? 'bg-gray-700/50 border-gray-600 text-gray-300' 
             : 'bg-gray-100 border-gray-200 text-gray-500'
          }`}>
            {position}
          </div>
        );
    }
  };

  // Função para retornar badge estilo macOS Tags (Pills)
  const getPerformanceBadge = (percentual: number) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-md border transition-colors";
    
    if (percentual >= 15) {
      return (
        <span className={`${baseClasses} ${
          isDark 
            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
            : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          <TrendingUp className="w-3 h-3" />
          Muito Alta
        </span>
      );
    } else if (percentual >= 10) {
      return (
        <span className={`${baseClasses} ${
          isDark 
            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
            : 'bg-orange-50 text-orange-600 border-orange-200'
        }`}>
          <TrendingUp className="w-3 h-3" />
          Alta
        </span>
      );
    } else if (percentual >= 5) {
      return (
        <span className={`${baseClasses} ${
          isDark 
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
            : 'bg-yellow-50 text-yellow-600 border-yellow-200'
        }`}>
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
          Moderada
        </span>
      );
    }
    return (
      <span className={`${baseClasses} ${
        isDark 
          ? 'bg-gray-700/30 text-gray-400 border-gray-700' 
          : 'bg-gray-100 text-gray-500 border-gray-200'
      }`}>
        Baixa
      </span>
    );
  };

  if (top10.length === 0) {
    return (
      <div className={`text-center py-16 px-4 rounded-2xl border border-dashed ${
        isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50/50'
      }`}>
        <div className="max-w-md mx-auto">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm ${
            isDark ? 'bg-gray-700 text-gray-500' : 'bg-white text-gray-400'
          }`}>
            <Trophy className="w-8 h-8 opacity-50" />
          </div>
          <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            Nenhum Dado Disponível
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Não há informações suficientes para exibir o ranking de conteúdos neste momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Pódio Visual - Estilo Cards Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {top10.slice(0, 3).map((item, index) => {
          const position = index + 1;
          const isPodium1 = position === 1;
          const isPodium2 = position === 2;
          
          // Define estilos específicos para cada posição (Gold, Silver, Bronze)
          const getCardStyles = () => {
            if (isDark) {
              if (isPodium1) return 'bg-gradient-to-br from-yellow-500/10 via-[#1e1e1e]/95 to-[#1e1e1e]/95 border-yellow-500/30 shadow-yellow-900/20';
              if (isPodium2) return 'bg-gradient-to-br from-gray-400/10 via-[#1e1e1e]/95 to-[#1e1e1e]/95 border-gray-500/30 shadow-gray-900/20';
              return 'bg-gradient-to-br from-orange-500/10 via-[#1e1e1e]/95 to-[#1e1e1e]/95 border-orange-500/30 shadow-orange-900/20';
            }
            // Light mode
            if (isPodium1) return 'bg-gradient-to-br from-yellow-50 via-white/90 to-white/80 border-yellow-200 shadow-yellow-200/40';
            if (isPodium2) return 'bg-gradient-to-br from-gray-50 via-white/90 to-white/80 border-gray-200 shadow-gray-200/40';
            return 'bg-gradient-to-br from-orange-50 via-white/90 to-white/80 border-orange-200 shadow-orange-200/40';
          };

          // Cálculo da largura relativa para a barra de progresso
          const relativeWidth = (item.percentual / maxPercentual) * 100;

          return (
            <div
              key={`podium-${item.topico}`}
              className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 border shadow-lg backdrop-blur-md ${getCardStyles()}`}
            >
              {/* Efeito de brilho superior estilo macOS */}
              <div className={`absolute inset-x-0 top-0 h-[1px] ${
                isDark ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : 'bg-gradient-to-r from-transparent via-white/60 to-transparent'
              }`} />

              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {position}º Lugar
                  </span>
                  {isPodium1 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full w-fit">
                      <Trophy className="w-2.5 h-2.5" />
                      Líder
                    </span>
                  )}
                </div>
                <div className="transform scale-90 origin-top-right">
                  {getMedalIcon(position)}
                </div>
              </div>
              
              <h3 className={`font-semibold text-lg mb-3 leading-tight line-clamp-2 h-14 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {item.topico}
              </h3>
              
              {/* Percentual */}
              <div className="flex items-baseline gap-1 mb-3">
                <span className={`text-3xl font-light tracking-tight ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.percentual}
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>%</span>
              </div>
              
              {/* Barra de Progresso Clean */}
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}
                  style={{ width: `${relativeWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela de Ranking - Estilo Finder/Settings */}
      <div className={`rounded-xl overflow-hidden border shadow-sm ${
        isDark 
          ? 'bg-[#1e1e1e] border-gray-700/50 shadow-black/20' 
          : 'bg-white border-gray-200 shadow-gray-200/50'
      }`}>
        {/* Header Estilo Toolbar */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between backdrop-blur-xl sticky top-0 z-10 ${
          isDark 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-gray-50/80 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-md ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <TrendingUp className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Ranking Completo
              </h3>
            </div>
          </div>
          <div className={`text-xs font-medium px-2.5 py-1 rounded-md ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
          }`}>
            Top {top10.length}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase font-medium ${
              isDark ? 'text-gray-500 bg-gray-800/30' : 'text-gray-400 bg-gray-50'
            }`}>
              <tr>
                <th className="px-6 py-3 font-semibold tracking-wider w-20 text-center">#</th>
                <th className="px-6 py-3 font-semibold tracking-wider">Conteúdo</th>
                <th className="px-6 py-3 font-semibold tracking-wider w-48">Frequência</th>
                <th className="px-6 py-3 font-semibold tracking-wider w-32 text-right">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
              {top10.map((item, index) => {
                const position = index + 1;
                const colorIndex = index % colors.length;
                const relativeWidth = (item.percentual / maxPercentual) * 100;
                
                return (
                  <tr
                    key={`${item.topico}-${index}`}
                    className={`group transition-colors ${
                      isDark 
                        ? 'hover:bg-white/[0.02]' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-center font-medium text-gray-400">
                      {position}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors[colorIndex] }}
                        />
                        <span className={`font-medium ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          {item.topico}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold w-10 text-right ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {item.percentual}%
                        </span>
                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                          isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <div
                            className="h-full rounded-full opacity-80"
                            style={{
                              width: `${relativeWidth}%`,
                              backgroundColor: colors[colorIndex],
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {getPerformanceBadge(item.percentual)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden">
          <ul className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
            {top10.map((item, index) => {
              const position = index + 1;
              const colorIndex = index % colors.length;
              const relativeWidth = (item.percentual / maxPercentual) * 100;
              
              return (
                <li key={`mobile-${item.topico}-${index}`} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded ${
                        isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {position}
                      </span>
                      <span className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {item.topico}
                      </span>
                    </div>
                    {getPerformanceBadge(item.percentual)}
                  </div>
                  
                  <div className="flex items-center gap-3 pl-7">
                    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${relativeWidth}%`,
                          backgroundColor: colors[colorIndex],
                        }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.percentual}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer - Estilo Notification/Widget */}
      <div className={`rounded-xl p-4 border flex gap-4 items-start shadow-sm ${
        isDark 
          ? 'bg-blue-900/10 border-blue-500/20' 
          : 'bg-blue-50/50 border-blue-100'
      }`}>
        <div className={`p-2 rounded-lg flex-shrink-0 ${
          isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-white text-blue-600 shadow-sm'
        }`}>
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h4 className={`text-sm font-semibold mb-1 ${
            isDark ? 'text-blue-100' : 'text-blue-900'
          }`}>
            Estratégia de Estudo
          </h4>
          <p className={`text-xs leading-relaxed ${
            isDark ? 'text-blue-200/70' : 'text-blue-800/70'
          }`}>
            <span className="font-semibold">Foque no Top 3:</span> Estes conteúdos representam a maior parte das questões. 
            Dominá-los é essencial para garantir uma boa pontuação.
          </p>
        </div>
      </div>
    </div>
  );
});

export default RankingMaterias;
