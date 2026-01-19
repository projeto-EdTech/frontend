import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { TabsContent } from "@/components/ui/tabs";
import TopicBarChart from "@/components/Simula_PRO/graficos_stats/TopicBarChart";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowUpNarrowWide, ArrowDownNarrowWide } from "lucide-react";

// --- Tipagens (sem alterações) ---
interface ProfileStatsForTab {
  simulados: number;
  questoes: number;
  acertos: number;
  percentagem: number;
}
interface SubjectPerformanceForTab {
  subject: string;
  percentage: number;
}

interface StatsUserProps {
  stats: ProfileStatsForTab;
  subjectPerformance: SubjectPerformanceForTab[];
  isPremiumUser?: boolean;
}

// --- Cores (sem alterações) ---
const CHART_COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#F59E0B", // amber-500
  "#14B8A6", // teal-500
  "#EF4444", // red-500
];

const StatsUser: React.FC<StatsUserProps> = ({ stats, subjectPerformance }) => {
  const { theme } = useTheme();
  // Estado para ordenação do gráfico de performance por matéria
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  // Mantém o relatório completo apenas em memória (sem sessionStorage)
  const [completeReport, setCompleteReport] = useState<string>("");
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Mapeia os dados de performance e aplica a ordenação conforme o estado
  const performanceChartData = (() => {
    const mappedData = subjectPerformance.map((item) => ({
      topico: item.subject,
      percentual: item.percentage,
    }));

    if (sortOrder === "asc") {
      return [...mappedData].sort((a, b) => a.percentual - b.percentual);
    } else if (sortOrder === "desc") {
      return [...mappedData].sort((a, b) => b.percentual - a.percentual);
    }
    return mappedData;
  })();

  useEffect(() => {
    // Estilo customizado para scrollbar com interpolação correta
    const style = document.createElement("style");
    const trackColor = theme === "dark" ? "#1f2937" : "#f3f4f6";
    const thumbColor = theme === "dark" ? "#4b5563" : "#9ca3af";
    const thumbHoverColor = theme === "dark" ? "#6b7280" : "#6b7280";
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: ${trackColor};
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: ${thumbColor};
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${thumbHoverColor};
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  return (
    <TabsContent
      value="estatisticas"
      className="mt-6"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Container com aparência de janela macOS */}
      <div
        className={`rounded-2xl overflow-hidden`}
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card de estatísticas gerais */}
          <div
            className={`rounded-2xl p-8 shadow-[0_6px_24px_rgba(0,0,0,0.06)] relative overflow-hidden border
            ${theme === "dark" ? "bg-[#1c1c1e]/70 border-white/10" : "bg-white/80 border-black/10"}`}
          >
            <div className="absolute bottom-0 right-0 opacity-70 pointer-events-none">
              <Image
                src="/Mascote/banners/Camaleão_12.png"
                alt=""
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-6 relative z-10">
              Estatísticas Gerais
            </h3>
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div
                className={`text-center p-4 rounded-xl border hover:shadow-lg transition-shadow hover:scale-[1.02] transform hover:shadow-blue-500/30 hover:border-blue-500/20
                ${theme === "dark" ? "bg-[#2c2c2e]/70 border-white/10" : "bg-white/90 border-black/10"}`}
              >
                <p
                  className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-2`}
                >
                  Simulados
                </p>
                <p
                  className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-700"}`}
                >
                  {stats.simulados}
                </p>
              </div>
              <div
                className={`text-center p-4 rounded-xl border hover:shadow-lg transition-shadow hover:scale-[1.02] transform hover:shadow-green-500/30 hover:border-green-500/20
                ${theme === "dark" ? "bg-[#2c2c2e]/70 border-white/10" : "bg-white/90 border-black/10"}`}
              >
                <p
                  className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-2`}
                >
                  Questões
                </p>
                <p
                  className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-700"}`}
                >
                  {stats.questoes}
                </p>
              </div>
              <div
                className={`text-center p-4 rounded-xl border hover:shadow-lg transition-shadow hover:scale-[1.02] transform hover:shadow-green-600/30 hover:border-green-600/20
                ${theme === "dark" ? "bg-[#2c2c2e]/70 border-white/10" : "bg-white/90 border-black/10"}`}
              >
                <p
                  className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-2`}
                >
                  Acertos
                </p>
                <p
                  className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-700"}`}
                >
                  {stats.acertos}
                </p>
              </div>
              <div
                className={`text-center p-4 rounded-xl border hover:shadow-lg transition-shadow hover:scale-[1.02] transform hover:shadow-purple-500/30 hover:border-purple-500/20
                ${theme === "dark" ? "bg-[#2c2c2e]/70 border-white/10" : "bg-white/90 border-black/10"}`}
              >
                <p
                  className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-2`}
                >
                  % de Acertos
                </p>
                <p
                  className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-700"}`}
                >
                  {stats.percentagem}%
                </p>
              </div>
            </div>
          </div>

          {/* Performance por matéria */}
          <div
            className={`rounded-2xl p-8 shadow-[0_6px_24px_rgba(0,0,0,0.06)] border
            ${theme === "dark" ? "bg-[#1c1c1e]/70 border-white/10" : "bg-white/80 border-black/10"}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3
                className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-700"}`}
              >
                Performance por Matéria
              </h3>

              {/* Controle de ordenação estilo macOS */}
              <div
                className={`relative inline-flex items-center rounded-xl p-1 transition-all duration-300 shadow-sm
                  ${
                    theme === "dark"
                      ? "bg-[#2c2c2e] border border-white/10"
                      : "bg-gray-100/80 border border-black/5"
                  }`}
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                {/* Slider animado */}
                <span
                  className={`absolute top-1 h-[calc(100%-8px)] rounded-[10px] transition-all duration-300 ease-out
                    ${sortOrder === "none" ? "opacity-0" : "opacity-100"}
                    ${
                      theme === "dark"
                        ? "bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_2px_8px_rgba(59,130,246,0.4)]"
                        : "bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_2px_10px_rgba(59,130,246,0.3)]"
                    }
                    ${
                      sortOrder === "asc"
                        ? "left-1 w-[calc(50%-4px)]"
                        : sortOrder === "desc"
                          ? "left-[calc(50%+2px)] w-[calc(50%-4px)]"
                          : "left-1 w-[calc(50%-4px)]"
                    }`}
                />

                {/* Botão Crescente */}
                <button
                  type="button"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "none" : "asc")
                  }
                  className={`relative z-10 px-4 py-2 text-center text-sm font-semibold transition-all duration-200 whitespace-nowrap rounded-lg flex items-center gap-2 cursor-pointer
                    ${
                      sortOrder === "asc"
                        ? "text-white"
                        : theme === "dark"
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-600 hover:text-gray-800"
                    }`}
                  title="Ordenar do menor para o maior"
                >
                  <ArrowUpNarrowWide
                    className={`w-4 h-4 transition-transform duration-200 ${sortOrder === "asc" ? "scale-110" : ""}`}
                  />
                  <span className="hidden sm:inline">Crescente</span>
                </button>

                {/* Botão Decrescente */}
                <button
                  type="button"
                  onClick={() =>
                    setSortOrder(sortOrder === "desc" ? "none" : "desc")
                  }
                  className={`relative z-10 px-4 py-2 text-center text-sm font-semibold transition-all duration-200 whitespace-nowrap rounded-lg flex items-center gap-2 cursor-pointer
                    ${
                      sortOrder === "desc"
                        ? "text-white"
                        : theme === "dark"
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-600 hover:text-gray-800"
                    }`}
                  title="Ordenar do maior para o menor"
                >
                  <ArrowDownNarrowWide
                    className={`w-4 h-4 transition-transform duration-200 ${sortOrder === "desc" ? "scale-110" : ""}`}
                  />
                  <span className="hidden sm:inline">Decrescente</span>
                </button>
              </div>
            </div>

            {/* Indicador de ordenação ativa */}
            {sortOrder !== "none" && (
              <div
                className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300
                ${
                  theme === "dark"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-blue-50 text-blue-600 border border-blue-200/50"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Ordenado por percentual{" "}
                  {sortOrder === "asc" ? "crescente" : "decrescente"}
                </span>
                <button
                  onClick={() => setSortOrder("none")}
                  className={`ml-auto p-1 rounded-md transition-colors duration-200
                    ${
                      theme === "dark"
                        ? "hover:bg-blue-500/20 text-blue-400"
                        : "hover:bg-blue-100 text-blue-600"
                    }`}
                  title="Remover ordenação"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            <div className="w-full h-auto">
              {performanceChartData.length > 0 ? (
                <TopicBarChart
                  data={performanceChartData}
                  colors={CHART_COLORS}
                />
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>Sem dados de performance por matéria para exibir.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};
export default StatsUser;
