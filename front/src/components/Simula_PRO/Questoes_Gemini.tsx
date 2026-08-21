"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  BotMessageSquare,
  Sparkles,
  Infinity,
  Bot,
  Layout,
  BarChart3,
  ArrowRight,
  X,
  Target,
  Rocket,
  ChevronRight,
  Library,
  Activity,
  Cpu,
  GraduationCap,
  Headset,
  Lightbulb,
} from "lucide-react";
import { getMateriaVisual } from "@/components/games/Enigma/lib/enigma-data";
import { parseSubjectKey, buildSubjectTree } from "./subjectKey";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserTier } from "@/hooks/useUserTier";
import "katex/dist/katex.min.css";

// A interface da questão permanece a mesma
interface ReviewableQuestion {
  id: string;
  enunciado: string;
  suaResposta: string;
  gabarito: string;
  displayLabel: string;
  displaySubject: string;
}

// 1. ATUALIZAÇÃO: Adicionamos a nova prop `universityLogoUrl` à interface.
// Ela é opcional ('?' no final) para o caso de uma questão não ter um logo correspondente.
interface GeminiProps {
  groupedQuestions: Map<string, ReviewableQuestion[]>;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  explanation: string;
  setExplanation: (explanation: string) => void;
  isGenerating: boolean;
  handleSubmit: () => void;
  universityLogoUrl?: string | null; // <-- NOVA PROP ADICIONADA AQUI
}

