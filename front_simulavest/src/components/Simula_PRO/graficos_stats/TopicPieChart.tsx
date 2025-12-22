"use client";

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface Metrica {
  topico: string;
  percentual: number;
}

interface TopicPieChartProps {
  data: Metrica[];
  colors: string[];
}

// Props usadas pelo shape ativo (somente os campos necessários)
interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  percent: number;
  payload: Metrica;
}

// Componente para a forma ativa da fatia (efeito de expansão no hover)
// Recebe `unknown` e converte para o shape esperado — evita uso de `any`.
const renderActiveShape = (props: unknown, isDarkMode: boolean): React.ReactElement => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, percent, payload } = props as ActiveShapeProps;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  
  // Efeito de "Pop": Aumenta levemente o raio da fatia ativa
  const activeOuterRadius = outerRadius + 6;
  
  // Ajuste para a linha começar do anel externo
  const sx = cx + (activeOuterRadius + 10) * cos;
  const sy = cy + (activeOuterRadius + 10) * sin;
  
  // Cotovelo da linha
  const mx = cx + (activeOuterRadius + 30) * cos;
  const my = cy + (activeOuterRadius + 30) * sin;
  
  // Fim da linha
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const xText = ex + (cos >= 0 ? 1 : -1) * 8;

  return (
    <g style={{ transition: 'all 0.3s ease' }}>
      {/* Fatia Principal Expandida */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={activeOuterRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="none"
        cornerRadius={8}
        style={{ filter: `drop-shadow(0 0 12px ${fill}60)` }}
      />
      
      {/* Arco Externo Fino (Anel de destaque estilo macOS) */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={activeOuterRadius + 8}
        outerRadius={activeOuterRadius + 11}
        fill={fill}
        stroke="none"
        cornerRadius={4}
      />
      
      {/* Linha Conectora */}
      <path 
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
        stroke={fill} 
        fill="none" 
        strokeWidth={2} 
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${fill}40)` }}
      />
      
      {/* Ponto na ponta da linha */}
      <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
      
      {/* Texto com Tópico e Porcentagem */}
      <text 
        x={xText} 
        y={ey} 
        textAnchor={textAnchor}
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
      >
        <tspan 
          x={xText}
          dy="-0.4em"
          fontSize={13} 
          fontWeight="500"
          fill={isDarkMode ? "#AEAEB2" : "#8E8E93"}
        >
          {payload.topico}
        </tspan>
        <tspan 
          x={xText}
          dy="1.4em"
          fontSize={16} 
          fontWeight="700"
          fill={isDarkMode ? "#FFFFFF" : "#1C1C1E"}
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </tspan>
      </text>
    </g>
  );
};

const TopicPieChart: React.FC<TopicPieChartProps> = ({ data, colors }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // O primeiro argumento fornecido pela lib não é usado aqui; tipamos como unknown para evitar `any`.
  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Wrapper para passar isDarkMode ao renderActiveShape
  const activeShapeRenderer = (props: unknown) => renderActiveShape(props, isDarkMode);

  return (
    <div className="flex flex-col items-center justify-start h-full w-full">
      <div className="w-full h-[390px] relative mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {colors.map((color, idx) => (
                <React.Fragment key={`defs-${idx}`}>
                  <linearGradient id={`gradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.85" />
                  </linearGradient>
                </React.Fragment>
              ))}
            </defs>
            <Pie
              data={data}
              dataKey="percentual"
              nameKey="topico"
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={140}
              paddingAngle={4}
              cornerRadius={6}
              label={false}
              labelLine={false}
              activeIndex={activeIndex}
              activeShape={activeShapeRenderer}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index % colors.length})`}
                  stroke="none"
                  style={{
                    filter: activeIndex === index 
                      ? `drop-shadow(0 0 12px ${colors[index % colors.length]}60)` 
                      : 'none',
                    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* LEGENDA PERSONALIZADA - Estilo macOS Chips */}
      <div className="w-full flex flex-wrap justify-center gap-3 px-4">
        {data.map((entry, index) => (
          <div 
            key={`legend-${index}`} 
            className={`
              flex items-center text-xs cursor-pointer
              px-3 py-1.5 rounded-full
              transition-all duration-300 cubic-bezier(0.25, 1, 0.5, 1)
              ${isDarkMode 
                ? 'bg-white/5 hover:bg-white/10' 
                : 'bg-black/5 hover:bg-black/10'
              }
            `}
            onMouseEnter={() => onPieEnter(entry, index)}
            onMouseLeave={onPieLeave}
            style={{
              transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
              backgroundColor: activeIndex === index 
                ? (isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)') 
                : undefined,
              boxShadow: activeIndex === index ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <div 
              className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className={`
              font-medium
              ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}
            `}
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
            >
              {entry.topico}
            </span>
            {activeIndex === index && (
              <span className={`
                ml-2 font-bold
                ${isDarkMode ? 'text-white' : 'text-black'}
              `}>
                {entry.percentual.toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicPieChart;