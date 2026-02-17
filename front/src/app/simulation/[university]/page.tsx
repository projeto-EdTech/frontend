"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Importe o CSS do KaTeX
import { type Question, type University } from "@/types/university";

import { useUniversityStorage } from "@/contexts/UniversityStorage";
import QuestionCarousel from '@/components/QuestionCarousel';
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";

interface ErroDetalhado {
  numero: number;
  enunciado: string;
  alternativaCorreta: string;
  alternativaEscolhida: string;
  tempoGasto: number;
  materia: string;
  conteudo: string;
  indiceAlternativaEscolhida: number | null;
  indiceAlternativaCorreta: number;
}

interface AcertoDetalhado {
  numero: number;
  enunciado: string;
  alternativaCorreta: string;
  indiceAlternativaCorreta: number;
  tempoGasto: number;
  materia: string;
  conteudo: string;
}

interface SummaryData {
  university: string;
  year: string | null;
  day: string;
  totalQuestions: number;
  timeSpent: number; // em segundos
  correctAnswers: number;
  wrongAnswers: number;
  successRate: number; // 0-100
  completedAt: string; // ISO
  materias: string[];
  conteudos: string[];
}

export default function SimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const examYear = searchParams.get("year");
  const { universities, loading: contextLoading } = useUniversityStorage();

  const universitySlug = Array.isArray(params.university)
    ? params.university[0]
    : params.university;
  // phase removido: agora fluxo usa somente year/day/time
  // Suporte a tempo ilimitado: se o param 'time' estiver ausente ou vazio, entramos no modo infinito
  const timeParam = searchParams.get("time");
  const isUnlimited = timeParam === null || timeParam === undefined || timeParam === "";
  // totalTime em minutos ou null quando ilimitado
  const totalTime: number | null = isUnlimited ? null : Number.parseInt(timeParam || "90");
  const day = searchParams.get("day") || "1";
  const currentUni = universities.find(u => u.slug === universitySlug);
  const numberOfQuestions = currentUni?.totalQuestions ?? Number.parseInt(searchParams.get("totalQuestions") || "3");
  const simIdParam = searchParams.get("simId");

  const storageKey = `simulation_progress_${universitySlug}_${examYear || 'any'}_${day || 'any'}_${simIdParam || 'none'}`;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  // timeRemaining em segundos; null representa infinito
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    totalTime === null ? null : totalTime * 60
  ); // Convert to seconds

  // Timestamp de início para calcular tempo gasto (compatível com modo ilimitado)
  const startTimestampRef = useRef<number>(Date.now());

  const [questions, setQuestions] = useState<Question[]>([]);

  // Track user answers dynamically based on number of questions
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  // currentUniversity state removed, using currentUni derived from context

  // Get university details da API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false); // <-- ADDED LOADING STATE

  // "Observa" o estado 'questions'.
  useEffect(() => {
    // Verificamos se 'questions' não está mais vazio.
    if (questions.length > 0) {
      // Atualizamos o estado 'userAnswers'.
      setUserAnswers(prev => {
        if (prev.length === questions.length) return prev;
        return new Array(questions.length).fill(null);
      });
    }
  }, [questions]);

  // Salvar progresso no localStorage
  useEffect(() => {
    if (questions.length > 0 && !isFinishing && !isLoading) {
      const elapsedSeconds = Math.round((Date.now() - startTimestampRef.current) / 1000);
      const stateToSave = {
        questions,
        userAnswers,
        currentQuestion,
        timeRemaining,
        elapsedSeconds,
        savedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [questions, userAnswers, currentQuestion, timeRemaining, isFinishing, isLoading, storageKey]);

  // Buscar dados (API + fallback local) filtrando por year & day
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const qRes = await fetch(
            `/api/questions/${universitySlug}?count=${numberOfQuestions}&year=${examYear || ""}&day=${day}`,
            { cache: "no-store" }
          );

        // Questões
        if (qRes.ok) {
          const qData: Question[] = await qRes.json();
          const dayNumber = Number(day);
          const filtered = qData.filter(
            (q) =>
              (!examYear || q.year === Number(examYear)) &&
              (isNaN(dayNumber) ? true : q.dia === dayNumber)
          );

          if (!cancelled) {
            if (filtered.length > 0) {
              setQuestions(filtered.slice(0, numberOfQuestions));
            } else {
              throw new Error("Sem questões disponíveis.");
            }
          }
        } else {
          throw new Error("Erro ao carregar questões da API.");
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Erro ao carregar dados."
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    (async () => {
      // --- INÍCIO DA NOVA LÓGICA ---
      try {
        // 0) Tentar recuperar progresso salvo no localStorage
        const savedProgressJSON = localStorage.getItem(storageKey);
        if (savedProgressJSON) {
          try {
            const savedState = JSON.parse(savedProgressJSON);
            // Validação básica
            if (savedState.questions && savedState.questions.length > 0) {
              console.log("Restaurando progresso do localStorage...");
              setQuestions(savedState.questions);
              setUserAnswers(savedState.userAnswers);
              setCurrentQuestion(savedState.currentQuestion);
              if (savedState.timeRemaining !== undefined) {
                setTimeRemaining(savedState.timeRemaining);
              }
              // Restaurar o tempo decorrido
              if (savedState.elapsedSeconds) {
                startTimestampRef.current = Date.now() - (savedState.elapsedSeconds * 1000);
              }

                // (University data sync logic removed as we depend on context for university info now)


              setIsLoading(false);
              return; // Interrompe para não buscar do zero
            }
          } catch (e) {
            console.error("Erro ao restaurar progresso salvo:", e);
            localStorage.removeItem(storageKey);
          }
        }

        // 1) Se houver simId via query param, tentamos buscar no store do servidor
        const simId = searchParams.get('simId');
        if (simId) {
          console.log('SimulationPage: simId detected in URL=', simId, 'fetching stored sim...');
          try {
            const res = await fetch(`/api/simulations/${simId}`, { cache: 'no-store' });
            if (res.ok) {
              const stored = await res.json();
              console.log('SimulationPage: fetched stored sim length=', Array.isArray(stored) ? stored.length : 'not-array');
              setQuestions(stored);
              // (University data sync removed)

              setIsLoading(false);
              return;
            } else {
              console.warn('SimulationPage: stored sim not found or expired, status=', res.status);
            }
          } catch (fetchErr) {
            console.warn('SimulationPage: error fetching stored sim by id', fetchErr);
          }
        }

        // 2) fallback: check sessionStorage (back-compat)
        console.log('SimulationPage: checking sessionStorage for personalizedSimulationQuestions');
        const personalizedQuestionsJSON = sessionStorage.getItem('personalizedSimulationQuestions');

        if (personalizedQuestionsJSON) {
          console.log('SimulationPage: personalizedSimulationQuestions found in sessionStorage');
          try {
            const personalizedQuestions = JSON.parse(personalizedQuestionsJSON);
            console.log('SimulationPage: parsed personalized questions length=', Array.isArray(personalizedQuestions) ? personalizedQuestions.length : 'not-array');
            setQuestions(personalizedQuestions);
            // (University data sync removed)

            try { sessionStorage.removeItem('personalizedSimulationQuestions'); } catch { /* ignore */ }
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Erro ao processar a prova personalizada do sessionStorage:', e);
            try { sessionStorage.removeItem('personalizedSimulationQuestions'); } catch { /* ignore */ }
          }
        }
      } catch (storageErr) {
        console.warn('SimulationPage: sessionStorage unavailable or threw error', storageErr);
      }

      // Se não encontramos sim personalizada, segue o fluxo normal
      if (!universitySlug) {
        setIsLoading(false);
        setError("Universidade não especificada.");
        return;
      }

      await fetchData();
    })();

    return () => {
      cancelled = true;
    };
  }, [universitySlug, examYear, day, numberOfQuestions, searchParams]);

  // Função para salvar resultado (declarada cedo para uso em handleFinishExam)
  const saveResultToBackend = useCallback(
    async (summaryData: SummaryData, errorsData: ErroDetalhado[], acertosData: AcertoDetalhado[]) => {
      try {
        const response = await fetch("/api/simulations/save-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            summary: summaryData, 
            errors: errorsData,
            acertos: acertosData 
          }),
        });
        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.error || "Falha ao salvar resultado no backend.");
        }
        const successResult = await response.json();
        console.log("Resultado salvo com sucesso no backend:", successResult);
      } catch (error) {
        console.error("Erro ao tentar salvar o resultado automaticamente:", error);
      }
    },
    []
  );

  // Função de finalização (declarada antes de timer para evitar closure stale)
  const handleFinishExam = useCallback(async () => {
    setIsFinishing(true);
    console.log("Finalizando o simulado...");
    const finalUserAnswers = [...userAnswers];
    finalUserAnswers[currentQuestion] = selectedAnswer;

    const finalErrosDetalhados: ErroDetalhado[] = [];
    const finalAcertosDetalhados: AcertoDetalhado[] = [];

    finalUserAnswers.forEach((userAnswer, index) => {
      const question = questions[index];
      const isCorrect = userAnswer === question.correctAnswer;
      const textoDoEnunciado = typeof question.text === "string" ? question.text : question.text.principal;
      
      if (!isCorrect) {
        finalErrosDetalhados.push({
          numero: index + 1,
          enunciado: textoDoEnunciado,
          alternativaCorreta: question.options[question.correctAnswer],
          indiceAlternativaCorreta: question.correctAnswer,
          alternativaEscolhida: userAnswer !== null ? question.options[userAnswer] : "Não respondida",
          indiceAlternativaEscolhida: userAnswer,
          tempoGasto: 0,
          materia: question.materia?.join(", ") || "Não especificada",
          conteudo: question.conteudo?.join(", ") || "Não especificado",
        });
      } else {
        finalAcertosDetalhados.push({
          numero: index + 1,
          enunciado: textoDoEnunciado,
          alternativaCorreta: question.options[question.correctAnswer],
          indiceAlternativaCorreta: question.correctAnswer,
          tempoGasto: 0,
          materia: question.materia?.join(", ") || "Não especificada",
          conteudo: question.conteudo?.join(", ") || "Não especificado",
        });
      }
    });

    const correctAnswers: number = finalUserAnswers.reduce(
      (acc: number, ans, idx) => (ans !== null && ans === questions[idx].correctAnswer ? acc + 1 : acc),
      0
    );
    const wrongAnswers: number = questions.length - correctAnswers;
    const successRate: number = questions.length ? Math.round((correctAnswers / questions.length) * 100) : 0;

    // calcula tempo gasto com base no timestamp de início (compatível com ilimitado)
    const elapsedSeconds = Math.round((Date.now() - startTimestampRef.current) / 1000);

    const summaryData: SummaryData = {
      university: String(universitySlug),
      year: examYear,
      day,
      totalQuestions: questions.length,
      timeSpent: elapsedSeconds,
      correctAnswers,
      wrongAnswers,
      successRate,
      completedAt: new Date().toISOString(),
      materias: Array.from(new Set(questions.flatMap((q) => q.materia).filter(Boolean))),
      conteudos: Array.from(new Set(questions.flatMap((q) => q.conteudo).filter(Boolean))),
    };

    // Limpar o progresso salvo ao finalizar
    localStorage.removeItem(storageKey);

    sessionStorage.setItem("simulationSummary", JSON.stringify(summaryData));
    sessionStorage.setItem("simulationErrors", JSON.stringify(finalErrosDetalhados));
    sessionStorage.setItem("simulationCorrect", JSON.stringify(finalAcertosDetalhados));
    await saveResultToBackend(summaryData, finalErrosDetalhados, finalAcertosDetalhados);
    router.push(`/simulation/${universitySlug}/summary?year=${examYear || ""}&day=${day}`);
  }, [userAnswers, currentQuestion, selectedAnswer, questions, universitySlug, examYear, day, saveResultToBackend, router]);

  // Timer effect (adaptive) usando handleFinishExam memoizado
  useEffect(() => {
    // se ilimitado, não cria timer
    if (timeRemaining === null) return;

    if (timeRemaining <= 0) return;
    const updateInterval = timeRemaining < 3600 ? 1000 : 60000;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        const dec = prev < 3600 ? 1 : 60;
        return prev - dec;
      });
    }, updateInterval);
    return () => clearInterval(timer);
  }, [timeRemaining, handleFinishExam]);

  // (efeito de reset de tempo por questão removido)

  // Format time adaptively (memoized)
  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null) return "♾";
    if (seconds < 3600) {
      // Less than 1 hour - show minutes:seconds
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    } else {
      // 1 hour or more - show hours:minutes
      const totalMinutes = Math.floor(seconds / 60);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}:${mins.toString().padStart(2, "0")}`;
    }
  }, []);

  // Get timer unit adaptively (memoized)
  const getTimerUnit = useCallback((seconds: number | null) => {
    if (seconds === null) return ""; // sem unidade quando infinito
    return seconds < 3600 ? "min" : "Horas";
  }, []);

  const handleNextQuestion = useCallback(
    async () => {
      // Salva a resposta da questão atual
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestion] = selectedAnswer;
      setUserAnswers(newUserAnswers);

      // Se NÃO for a última questão, avança normalmente
      if (currentQuestion < questions.length - 1) {
        // (captura detalhada de erros removida)
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(newUserAnswers[currentQuestion + 1]);
      } 
      // Se FOR a última questão, chama a função de finalizar
      else {
        await handleFinishExam();
      }
    },
    [currentQuestion, selectedAnswer, userAnswers, questions, handleFinishExam]
  );

  const handlePreviousQuestion = useCallback(() => {
    // 1. Salva a resposta da questão atual antes de voltar
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    // 2. Verifica se não estamos na primeira questão
    if (currentQuestion > 0) {
      const previousQuestionIndex = currentQuestion - 1;
      
      // 3. Atualiza o estado para a questão anterior
      setCurrentQuestion(previousQuestionIndex);
      
      // 4. Carrega a resposta que o usuário deu para a questão anterior
      setSelectedAnswer(newUserAnswers[previousQuestionIndex]);
    }
  }, [currentQuestion, selectedAnswer, userAnswers]);

  const handleQuestionJump = useCallback(
    (targetIndex: number) => {
      // 1. Salva a resposta da questão atual antes de pular
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestion] = selectedAnswer;
      setUserAnswers(newUserAnswers);

      // 2. Verifica se o índice alvo é válido
      if (targetIndex >= 0 && targetIndex < questions.length) {
        // 3. Atualiza o estado para a questão alvo
        setCurrentQuestion(targetIndex);
        
        // 4. Carrega a resposta que o usuário deu para a questão alvo
        setSelectedAnswer(newUserAnswers[targetIndex]);
      }
    },
    [currentQuestion, selectedAnswer, userAnswers, questions.length]
  );

  // Feedback do carregamento e erro
  if (isLoading || contextLoading) {
    return (
      <LoadingScreen message="Carregando Prova..." />
    );
  }

  if (error || (!currentUni && !contextLoading)) {
    return <div className="min-h-screen flex justify-center items-center text-red-500">Erro: {error || "Dados da universidade não encontrados."}</div>;
  }

  if (isFinishing) {
    return (
      <LoadingScreen message="Finalizando Resultado..." />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header component */}
      <Header />

      {/* Main content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Main content */}
          <div className="flex-1">
            {/* Exam header */}
            <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8 relative overflow-hidden">
              {/* Mascote de boas-vindas - canto superior direito */}
              <div className="absolute top-5 right-75 z-10 hidden sm:block">
                <Image 
                  src="/Mascote/banners/Camaleão_24.png" 
                  alt="Mascote Vestibuline"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-90 hover:opacity-100 transition-opacity"
                  width={100}
                  height={100}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
                  {/* Logo da universidade */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-blue-400 rounded-xl sm:rounded-2xl blur-lg opacity-30 transform rotate-1"></div>
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center !bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
                      <Image 
                        src={
                          currentUni && currentUni.logo
                            ? (currentUni.logo.startsWith('/')
                                ? currentUni.logo
                                : `/${currentUni.logo}`)
                            : "/placeholder.svg"
                        }
                        alt={currentUni?.name || "Universidade"} 
                        width={50} 
                        height={50} 
                        className="sm:w-12 sm:h-12 w-8 h-8 object-contain rounded-lg sm:rounded-xl" 
                      />
                    </div>
                  </div>
                  
                  {/* Nome e ano da universidade */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                      {currentUni?.name} {examYear}
                    </h1>
                  </div>
                </div>
                
                {/* Timer */}
                <div className="bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base w-full sm:w-auto text-center">
                  <span className="block sm:inline">Tempo restante: </span>
                  <span className="font-bold">{formatTime(timeRemaining)} {getTimerUnit(timeRemaining)}</span>
                </div>
              </div>
            </div>

            {/* NAVEGADOR DE QUESTÕES - Mobile First */}
            <div className="mb-4 sm:mb-6">
              <QuestionCarousel 
                totalQuestions={questions.length}
                currentQuestion={currentQuestion}
                userAnswers={userAnswers}
                onQuestionJump={handleQuestionJump}
              />
            </div>
            
            {/* Question */}
            <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8 relative">
              <div className="flex items-start gap-2 sm:gap-4 mb-4 sm:mb-6 relative z-10">
                {/* Número da questão - Mobile otimizado */}
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">
                  {currentQuestion + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm sm:prose-xl max-w-none text-gray-700">
                    {typeof questions[currentQuestion]?.text === "string" ? (
                      // Se for uma string simples, renderiza com Markdown
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {questions[currentQuestion]?.text}
                      </ReactMarkdown>
                    ) : (
                      // Se for um objeto complexo, renderiza a estrutura com Markdown
                      <div className="space-y-3 sm:space-y-4">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {questions[currentQuestion]?.text.principal}
                        </ReactMarkdown>
                        {questions[currentQuestion]?.text.subItens?.map((item, index) => (
                          <div key={index} className="p-3 sm:p-4 bg-gray-100 rounded-lg">
                            <p className="font-medium text-gray-800 text-sm sm:text-base">{item.titulo}</p>
                            <div className="italic text-gray-600 ml-2 sm:ml-4 text-sm sm:text-base">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {item.conteudo}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ))}
                        {questions[currentQuestion]?.text.contextoAdicional && (
                          <div className="p-3 sm:p-4 bg-blue-50/60 border border-blue-200 rounded-lg">
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {questions[currentQuestion]?.text.contextoAdicional}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Imagens - Mobile optimized */}
                  {questions[currentQuestion]?.images && questions[currentQuestion].images.length > 0 && (
                    (() => {
                      const imageCount = questions[currentQuestion].images.length;
                      return (
                        <div className={`mt-4 sm:mt-6 ${
                          imageCount === 1 
                            ? 'flex justify-center' 
                            : 'grid grid-cols-1 gap-3 sm:gap-4'
                        }`}>
                          {questions[currentQuestion].images.map((imgSrc, index) => (
                            <div key={index} className="flex justify-center items-center bg-gray-50 rounded-lg p-2 border border-gray-200">
                              <img 
                                src={imgSrc} 
                                alt={`Imagem ${index + 1} da questão ${currentQuestion + 1}`} 
                                className="max-w-full h-auto rounded-md shadow-sm"
                                style={{ maxHeight: window.innerWidth < 640 ? '250px' : '400px' }}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Answer options - Mobile optimized */}
              <div className="space-y-2 sm:space-y-3">
                {questions[currentQuestion]?.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 active:scale-95 sm:hover:scale-105 shadow-sm sm:shadow-md hover:shadow-lg ${
                      selectedAnswer === index 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedAnswer(index)}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-semibold text-xs sm:text-sm transition-colors duration-200 flex-shrink-0 ${
                        selectedAnswer === index
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 text-gray-500"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="text-gray-700 flex-1 prose prose-sm sm:prose-base max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {option}
                          </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation - Mobile optimized */}
            <div className="flex justify-between items-center gap-3 sm:gap-4 px-1 relative">
                {/* Botão Voltar */}
                <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-95 sm:transform sm:hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-initial cursor-pointer"
                >
                    Voltar
                </button>

                {/* Botão Próximo/Concluir */}
                <button
                    onClick={handleNextQuestion}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-95 sm:transform sm:hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base flex-1 sm:flex-initial cursor-pointer"
                >
                    {currentQuestion === questions.length - 1 ? 'Concluir' : 'Próximo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      <Footer />
    </div>
  )
}
