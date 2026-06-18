import type React from "react";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  AlignmentType,
  BorderStyle,
} from "docx";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { TabsContent } from "@/components/ui/tabs";
import TopicBarChart from "@/components/Simula_PRO/graficos_stats/TopicBarChart";
import MonthlyProgressChart from "@/components/Simula_PRO/graficos_stats/MonthlyProgressChart";
import { useTheme } from "@/contexts/ThemeContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Lock,
  X,
  Zap,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  Target,
  BarChart3,
  Lightbulb,
  Rocket,
  ChevronRight,
  Check,
  Library,
  Activity,
  Cpu,
  GraduationCap,
  Headset,
} from "lucide-react";
import { useUserTier } from "@/hooks/useUserTier";
import { motion } from "framer-motion";

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
interface MonthlyProgressPointForTab {
  label: string;
  value: number;
}
interface StatsUserProps {
  stats: ProfileStatsForTab;
  subjectPerformance: SubjectPerformanceForTab[];
  monthlyProgress: MonthlyProgressPointForTab[];
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

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  if (!isOpen) return null;

  // Função para redirecionar para a página de planos
  const handleUpgradeClick = () => {
    window.location.href = "/paidPlan";
  };

  return (
    <>
      {/* Overlay (fundo) com animação suave */}
      <div
        className={`fixed inset-0 z-40 backdrop-blur-[1px] transition-all duration-200 ease-out
          ${isOpen ? "opacity-100 bg-black/40" : "opacity-0 bg-black/0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Conteúdo do Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-[600px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-[350ms] overflow-hidden focus-visible:outline-none
          ${
            theme === "dark"
              ? "bg-[#1c1c1e]"
              : "bg-gradient-to-b from-white to-[#fafafa]"
          }
          ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-[0.96] pointer-events-none"}
        `}
        style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        tabIndex={-1}
      >
        <div className="relative z-10">
          {/* Botão de Fechar aprimorado */}
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] cursor-pointer
              ${
                theme === "dark"
                  ? "text-white/30 hover:text-white/60 hover:bg-white/10"
                  : "text-black/30 hover:text-black/60 hover:bg-black/10"
              }
            `}
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>

          {/* Conteúdo principal */}
          <div className="px-10 pt-12 pb-10 text-center">
            {/* Título - Máximo Contraste */}
            <h2
              id="upgrade-modal-title"
              className={`text-[28px] font-normal mb-2 tracking-tight leading-[1.2]
              ${theme === "dark" ? "text-white" : "text-[#1d1d1f]"}
            `}
              style={{
                fontFamily:
                  "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Desbloqueie seu{" "}
              <span className="font-bold">Potencial Máximo</span>
            </h2>

            {/* Subtítulo - Contexto (Terciário) */}
            <p
              className={`text-[18px] mb-6 max-w-[480px] mx-auto leading-[1.4] font-normal
              ${theme === "dark" ? "text-white/60" : "text-black/60"}
            `}
              style={{
                fontFamily:
                  "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Acesse <strong>relatório completo</strong> com análise de IA,
              identificação de pontos fortes e fracos, e plano de estudos
              personalizado.
            </p>

            {/* Lista de features - Informativo (Secundário) */}
            <div className="mb-8 text-left max-w-2xl mx-auto px-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  {
                    icon: <Rocket className="w-5 h-5" />,
                    color: "#5856D6",
                    text: "Acesso ilimitado a simulados",
                  },
                  {
                    icon: <Library className="w-5 h-5" />,
                    color: "#007AFF",
                    text: "Biblioteca de provas",
                  },
                  {
                    icon: <Activity className="w-5 h-5" />,
                    color: "#34C759",
                    text: "Estatística em tempo real",
                  },
                  {
                    icon: <Cpu className="w-5 h-5" />,
                    color: "#FF2D55",
                    text: "Resolução com IA (PRO)",
                  },
                  {
                    icon: <Lightbulb className="w-5 h-5" />,
                    color: "#FFCC00",
                    text: "Plano de estudos otimizado",
                  },
                  {
                    icon: <GraduationCap className="w-5 h-5" />,
                    color: "#FF3B30",
                    text: "Consulta de notas de corte",
                  },
                  {
                    icon: <BarChart3 className="w-5 h-5" />,
                    color: "#5E5CE6",
                    text: "Estatísticas avançadas",
                  },
                  {
                    icon: <Headset className="w-5 h-5" />,
                    color: "#FF9500",
                    text: "Suporte prioritário 24/7",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${benefit.color}15`,
                        color: benefit.color,
                      }}
                    >
                      {benefit.icon}
                    </div>
                    <span
                      className={`text-[14.5px] font-medium leading-[1.3]
                      ${theme === "dark" ? "text-white/85" : "text-black/85"}
                    `}
                      style={{
                        fontFamily:
                          "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botões de ação - CTA Vibrante */}
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <button
                onClick={handleUpgradeClick}
                className="w-full bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold text-[14px] px-8 py-3.5 rounded-[12px] shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transform active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-blue-500/20"
                style={{
                  fontFamily:
                    "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Fazer Upgrade para PRO
                <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>

              <button
                onClick={onClose}
                className={`w-full px-6 py-1 rounded-xl text-[18.6px] font-normal transition-all duration-[150ms] ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/30 cursor-pointer
                  ${
                    theme === "dark"
                      ? "text-white/50 hover:text-white/70"
                      : "text-black/50 hover:text-black/70"
                  }
                `}
                style={{
                  fontFamily:
                    "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Continuar no plano gratuito
              </button>
            </div>

            {/* Elementos secundários - Badge e Segurança (Subtle) */}
            <div className="mt-6 flex flex-col items-center gap-3">
              {/* Indicador de Preço e Valor */}
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={`text-[16px] font-medium
                  ${theme === "dark" ? "text-white/50" : "text-black/50"}
                `}
                  style={{
                    fontFamily:
                      "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  A partir de R$ 41,50/mês
                </span>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300
                ${
                  theme === "dark"
                    ? "bg-white/5 text-white/40 border border-white/10"
                    : "bg-black/5 text-black/40 border border-black/10"
                }
              `}
                style={{
                  letterSpacing: "0.3px",
                  fontFamily:
                    'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                <Zap className="w-3 h-3" />
                Recurso Premium
              </span>

              <p
                className={`flex items-center justify-center gap-1.5 text-[14px] font-normal
                ${theme === "dark" ? "text-white/40" : "text-black/40"}
              `}
                style={{
                  fontFamily:
                    "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                <Lock className="w-3 h-3 opacity-80" />
                Pagamento seguro • Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StatsUser: React.FC<StatsUserProps> = ({
  stats,
  subjectPerformance,
  monthlyProgress,
  isPremiumUser = false,
}) => {
  const { theme } = useTheme();
  const { isPro } = useUserTier();
  const canAccessPremium = isPro || !!isPremiumUser;

  const targetExam = useMemo<string | undefined>(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? sessionStorage.getItem("user_profile_data")
          : null;
      if (!raw) return undefined;
      return (
        (JSON.parse(raw) as { targetExam?: string }).targetExam || undefined
      );
    } catch {
      return undefined;
    }
  }, []);

  const [reportType, setReportType] = useState<"simples" | "completo">(
    "simples",
  );
  // Estado para ordenação do gráfico de performance por matéria
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  // Mantém o relatório completo apenas em memória (sem sessionStorage)
  const [completeReport, setCompleteReport] = useState<string>("");
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const toggleReportType = () => {
    // Esta função é chamada ao clicar no *fundo* do seletor
    const current = reportType;
    if (current === "simples") {
      // Se está tentando ir para 'completo'
      if (canAccessPremium) {
        setReportType("completo");
      } else {
        setIsUpgradeModalOpen(true); // Abre o modal
      }
    } else {
      // Se está tentando ir para 'simples' (sempre permitido)
      setReportType("simples");
    }
  };

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

  const statCards = [
    {
      label: "Simulados",
      value: stats.simulados,
      unit: "",
      color: "#007AFF",
      Icon: BarChart3,
      shadow: "rgba(0,122,255,0.20)",
    },
    {
      label: "Questões",
      value: stats.questoes,
      unit: "",
      color: "#34C759",
      Icon: Target,
      shadow: "rgba(52,199,89,0.20)",
    },
    {
      label: "Acertos",
      value: stats.acertos,
      unit: "",
      color: "#30D158",
      Icon: Check,
      shadow: "rgba(48,209,88,0.20)",
    },
    {
      label: "% de Acertos",
      value: stats.percentagem,
      unit: "%",
      color: "#AF52DE",
      Icon: Zap,
      shadow: "rgba(175,82,222,0.20)",
    },
  ];

  useEffect(() => {
    // Só executa se:
    // 1. O usuário mudou para "Relatório Completo"
    // 2. O relatório ainda NÃO foi carregado (é uma string vazia)
    // 3. Não estamos carregando um no momento
    if (reportType === "completo" && !completeReport && !isLoadingReport) {
      // No arquivo StatsUser.tsx

      const fetchCompleteReport = async () => {
        setIsLoadingReport(true);
        setReportError(null);
        let fullReportText = ""; // 1. (ADICIONAR) Crie uma variável local para acumular

        try {
          const response = await fetch("/api/relatorio-IA", {
            method: "GET", // Como definimos na API route
          });

          // Trata erros da API (seu código aqui está correto)
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Falha na resposta da API");
          }

          // Se a resposta NÃO for um stream (seu código aqui está correto)
          if (!response.body) {
            throw new Error("A resposta da API não é um stream.");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              break; // Stream finalizado
            }
            const chunk = decoder.decode(value);

            // 2. (MODIFICAR) Acumule o texto na variável local
            fullReportText += chunk;

            // 3. (MODIFICAR) Atualize o estado usando a variável local
            // Isso é um pouco mais eficiente do que usar (prev) => prev + chunk
            setCompleteReport(fullReportText);

            /* // Sua versão original (também funciona, mas mantenha o fullReportText += chunk):
            setCompleteReport((prev) => prev + chunk);
            */
          }

          // Não salva mais em sessionStorage: mantém apenas em memória
        } catch (error) {
          console.error(error);
          setReportError(
            error instanceof Error
              ? error.message
              : "Houve um problema ao gerar seu relatório.",
          );
        } finally {
          setIsLoadingReport(false);
        }
      };

      fetchCompleteReport();
    }
  }, [reportType, completeReport, isLoadingReport]); // Dependências do efeito

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
        {/* Conteúdo da janela */}
        <div className="p-4 lg:p-6">
          {/* --- Botão Deslizante Premium --- */}
          <div className="flex justify-center mb-6 lg:mb-8">
            <div
              className={`relative inline-flex items-center rounded-xl p-1 transition-all duration-300 cursor-pointer group bg-white border border-gray-200 shadow-md`}
              onClick={toggleReportType}
              role="switch"
              aria-checked={reportType === "completo"}
              aria-label={`Mudar para relatório ${reportType === "simples" ? "completo" : "simples"}`}
            >
              {/* Slider animado com efeito de brilho */}
              <span
                className={`absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-6px)] rounded-[10px] transition-all duration-400 ease-out
              ${
                theme === "dark"
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(10,132,255,0.5)]"
                  : "bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_1px_0_rgba(255,255,255,0.9),0_4px_14px_rgba(0,122,255,0.3)]"
              }
              ${reportType === "completo" ? "translate-x-[calc(100%)]" : "translate-x-0"}`}
              />

              {/* Opção: Relatório Simples */}
              <button
                type="button"
                className={`relative z-10 px-6 py-2.5 text-center text-sm font-semibold transition-all duration-200 whitespace-nowrap rounded-md cursor-pointer
              ${
                reportType === "simples"
                  ? "text-white"
                  : theme === "dark"
                    ? "text-gray-400 hover:text-gray-200 active:scale-95"
                    : "text-gray-600 hover:text-gray-700 active:scale-95"
              }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setReportType("simples");
                }}
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 transition-all duration-300 ${reportType === "simples" ? "opacity-100" : "opacity-0 scale-0"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Relatório Simples
                </span>
              </button>

              {/* Opção: Relatório Completo */}
              <button
                type="button"
                className={`relative z-10 px-6 py-2.5 text-center text-sm font-semibold transition-all duration-200 whitespace-nowrap rounded-md cursor-pointer
              ${
                reportType === "completo"
                  ? "text-white"
                  : theme === "dark"
                    ? "text-gray-400 hover:text-gray-200 active:scale-95"
                    : "text-gray-600 hover:text-gray-700 active:scale-95"
              }`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Aqui está a verificação principal
                  if (canAccessPremium) {
                    setReportType("completo");
                  } else {
                    setIsUpgradeModalOpen(true); // Abre o modal
                  }
                }}
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 transition-all duration-300 ${reportType === "completo" ? "opacity-100" : "opacity-0 scale-0"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Relatório Completo
                  {/* */}
                  {!canAccessPremium && (
                    <Lock
                      className={`w-3.5 h-3.5 transition-all duration-300 ml-0.5
                    ${
                      reportType === "completo" // Isso não deve acontecer para free users, mas é seguro
                        ? "text-white/70"
                        : theme === "dark"
                          ? "text-gray-400/70"
                          : "text-gray-600/70"
                    }`}
                    />
                  )}
                  {/* */}
                </span>
              </button>

              {/* Indicador visual de interação */}
              <div
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 transition-all duration-300 rounded-full
            ${theme === "dark" ? "hover:from-blue-600 hover:to-blue-700" : "bg-blue-500"}
            group-hover:w-1/3 opacity-0 group-hover:opacity-50`}
              />
            </div>
          </div>
          {/* Usamos um operador ternário:
        Se reportType === 'simples', renderiza o primeiro bloco (seu grid atual).
        Senão (else), renderiza o segundo bloco (o placeholder do relatório completo).
      */}
          {reportType === "simples" ? (
            // --- Conteúdo do Relatório Simples ---
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card de estatísticas gerais */}
              <div
                className={`rounded-3xl p-7 relative overflow-hidden border backdrop-blur-2xl
                  ${
                    theme === "dark"
                      ? "bg-[#1c1c1e]/60 border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                      : "bg-white/60 border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
                  }`}
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}
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
                <h3
                  className={`text-xl font-semibold mb-5 relative z-10 tracking-tight
                    ${theme === "dark" ? "text-white" : "text-[#1d1d1f]"}`}
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  }}
                >
                  Estatísticas Gerais
                </h3>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {statCards.map((card) => (
                    <motion.div
                      key={card.label}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: `0 14px 32px ${card.shadow}`,
                        borderColor: card.color,
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      className={`relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border backdrop-blur-xl cursor-default select-none overflow-hidden
                        ${
                          theme === "dark"
                            ? "bg-white/[0.04] border-white/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                            : "bg-white/80 border-white/60 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                        }`}
                    >
                      {/* Glow radial sutil */}
                      <div
                        className="absolute inset-0 opacity-[0.07] pointer-events-none rounded-2xl"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${card.color}, transparent 70%)`,
                        }}
                      />
                      {/* Ícone colorido */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${card.color}1A`,
                          color: card.color,
                        }}
                      >
                        <card.Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      {/* Label */}
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-[0.12em] leading-none
                          ${theme === "dark" ? "text-white/40" : "text-black/40"}`}
                        style={{
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        }}
                      >
                        {card.label}
                      </p>
                      {/* Valor */}
                      <p
                        className={`text-[30px] font-bold leading-none tracking-tight
                          ${theme === "dark" ? "text-white" : "text-[#1d1d1f]"}`}
                        style={{
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        }}
                      >
                        {card.value}
                        {card.unit}
                      </p>
                    </motion.div>
                  ))}
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

              {/* Progresso Mensal */}
              <div className="lg:col-span-2 relative">
                {monthlyProgress.length > 1 &&
                  monthlyProgress[monthlyProgress.length - 1].value >
                    monthlyProgress[monthlyProgress.length - 2].value}

                {monthlyProgress.length > 0 ? (
                  <MonthlyProgressChart
                    data={monthlyProgress}
                    isPremiumUser={canAccessPremium}
                    targetExam={targetExam}
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center h-full text-center py-10 text-gray-500 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] p-8 border
                ${theme === "dark" ? "bg-[#1c1c1e]/60 border-white/10" : "bg-white/70 border-black/10"}`}
                  >
                    <p>Sem dados de progresso mensal para exibir.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // --- Conteúdo do Relatório Simples ---

            <div
              className={`backdrop-blur-xl border rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden flex flex-col
          ${
            theme === "dark"
              ? "bg-[#1c1c1e]/80 border-white/10"
              : "bg-white/85 border-black/10"
          }
        `}
            >
              {/* Efeitos de fundo decorativos */}
              <div
                className={`absolute inset-0 opacity-30 pointer-events-none
            ${
              theme === "dark"
                ? "bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),transparent_70%)]"
                : "bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.08),transparent_70%)]"
            }
          `}
              />

              {/* Padrão de grid sutil */}
              <div
                className={`absolute inset-0 opacity-[0.03] pointer-events-none
            ${theme === "dark" ? "opacity-[0.02]" : "opacity-[0.03]"}
          `}
                style={{
                  backgroundImage: `linear-gradient(${theme === "dark" ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${theme === "dark" ? "#fff" : "#000"} 1px, transparent 1px)`,
                  backgroundSize: "50px 50px",
                }}
              />

              {/* ========== HEADER FIXO ========== */}
              <div
                className={`relative z-20 px-6 lg:px-8 py-5 border-b transition-all duration-300 rounded-t-3xl
            ${
              theme === "dark"
                ? "bg-[#1c1c1e]/80 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
                : "bg-[#f9f9fb]/70 border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
            }
          `}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Lado esquerdo - Título e Badge */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Ícone decorativo */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-400/30"
                      : "bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-400/20"
                  }
                `}
                    >
                      <svg
                        className={`w-6 h-6 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2
                        className={`text-xl lg:text-2xl font-bold tracking-tight truncate
                    ${
                      theme === "dark"
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300"
                        : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
                    }
                  `}
                      >
                        Relatório Completo de Performance
                      </h2>
                      <p
                        className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Análise detalhada gerada por inteligência artificial
                      </p>
                    </div>
                  </div>

                  {/* Lado direito - Ações e Status */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Status Badge (quando carregando) */}
                    {isLoadingReport && (
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border animate-pulse
                    ${
                      theme === "dark"
                        ? "bg-green-500/10 border-green-400/30"
                        : "bg-green-500/10 border-green-400/30"
                    }
                  `}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        <span
                          className={`text-xs font-semibold ${theme === "dark" ? "text-green-300" : "text-green-700"}`}
                        >
                          Gerando...
                        </span>
                      </div>
                    )}

                    {/* Botão de ações */}
                    {completeReport && !isLoadingReport && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(completeReport);
                        }}
                        className={`p-2.5 rounded-xl transition-all duration-200 active:scale-[0.98]
                      ${
                        theme === "dark"
                          ? "bg-[#2c2c2e]/70 hover:bg-[#3a3a3c] text-gray-200 border border-white/10"
                          : "bg-white hover:bg-gray-100 text-gray-700 border border-black/10"
                      }
                    `}
                        title="Copiar relatório"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Botão fechar */}
                    <button
                      onClick={() => setReportType("simples")}
                      className={`p-2.5 rounded-xl transition-all duration-200 active:scale-[0.98]
                    ${
                      theme === "dark"
                        ? "bg-[#2c2c2e]/70 hover:bg-[#3a3a3c] text-red-400 border border-white/10"
                        : "bg-white hover:bg-gray-100 text-red-600 border border-black/10"
                    }
                  `}
                      title="Fechar relatório"
                    >
                      <svg
                        className="w-5 h-5"
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
                </div>
              </div>

              {isLoadingReport && !completeReport && (
                // --- Estado de Loading Profissional ---
                <div className="relative flex flex-col items-center justify-center min-h-[600px] px-8 py-12">
                  {/* Efeitos de fundo animados */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Círculos decorativos flutuantes */}
                    <div
                      className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 animate-pulse
                  ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                      : "bg-gradient-to-br from-blue-400 to-indigo-500"
                  }
                `}
                      style={{ animationDuration: "3s" }}
                    />
                    <div
                      className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse
                  ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-purple-500 to-pink-600"
                      : "bg-gradient-to-br from-purple-400 to-pink-500"
                  }
                `}
                      style={{ animationDuration: "4s", animationDelay: "1s" }}
                    />
                  </div>

                  {/* Container principal com glassmorphism */}
                  <div
                    className={`relative z-10 w-full max-w-2xl rounded-3xl p-10 backdrop-blur-xl border shadow-2xl transition-all duration-500
                ${
                  theme === "dark"
                    ? "bg-gray-800/40 border-gray-700/50 shadow-black/20"
                    : "bg-white/60 border-gray-200/60 shadow-gray-900/10"
                }
              `}
                  >
                    {/* Badge de status com animação */}
                    <div className="flex justify-center mb-8">
                      <div
                        className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-md border transition-all duration-300 animate-pulse
                    ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400/40 shadow-lg shadow-blue-500/20"
                        : "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-400/30 shadow-lg shadow-blue-500/10"
                    }
                  `}
                        style={{ animationDuration: "2s" }}
                      >
                        <div className="relative">
                          <svg
                            className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          {/* Pulso animado */}
                          <div className="absolute inset-0 animate-ping opacity-75">
                            <svg
                              className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold tracking-wide uppercase
                      ${theme === "dark" ? "text-blue-300" : "text-blue-700"}
                    `}
                        >
                          Processamento em Andamento
                        </span>
                      </div>
                    </div>

                    {/* Vídeo do Camaleão com moldura elegante */}
                    <div className="relative mb-8">
                      {/* Moldura com gradiente animado */}
                      <div
                        className={`absolute -inset-1 rounded-3xl opacity-75 blur-lg transition-all duration-1000 animate-pulse
                    ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
                        : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                    }
                  `}
                        style={{ animationDuration: "3s" }}
                      />

                      {/* Container do vídeo */}
                      <div
                        className={`relative rounded-3xl overflow-hidden border-2 shadow-2xl
                    ${
                      theme === "dark"
                        ? "bg-gray-900/50 border-gray-700/50"
                        : "bg-white/80 border-gray-200/50"
                    }
                  `}
                      >
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-auto max-h-[320px] object-contain"
                        >
                          <source
                            src="/Mascote/Animações/Camaleão_Animado_Digitando_no_Notebook.mp4"
                            type="video/mp4"
                          />
                          Seu navegador não suporta a tag de vídeo.
                        </video>
                      </div>
                    </div>

                    {/* Textos principais */}
                    <div className="space-y-4 text-center mb-8">
                      <h3
                        className={`text-3xl font-bold tracking-tight leading-tight
                    ${
                      theme === "dark"
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300"
                        : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
                    }
                  `}
                      >
                        Análise Inteligente em Progresso
                      </h3>
                      <p
                        className={`text-base leading-relaxed max-w-lg mx-auto
                    ${theme === "dark" ? "text-gray-300" : "text-gray-700"}
                  `}
                      >
                        Nossa inteligência artificial está analisando seu
                        desempenho e preparando insights personalizados para
                        potencializar seus estudos.
                      </p>
                    </div>

                    {/* Indicadores de processo */}
                    <div
                      className={`space-y-3 mb-8 p-5 rounded-2xl backdrop-blur-sm border
                  ${
                    theme === "dark"
                      ? "bg-gray-900/30 border-gray-700/50"
                      : "bg-gray-50/50 border-gray-200/50"
                  }
                `}
                    >
                      {[
                        { label: "Coletando dados de desempenho", delay: "0s" },
                        {
                          label: "Identificando padrões de aprendizado",
                          delay: "0.5s",
                        },
                        {
                          label: "Gerando recomendações personalizadas",
                          delay: "1s",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 animate-pulse"
                          style={{
                            animationDelay: item.delay,
                            animationDuration: "2s",
                          }}
                        >
                          <div
                            className={`w-2 h-2 rounded-full
                        ${
                          theme === "dark"
                            ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600"
                        }
                      `}
                          />
                          <span
                            className={`text-sm font-medium
                        ${theme === "dark" ? "text-gray-400" : "text-gray-600"}
                      `}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Barra de progresso moderna */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider
                      ${theme === "dark" ? "text-gray-400" : "text-gray-600"}
                    `}
                        >
                          Progresso
                        </span>
                        <span
                          className={`text-xs font-bold
                      ${theme === "dark" ? "text-blue-400" : "text-blue-600"}
                    `}
                        >
                          Aguarde...
                        </span>
                      </div>

                      <div
                        className={`relative h-2.5 rounded-full overflow-hidden shadow-inner
                    ${theme === "dark" ? "bg-gray-700/50" : "bg-gray-200/80"}
                  `}
                      >
                        {/* Barra de progresso com animação de gradiente deslizante */}
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full shadow-lg transition-all duration-1000 ease-out
                        ${
                          theme === "dark"
                            ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-blue-500/50"
                            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-blue-600/30"
                        }
                      `}
                          style={{
                            width: "75%",
                            animation:
                              "progressPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          }}
                        >
                          {/* Efeito de brilho deslizante */}
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                            style={{
                              backgroundSize: "200% 100%",
                              animation: "shimmer 2s linear infinite",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nota informativa */}
                    <div
                      className={`mt-6 p-4 rounded-xl border backdrop-blur-sm
                  ${
                    theme === "dark"
                      ? "bg-blue-500/5 border-blue-400/20"
                      : "bg-blue-500/5 border-blue-400/20"
                  }
                `}
                    >
                      <div className="flex items-start gap-3">
                        <svg
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
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
                        <p
                          className={`text-xs leading-relaxed
                      ${theme === "dark" ? "text-gray-400" : "text-gray-600"}
                    `}
                        >
                          Este processo pode levar alguns instantes. Estamos
                          utilizando inteligência artificial avançada para
                          garantir a máxima precisão em sua análise.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Animações CSS personalizadas */}
                  <style jsx>{`
                    @keyframes shimmer {
                      0% {
                        background-position: -200% 0;
                      }
                      100% {
                        background-position: 200% 0;
                      }
                    }
                    @keyframes progressPulse {
                      0%,
                      100% {
                        opacity: 1;
                      }
                      50% {
                        opacity: 0.8;
                      }
                    }
                  `}</style>
                </div>
              )}

              {reportError && (
                // --- Estado de Erro (Aprimorado) ---
                <div className="relative flex flex-col gap-6 justify-center items-center min-h-[500px] p-8 text-center">
                  {/* Ícone de erro com animação */}
                  <div className="relative">
                    {/* Círculo de fundo pulsante */}
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                    {/* Círculo principal */}
                    <div
                      className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 transition-all duration-300
                  ${
                    theme === "dark"
                      ? "bg-red-500/10 border-red-400/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                      : "bg-red-50 border-red-300/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                  }
                `}
                    >
                      <svg
                        className={`w-14 h-14 ${theme === "dark" ? "text-red-400" : "text-red-500"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Conteúdo do erro */}
                  <div className="space-y-4 max-w-lg">
                    <h3
                      className={`text-2xl font-bold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}
                    >
                      Ops! Algo deu errado
                    </h3>

                    {/* Caixa de mensagem de erro */}
                    <div
                      className={`p-5 rounded-xl border backdrop-blur-sm transition-all duration-300
                  ${
                    theme === "dark"
                      ? "bg-red-500/5 border-red-400/30"
                      : "bg-red-50/80 border-red-200/50"
                  }
                `}
                    >
                      <p
                        className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {reportError}
                      </p>
                    </div>

                    {/* Botão de ação */}
                    <button
                      onClick={() => {
                        setReportError(null);
                        setReportType("simples");
                      }}
                      className={`mt-4 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95
                    ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.4)]"
                        : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.35)]"
                    }
                  `}
                    >
                      Voltar ao Relatório Simples
                    </button>
                  </div>
                </div>
              )}

              {completeReport && (
                // --- Estado de Sucesso (Renderizando o Stream) ---
                <div className="relative flex flex-col flex-1 min-h-0">
                  {/* ========== CONTEÚDO DO RELATÓRIO (Scrollável) ========== */}
                  <div className="relative flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {/* Conteúdo do relatório com tipografia aprimorada */}
                    <article
                      className={`p-8 lg:p-12 max-w-none transition-opacity duration-500 ${isLoadingReport ? "opacity-90" : "opacity-100"}`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: (props) => (
                            <h2
                              className={`text-3xl font-bold mt-12 mb-6 pb-3 border-b-2 
                          ${
                            theme === "dark"
                              ? "border-gray-700/60 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300"
                              : "border-gray-200 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                          }`}
                              {...props}
                            />
                          ),
                          h3: (props) => (
                            <h3
                              className={`text-2xl font-semibold mt-10 mb-4
                          ${theme === "dark" ? "text-blue-300" : "text-indigo-700"}`}
                              {...props}
                            />
                          ),
                          p: (props) => (
                            <p
                              className={`text-base leading-relaxed mb-5
                          ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                              {...props}
                            />
                          ),
                          blockquote: (props) => (
                            <blockquote
                              className={`border-l-4 p-6 my-8 rounded-lg shadow-lg
                          ${
                            theme === "dark"
                              ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-400/50 text-gray-200"
                              : "bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-blue-500/50 text-gray-700"
                          }`}
                              {...props}
                            />
                          ),
                          table: (props) => (
                            <div className="my-8 overflow-x-auto shadow-md rounded-lg">
                              <table
                                className={`min-w-full divide-y
                            ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}
                                {...props}
                              />
                            </div>
                          ),
                          thead: (props) => (
                            <thead
                              className={`${theme === "dark" ? "bg-indigo-600/80" : "bg-indigo-600"}`}
                              {...props}
                            />
                          ),
                          th: (props) => (
                            <th
                              className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider"
                              {...props}
                            />
                          ),
                          td: (props) => (
                            <td
                              className={`px-6 py-4 text-sm border-b
                          ${
                            theme === "dark"
                              ? "text-gray-300 border-gray-700"
                              : "text-gray-700 border-gray-200"
                          }`}
                              {...props}
                            />
                          ),
                          tbody: (props) => (
                            <tbody
                              className={`divide-y
                          ${
                            theme === "dark"
                              ? "bg-gray-800/50 divide-gray-700"
                              : "bg-white divide-gray-200"
                          }`}
                              {...props}
                            />
                          ),
                          ul: (props) => (
                            <ul
                              className="space-y-3 my-6 pl-8 list-disc"
                              {...props}
                            />
                          ),
                          ol: (props) => (
                            <ol
                              className="space-y-3 my-6 pl-8 list-decimal"
                              {...props}
                            />
                          ),
                          li: (props) => (
                            <li
                              className={`text-base leading-relaxed
                          ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                              {...props}
                            />
                          ),
                          hr: (props) => (
                            <hr
                              className={`my-12 border-0 h-0.5
                          ${
                            theme === "dark"
                              ? "bg-gradient-to-r from-transparent via-gray-600 to-transparent"
                              : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
                          }`}
                              {...props}
                            />
                          ),
                          strong: (props) => (
                            <strong
                              className={`font-semibold
                          ${theme === "dark" ? "text-blue-300" : "text-indigo-700"}`}
                              {...props}
                            />
                          ),
                        }}
                      >
                        {completeReport}
                      </ReactMarkdown>

                      {/* Indicador de stream em andamento */}
                      {isLoadingReport && (
                        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-300/30">
                          <div
                            className={`w-3 h-3 rounded-full animate-pulse
                      ${theme === "dark" ? "bg-blue-400" : "bg-blue-500"}
                    `}
                          />
                          <span
                            className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Gerando mais conteúdo...
                          </span>
                        </div>
                      )}
                    </article>

                    {/* Gradiente de fade no final do scroll */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-20 pointer-events-none
                ${
                  theme === "dark"
                    ? "bg-gradient-to-t from-gray-900/90 to-transparent"
                    : "bg-gradient-to-t from-white/90 to-transparent"
                }
              `}
                    />
                  </div>

                  {/* ========== FOOTER FIXO ========== */}
                  <div
                    className={`relative z-20 px-6 lg:px-8 py-5 border-t transition-all duration-300 rounded-b-3xl
              ${
                theme === "dark"
                  ? "bg-[#1c1c1e]/80 border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.35)]"
                  : "bg-[#f9f9fb]/70 border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
              }
            `}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      {/* Lado esquerdo - Info e timestamp */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Badge de IA */}
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border
                    ${
                      theme === "dark"
                        ? "bg-blue-500/10 border-blue-400/30"
                        : "bg-blue-500/5 border-blue-400/20"
                    }
                  `}
                        >
                          <svg
                            className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          <span
                            className={`text-xs font-semibold ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}
                          >
                            Powered by Gemini 2.5 pro AI
                          </span>
                        </div>

                        <div
                          className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
                        >
                          <span>
                            Gerado em{" "}
                            {new Date().toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Lado direito - Ações principais */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Botão de download/exportar */}
                        <button
                          onClick={async () => {
                            // --- 1. Lógica de Parsing da Capa e Conteúdo ---

                            // CORREÇÃO: Usa a RegExp para dividir por '---' (três hifens) em uma nova linha
                            const reportParts =
                              completeReport.split(/^-{3,}\s*$/m);
                            const coverMarkdown = reportParts[0] || "";
                            // CORREÇÃO: Rejunta o conteúdo principal com '---' (ou '\n---\n')
                            const mainReportMarkdown = reportParts
                              .slice(1)
                              .join("\n---\n")
                              .trim();

                            const coverLines = coverMarkdown
                              .split(/\r?\n/)
                              .filter((line) => line.trim() !== "");

                            // Valores padrão
                            let tituloRelatorio =
                              "Relatório de Desempenho Acadêmico";
                            let estudante = "Não informado";
                            let periodo = "Não informado";
                            let mentor = "Não informado";
                            let data = new Date().toLocaleDateString("pt-BR"); // Padrão

                            // Extrai os dados da capa
                            coverLines.forEach((line) => {
                              const trimmedLine = line
                                .replace(/^\*?\s*/, "")
                                .trim(); // Remove '*' e espaço

                              if (trimmedLine.startsWith("Estudante:")) {
                                estudante = trimmedLine
                                  .substring("Estudante:".length)
                                  .trim();
                              } else if (
                                trimmedLine.startsWith("Período Analisado:")
                              ) {
                                // CORREÇÃO da chave
                                periodo = trimmedLine
                                  .substring("Período Analisado:".length)
                                  .trim();
                              } else if (
                                trimmedLine.startsWith("Mentor Responsável:")
                              ) {
                                mentor = trimmedLine
                                  .substring("Mentor Responsável:".length)
                                  .trim();
                              } else if (
                                trimmedLine.startsWith("Data de Geração:")
                              ) {
                                data = trimmedLine
                                  .substring("Data de Geração:".length)
                                  .trim();
                              } else if (
                                trimmedLine.startsWith("Tipo:") &&
                                tituloRelatorio ===
                                  "Relatório de Desempenho Acadêmico" // Pega o título
                              ) {
                                tituloRelatorio = trimmedLine
                                  .substring("Tipo:".length)
                                  .trim();
                              }
                            });

                            // --- 2. Geração dos Parágrafos da Capa Estruturada ---
                            const coverPageParagraphs = [
                              new Paragraph({
                                text: "",
                                style: "NormalABNT",
                                spacing: { before: 1500 },
                              }), // Espaço superior

                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Vestibuline",
                                    bold: true,
                                    size: 36,
                                  }),
                                ], // 18pt
                                style: "TituloABNT",
                                alignment: "center",
                              }),

                              new Paragraph({
                                text: "",
                                style: "NormalABNT",
                                spacing: { after: 1500 },
                              }), // Espaço

                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: tituloRelatorio,
                                    bold: true,
                                    size: 32,
                                  }),
                                ], // 16pt
                                style: "TituloABNT",
                                alignment: "center",
                              }),

                              new Paragraph({
                                text: "",
                                style: "NormalABNT",
                                spacing: { after: 2500 },
                              }), // Mais espaço

                              // Informações do estudante (alinhado à esquerda)
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Estudante: ",
                                    bold: true,
                                  }),
                                  new TextRun(estudante),
                                ],
                                style: "NormalABNT",
                                alignment: "left",
                                spacing: { after: 240 },
                              }),
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Período de Análise: ",
                                    bold: true,
                                  }),
                                  new TextRun(periodo),
                                ],
                                style: "NormalABNT",
                                alignment: "left",
                                spacing: { after: 240 },
                              }),
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Mentor Responsável: ",
                                    bold: true,
                                  }),
                                  new TextRun(mentor),
                                ],
                                style: "NormalABNT",
                                alignment: "left",
                                spacing: { after: 240 },
                              }),

                              // CORREÇÃO: Valor reduzido para a data não vazar de página
                              new Paragraph({
                                text: "",
                                style: "NormalABNT",
                                spacing: { after: 3500 },
                              }),

                              // Data no final da página
                              new Paragraph({
                                children: [new TextRun(data)],
                                style: "NormalABNT",
                                alignment: "center",
                              }),

                              // Quebra de página
                              new Paragraph({
                                children: [new TextRun({ text: "", break: 1 })],
                              }),
                            ];

                            // --- 3. Funções Helper (Dentro da onClick) ---

                            // Helper para 'negrito' (**)
                            const parseBold = (text: string) => {
                              const parts = [];
                              let lastIndex = 0;
                              const regex = /\*\*(.+?)\*\*/g;
                              let match;
                              while ((match = regex.exec(text)) !== null) {
                                if (match.index > lastIndex) {
                                  parts.push(
                                    text.substring(lastIndex, match.index),
                                  );
                                }
                                parts.push({ bold: true, text: match[1] });
                                lastIndex = match.index + match[0].length;
                              }
                              if (lastIndex < text.length) {
                                parts.push(text.substring(lastIndex));
                              }
                              return parts.map((part) =>
                                typeof part === "string"
                                  ? new TextRun(part)
                                  : new TextRun({
                                      text: part.text,
                                      bold: true,
                                    }),
                              );
                            };

                            // NOVO HELPER: Para parsear linhas de tabela
                            const parseTableLine = (line: string): string[] => {
                              return line
                                .split("|") // Divide a linha pelo caractere '|'
                                .slice(1, -1) // Remove o primeiro e o último item (que são strings vazias)
                                .map((s) => s.trim()); // Limpa os espaços em branco de cada célula
                            };

                            // --- 4. Lógica de Parsing do Conteúdo Principal (COM PARSER DE TABELA) ---
                            const lines = mainReportMarkdown.split(/\r?\n/);
                            const mainContentParagraphs: (Paragraph | Table)[] =
                              []; // O array agora aceita Parágrafos OU Tabelas
                            let i = 0;

                            while (i < lines.length) {
                              const line = lines[i];
                              const trimmed = line.trim();

                              // --- NOVA LÓGICA DE DETECÇÃO DE TABELA ---
                              // 1. A linha começa com '|' ?
                              // 2. A próxima linha (i+1) existe?
                              // 3. A próxima linha é um separador de tabela (ex: '|:--|:--|') ?
                              if (
                                trimmed.startsWith("|") &&
                                lines[i + 1] &&
                                lines[i + 1].trim().startsWith("|:--")
                              ) {
                                // --- Início da Tabela ---
                                const headerLine = lines[i];
                                const alignmentLine = lines[i + 1];

                                // Pega os alinhamentos (CENTER, RIGHT, LEFT) da linha |:--:|:--|
                                const alignments = parseTableLine(
                                  alignmentLine,
                                ).map((a) => {
                                  if (a.startsWith(":") && a.endsWith(":"))
                                    return AlignmentType.CENTER;
                                  if (a.endsWith(":"))
                                    return AlignmentType.RIGHT;
                                  return AlignmentType.LEFT;
                                });

                                // Cria as células do cabeçalho
                                const headerCells = parseTableLine(
                                  headerLine,
                                ).map((cell, index) => {
                                  return new TableCell({
                                    children: [
                                      new Paragraph({
                                        children: [
                                          new TextRun({
                                            text: cell,
                                            bold: true,
                                            color: "FFFFFF",
                                          }),
                                        ], // Texto em negrito e branco
                                        style: "NormalABNT",
                                        alignment: alignments[index],
                                      }),
                                    ],
                                    verticalAlign: VerticalAlign.CENTER,
                                    shading: { fill: "4472C4" }, // Fundo azul (pode mudar)
                                  });
                                });

                                // Cria a linha do cabeçalho
                                const tableRows = [
                                  new TableRow({
                                    children: headerCells,
                                    tableHeader: true,
                                  }),
                                ];

                                i += 2; // Pula a linha do cabeçalho e a linha de alinhamento

                                // Loop para as linhas do corpo da tabela
                                while (
                                  i < lines.length &&
                                  lines[i].trim().startsWith("|")
                                ) {
                                  const rowCells = parseTableLine(lines[i]).map(
                                    (cell, index) => {
                                      return new TableCell({
                                        children: [
                                          new Paragraph({
                                            children: parseBold(cell), // Usa o parseBold para texto dentro da célula
                                            style: "NormalABNT",
                                            alignment: alignments[index],
                                          }),
                                        ],
                                        verticalAlign: VerticalAlign.CENTER,
                                      });
                                    },
                                  );

                                  tableRows.push(
                                    new TableRow({ children: rowCells }),
                                  );
                                  i++; // Próxima linha da tabela
                                }

                                // Adiciona o objeto Tabela completo ao array
                                mainContentParagraphs.push(
                                  new Table({
                                    rows: tableRows,
                                    width: {
                                      size: 100,
                                      type: WidthType.PERCENTAGE,
                                    }, // Tabela ocupa 100% da largura
                                    borders: {
                                      // Bordas finas
                                      top: {
                                        style: BorderStyle.SINGLE,
                                        size: 1,
                                        color: "BFBFBF",
                                      },
                                      bottom: {
                                        style: BorderStyle.SINGLE,
                                        size: 1,
                                        color: "BFBFBF",
                                      },
                                      left: {
                                        style: BorderStyle.SINGLE,
                                        size: 1,
                                        color: "BFBFBF",
                                      },
                                      right: {
                                        style: BorderStyle.SINGLE,
                                        size: 1,
                                        color: "BFBFBF",
                                      },
                                      insideHorizontal: {
                                        style: BorderStyle.SINGLE,
                                        size: 1,
                                        color: "BFBFBF",
                                      },
                                      insideVertical: {
                                        style: BorderStyle.SINGLE,
                                        size: 1,
                                        color: "BFBFBF",
                                      },
                                    },
                                  }),
                                );

                                continue; // Volta ao início do 'while' para a próxima linha pós-tabela
                              }

                              // --- LÓGICA ANTIGA (para linhas que NÃO são tabelas) ---

                              if (/^-{3,}$/.test(trimmed)) {
                                // Não adiciona nada, apenas pula a linha separadora '---'
                              } else if (/^>\s?(.+)/.test(line)) {
                                mainContentParagraphs.push(
                                  new Paragraph({
                                    children: parseBold(
                                      line.replace(/^>\s?/, ""),
                                    ),
                                    style: "CitacaoLongaABNT",
                                  }),
                                );
                              } else if (/^# (.*)/.test(line)) {
                                mainContentParagraphs.push(
                                  new Paragraph({
                                    children: parseBold(
                                      line.replace(/^# /, ""),
                                    ),
                                    heading: HeadingLevel.HEADING_1,
                                    style: "TituloABNT",
                                  }),
                                );
                              } else if (/^## (.*)/.test(line)) {
                                mainContentParagraphs.push(
                                  new Paragraph({
                                    children: parseBold(
                                      line.replace(/^## /, ""),
                                    ),
                                    heading: HeadingLevel.HEADING_2,
                                    style: "SubtituloABNT",
                                  }),
                                );
                              } else if (/^### (.*)/.test(line)) {
                                mainContentParagraphs.push(
                                  new Paragraph({
                                    children: parseBold(
                                      line.replace(/^### /, ""),
                                    ),
                                    heading: HeadingLevel.HEADING_3,
                                    style: "SubtituloABNT",
                                  }),
                                );
                              } else if (/^\* (.*)/.test(trimmed)) {
                                mainContentParagraphs.push(
                                  new Paragraph({
                                    children: parseBold(
                                      trimmed.replace(/^\* /, ""),
                                    ),
                                    style: "NormalABNT",
                                    bullet: { level: 0 },
                                  }),
                                );
                              } else if (/^  \* (.*)/.test(line)) {
                                mainContentParagraphs.push(
                                  new Paragraph({
                                    children: parseBold(
                                      line.replace(/^  \* /, ""),
                                    ),
                                    style: "NormalABNT",
                                    bullet: { level: 1 },
                                  }),
                                );
                              } else if (trimmed === "") {
                                mainContentParagraphs.push(
                                  new Paragraph({
                                    text: "",
                                    style: "NormalABNT",
                                  }),
                                );
                              } else {
                                if (
                                  trimmed.startsWith('"') &&
                                  trimmed.endsWith('"')
                                ) {
                                  mainContentParagraphs.push(
                                    new Paragraph({
                                      children: parseBold(line),
                                      style: "CitacaoCurtaABNT",
                                    }),
                                  );
                                } else {
                                  // Renderiza linhas normais de texto
                                  mainContentParagraphs.push(
                                    new Paragraph({
                                      children: parseBold(line),
                                      style: "NormalABNT",
                                    }),
                                  );
                                }
                              }

                              i++; // Incrementa o contador do loop
                            }

                            // --- 5. Referências (sem alterações) ---
                            const referencias = [
                              new Paragraph({
                                text: "REFERÊNCIAS",
                                style: "TituloABNT", // Reutilizando
                                alignment: "left",
                                spacing: { before: 400, after: 200 },
                              }),
                              new Paragraph({
                                text: "Exemplo: AUTOR, A. Título do livro. Edição. Local: Editora, ano.",
                                style: "ReferenciaABNT",
                              }),
                            ];

                            // --- 6. Montagem do Documento (Modificada) ---
                            const doc = new Document({
                              styles: {
                                // Estilos de parágrafo ABNT
                                paragraphStyles: [
                                  {
                                    id: "NormalABNT",
                                    name: "Normal ABNT",
                                    basedOn: "Normal",
                                    next: "NormalABNT",
                                    quickFormat: true,
                                    run: { font: "Arial", size: 24 }, // 12pt
                                    paragraph: {
                                      spacing: { line: 360 },
                                      alignment: "both",
                                    }, // 1.5 e justificado
                                  },
                                  {
                                    id: "TituloABNT",
                                    name: "Título ABNT",
                                    basedOn: "NormalABNT",
                                    next: "NormalABNT",
                                    quickFormat: true,
                                    run: {
                                      font: "Arial",
                                      size: 32,
                                      bold: true,
                                    }, // 16pt
                                    paragraph: {
                                      spacing: { after: 240, line: 360 },
                                      alignment: "center",
                                    },
                                  },
                                  {
                                    id: "SubtituloABNT",
                                    name: "Subtítulo ABNT",
                                    basedOn: "NormalABNT",
                                    next: "NormalABNT",
                                    quickFormat: true,
                                    run: {
                                      font: "Arial",
                                      size: 28,
                                      bold: true,
                                    }, // 14pt
                                    paragraph: {
                                      spacing: { after: 120, line: 360 },
                                      alignment: "left",
                                    },
                                  },
                                  {
                                    id: "CitacaoLongaABNT",
                                    name: "Citação Longa ABNT",
                                    basedOn: "NormalABNT",
                                    next: "NormalABNT",
                                    quickFormat: true,
                                    run: { font: "Arial", size: 20 }, // 10pt
                                    paragraph: {
                                      indent: { left: 2268 },
                                      spacing: { line: 240 },
                                      alignment: "both",
                                    }, // Recuo 4cm, espaço 1.0
                                  },
                                  {
                                    id: "CitacaoCurtaABNT",
                                    name: "Citação Curta ABNT",
                                    basedOn: "NormalABNT",
                                    next: "NormalABNT",
                                    quickFormat: true,
                                    run: {
                                      font: "Arial",
                                      size: 24,
                                      italics: true,
                                    }, // 12pt
                                    paragraph: {
                                      spacing: { line: 360 },
                                      alignment: "both",
                                    },
                                  },
                                  {
                                    id: "ReferenciaABNT",
                                    name: "Referência ABNT",
                                    basedOn: "NormalABNT",
                                    next: "ReferenciaABNT",
                                    quickFormat: true,
                                    run: { font: "Arial", size: 20 }, // 10pt
                                    paragraph: {
                                      spacing: { line: 240 },
                                      alignment: "both",
                                    }, // Espaço 1.0
                                  },
                                ],
                              },
                              sections: [
                                {
                                  properties: {
                                    // Propriedades de margem ABNT
                                    page: {
                                      margin: {
                                        top: 1701, // 3cm
                                        left: 1701, // 3cm
                                        bottom: 1134, // 2cm
                                        right: 1134, // 2cm
                                      },
                                    },
                                  },
                                  // Conteúdo do documento
                                  children: [
                                    ...coverPageParagraphs, // 1. Adiciona a Capa
                                    ...mainContentParagraphs, // 2. Adiciona o Conteúdo Principal (com tabelas)
                                    new Paragraph({
                                      text: "",
                                      style: "NormalABNT",
                                    }),
                                    ...referencias, // 3. Adiciona as Referências
                                  ],
                                },
                              ],
                            });

                            // --- 7. Salvar o arquivo (sem alterações) ---
                            const blob = await Packer.toBlob(doc);
                            saveAs(
                              blob,
                              `relatorio-vestibuline-${new Date().toISOString().split("T")[0]}.docx`,
                            );
                          }}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-200
                      ${
                        theme === "dark"
                          ? "bg-[#0A84FF]/20 hover:bg-[#0A84FF]/30 text-[#0A84FF] border border-[#0A84FF]/30"
                          : "bg-[#0A84FF]/10 hover:bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30"
                      }
                    `}
                          title="Baixar relatório"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Exportar
                        </button>

                        {/* Botão voltar */}
                        <button
                          onClick={() => setReportType("simples")}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-200
                      ${
                        theme === "dark"
                          ? "bg-[#2c2c2e] hover:bg-[#3a3a3c] text-gray-200 border border-white/10"
                          : "bg-white hover:bg-gray-100 text-gray-800 border border-black/10"
                      }
                    `}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                          </svg>
                          Voltar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        theme={theme}
      />
    </TabsContent>
  );
};
export default StatsUser;
