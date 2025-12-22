import React from 'react';
import Image from 'next/image';
import { Edit, BookOpen, BarChart2, CheckCircle, Award, TrendingUp, AlertCircle, Info } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

// --- TIPAGENS ---
export interface StatTrend {
  value: number;
  type: 'up' | 'down';
}

export interface ProfileStats {
  simulados: number;
  questoes: number;
  acertos: number;
  percentagem: number;
  trend_simulados: StatTrend;
  trend_questoes: StatTrend;
  trend_acertos: StatTrend;
  trend_percentagem: StatTrend;
}

interface GeneralStatsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  status: string;
  formData: {
    profileIcon: string;
    useInitialAvatar: boolean;
  };
  profileData: {
    stats: ProfileStats;
  };
  isDataLoading: boolean;
  error: string | null;
  setActiveTab: (tab: string) => void;
}

// Componente Card Estatística
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'emerald' | 'purple';
  trend?: {
    value: number;
    type: 'up' | 'down';
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: { iconBg: 'from-blue-500 to-blue-600', text: 'text-gray-900', hoverBorder: 'hover:border-blue-500' },
    green: { iconBg: 'from-green-500 to-green-600', text: 'text-gray-900', hoverBorder: 'hover:border-green-500' },
    emerald: { iconBg: 'from-emerald-500 to-emerald-600', text: 'text-gray-900', hoverBorder: 'hover:border-emerald-500' },
    purple: { iconBg: 'from-purple-500 to-purple-600', text: 'text-gray-900', hoverBorder: 'hover:border-purple-500' }
  };
  const classes = colorClasses[color];
  return (
    <div className={`flex flex-col items-start p-5 bg-white backdrop-blur-sm rounded-2xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group ${classes.hoverBorder}`}>
      <div className="flex items-center justify-between w-full mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${classes.iconBg} rounded-xl shadow-sm flex items-center justify-center text-white transform group-hover:scale-105 transition-transform duration-300`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trend.type === 'up' ? 'bg-green-100/80 text-green-700' : 'bg-red-100/80 text-red-700'}`}>
            <TrendingUp size={12} className={`mr-1 ${trend.type === 'down' ? 'rotate-180' : ''}`} />
            {trend.value}%
          </div>
        )}
      </div>
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-2xl font-bold ${classes.text} tracking-tight`}>{value}</p>
    </div>
  );
};

// Componente Badge de Status
interface StatusBadgeProps { status: 'online' | 'offline' | 'away'; showText?: boolean; }
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showText = false }) => {
  const statusConfig = { 
    online: { color: 'bg-green-500', text: 'Online', pulse: false },
    offline: { color: 'bg-gray-400', text: 'Offline', pulse: false },
    away: { color: 'bg-yellow-500', text: 'Ausente', pulse: false } };
  const config = statusConfig[status];
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 ${config.color} rounded-full shadow-sm`} />
      {showText && (<span className="text-xs text-gray-500 font-medium">{config.text}</span>)}
    </div>
  );
};

// Componente de Skeleton Loading
export const SkeletonCard: React.FC = () => (
  <div className="bg-white/60 border border-white/40 rounded-3xl p-6 shadow-sm animate-pulse">
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 flex items-center justify-center mb-4">
        <Image 
          src="/Mascote/banners/Camaleão_20.png" 
          alt="Carregando..." 
          width={80}
          height={80}
          className="object-contain opacity-40"
        />
      </div>
      <div className="h-5 bg-gray-200 rounded-lg w-28 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-lg w-40 mb-4"></div>
      <div className="h-9 bg-gray-200 rounded-lg w-24"></div>
    </div>
  </div>
);

const GeneralStats: React.FC<GeneralStatsProps> = ({ session, status, formData, profileData, isDataLoading, error, setActiveTab }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* 5. Renderiza o SkeletonCard durante o carregamento ou os dados reais quando autenticado */}
      {status === 'loading' ? (
        <SkeletonCard />
      ) : (
        <div className="relative overflow-hidden bg-white backdrop-blur-2xl border border-gray-200 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col items-center">
            <div className="relative mb-6 group">
              {/* AQUI ESTÁ A SUBSTITUIÇÃO */}
              <UserAvatar 
                name={session?.user?.name || ''}
                className="w-28 h-28 text-4xl ring-4 ring-white shadow-lg group-hover:scale-105 transition-all duration-300"
                customIcon={formData.useInitialAvatar ? undefined : formData.profileIcon}
              />
              <div className="absolute bottom-1 right-1 ring-2 ring-white rounded-full"><StatusBadge status="online" /></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">{session?.user?.name || 'Usuário'}</h2>
            <p className="text-gray-500 font-medium mb-6 text-sm">{session?.user?.email || 'email@exemplo.com'}</p>
            <button 
              onClick={() => setActiveTab('configuracoes')}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-blue-700 hover:shadow-xl shadow-blue-500/30 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Edit size={14} className="transition-transform duration-300" />
              <span className="transition-all duration-300">Editar Perfil</span>
            </button>
          </div>
        </div>
      )}

      {isDataLoading ? (
          // ENQUANTO OS DADOS CARREGAM: Mostra um esqueleto para cada card de dados.
          <>
              <div className="md:col-span-2"><SkeletonCard /></div>
              <SkeletonCard />
              <div className="md:col-span-2"><SkeletonCard /></div>
          </>
      ) : error ? (
          // SE DER ERRO: Mostra uma única e clara mensagem de erro.
          <div className="md:col-span-3 p-8 text-center text-red-500 bg-red-50/50 rounded-3xl border border-red-200/20 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <Image 
                  src="/Mascote/banners/Camaleão_23.png" 
                  alt="Erro" 
                  width={120}
                  height={120}
                  className="object-contain"
                />
                <AlertCircle className="h-10 w-10" />
                <div>
                  <h3 className="text-lg font-semibold">Ocorreu um erro</h3>
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
          </div>
      ) : (
          // QUANDO OS DADOS CHEGAM COM SUCESSO: Renderiza todos os cards de uma vez.
          <>
        {/* Card de estatísticas gerais */}
        <div className="bg-white backdrop-blur-2xl border border-gray-200 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-2 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
          {/* Mascote comemorativo para alto desempenho */}
          {profileData.stats.percentagem >= 80 && (
            <div className="absolute top-4 right-4 z-20 animate-bounce">
              <Image 
                src="/Mascote/banners/Camaleão_5.png" 
                alt="Excelente desempenho!" 
                width={60}
                height={60}
                className="object-contain drop-shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                Top! 🔥
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Estatísticas Gerais</h3>
            <Info size={18} className="text-gray-700 hover:text-blue-500 transition-colors duration-300 cursor-help" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Simulados" value={profileData.stats.simulados} icon={<BookOpen size={20} />} color="blue" trend={profileData.stats.trend_simulados} />
            <StatCard title="Questões" value={profileData.stats.questoes} icon={<BarChart2 size={20} />} color="green" trend={profileData.stats.trend_questoes} />
            <StatCard title="Acertos" value={profileData.stats.acertos} icon={<CheckCircle size={20} />} color="emerald" trend={profileData.stats.trend_acertos} />
            <StatCard title="% Acertos" value={`${profileData.stats.percentagem}%`} icon={<Award size={20} />} color="purple" trend={profileData.stats.trend_percentagem} />
          </div>
        </div>
       </>
      )}
    </div>
  );
};

export default GeneralStats;
