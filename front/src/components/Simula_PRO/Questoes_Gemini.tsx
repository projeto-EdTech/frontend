"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BookOpen, CheckCircle, AlertCircle, BotMessageSquare } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import 'katex/dist/katex.min.css'

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
  universityLogoUrl // <-- 2. RECEBEMOS A NOVA PROP AQUI
}) => {
  const { data: session, status } = useSession();
  
  // Estado para rastrear quantas vezes o usuário FREE já usou a IA (máximo 5)
  const [freeUsageCount, setFreeUsageCount] = useState<number>(() => {
    // Recupera do localStorage se existir
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('freeAIUsageCount');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const MAX_FREE_USES = 5;
  const remainingFreeUses = MAX_FREE_USES - freeUsageCount;
  const hasExceededFreeLimit = freeUsageCount >= MAX_FREE_USES;

  // Salvar no localStorage quando o contador mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('freeAIUsageCount', freeUsageCount.toString());
    }
  }, [freeUsageCount]);

  // Função para incrementar o uso quando a IA for chamada
  const handleAIUsage = () => {
    if (session?.user?.tier === 'FREE') {
      setFreeUsageCount(prev => prev + 1);
    }
  };

  // Normalizar universityLogoUrl para uso seguro em next/image
  const normalizeLogoUrl = (url?: string | null) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed === '') return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) return trimmed;
    return '/' + trimmed;
  };

  const normalizedUniversityLogoUrl = normalizeLogoUrl(universityLogoUrl ?? null);

  // Chave utilitária para persistência por questão
  const getExplanationKey = (subject: string, questionId: string | undefined) => {
    return `gemini:explanation:${subject}:${questionId ?? 'unknown'}`;
  };

  // Carregar explicação salva ao trocar de questão/assunto
  useEffect(() => {
    const currentGroup = groupedQuestions.get(selectedSubject);
    const questionToDisplay = currentGroup ? currentGroup[currentQuestionIndex] : null;
    if (!questionToDisplay) {
      setExplanation('');
      return;
    }
    try {
      const key = getExplanationKey(selectedSubject, questionToDisplay.id);
      const saved = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
      if (saved && saved.length > 0) {
        setExplanation(saved);
      } else {
        setExplanation('');
      }
    } catch {
      // noop
      setExplanation('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, currentQuestionIndex]);

  // Salvar explicação quando for atualizada
  useEffect(() => {
    const currentGroup = groupedQuestions.get(selectedSubject);
    const questionToDisplay = currentGroup ? currentGroup[currentQuestionIndex] : null;
    if (!questionToDisplay) return;
    try {
      const key = getExplanationKey(selectedSubject, questionToDisplay.id);
      if (typeof window !== 'undefined') {
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
    if (status === 'authenticated' && session?.user?.tier === 'FREE' && hasExceededFreeLimit) {
      setShowUpgradeModal(true);
    }
  }, [status, session?.user?.tier, hasExceededFreeLimit]);
  return (
    <div className="w-full max-w-6xl mx-auto space-y-5">
      {/* Header Card Modernizado com Mascote */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 border border-blue-100/40 rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5"></div>
        
        {/* Mascote no canto superior direito */}
        <div className="absolute top-0 right-0 w-28 h-28 opacity-80 hover:opacity-100 transition-opacity duration-300">
          <Image 
            src="/Mascote/banners/Camaleão_34.png" 
            alt="Mascote SimulaVest" 
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
            {status === 'authenticated' && session?.user?.tier === 'FREE' && (
              <div className={`flex items-center gap-2 px-3.5 py-2 rounded-lg shadow-sm ${
                remainingFreeUses > 2 
                  ? 'bg-green-100/80 border border-green-300/60' 
                  : remainingFreeUses > 0 
                  ? 'bg-yellow-100/80 border border-yellow-300/60' 
                  : 'bg-red-100/80 border border-red-300/60'
              } backdrop-blur-sm`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={
                  remainingFreeUses > 2 ? '#16a34a' : remainingFreeUses > 0 ? '#eab308' : '#dc2626'
                } strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <div className="text-[13px]">
                  <div className={`font-semibold ${
                    remainingFreeUses > 2 ? 'text-green-700' : remainingFreeUses > 0 ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {remainingFreeUses} uso{remainingFreeUses !== 1 ? 's' : ''} gratuito{remainingFreeUses !== 1 ? 's' : ''}
                  </div>
                  <div className="text-gray-600 text-[11px]">restante{remainingFreeUses !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )}
          </div>
          <span className="text-gray-700/90 text-[15px]">
            Nossa IA analisa seu erro e fornece explicações detalhadas personalizadas para acelerar seu aprendizado.
          </span>
        </div>
      </div>

      {/* Selector Card Melhorado */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <BookOpen size={14} className="text-white" strokeWidth={2} />
          </div>
          <label htmlFor="question-select" className="text-base font-semibold text-emerald-600 tracking-tight">
            Escolha o tópico para revisar
          </label>
        </div>
        
        <div className="relative">
          <select
            id="question-select"
            className="w-full p-3.5 border border-gray-200 rounded-lg shadow-sm focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all duration-300 text-gray-700 font-medium appearance-none cursor-pointer text-[15px]"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setCurrentQuestionIndex(0);
            }}
          >
            {groupedQuestions.size === 0 ? (
              <option>Nenhuma questão para revisar</option>
            ) : (
              Array.from(groupedQuestions.keys()).map((subject) => (
                <option key={subject} value={subject}>
                  {subject} • {groupedQuestions.get(subject)?.length} questões disponíveis
                </option>
              ))
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {(() => {
        const currentGroup = groupedQuestions.get(selectedSubject);
        const questionToDisplay = currentGroup ? currentGroup[currentQuestionIndex] : null;

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
              <h3 className="text-lg font-semibold text-gray-700 mb-2 tracking-tight">Pronto para começar</h3>
              <p className="text-gray-500 max-w-md mx-auto text-[15px]">
                Selecione um tópico na lista acima para iniciar sua revisão personalizada com IA
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
                    <span className="text-white font-semibold text-[13px]">{currentQuestionIndex + 1}</span>
                  </div>
                  <h1 className="text-base font-semibold text-gray-800 tracking-tight">
                    Questão {currentQuestionIndex + 1} de {currentGroup?.length}
                  </h1>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[13px] font-medium text-blue-700">Em análise</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((currentQuestionIndex + 1) / (currentGroup?.length || 1)) * 100}%` }}
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
                    <span className="text-[15px] font-semibold text-red-700 tracking-tight">Sua Resposta</span>
                    <div className="text-red-600/80 text-[11px] font-medium">Precisa de revisão</div>
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3.5 border border-red-200/50 backdrop-blur-sm">
                  <div className="text-xl font-semibold text-red-800">{questionToDisplay.suaResposta}</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50/90 to-emerald-50/80 border border-green-200/60 rounded-xl p-5 transform hover:scale-[1.01] transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                    <CheckCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <span className="text-[15px] font-semibold text-green-700 tracking-tight">Gabarito</span>
                    <div className="text-green-600/80 text-[11px] font-medium">Resposta correta</div>
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3.5 border border-green-200/50 backdrop-blur-sm">
                  <div className="text-xl font-semibold text-green-800">{questionToDisplay.gabarito}</div>
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
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <BotMessageSquare size={20} />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-blue-800 tracking-tight">Análise Inteligente</span><br/>
                    <span className="text-blue-600 text-[13px] font-medium">Explicação personalizada da resolução</span>
                  </div>
                </div>

                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  handleSubmit();
                  handleAIUsage(); // Incrementa o contador de uso para usuários FREE
                }} className="space-y-5">
                  <button
                    type="submit"
                    disabled={isGenerating || !selectedSubject || (session?.user?.tier === 'FREE' && hasExceededFreeLimit)}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)] transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2.5">
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[15px]">Analisando com IA...</span>
                        </>
                      ) : hasExceededFreeLimit && session?.user?.tier === 'FREE' ? (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <span className="text-[15px]">Limite de Usos Gratuitos Atingido</span>
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                          </svg>
                          <span className="text-[15px]">
                            Gerar Explicação Inteligente
                            {session?.user?.tier === 'FREE' && remainingFreeUses > 0 && (
                              <span className="text-[13px] font-normal opacity-90"> ({remainingFreeUses} restante{remainingFreeUses !== 1 ? 's' : ''})</span>
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
                          <span className="text-[15px] font-semibold text-blue-800 tracking-tight">IA Analisando...</span>
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
                            <span className="text-lg font-semibold text-green-700 tracking-tight">Resolução Completa</span>
                            <div className="text-green-600/80 text-[13px] font-medium">Análise detalhada do raciocínio</div>
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
              const isLastQuestion = currentQuestionIndex >= currentGroup.length - 1;
              
              return (
                <div className="flex items-center justify-between pt-5">
                  {!isFirstQuestion && (
                    <button
                      onClick={() => {
                        setCurrentQuestionIndex((prev: number) => prev - 1);
                        setExplanation('');
                      }}
                      className="group flex items-center gap-2.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 px-5 py-2.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transform hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                        <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
                      </svg>
                      <span className="font-semibold text-[15px] text-gray-700 group-hover:text-blue-600 hover:shadow-blue-500/30 transition-colors duration-300">
                        Questão Anterior
                      </span>
                    </button>
                  )}
                  <div className={isFirstQuestion ? 'w-full' : ''}></div>
                  
                  {!isLastQuestion && (
                    <button
                      onClick={() => {
                        setCurrentQuestionIndex((prev: number) => prev + 1);
                        setExplanation('');
                      }}
                      className="group flex items-center gap-2.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30 text-white px-5 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transform hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                    >
                      <span className="font-semibold text-[15px]">Próxima Questão</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* Modal de Upgrade - Aparece quando usuário FREE esgota os usos gratuitos */}
      {showUpgradeModal && (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
        onClick={() => setShowUpgradeModal(false)}
      >
        <div 
          className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-500 border border-gray-100/60 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão de fechar animado */}
          <button
            onClick={() => setShowUpgradeModal(false)}
            className="absolute top-3 right-3 w-9 h-9 bg-white/80 hover:bg-red-500 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-110 hover:rotate-90 transition-all duration-300 z-10 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-white transition-colors duration-300">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Partículas decorativas flutuantes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <div className="absolute top-10 left-10 w-16 h-16 bg-purple-400/15 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-40 w-20 h-20 bg-cyan-400/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* Mascote incentivando o upgrade com animação */}
          <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 opacity-60 md:opacity-70 pointer-events-none">
            <Image 
              src="/Mascote/banners/Camaleão_26.png" 
              alt="Mascote incentivando upgrade" 
              width={160}
              height={160}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            {/* Badge com efeito de brilho */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-5 border border-purple-300/50 shadow-md animate-in slide-in-from-top duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-40 animate-pulse"></div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative text-yellow-600 animate-spin" style={{ animationDuration: '3s' }}>
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                  <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 tracking-tight">
                PLANO PREMIUM DISPONÍVEL
              </span>
            </div>

            {/* Título principal com gradiente estático */}
            <h2 className="text-2xl md:text-4xl font-bold mb-3 animate-in slide-in-from-bottom duration-700 tracking-tight" style={{ animationDuration: '700ms' }}>
              <span className="text-3xl md:text-4xl">🎓</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Você esgotou seus 5 usos gratuitos!
              </span>
            </h2>
            
            {/* Subtítulo */}
            <p className="text-base md:text-lg text-gray-700 mb-6 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: '200ms' }}>
              Você já utilizou seus <span className="font-semibold text-purple-600">5 análises gratuitas com IA</span>. Faça upgrade para <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">Simula PRO</span> e tenha acesso ilimitado! 🚀
            </p>

            {/* Lista de benefícios com cards animados */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 mb-6 shadow-md border border-purple-200/30 animate-in slide-in-from-bottom" style={{ animationDelay: '400ms', animationDuration: '500ms' }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center justify-center gap-2">
                <span className="animate-bounce">✨</span>
                <span>Com o Simula PRO você terá:</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-3xl mx-auto">
                {/* Benefício 1 */}
                <div className="group bg-gradient-to-br from-purple-50/90 to-purple-100/50 rounded-xl p-3.5 border border-purple-200/50 hover:border-purple-400 hover:shadow-lg transform hover:scale-[1.02] hover:-translate-y-0.5 transition-all animate-in slide-in-from-left" style={{ animationDelay: '600ms', animationDuration: '500ms' }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:animate-bounce">
                      <span className="text-lg">🔄</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800 mb-0.5 text-[15px] tracking-tight">Análises Ilimitadas</p>
                      <p className="text-[13px] text-gray-600">Explicações detalhadas por IA para todas as suas questões</p>
                    </div>
                  </div>
                </div>

                {/* Benefício 2 */}
                <div className="group bg-gradient-to-br from-blue-50/90 to-blue-100/50 rounded-xl p-3.5 border border-blue-200/50 hover:border-blue-400 hover:shadow-lg transform hover:scale-[1.02] hover:-translate-y-0.5 transition-all animate-in slide-in-from-right" style={{ animationDelay: '800ms', animationDuration: '500ms' }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:animate-bounce">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800 mb-0.5 text-[15px] tracking-tight">IA Personalizada</p>
                      <p className="text-[13px] text-gray-600">Análise do seu raciocínio e dicas personalizadas</p>
                    </div>
                  </div>
                </div>

                {/* Benefício 3 */}
                <div className="group bg-gradient-to-br from-cyan-50/90 to-cyan-100/50 rounded-xl p-3.5 border border-cyan-200/50 hover:border-cyan-400 hover:shadow-lg transform hover:scale-[1.02] hover:-translate-y-0.5 transition-all animate-in slide-in-from-left" style={{ animationDelay: '1000ms', animationDuration: '500ms' }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:animate-bounce">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800 mb-0.5 text-[15px] tracking-tight">Simulados Ilimitados</p>
                      <p className="text-[13px] text-gray-600">Acesso completo a questões e simulados exclusivos</p>
                    </div>
                  </div>
                </div>

                {/* Benefício 4 */}
                <div className="group bg-gradient-to-br from-indigo-50/90 to-indigo-100/50 rounded-xl p-3.5 border border-indigo-200/50 hover:border-indigo-400 hover:shadow-lg transform hover:scale-[1.02] hover:-translate-y-0.5 transition-all animate-in slide-in-from-right" style={{ animationDelay: '1200ms', animationDuration: '500ms' }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:animate-bounce">
                      <span className="text-lg">📊</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800 mb-0.5 text-[15px] tracking-tight">Conteúdo Premium</p>
                      <p className="text-[13px] text-gray-600">Materiais exclusivos e relatórios avançados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="space-y-3.5 animate-in slide-in-from-bottom" style={{ animationDelay: '1400ms', animationDuration: '500ms' }}>
              <button
                onClick={() => window.location.href = '/paidPlan'}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold text-base px-8 py-4 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-purple-500/40 transform hover:scale-[1.02] active:scale-95 transition-all duration-300 w-full md:w-auto mx-auto animate-pulse"
              >
                {/* Efeito de brilho deslizante */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {/* Partículas de energia */}
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75"></div>
                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
                
                <div className="relative flex items-center justify-center gap-2.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform duration-300">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                  </svg>
                  <span>Fazer Upgrade para PRO Agora</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </div>
              </button>

              {/* Texto secundário */}
              <p className="text-[13px] text-gray-600 flex items-center justify-center gap-2">
                <span className="animate-bounce">💰</span>
                <strong>Planos a partir de R$ 41,50/mês</strong>
                <span>•</span>
                <span>Cancele quando quiser</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default Gemini;