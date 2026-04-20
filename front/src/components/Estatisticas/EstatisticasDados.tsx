import React from 'react';
import dynamic from 'next/dynamic';
import Image from "next/image";
import { cookies } from "next/headers";

const TopicBarChart = dynamic(
  () => import('@/components/Simula_PRO/graficos_stats/TopicBarChart'),
  {
    loading: () => (
      <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

const TopicPieChart = dynamic(
  () => import('@/components/Simula_PRO/graficos_stats/TopicPieChart'),
  {
    loading: () => (
      <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

const RankingMaterias = dynamic(
  () => import('@/components/RankingMaterias'),
  {
    loading: () => (
      <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

type Metrica = {
  topico: string;
  percentual: number;
};

interface EstatisticasDadosProps {
  subject: string;
  vestibularSelecionado: string;
}

export default async function EstatisticasDados({ subject, vestibularSelecionado }: EstatisticasDadosProps) {
  // Padrões do Next.js App Router para cookies/auth
  const cookieStore = await cookies();
  const token = cookieStore.get('user_data')?.value;

  // Lógica similar a route.ts, podemos fazer a chamada diretamente pro BFF usando fetch
  // Mas para não duplicar, podemos bater no próprio /api/ do nextjs, mas fetch em route local do Next.js
  // precisa da URL completa, então é mais simples bater no backend direto aqui. 
  // No plano vimos que route.ts bate em process.env.BACKEND_API_URL.
  
  if (!process.env.BACKEND_API_URL) {
    return <ErroDisplay erro="A variável de ambiente BACKEND_API_URL não está definida." />;
  }
  if (!token) {
    // Isso deve desencadear LoginModal no client via status unauthenticated
    return <ErroDisplay erro="Não autorizado. Faça o login para visualizar os dados." />;
  }

  // Tentar buscar no mapa usando a versão minúscula
  const mapaMaterias: Record<string, string> = {
    "matematica": "Matemática",
    "fisica": "Física",
    "quimica": "Química",
    "biologia": "Biologia",
    "portugues": "Língua Portuguesa",
    "historia": "História",
    "geografia": "Geografia",
    "filosofia": "Filosofia",
    "sociologia": "Sociologia",
    "ingles": "Inglês",
  };

  const materia = mapaMaterias[subject.toLowerCase()] || subject;
  let universidadeId = vestibularSelecionado;
  if (!universidadeId || universidadeId === "geral" || universidadeId === "all") {
    universidadeId = "all";
  }

  const backendApiUrl = `${process.env.BACKEND_API_URL}/api/instituicao/estatisticas/${universidadeId}/${materia}`;
  
  let metricas: Metrica[] = [];
  try {
    const res = await fetch(backendApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      next: { revalidate: 60 } // Híbrido ISR 60s
    });

    if (!res.ok) {
      if (res.status === 404) {
        return <EmptyDisplay />;
      }
      throw new Error("Falha ao carregar dados do servidor.");
    }
    const backendData = await res.json();
    metricas = Array.isArray(backendData) 
      ? backendData.map((item: any) => ({
          topico: item.conteudo,
          percentual: item.percentual
        }))
      : [];

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro inesperado.';
    return <ErroDisplay erro={msg} />;
  }

  if (metricas.length === 0) {
    return <EmptyDisplay />;
  }

  const colors = [
    "#2563eb", "#10b981", "#f59e42", "#ef4444", "#a21caf", "#0ea5e9", "#fbbf24", "#14b8a6", "#e11d48"
  ];

  const filteredRanking = metricas.filter(item => 
    item.topico.toLowerCase() !== 'demais assuntos' && 
    !item.topico.toLowerCase().includes('demais assuntos (< que') &&
    item.topico.toLowerCase() !== 'outros'
  );

  return (
    <>
      <div className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 mb-8 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <span className="text-xl">🏆</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-600 tracking-tight">
            TOP 10 Conteúdos
          </h2>
        </div>
        <RankingMaterias 
          data={filteredRanking} 
          colors={colors} 
        />
      </div>
      
      <div className="w-full max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
        <div className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-xl">📊</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-600 tracking-tight">
              Distribuição dos Tópicos
            </h2>
          </div>
          <TopicBarChart data={metricas} colors={colors} />
        </div>

        <div className="backdrop-blur-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-xl">📈</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-600 tracking-tight">
              Distribuição Percentual
            </h2>
          </div>
          <TopicPieChart data={metricas} colors={colors} />
        </div>
      </div>

      <div className="relative">
        <div className="flex justify-center mb-10">
          <div className="backdrop-blur-xl bg-white rounded-2xl px-8 py-4 shadow-xl border border-gray-200 flex items-center gap-4">
            <Image
              src="/Mascote/banners/Camaleão_20.png"
              alt="Mascote comemorando"
              width={400}
              height={400}
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg"
            />
            <span className="text-base md:text-lg font-semibold text-gray-700 tracking-tight">
              {metricas.length} {metricas.length === 1 ? 'Conteúdo encontrado' : 'Conteúdos encontrados'}!
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {metricas.map((item, idx) => (
            <div
              key={idx}
              className="backdrop-blur-xl bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 flex flex-col items-center border-t-4 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in"
              style={{ 
                borderTopColor: colors[idx % colors.length], 
                animationDelay: `${idx * 60}ms` 
              }}
            >
              <span className="text-base sm:text-lg font-semibold text-gray-600 mb-3 text-center tracking-tight leading-snug">
                {item.topico}
              </span>
              <span
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{ color: colors[idx % colors.length] }}
              >
                {item.percentual}%
              </span>
              <div className="w-full bg-gray-200/50 rounded-full h-2.5 mt-3 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${item.percentual}%`, 
                    background: `linear-gradient(90deg, ${colors[idx % colors.length]}, ${colors[(idx + 1) % colors.length]})` 
                  }}
                >
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ErroDisplay({ erro }: { erro: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <Image
        src="/Mascote/banners/Camaleão_17.png"
        alt="Mascote confuso"
        width={120}
        height={120}
        className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-xl"
      />
      <p className="text-red-600 text-lg font-semibold backdrop-blur-xl bg-white px-6 py-4 rounded-2xl shadow-xl border border-red-200/50 tracking-tight">
        {erro}
      </p>
    </div>
  );
}

function EmptyDisplay() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <Image
        src="/Mascote/banners/Camaleão_18.png"
        alt="Mascote - sem dados"
        width={200}
        height={200}
        className="w-40 h-40 md:w-48 md:h-48 object-contain opacity-50 drop-shadow-xl"
      />
      <p className="text-gray-500 text-xl font-medium tracking-tight">Não há dados para esta matéria.</p>
    </div>
  );
}