const Gemini: React.FC<GeminiProps> = ({
  groupedQuestions,
  selectedSubject,
  setSelectedSubject,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  explanation,
  setExplanation,
  isGenerating,
  handleSubmit,
  universityLogoUrl, // <-- 2. RECEBEMOS A NOVA PROP AQUI
}) => {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const { isFree } = useUserTier();

  // Estado para rastrear quantas vezes o usuário FREE já usou a IA (máximo 5)
  const [freeUsageCount, setFreeUsageCount] = useState<number>(() => {
    // Recupera do localStorage se existir
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("freeAIUsageCount");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const MAX_FREE_USES = 5;
  const remainingFreeUses = MAX_FREE_USES - freeUsageCount;
  const hasExceededFreeLimit = freeUsageCount >= MAX_FREE_USES;

  // Salvar no localStorage quando o contador mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("freeAIUsageCount", freeUsageCount.toString());
    }
  }, [freeUsageCount]);

  // Função para incrementar o uso quando a IA for chamada
  const handleAIUsage = () => {
    if (isFree) {
      setFreeUsageCount((prev) => prev + 1);
    }
  };

  // Normalizar universityLogoUrl para uso seguro em next/image
  const normalizeLogoUrl = (url?: string | null) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed === "") return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("/")) return trimmed;
    return "/" + trimmed;
  };

  const normalizedUniversityLogoUrl = normalizeLogoUrl(
    universityLogoUrl ?? null,
  );

  // Chave utilitária para persistência por questão
  const getExplanationKey = (
    subject: string,
    questionId: string | undefined,
  ) => {
    return `gemini:explanation:${subject}:${questionId ?? "unknown"}`;
  };

  // Carregar explicação salva ao trocar de questão/assunto
  useEffect(() => {
    const currentGroup = groupedQuestions.get(selectedSubject);
    const questionToDisplay = currentGroup
      ? currentGroup[currentQuestionIndex]
      : null;
    if (!questionToDisplay) {
      setExplanation("");
      return;
    }
    try {
      const key = getExplanationKey(selectedSubject, questionToDisplay.id);
      const saved =
        typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
      if (saved && saved.length > 0) {
        setExplanation(saved);
      } else {
        setExplanation("");
      }
    } catch {
      // noop
      setExplanation("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, currentQuestionIndex]);

  // Salvar explicação quando for atualizada
  useEffect(() => {
    const currentGroup = groupedQuestions.get(selectedSubject);
    const questionToDisplay = currentGroup
      ? currentGroup[currentQuestionIndex]
      : null;
    if (!questionToDisplay) return;
    try {
      const key = getExplanationKey(selectedSubject, questionToDisplay.id);
      if (typeof window !== "undefined") {
        if (explanation && explanation.length > 0) {
          sessionStorage.setItem(key, explanation);
        } else {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // noop
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explanation]);

  // Estado para controlar a visibilidade do modal de upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Mostrar o modal quando o usuário FREE exceder o limite
  useEffect(() => {
    if (status === "authenticated" && isFree && hasExceededFreeLimit) {
      setShowUpgradeModal(true);
    }
  }, [status, isFree, hasExceededFreeLimit]);

  // ---------------------------------------------------------------------------
  // Seleção Matéria → Conteúdo (modal + dropdown)
  // A chave composta `selectedSubject` ("Matéria — Conteúdo") mantém a mesma
  // semântica; aqui apenas derivamos a árvore de 2 níveis para a UI.
  // ---------------------------------------------------------------------------
  const [isMateriaModalOpen, setIsMateriaModalOpen] = useState(false);

  const subjectTree = useMemo(
    () => buildSubjectTree(groupedQuestions),
    [groupedQuestions],
  );

  const selectedMateria = useMemo(
    () => parseSubjectKey(selectedSubject).materia,
    [selectedSubject],
  );

  const conteudosDaMateria = subjectTree.get(selectedMateria)?.conteudos ?? [];
  const materiaVisual = getMateriaVisual(selectedMateria);

  // Ao escolher uma matéria no modal: fecha e auto-seleciona o 1º conteúdo dela.
  const handleSelectMateria = (materia: string) => {
    const node = subjectTree.get(materia);
    const first = node?.conteudos[0];
    if (first) {
      setSelectedSubject(first.fullKey);
      setCurrentQuestionIndex(0);
    }
    setIsMateriaModalOpen(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5">
      {/* Header Card Modernizado com Mascote */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 border border-blue-100/40 rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5"></div>

        {/* Mascote no canto superior direito */}
        <div className="absolute top-0 right-0 w-28 h-28 opacity-80 hover:opacity-100 transition-opacity duration-300">
          <Image
            src="/Mascote/banners/Camaleão_34.png"
            alt="Mascote Vestibuline"
            width={112}
            height={112}
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-300">
              <AlertCircle size={20} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <span className="text-xl font-semibold text-blue-800 tracking-tight">
                Revisão com IA Personalizada
              </span>
              <br />
              <span className="text-blue-600/80 text-[13px] font-medium">
                Análise inteligente das suas dificuldades
              </span>
            </div>

            {/* Badge de usos restantes para usuários FREE */}
            {status === "authenticated" && isFree && (
              <div
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg shadow-sm ${
                  remainingFreeUses > 2
                    ? "bg-green-100/80 border border-green-300/60"
                    : remainingFreeUses > 0
                      ? "bg-yellow-100/80 border border-yellow-300/60"
                      : "bg-red-100/80 border border-red-300/60"
                } backdrop-blur-sm`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={
                    remainingFreeUses > 2
                      ? "#16a34a"
                      : remainingFreeUses > 0
                        ? "#eab308"
                        : "#dc2626"
                  }
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <div className="text-[13px]">
                  <div
                    className={`font-semibold ${
                      remainingFreeUses > 2
                        ? "text-green-700"
                        : remainingFreeUses > 0
                          ? "text-yellow-700"
                          : "text-red-700"
                    }`}
                  >
                    {remainingFreeUses} uso{remainingFreeUses !== 1 ? "s" : ""}{" "}
                    gratuito{remainingFreeUses !== 1 ? "s" : ""}
                  </div>
                  <div className="text-gray-600 text-[11px]">
                    restante{remainingFreeUses !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            )}
          </div>
          <span className="text-gray-700/90 text-[15px]">
            Nossa IA analisa seu erro e fornece explicações detalhadas
            personalizadas para acelerar seu aprendizado.
          </span>
        </div>
      </div>

      {/* Selector Card Melhorado */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <BookOpen size={14} className="text-white" strokeWidth={2} />
          </div>
          <label
            htmlFor="question-select"
            className="text-base font-semibold text-emerald-600 tracking-tight"
          >
            Escolha o tópico para revisar
          </label>
        </div>

        {groupedQuestions.size === 0 ? (
          <div className="w-full p-3.5 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-500 font-medium text-[15px]">
            Nenhuma questão para revisar
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Coluna 1 — Matéria (abre modal) */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-500 mb-1.5">
                1. Matéria
              </label>
              <button
                type="button"
                onClick={() => setIsMateriaModalOpen(true)}
                className="w-full flex items-center gap-2.5 p-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50 hover:bg-white hover:border-emerald-400 transition-all duration-300 cursor-pointer text-left"
              >
                <span className="flex-shrink-0 w-9 h-9 !bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 text-lg leading-none">
                  {materiaVisual ? (
                    <span style={{ color: materiaVisual.colorHex }}>
                      {materiaVisual.icon}
                    </span>
                  ) : (
                    <BookOpen size={16} className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-gray-700 truncate">
                    {selectedMateria || "Escolher matéria"}
                  </span>
                  <span className="block text-[12px] text-gray-400">
                    {subjectTree.size} matéria
                    {subjectTree.size !== 1 ? "s" : ""} disponíve
                    {subjectTree.size !== 1 ? "is" : "l"}
                  </span>
                </span>
                <ChevronRight
                  size={16}
                  className="text-gray-400 flex-shrink-0"
                />
              </button>
            </div>

            {/* Coluna 2 — Conteúdo (dropdown filtrado pela matéria) */}
            <div>
              <label
                htmlFor="conteudo-select"
                className="block text-[13px] font-semibold text-gray-500 mb-1.5"
              >
                2. Conteúdo
              </label>
              <div className="relative">
                <select
                  id="conteudo-select"
                  disabled={!selectedMateria || conteudosDaMateria.length === 0}
                  className="w-full p-3 pr-9 border border-gray-200 rounded-lg shadow-sm focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all duration-300 text-gray-700 font-medium appearance-none cursor-pointer text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentQuestionIndex(0);
                  }}
                >
                  {conteudosDaMateria.length === 0 ? (
                    <option value="">Selecione uma matéria</option>
                  ) : (
                    conteudosDaMateria.map((c) => (
                      <option key={c.fullKey} value={c.fullKey}>
                        {c.conteudo} • {c.count}{" "}
                        {c.count === 1 ? "questão" : "questões"}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {(() => {
        const currentGroup = groupedQuestions.get(selectedSubject);
        const questionToDisplay = currentGroup
          ? currentGroup[currentQuestionIndex]
          : null;

        if (!questionToDisplay) {
          return (
            <div className="relative text-center py-14 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              {/* Mascote animado esperando */}
              <div className="w-28 h-28 mx-auto mb-5 animate-bounce">
                <Image
                  src="/Mascote/banners/Camaleão_5.png"
                  alt="Mascote aguardando"
                  width={112}
                  height={112}
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2 tracking-tight">
                Pronto para começar
              </h3>
              <p className="text-gray-500 max-w-md mx-auto text-[15px]">
                Selecione um tópico na lista acima para iniciar sua revisão
                personalizada com IA
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Question Progress */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-[13px]">
                      {currentQuestionIndex + 1}
                    </span>
                  </div>
                  <h1 className="text-base font-semibold text-gray-800 tracking-tight">
                    Questão {currentQuestionIndex + 1} de {currentGroup?.length}
                  </h1>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[13px] font-medium text-blue-700">
                    Em análise
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${((currentQuestionIndex + 1) / (currentGroup?.length || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question Card Modernized */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-start gap-3.5 mb-5">
                {normalizedUniversityLogoUrl && (
                  <div className="flex-shrink-0 w-11 h-11 !bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-200 p-1">
                    <Image
                      src={normalizedUniversityLogoUrl}
                      alt="Logo da universidade"
                      className="object-contain h-full w-full"
                      width={44}
                      height={44}
                    />
                  </div>
                )}

                {/* O restante do conteúdo (título e enunciado) continua aqui */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base font-bold text-blue-600 uppercase tracking-wide">
                      {questionToDisplay.displayLabel}
                    </span>
                    <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[11px] font-semibold">
                      {questionToDisplay.displaySubject}
                    </div>
                  </div>
                  <div className="text-gray-700 text-base leading-relaxed font-medium">
                    {questionToDisplay.enunciado}
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Comparison Cards (sem alterações) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-50/90 to-pink-50/80 border border-red-200/60 rounded-xl p-5 transform hover:scale-[1.01] transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                    <AlertCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <span className="text-[15px] font-semibold text-red-700 tracking-tight">
                      Sua Resposta
                    </span>
                    <div className="text-red-600/80 text-[11px] font-medium">
                      Precisa de revisão
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3.5 border border-red-200/50 backdrop-blur-sm">
                  <div className="text-xl font-semibold text-red-800">
                    {questionToDisplay.suaResposta}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50/90 to-emerald-50/80 border border-green-200/60 rounded-xl p-5 transform hover:scale-[1.01] transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                    <CheckCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <span className="text-[15px] font-semibold text-green-700 tracking-tight">
                      Gabarito
                    </span>
                    <div className="text-green-600/80 text-[11px] font-medium">
                      Resposta correta
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3.5 border border-green-200/50 backdrop-blur-sm">
                  <div className="text-xl font-semibold text-green-800">
                    {questionToDisplay.gabarito}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Section com Mascote */}
            <div className="relative bg-gradient-to-br from-blue-50/90 to-indigo-50/80 border border-blue-200/60 rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden backdrop-blur-sm">
              {/* Mascote pensativo no fundo */}
              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-15">
                <Image
                  src="/Mascote/banners/Camaleão_10.png"
                  alt="Mascote pensando"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md text-white">
                    <BotMessageSquare size={20} />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-blue-800 tracking-tight">
                      Análise Inteligente
                    </span>
                    <br />
                    <span className="text-blue-600 text-[13px] font-medium">
                      Explicação personalizada da resolução
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                    handleAIUsage(); // Incrementa o contador de uso para usuários FREE
                  }}
                  className="space-y-5"
                >
                  <button
                    type="submit"
                    disabled={
                      isGenerating ||
                      !selectedSubject ||
                      (session?.user?.tier === "FREE" && hasExceededFreeLimit)
                    }
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)] transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2.5">
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[15px]">
                            Analisando com IA...
                          </span>
                        </>
                      ) : hasExceededFreeLimit &&
                        session?.user?.tier === "FREE" ? (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <span className="text-[15px]">
                            Limite de Usos Gratuitos Atingido
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                          <span className="text-[15px]">
                            Gerar Explicação Inteligente
                            {session?.user?.tier === "FREE" &&
                              remainingFreeUses > 0 && (
                                <span className="text-[13px] font-normal opacity-90">
                                  {" "}
                                  ({remainingFreeUses} restante
                                  {remainingFreeUses !== 1 ? "s" : ""})
                                </span>
                              )}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                </form>

                {isGenerating && (
                  <div className="mt-6 animate-in fade-in duration-500">
                    <div className="relative bg-white/70 rounded-xl p-5 border border-blue-200/50 overflow-hidden backdrop-blur-sm">
                      {/* Mascote trabalhando */}
                      <div className="absolute right-4 top-10 -translate-y-1/2 w-20 h-20 opacity-60 animate-pulse">
                        <Image
                          src="/Mascote/banners/Camaleão_9.png"
                          alt="Mascote trabalhando"
                          width={80}
                          height={80}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-5">
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <span className="text-[15px] font-semibold text-blue-800 tracking-tight">
                            IA Analisando...
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          <div className="h-3.5 bg-blue-200/60 rounded-lg animate-pulse"></div>
                          <div className="h-3.5 bg-blue-200/40 rounded-lg animate-pulse w-5/6"></div>
                          <div className="h-3.5 bg-blue-200/60 rounded-lg animate-pulse"></div>
                          <div className="h-3.5 bg-blue-200/40 rounded-lg animate-pulse w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {explanation && !isGenerating && (
                  <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative bg-white rounded-xl p-6 border border-blue-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden backdrop-blur-sm">
                      {/* Mascote comemorando sucesso */}
                      <div className="absolute top-4 right-4 w-16 h-16 opacity-60 hover:opacity-90 transition-opacity duration-300">
                        <Image
                          src="/Mascote/banners/Camaleão_26.png"
                          alt="Mascote feliz"
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-5">
                          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                            <CheckCircle size={18} className="text-white" />
                          </div>
                          <div>
                            <span className="text-lg font-semibold text-green-700 tracking-tight">
                              Resolução Completa
                            </span>
                            <div className="text-green-600/80 text-[13px] font-medium">
                              Análise detalhada do raciocínio
                            </div>
                          </div>
                        </div>
                        <div className="prose prose-blue prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {explanation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation (sem alterações) */}
            {(() => {
              if (!currentGroup || currentGroup.length <= 1) return null;
              const isFirstQuestion = currentQuestionIndex === 0;
              const isLastQuestion =
                currentQuestionIndex >= currentGroup.length - 1;

              return (
                <div className="flex items-center justify-between pt-5">
                  {!isFirstQuestion && (
                    <button
                      onClick={() => {
                        setCurrentQuestionIndex((prev: number) => prev - 1);
                        setExplanation("");
                      }}
                      className="group flex items-center gap-2.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 px-5 py-2.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transform hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
                      >
                        <path d="M19 12H5" />
                        <path d="m12 19-7-7 7-7" />
                      </svg>
                      <span className="font-semibold text-[15px] text-gray-700 group-hover:text-blue-600 hover:shadow-blue-500/30 transition-colors duration-300">
                        Questão Anterior
                      </span>
                    </button>
                  )}
                  <div className={isFirstQuestion ? "w-full" : ""}></div>

                  {!isLastQuestion && (
                    <button
                      onClick={() => {
                        setCurrentQuestionIndex((prev: number) => prev + 1);
                        setExplanation("");
                      }}
                      className="group flex items-center gap-2.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30 text-white px-5 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transform hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                    >
                      <span className="font-semibold text-[15px]">
                        Próxima Questão
                      </span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* Modal de Seleção de Matéria — cards com ícone/cor do Enigma */}
      {isMateriaModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-[2px] bg-black/20"
          onClick={() => setIsMateriaModalOpen(false)}
        >
          <div
            className={`relative max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-[28px] p-6 md:p-8 animate-in fade-in zoom-in-100 duration-300 border ${
              theme === "dark"
                ? "bg-[#1C1C1E]/95 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                : "bg-white/95 border-white/50 shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
            } backdrop-blur-[50px]`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsMateriaModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-transparent hover:bg-red-200/50 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all duration-300 z-10 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h2
              className={`text-[19px] font-bold mb-1 tracking-tight ${theme === "dark" ? "text-white" : "text-gray-800"}`}
            >
              Escolha a matéria
            </h2>
            <p
              className={`text-[13px] mb-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              Selecione uma matéria para ver seus conteúdos para revisar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Array.from(subjectTree.entries()).map(([materia, node]) => {
                const visual = getMateriaVisual(materia);
                const isActive = materia === selectedMateria;
                return (
                  <button
                    key={materia}
                    type="button"
                    onClick={() => handleSelectMateria(materia)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer text-left ${
                      isActive
                        ? "border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-50/60"
                        : theme === "dark"
                          ? "border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/[0.06]"
                          : "border-gray-200 hover:border-emerald-300 bg-gray-50/50 hover:bg-white"
                    }`}
                  >
                    <span className="flex-shrink-0 w-10 h-10 !bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 text-xl leading-none">
                      {visual ? (
                        <span style={{ color: visual.colorHex }}>
                          {visual.icon}
                        </span>
                      ) : (
                        <BookOpen size={18} className="text-gray-400" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-[14.5px] font-semibold truncate ${
                          isActive
                            ? "text-emerald-700"
                            : theme === "dark"
                              ? "text-white/90"
                              : "text-gray-800"
                        }`}
                      >
                        {materia}
                      </span>
                      <span
                        className={`block text-[12px] ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {node.totalCount}{" "}
                        {node.totalCount === 1 ? "questão" : "questões"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upgrade - Aparece quando usuário FREE esgota os usos gratuitos */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-500 backdrop-blur-[1px]"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className={`relative max-w-xl w-full max-h-[90vh] overflow-y-auto ${
              theme === "dark"
                ? "bg-[#1C1C1E]/95 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                : "bg-white/90 border-white/50 shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
            } backdrop-blur-[50px] rounded-[32px] p-6 md:p-10 animate-in fade-in zoom-in-100 duration-500 ease-out border`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Brilho interno Liquid Glass Refinado */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr ${
                theme === "dark" ? "from-white/10" : "from-white"
              } to-transparent pointer-events-none rounded-[32px]`}
            ></div>
            {/* Botão de fechar nativo macOS style - Mais discreto */}
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-transparent hover:bg-red-200/50 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out z-10 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              {/* Título principal (SF Pro Bold) - Compacto */}
              <h2
                className={`text-[22px] md:text-[25px] font-bold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2 tracking-tight`}
              >
                Desbloqueie o Simula PRO
              </h2>

              {/* Subtítulo persuasivo - Compacto */}
              <p
                className={`text-[13px] ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-8 max-w-md mx-auto leading-relaxed`}
              >
                Você atingiu o limite gratuito. Tenha acesso a{" "}
                <span
                  className={`font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
                >
                  análises ilimitadas, IA exclusiva e banco completo.
                </span>
              </p>

              <div
                className={`w-full h-px ${theme === "dark" ? "bg-white/[0.05]" : "bg-black/[0.03]"} mb-10`}
              ></div>

              {/* Lista de benefícios (Compact Premium Glass Tiles) */}
              <div className="mb-8">
                <p
                  className={`text-[9px] font-bold ${theme === "dark" ? "text-gray-400" : "text-gray-500"} uppercase tracking-[0.2em] mb-4 text-center`}
                >
                  VANTAGENS EXCLUSIVAS DO SIMULA PRO
                </p>

                {/* Lista de benefícios (8 tópicos com ícones coloridos) */}
                <div className="mb-8 text-left max-w-2xl mx-auto px-4">
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
                      <div
                        key={index}
                        className="flex items-center gap-3 group"
                      >
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
              </div>

              <div
                className={`w-full h-px ${theme === "dark" ? "bg-white/[0.05]" : "bg-black/[0.03]"} mb-10`}
              ></div>

              {/* Botões de ação (High-End Commercial Style) */}
              <div
                className="flex flex-col items-center space-y-5 animate-in slide-in-from-bottom duration-300 ease-in-out"
                style={{ animationDelay: "300ms" }}
              >
                <button
                  onClick={() => (window.location.href = "/paidPlan")}
                  className="w-full bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold text-[14px] px-8 py-3.5 rounded-[12px] shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transform active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-blue-500/20"
                >
                  Garantir Simula PRO agora
                </button>

                {/* Trust signals e preço clear */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex items-center gap-3 text-[13px] ${theme === "dark" ? "text-gray-400" : "text-gray-500"} font-medium`}
                  >
                    <div
                      className={`flex items-center gap-1.5 ${theme === "dark" ? "bg-white/[0.05]" : "bg-gray-100"} px-2.5 py-1 rounded-lg`}
                    >
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span
                        className={`${theme === "dark" ? "text-gray-200" : "text-gray-700"} font-bold`}
                      >
                        R$ 41,50/mês
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span>Sem fidelidade</span>
                    </div>
                  </div>
                  <p
                    className={`text-[11px] ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Pagamento 100% seguro via Mercado pago ou PIX
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gemini;
