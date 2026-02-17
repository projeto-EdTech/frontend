import React from 'react';
import { BookOpen, BarChart2, Settings, AlertCircle, CalendarDays, Target } from "lucide-react";
import { useSession } from 'next-auth/react';
import { useUserTier } from '@/hooks/useUserTier';

interface NavigationBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeTab, setActiveTab }) => {
  const { data: session } = useSession();
  const { tier } = useUserTier();
  const isPRO = tier === 'Simula PRO';

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-1.5 flex w-full justify-between items-center">
        <button
          onClick={() => setActiveTab('profile')}
          className={`group px-4 md:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"></path>
              <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="currentColor"></path>
          </svg>
          <span className="hidden md:inline">Perfil</span>
        </button>
        <button
          onClick={() => setActiveTab('simulados')}
          className={`group px-4 md:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'simulados'
              ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <BookOpen size={18} className="flex-shrink-0" />
          <span className="hidden md:inline">Simulados</span>
        </button>
        <button
          onClick={() => setActiveTab('estatisticas')}
          className={`group px-4 md:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'estatisticas'
              ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <BarChart2 size={18} className="flex-shrink-0" />
          <span className="hidden md:inline">Estatísticas</span>
        </button>
        {isPRO && (
          <>
            <button
              onClick={() => setActiveTab('notasDeCorte')}
              className={`group px-4 md:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'notasDeCorte'
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Target size={18} className="flex-shrink-0" />
              <span className="hidden lg:inline">Notas de Corte</span>
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('configuracoes')}
          className={`group px-4 md:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'configuracoes'
              ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings size={18} className="flex-shrink-0" />
          <span className="hidden md:inline">Configurações</span>
        </button>                
      </div>
    </div>
  );
};

export default NavigationBar;
