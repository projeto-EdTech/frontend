import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface RecentExam {
  name: string;
  date: string;
  score: number;
}

interface SimulationHistoricProps {
  recentExams: RecentExam[];
}

const SimulationHistoric: React.FC<SimulationHistoricProps> = ({ recentExams }) => {
  const router = useRouter();

  return (
    <div className="bg-white backdrop-blur-2xl border border-gray-200 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Histórico de Simulados</h3>
      {recentExams.length === 0 ? (
        <div className="text-center py-12">
          <Image 
            src="/Mascote/banners/Camaleão_10.png" 
            alt="Sem simulados" 
            width={150}
            height={150}
            className="mx-auto mb-4 object-contain drop-shadow-md"
          />
          <p className="text-gray-500 font-medium mb-6">Você ainda não fez nenhum simulado</p>
          <button 
            onClick={() => router.push('/library')}
            className="bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 font-medium"
          >
            Começar Agora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recentExams.map((exam, index) => (
            <div key={index} className="p-6 bg-white backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-bold text-gray-900 group-hover:!text-blue-600 transition-colors">{exam.name}</p>
                  <p className="text-sm text-gray-500 font-medium">{exam.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Pontuação</p>
                  <p className="text-2xl font-bold !text-green-600">{exam.score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimulationHistoric;
