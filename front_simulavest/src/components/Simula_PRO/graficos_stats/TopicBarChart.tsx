"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { useTheme } from '@/contexts/ThemeContext';

interface Metrica {
  topico: string;
  percentual: number;
}

interface TopicBarChartProps {
  data: Metrica[];
  colors: string[];
}

// Custom label com suporte a tema
const CustomLabel = (props: unknown, isDark: boolean) => {
  const { x, y, width, value } = props as { x: number; y: number; width: number; value: number };
  
  // Para valores muito pequenos, sempre mostrar fora da barra
  const labelX = width > 40 ? x + width - 8 : x + width + 8;
  const anchor = width > 40 ? 'end' : 'start';
  const fill = width > 40 
    ? '#FFFFFF' 
    : isDark ? '#E5E5EA' : '#1C1C1E';
  
  return (
    <text 
      x={labelX} 
      y={y + 18} 
      fill={fill} 
      textAnchor={anchor}
      fontSize={13}
      fontWeight="600"
      fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      style={{
        textShadow: width > 40 ? '0 1px 2px rgba(0, 0, 0, 0.15)' : 'none',
        letterSpacing: '-0.01em'
      }}
    >
      {value.toFixed(1)}%
    </text>
  );
};

const TopicBarChart: React.FC<TopicBarChartProps> = ({ data, colors }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Função para determinar a cor baseada no desempenho
  const getPerformanceColor = (percentual: number) => {
    if (percentual >= 80) {
      // 80-100%: Excelente (Verde macOS)
      return isDark ? '#30D158' : '#34C759';
    } else if (percentual >= 60) {
      // 60-79%: Em Progresso (Azul macOS)
      return isDark ? '#0A84FF' : '#007AFF';
    } else {
      // 0-59%: Iniciante (Laranja macOS)
      return isDark ? '#FF9F0A' : '#FF9500';
    }
  };
  
  // Cores adaptativas para tema - Estilo macOS
  const themeColors = {
    text: isDark ? '#E5E5EA' : '#1C1C1E',
    textStrong: isDark ? '#FFFFFF' : '#000000',
    tooltipBg: isDark ? 'rgba(30, 30, 30, 0.75)' : 'rgba(255, 255, 255, 0.75)',
    tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    cursorFill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    gridLine: isDark ? '#2C2C2E' : '#E5E5EA',
  };
  
  // Calcular a altura dinamicamente
  const chartHeight = Math.max(200, data.length * 40 + 40);

  // Calcular o domínio do eixo X
  const maxPercent = data && data.length ? Math.max(...data.map(d => d.percentual)) : 0;
  const margin = Math.max(1, Math.ceil(maxPercent * 0.1));
  const xDomainMax = Math.ceil(maxPercent + margin);

  return (
    <div className="flex flex-col h-full">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ left: 10, right: 60, top: 5, bottom: 5 }}
          barGap={6}
          barCategoryGap={12}
        >
          <defs>
            {colors.map((color, idx) => (
              <React.Fragment key={`gradient-${idx}`}>
                <linearGradient id={`gradient-${idx}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={1} />
                </linearGradient>
                {/* Gradiente para hover */}
                <linearGradient id={`gradient-hover-${idx}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={1} />
                </linearGradient>
              </React.Fragment>
            ))}
            {/* Filtro para efeito de brilho suave */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feComposite in="coloredBlur" in2="SourceGraphic" operator="in" result="softGlow"/>
              <feMerge>
                <feMergeNode in="softGlow"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <XAxis 
            type="number" 
            domain={[0, xDomainMax]} 
            hide 
          />
          
          <YAxis 
            dataKey="topico" 
            type="category" 
            width={150}
            tick={{ 
              fill: themeColors.text, 
              fontSize: 13, 
              fontWeight: 500,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            }}
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip 
            cursor={{ 
              fill: themeColors.cursorFill,
              radius: 6
            }}
            contentStyle={{
              backgroundColor: themeColors.tooltipBg,
              borderColor: themeColors.tooltipBorder,
              borderRadius: '12px',
              color: themeColors.textStrong,
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              border: `1px solid ${themeColors.tooltipBorder}`,
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: '1.4',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            formatter={(value: number) => [
              <div key="content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: 700,
                    color: getPerformanceColor(value),
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
                  }}>
                    {value.toFixed(1)}%
                  </span>
                </div>
              </div>,
            ]}
            labelStyle={{ 
              color: themeColors.textStrong, 
              fontWeight: 600, 
              marginBottom: '8px',
              fontSize: '15px',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              paddingBottom: '6px',
              display: 'block',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif"
            }}
          />
          
          <Bar 
            dataKey="percentual" 
            radius={[6, 6, 6, 6]}
            maxBarSize={24}
            minPointSize={3}
            animationDuration={1200}
            animationEasing="ease-out"
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {data.map((entry, idx) => (
              <Cell 
                key={`cell-${idx}`} 
                fill={hoveredIndex === idx 
                  ? `url(#gradient-hover-${idx % colors.length})` 
                  : `url(#gradient-${idx % colors.length})`}
                stroke={hoveredIndex === idx ? colors[idx % colors.length] : 'transparent'}
                strokeWidth={0}
                style={{
                  filter: hoveredIndex === idx 
                    ? `drop-shadow(0 4px 12px ${colors[idx % colors.length]}50)` 
                    : 'none',
                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.5,
                  cursor: 'default'
                }}
              />
            ))}
            <LabelList 
              dataKey="percentual" 
              content={(props) => CustomLabel(props, isDark)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicBarChart;