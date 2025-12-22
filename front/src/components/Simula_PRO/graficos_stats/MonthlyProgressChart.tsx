"use client";

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  TooltipProps 
} from "recharts";
import { TrendingUp, Target, Award, Lock } from "lucide-react"; // Adicionado o ícone Lock
import { useTheme } from '@/contexts/ThemeContext';

// 1. MAPEAMENTO DOS MESES
// Usado para encontrar o índice do mês atual
const monthLabels = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

// Dados de exemplo para fallback (agora com o ano inteiro)
const sampleData = [
  { label: "Jan", value: 45 }, { label: "Fev", value: 52 }, { label: "Mar", value: 61 },
  { label: "Abr", value: 58 }, { label: "Mai", value: 70 }, { label: "Jun", value: 68 },
  { label: "Jul", value: 85 }, { label: "Ago", value: 82 }, { label: "Set", value: 88 },
  { label: "Out", value: 92 }, { label: "Nov", value: 95 }, { label: "Dez", value: 98 },
];

interface ProgressData {
  label: string;
  value: number;
  isLocked?: boolean; // 2. Adicionamos a flag 'isLocked'
}

interface MonthlyProgressChartProps {
  data?: ProgressData[];
  isPremiumUser?: boolean; // 1. Nova prop para status do plano
}

type DotRendererProps = {
  cx?: number;
  cy?: number;
  payload?: ProgressData;
};

// --- Tooltip para Upgrade ---
const LockedTooltip = ({ theme }: { theme: string }) => (
  <div 
    className={`rounded-xl p-4 border backdrop-blur-md ${
      theme === 'dark' 
        ? 'bg-gray-800/95 border-gray-700/60 shadow-[0_8px_24px_rgba(0,0,0,0.4)]' 
        : 'bg-white/95 border-gray-200/60 shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
    }`}
  >
    <div className="flex items-center gap-2.5">
      <Lock className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} strokeWidth={2} />
      <p className={`font-semibold text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
        Análise Futura
      </p>
    </div>
    <p className={`text-[13px] mt-1.5 font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
      Faça upgrade para desbloquear
    </p>
  </div>
);

// --- Tooltip Padrão (sem alterações) ---
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const { theme } = useTheme();
  
  if (active && payload && payload.length) {
    // 3. VERIFICA SE O DADO ESTÁ BLOQUEADO
    const dataPoint = payload[0].payload as ProgressData;
    if (dataPoint.isLocked) {
      return <LockedTooltip theme={theme} />;
    }

    const raw = payload[0].value;
    if (raw == null || typeof raw !== 'number') return null;
    const value = raw as number;
    const isHigh = value >= 80;
    const isMedium = value >= 60 && value < 80;
    
    return (
      <div 
        className={`rounded-xl p-4 border backdrop-blur-md transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/95 border-gray-700/60 shadow-[0_8px_24px_rgba(0,0,0,0.4)]' 
            : 'bg-white/95 border-gray-200/60 shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
        }`}
        style={{ borderColor: isHigh ? '#10B981' : isMedium ? '#3B82F6' : '#F59E0B' }}
      >
        <p className={`font-semibold mb-2 text-[13px] ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{label}</p>
        <div className="flex items-center gap-2.5">
          <div 
            className="w-3 h-3 rounded-full shadow-lg"
            style={{
              backgroundColor: isHigh ? '#10B981' : isMedium ? '#3B82F6' : '#F59E0B',
              boxShadow: `0 0 8px ${isHigh ? '#10B98140' : isMedium ? '#3B82F640' : '#F59E0B40'}`,
            }}
          />
          <p className="font-semibold text-2xl tracking-tight" style={{ color: isHigh ? '#10B981' : isMedium ? '#3B82F6' : '#F59E0B' }}>
            {value.toFixed(0)}%
          </p>
        </div>
        <p className={`text-[13px] mt-2 font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {isHigh ? '🎉 Excelente desempenho!' : isMedium ? '👍 Bom progresso' : '💪 Continue assim!'}
        </p>
      </div>
    );
  }
  return null;
};

// --- Componente de CTA (Paywall) ---
const PaywallCTA = ({ theme }: { theme: string }) => (
  <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center z-10 p-4">
    <div className={`relative flex flex-col items-center justify-between w-full h-full rounded-lg overflow-hidden border shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-7 px-5
      ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900/75 via-gray-850/80 to-purple-900/15 border-purple-500/30 backdrop-blur-md' 
        : 'bg-gradient-to-br from-white/90 via-purple-50/70 to-blue-50/70 border-purple-200/50 backdrop-blur-md'
      }
    `}>
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-25
          ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'}`} 
        />
        <div className={`absolute -bottom-8 -left-8 w-28 h-28 rounded-full blur-3xl opacity-25
          ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'}`} 
        />
      </div>

      {/* Top Section: Lock Icon with Premium Badge */}
      <div className="relative flex-shrink-0">
        <div className={`absolute inset-0 rounded-full blur-2xl opacity-50
          ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-400'}`}
        />
        <div className={`relative p-3.5 rounded-xl shadow-lg
          ${theme === 'dark' 
            ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
            : 'bg-gradient-to-br from-purple-500 to-blue-500'
          }`}
        >
          <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <div className={`absolute -top-0.5 -right-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-md
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900' 
            : 'bg-gradient-to-r from-yellow-300 to-amber-400 text-gray-800'
          }`}
        >
          PRO
        </div>
      </div>

      {/* Middle Section: Title & Description */}
      <div className="relative z-10 text-center flex-grow flex flex-col justify-center px-2">
        <h3 className={`text-xl font-semibold mb-1.5 leading-tight tracking-tight
          ${theme === 'dark' 
            ? 'text-white' 
            : 'text-gray-900'
          }`}
        >
          Conteúdo Exclusivo<br/>Premium
        </h3>
        <p className={`text-[13px] font-normal leading-relaxed
          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Desbloqueie análises completas e<br/>
          <span className="font-semibold text-purple-500">projeções futuras</span>
        </p>
      </div>

      {/* Bottom Section: CTA Button */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 flex-shrink-0">
        <a
          href="/paidPlan"
          className={`group relative px-7 py-3 rounded-lg font-semibold text-white text-sm shadow-lg transition-all duration-300 overflow-hidden w-full text-center
            ${theme === 'dark'
              ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:shadow-purple-500/40'
              : 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:shadow-purple-400/40'
            }
            hover:scale-[1.02] hover:shadow-xl active:scale-95
            bg-[length:200%_100%] hover:bg-right-bottom
            no-underline
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>Desbloquear Agora</span>
            <svg 
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          {/* Button Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </a>
      </div>
    </div>
  </div>
);


const MonthlyProgressChart: React.FC<MonthlyProgressChartProps> = ({ 
  data = sampleData, 
  isPremiumUser = false // 1. Prop recebida, default para 'false'
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const { theme } = useTheme();

  // 4. PROCESSAMENTO DE DADOS (Clamping e Locking) - BASEADO EM SEMESTRES
  const currentMonthIndex = new Date().getMonth(); // 0 = Jan, 1 = Fev, ..., 11 = Dez
  
  const processedData = useMemo(() => {
    // Mapeia e processa todos os dados
    const allProcessedData = data.map(item => {
      const itemMonthIndex = monthLabels.indexOf(item.label);
      const isFuture = itemMonthIndex > currentMonthIndex;
      
      return {
        ...item,
        value: Math.max(0, Math.min(item.value, 100)), // Garante 0-100
        isLocked: !isPremiumUser && isFuture // Define se o dado é bloqueado
      };
    });

    // Determina o semestre atual
    // Se estamos antes de julho (mês 0-5): 1º semestre (Jan-Jun, índices 0-5)
    // Se estamos em julho ou depois (mês 6-11): 2º semestre (Jul-Dez, índices 6-11)
    const isFirstSemester = currentMonthIndex < 6;
    const startIndex = isFirstSemester ? 0 : 6;  // Jan = 0, Jul = 6
    const endIndex = isFirstSemester ? 6 : 12;   // Jun = 6, Dez = 12
    
    return allProcessedData.slice(startIndex, endIndex);
  }, [data, isPremiumUser, currentMonthIndex]);
  
  // 5. CÁLCULO DE ESTATÍSTICAS (APENAS com dados visíveis)
  // Filtra os dados para incluir apenas os que NÃO estão bloqueados
  const visibleData = useMemo(() => {
    return processedData.filter(d => !d.isLocked);
  }, [processedData]);

  // Todas as estatísticas agora usam 'visibleData'
  const currentValue = visibleData.length > 0 ? visibleData[visibleData.length - 1].value : 0;
  const previousValue = visibleData.length > 1 ? visibleData[visibleData.length - 2].value : 0;
  const trend = currentValue - previousValue;
  const average = visibleData.length > 0 ? visibleData.reduce((sum, item) => sum + item.value, 0) / visibleData.length : 0;
  const maxValue = visibleData.length > 0 ? Math.max(...visibleData.map(d => d.value)) : 0;
  const bestMonth = visibleData.find(d => d.value === maxValue);

  // Calcula a % de largura que o CTA deve ocupar (para não cobrir o gráfico visível)
  const chartPaywallOffset = (visibleData.length / processedData.length) * 100;

  return (
    <div className={`w-full h-full rounded-xl p-8 transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-white border border-gray-200' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-200'
    } shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl`}>
      {/* Header com Título e Indicadores (usando 'visibleData') */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className={`text-2xl font-semibold mb-1.5 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Progresso Mensal
            </h2>
            <p className={`text-[13px] font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Acompanhe sua evolução ao longo do tempo
            </p>
          </div>
          <div className={`px-5 py-3 rounded-lg transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20'
              : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50'
          } backdrop-blur-sm`}>
            <p className={`text-[11px] font-medium mb-0.5 uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Atual</p>
            <p className={`text-3xl font-semibold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentValue.toFixed(0)}%</p>
          </div>
        </div>

        {/* Cards de Estatísticas (usando 'visibleData') */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800/60 to-gray-850/60 border border-gray-700/50 hover:border-green-500/30' 
              : 'bg-white/70 border border-gray-200/60 hover:border-green-400/40'
          } backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'}`}>
                <TrendingUp className={`w-4 h-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} strokeWidth={2} />
              </div>
              <p className={`text-[13px] font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Tendência</p>
            </div>
            <p className={`text-2xl font-semibold tracking-tight ${trend >= 0 ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : (theme === 'dark' ? 'text-red-400' : 'text-red-600')}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </p>
          </div>
          <div className={`rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800/60 to-gray-850/60 border border-gray-700/50 hover:border-blue-500/30' 
              : 'bg-white/70 border border-gray-200/60 hover:border-blue-400/40'
          } backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <Target className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} strokeWidth={2} />
              </div>
              <p className={`text-[13px] font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Média</p>
            </div>
            <p className={`text-2xl font-semibold tracking-tight ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{average.toFixed(1)}%</p>
          </div>
          <div className={`rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800/60 to-gray-850/60 border border-gray-700/50 hover:border-purple-500/30' 
              : 'bg-white/70 border border-gray-200/60 hover:border-purple-400/40'
          } backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <Award className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} strokeWidth={2} />
              </div>
              <p className={`text-[13px] font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Melhor Mês</p>
            </div>
            <p className={`text-2xl font-semibold tracking-tight ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{bestMonth?.label || 'N/A'}</p>
          </div>
        </div>

        {/* Legenda Interativa */}
        <div className="flex items-center gap-5 text-[13px]">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}></div>
            <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>0-59% Podemos melhorar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}></div>
            <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>60-79% Em Progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-green-500 to-emerald-700'}`}></div>
            <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>80-100% Excelente</span>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      {/* 6. Adicionado 'position: relative' para o container do gráfico */}
      <div className={`relative rounded-lg p-5 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-800/40 to-gray-850/40 border border-gray-700/40' 
          : 'bg-white/60 border border-gray-200/40'
      } backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)]`} style={{ height: '320px' }}>
        
        {/* 7. PAYWALL CTA (renderizado apenas para usuários gratuitos) */}
        {!isPremiumUser && 
          <div 
            className="absolute top-0 right-0 bottom-0 z-10"
            // O offset 'left' impede o CTA de cobrir os dados visíveis
            style={{ left: `${chartPaywallOffset}%` }} 
          >
            <PaywallCTA theme={theme} />
          </div>
        }

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={processedData} // Usando todos os dados processados
            margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
            onMouseMove={(state: { activeLabel?: string | number }) => {
              const label = state?.activeLabel;
              if (label !== undefined && label !== null) {
                setSelectedMonth(typeof label === 'string' ? label : String(label));
              }
            }}
            onMouseLeave={() => setSelectedMonth(null)}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="label" 
              fontSize={11} 
              fontWeight={500} 
              tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }} 
              axisLine={false} 
              tickLine={false}
              dy={8}
            />
            
            <YAxis 
              fontSize={11} 
              fontWeight={500} 
              tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => `${value}%`} 
              domain={[0, 100]}
              dx={-8}
            />
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} 
              horizontal={true} 
              vertical={false}
              strokeOpacity={0.5}
            />
            
            {/* O Tooltip agora verifica 'isLocked' internamente */}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }} />
            
            {/* 8. ÁREA DE DADOS VISÍVEIS (colorida) */}
            <Area 
              type="monotone"
              dataKey="value" 
              // A prop 'defined' garante que esta área só desenhe pontos NÃO bloqueados
              // @ts-expect-error - defined prop exists in recharts but not in types
              defined={(pt: ProgressData) => !pt.isLocked} 
              stroke="url(#colorValue)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorValue)"
              dot={(props: unknown): React.ReactElement<SVGElement> => {
                const { cx, cy, payload } = (props as DotRendererProps);
                if (cx == null || cy == null || !payload) return (<g />);
                const isSelected = payload.label === selectedMonth;
                const value = payload.value;
                const color = value >= 80 ? '#10B981' : value >= 60 ? '#3B82F6' : '#F59E0B';
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isSelected ? 6 : 4} 
                    stroke={color} 
                    strokeWidth={isSelected ? 2 : 1.5} 
                    fill={theme === 'dark' ? '#1F2937' : '#FFFFFF'} 
                    className="transition-all duration-200" 
                  />
                );
              }}
              activeDot={{ 
                r: 6, 
                fill: '#3B82F6', 
                stroke: theme === 'dark' ? '#1F2937' : '#FFFFFF', 
                strokeWidth: 2, 
                className: 'drop-shadow-lg' 
              }}
            />

            {/* 9. ÁREA DE DADOS BLOQUEADOS (cinza e tracejada) */}
            <Area
              type="monotone"
              dataKey="value"
              // A prop 'defined' garante que esta área só desenhe pontos BLOQUEADOS
              // @ts-expect-error - defined prop exists in recharts but not in types
              defined={(pt: ProgressData) => !!pt.isLocked} 
              stroke={theme === 'dark' ? '#52525B' : '#A1A1AA'}
              strokeWidth={2}
              strokeDasharray="5 5" // Linha tracejada
              fill={theme === 'dark' ? '#3F3F46' : '#E4E4E7'}
              fillOpacity={0.3}
              dot={(props: unknown): React.ReactElement<SVGElement> => {
                const { cx, cy } = (props as DotRendererProps);
                if (cx == null || cy == null) return (<g />);
                // Ponto simples, cinza e não interativo
                return (
                  <circle cx={cx} cy={cy} r={3} fill={theme === 'dark' ? '#52525B' : '#A1A1AA'} />
                );
              }}
              activeDot={false} // Desativa o ponto ativo para a área bloqueada
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer com Dica */}
      <div className={`mt-4 rounded-lg p-3 border transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-blue-500/5 border-blue-700/30 backdrop-blur-sm' 
          : 'bg-blue-50/50 border-blue-200/40'
      }`}>
        <p className={`text-[13px] font-normal ${theme === 'dark' ? 'text-blue-300/80' : 'text-blue-700/80'}`}>
          <span className="font-semibold">💡 Dica:</span> Passe o mouse sobre o gráfico para ver detalhes de cada mês
        </p>
      </div>
    </div>
  );
};

export default MonthlyProgressChart;