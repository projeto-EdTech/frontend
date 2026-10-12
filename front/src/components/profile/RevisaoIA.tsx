"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  BookOpen,
  BotMessageSquare,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import DynamicMarkdown from "@/components/Simula_PRO/DynamicMarkdown";
import { buildSubjectTree, parseSubjectKey } from "@/components/Simula_PRO/subjectKey";
import { useUserTier } from "@/hooks/useUserTier";
import { AI_QUOTA_HEADER, FREE_DAILY_EXPLANATIONS } from "@/lib/core/aiQuota";

export interface ReviewableQuestion {
  id: string;
  enunciado: string;
  suaResposta: string;
  gabarito: string;
  displayLabel: string;
  displaySubject: string;
}

interface RevisaoIAProps {
  groupedQuestions: Map<string, ReviewableQuestion[]>;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  universityLogoUrl?: string | null;
}

type Saldo = number | "unlimited" | null;

/** `next/image` exige URL absoluta ou caminho iniciado por `/`; o logo às vezes vem sem a barra. */
function normalizarLogo(url?: string | null): string | null {
  const limpo = url?.trim();
  if (!limpo) return null;
  if (/^https?:\/\//i.test(limpo) || limpo.startsWith("/")) return limpo;
  return `/${limpo}`;
}

/**
 * Revisão de questões com explicação do gabarito por IA — aba "Revisão" do perfil.
 *
 * Substitui o `Simula_PRO/Questoes_Gemini.tsx`, que nenhuma tela montava e que lia `isFree` de
 * `useUserTier()` — campo inexistente, então o FREE nunca batia no limite. Aqui a tela **não
 * decide** quem pode gerar: quem decide é `/api/generate-explanation`, pelo tier da sessão. A
 * tela só mostra o saldo que a rota devolve em `X-AI-Quota-Remaining` e a mensagem do 429.
 *
 * Explicação já gerada fica em memória por questão: voltar a uma questão não gasta cota de novo.
 */
export default function RevisaoIA({
  groupedQuestions,
  selectedSubject,
  setSelectedSubject,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  universityLogoUrl,
}: RevisaoIAProps) {
  const { isPro, loading: tierLoading } = useUserTier();
  const [explicacoes, setExplicacoes] = useState<Record<string, string>>({});
  const [gerandoChave, setGerandoChave] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [saldo, setSaldo] = useState<Saldo>(null);
  const abortRef = useRef<AbortController | null>(null);

  const arvore = useMemo(() => buildSubjectTree(groupedQuestions), [groupedQuestions]);
  const materiaAtual = parseSubjectKey(selectedSubject).materia;
  const conteudos = arvore.get(materiaAtual)?.conteudos ?? [];

  const grupo = groupedQuestions.get(selectedSubject) ?? [];
  const questao = grupo[currentQuestionIndex] ?? null;
  const chave = questao ? `${selectedSubject}::${questao.id}` : null;
  const explicacao = chave ? explicacoes[chave] ?? "" : "";
  const gerando = chave !== null && gerandoChave === chave;
  const logo = normalizarLogo(universityLogoUrl);

  // Trocar de questão ou sair da aba corta o streaming em andamento: o texto de uma questão não
  // pode continuar chegando na tela de outra.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, [chave]);

  const semSaldo = !isPro && saldo === 0;

  function selecionarMateria(materia: string) {
    const primeiro = arvore.get(materia)?.conteudos[0];
    if (!primeiro) return;
    setSelectedSubject(primeiro.fullKey);
    setCurrentQuestionIndex(0);
    setErro(null);
  }

  function irPara(indice: number) {
    setCurrentQuestionIndex(indice);
    setErro(null);
  }

  async function gerarExplicacao() {
    if (!questao || !chave) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setErro(null);
    setGerandoChave(chave);
    setExplicacoes((prev) => ({ ...prev, [chave]: "" }));

    try {
      // Sem Authorization: o cookie de sessão HttpOnly acompanha sozinho o fetch same-origin.
      const response = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enunciado: questao.enunciado, gabarito: questao.gabarito }),
        signal: controller.signal,
      });

      const saldoHeader = response.headers.get(AI_QUOTA_HEADER);
      if (saldoHeader !== null) {
        setSaldo(saldoHeader === "unlimited" ? "unlimited" : Number(saldoHeader));
      }

      if (!response.ok || !response.body) {
        const corpo = await response.json().catch(() => null);
        setErro(
          response.status === 401
            ? "Sua sessão expirou. Entre de novo para gerar explicações."
            : corpo?.error ?? "Não foi possível gerar a explicação agora. Tente novamente."
        );
        setExplicacoes((prev) => ({ ...prev, [chave]: "" }));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const pedaco = decoder.decode(value, { stream: true });
        setExplicacoes((prev) => ({ ...prev, [chave]: (prev[chave] ?? "") + pedaco }));
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") {
        // Texto pela metade não serve de explicação: a questão volta ao estado "não gerada".
        setExplicacoes((prev) => ({ ...prev, [chave]: "" }));
        return;
      }
      console.error("Erro ao buscar explicação:", e);
      setErro("Ocorreu um erro ao gerar a explicação. Tente novamente.");
    } finally {
      setGerandoChave((atual) => (atual === chave ? null : atual));
    }
  }

  if (groupedQuestions.size === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
        <BookOpen className="h-10 w-10 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-800">Nenhuma questão para revisar</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          As questões que você errar nos simulados aparecem aqui, com a explicação do gabarito
          gerada por IA.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-blue-800">Revisão com IA</h2>
            <p className="text-sm text-blue-600/80">
              Entenda o raciocínio que leva ao gabarito das questões que você errou.
            </p>
          </div>
          {!tierLoading && (
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                isPro
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : semSaldo
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {isPro
                ? "Simula PRO: sem limite"
                : typeof saldo === "number"
                  ? `${saldo} de ${FREE_DAILY_EXPLANATIONS} explicações restantes hoje`
                  : `Plano gratuito: ${FREE_DAILY_EXPLANATIONS} explicações por dia`}
            </span>
          )}
        </div>
      </div>

      {/* Seleção Matéria → Conteúdo */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="revisao-materia" className="block text-sm font-semibold text-gray-600 mb-1.5">
            Matéria
          </label>
          <select
            id="revisao-materia"
            value={materiaAtual}
            onChange={(e) => selecionarMateria(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500"
          >
            {[...arvore.entries()].map(([materia, node]) => (
              <option key={materia} value={materia}>
                {materia} • {node.totalCount} {node.totalCount === 1 ? "questão" : "questões"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="revisao-conteudo" className="block text-sm font-semibold text-gray-600 mb-1.5">
            Conteúdo
          </label>
          <select
            id="revisao-conteudo"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              irPara(0);
            }}
            disabled={conteudos.length === 0}
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 disabled:opacity-50"
          >
            {conteudos.map((c) => (
              <option key={c.fullKey} value={c.fullKey}>
                {c.conteudo} • {c.count} {c.count === 1 ? "questão" : "questões"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {questao && (
        <>
          {/* Enunciado */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3">
              <span className="text-sm font-semibold text-gray-500">
                Questão {currentQuestionIndex + 1} de {grupo.length}
              </span>
              <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex + 1) / grupo.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              {logo && (
                <div className="flex-shrink-0 w-11 h-11 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 p-1">
                  <Image
                    src={logo}
                    alt="Logo da universidade"
                    width={44}
                    height={44}
                    className="object-contain h-full w-full"
                  />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                    {questao.displayLabel}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                    {questao.displaySubject}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{questao.enunciado}</p>
              </div>
            </div>
          </div>

          {/* Sua resposta × gabarito */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold">
                <AlertCircle size={18} /> Sua resposta
              </div>
              <p className="text-lg font-semibold text-red-800">{questao.suaResposta}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2 text-green-700 font-semibold">
                <CheckCircle size={18} /> Gabarito
              </div>
              <p className="text-lg font-semibold text-green-800">{questao.gabarito}</p>
            </div>
          </div>

          {/* Explicação */}
          <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <BotMessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Explicação do gabarito</h3>
                <p className="text-sm text-blue-600">Gerada por IA — confira sempre com o seu material.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={gerarExplicacao}
              disabled={gerando || semSaldo}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {gerando
                ? "Analisando com IA..."
                : semSaldo
                  ? "Limite gratuito de hoje atingido"
                  : explicacao
                    ? "Gerar outra explicação"
                    : "Explicar o gabarito com IA"}
            </button>

            {erro && (
              <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}

            {gerando && !explicacao && (
              <div className="space-y-2.5" aria-hidden="true">
                <div className="h-3.5 bg-blue-100 rounded-lg animate-pulse" />
                <div className="h-3.5 bg-blue-100 rounded-lg animate-pulse w-5/6" />
                <div className="h-3.5 bg-blue-100 rounded-lg animate-pulse w-3/4" />
              </div>
            )}

            {explicacao && (
              <div className="prose prose-sm max-w-none text-gray-700" aria-live="polite">
                <DynamicMarkdown>{explicacao}</DynamicMarkdown>
              </div>
            )}
          </div>

          {/* Navegação */}
          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => irPara(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={18} /> Questão anterior
            </button>
            <button
              type="button"
              onClick={() => irPara(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex >= grupo.length - 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Próxima questão <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
