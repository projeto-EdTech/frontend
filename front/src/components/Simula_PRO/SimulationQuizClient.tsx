"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';

const DynamicMarkdown = dynamic(() => import('@/components/Simula_PRO/DynamicMarkdown'), {
  ssr: false,
  loading: () => <span className="animate-pulse bg-gray-200 text-transparent rounded w-full inline-block">Carregando formato...</span>
});
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
  timeSpent: number;
  correctAnswers: number;
  wrongAnswers: number;
  successRate: number;
  completedAt: string;
  materias: string[];
  conteudos: string[];
}

interface SimulationQuizClientProps {
  initialQuestions: Question[];
  universitySlug: string;
  examYear: string | null;
  day: string;
  numberOfQuestions: number;
}

export default function SimulationQuizClient({ 
  initialQuestions, 
  universitySlug, 
  examYear, 
  day, 
  numberOfQuestions 
}: SimulationQuizClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { universities, loading: contextLoading } = useUniversityStorage();

  const timeParam = searchParams.get("time");
  const isUnlimited = timeParam === null || timeParam === undefined || timeParam === "";
  const totalTime: number | null = isUnlimited ? null : Number.parseInt(timeParam || "90");
  
  const currentUni = universities.find((u: University) => u.slug === universitySlug);
  const simIdParam = searchParams.get("simId");

  const storageKey = `simulation_progress_${universitySlug}_${examYear || 'any'}_${day || 'any'}_${simIdParam || 'none'}`;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    totalTime === null ? null : totalTime * 60
  );

  const startTimestampRef = useRef<number>(Date.now());
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    new Array(initialQuestions.length).fill(null)
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    // Restaurar progresso do localStorage caso exista
    const savedProgressJSON = localStorage.getItem(storageKey);
    if (savedProgressJSON) {
      try {
        const savedState = JSON.parse(savedProgressJSON);
        if (savedState.questions && savedState.questions.length > 0) {
          setQuestions(savedState.questions);
          setUserAnswers(savedState.userAnswers);
          setCurrentQuestion(savedState.currentQuestion);
          if (savedState.timeRemaining !== undefined) {
            setTimeRemaining(savedState.timeRemaining);
          }
          if (savedState.elapsedSeconds) {
            startTimestampRef.current = Date.now() - (savedState.elapsedSeconds * 1000);
          }
        }
      } catch (e) {
        localStorage.removeItem(storageKey);
      }
    }
    
    setIsLoading(false);
  }, [storageKey]);

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

  const saveResultToBackend = useCallback(
    async (summaryData: SummaryData, errorsData: ErroDetalhado[], acertosData: AcertoDetalhado[]) => {
      try {
        // Sem Authorization: o cookie `user_data` HttpOnly vai sozinho no fetch same-origin.
        // ATENÇÃO: `/api/simulations/save-result` não existe no projeto — esta chamada sempre
        // falhou e o resultado do simulado nunca chegou ao backend. Bug de escopo próprio.
        const response = await fetch("/api/simulations/save-result", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
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
      } catch (error) {
        console.error("Erro ao tentar salvar o resultado automaticamente:", error);
      }
    },
    []
  );

  const handleFinishExam = useCallback(async () => {
    setIsFinishing(true);
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

    localStorage.removeItem(storageKey);
    sessionStorage.setItem("simulationSummary", JSON.stringify(summaryData));
    sessionStorage.setItem("simulationErrors", JSON.stringify(finalErrosDetalhados));
    sessionStorage.setItem("simulationCorrect", JSON.stringify(finalAcertosDetalhados));
    await saveResultToBackend(summaryData, finalErrosDetalhados, finalAcertosDetalhados);
    router.push(`/simulation/${universitySlug}/summary?year=${examYear || ""}&day=${day}`);
  }, [userAnswers, currentQuestion, selectedAnswer, questions, universitySlug, examYear, day, saveResultToBackend, router, storageKey]);

  useEffect(() => {
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

  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null) return "♾";
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    } else {
      const totalMinutes = Math.floor(seconds / 60);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}:${mins.toString().padStart(2, "0")}`;
    }
  }, []);

  const getTimerUnit = useCallback((seconds: number | null) => {
    if (seconds === null) return "";
    return seconds < 3600 ? "min" : "Horas";
  }, []);

  const handleNextQuestion = useCallback(async () => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(newUserAnswers[currentQuestion + 1]);
    } else {
      await handleFinishExam();
    }
  }, [currentQuestion, selectedAnswer, userAnswers, questions, handleFinishExam]);

  const handlePreviousQuestion = useCallback(() => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    if (currentQuestion > 0) {
      const previousQuestionIndex = currentQuestion - 1;
      setCurrentQuestion(previousQuestionIndex);
      setSelectedAnswer(newUserAnswers[previousQuestionIndex]);
    }
  }, [currentQuestion, selectedAnswer, userAnswers]);

  const handleQuestionJump = useCallback((targetIndex: number) => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    if (targetIndex >= 0 && targetIndex < questions.length) {
      setCurrentQuestion(targetIndex);
      setSelectedAnswer(newUserAnswers[targetIndex]);
    }
  }, [currentQuestion, selectedAnswer, userAnswers, questions.length]);

  if (isLoading || contextLoading) {
    return <LoadingScreen message="Preparando a Prova..." />;
  }

  if (error || (!currentUni && !contextLoading)) {
    return <div className="min-h-[50vh] flex justify-center items-center text-red-500">Erro: {error || "Dados da universidade não encontrados."}</div>;
  }

  if (isFinishing) {
    return <LoadingScreen message="Finalizando Resultado..." />;
  }

  return (
    <div className="flex-1">
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-5 right-75 z-10 hidden sm:block">
          <Image 
            src="/Mascote/banners/Camaleão_24.png" 
            alt="Mascote Vestibuline"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-90 hover:opacity-100 transition-opacity"
            width={100} height={100}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-blue-400 rounded-xl sm:rounded-2xl blur-lg opacity-30 transform rotate-1"></div>
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center !bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
                <Image 
                  src={currentUni?.logo ? (currentUni.logo.startsWith('/') ? currentUni.logo : `/${currentUni.logo}`) : "/placeholder.svg"}
                  alt={currentUni?.name || "Universidade"} 
                  width={50} height={50} 
                  className="sm:w-12 sm:h-12 w-8 h-8 object-contain rounded-lg sm:rounded-xl" 
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {currentUni?.name} {examYear}
              </h1>
            </div>
          </div>
          <div className="bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base w-full sm:w-auto text-center">
            <span className="block sm:inline">Tempo restante: </span>
            <span className="font-bold">{formatTime(timeRemaining)} {getTimerUnit(timeRemaining)}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <QuestionCarousel 
          totalQuestions={questions.length}
          currentQuestion={currentQuestion}
          userAnswers={userAnswers}
          onQuestionJump={handleQuestionJump}
        />
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8 relative">
        <div className="flex items-start gap-2 sm:gap-4 mb-4 sm:mb-6 relative z-10">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">
            {currentQuestion + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="prose prose-sm sm:prose-xl max-w-none text-gray-700">
              {typeof questions[currentQuestion]?.text === "string" ? (
                <DynamicMarkdown>
                  {questions[currentQuestion]?.text as string}
                </DynamicMarkdown>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <DynamicMarkdown>
                    {(questions[currentQuestion]?.text as any)?.principal || ""}
                  </DynamicMarkdown>
                  {(questions[currentQuestion]?.text as any)?.subItens?.map((item: any, index: number) => (
                    <div key={index} className="p-3 sm:p-4 bg-gray-100 rounded-lg">
                      <p className="font-medium text-gray-800 text-sm sm:text-base">{item.titulo}</p>
                      <div className="italic text-gray-600 ml-2 sm:ml-4 text-sm sm:text-base">
                        <DynamicMarkdown>
                          {item.conteudo}
                        </DynamicMarkdown>
                      </div>
                    </div>
                  ))}
                  {(questions[currentQuestion]?.text as any)?.contextoAdicional && (
                    <div className="p-3 sm:p-4 bg-blue-50/60 border border-blue-200 rounded-lg">
                      <DynamicMarkdown>
                        {(questions[currentQuestion]?.text as any)?.contextoAdicional}
                      </DynamicMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {questions[currentQuestion]?.images && questions[currentQuestion].images.length > 0 && (
              <div className={`mt-4 sm:mt-6 ${questions[currentQuestion].images.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 gap-3 sm:gap-4'}`}>
                {questions[currentQuestion].images.map((imgSrc, index) => (
                  <div key={index} className="flex justify-center items-center bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <img 
                      src={imgSrc} 
                      alt={`Imagem ${index + 1} da questão ${currentQuestion + 1}`} 
                      className="max-w-full h-auto rounded-md shadow-sm"
                      style={{ maxHeight: '250px' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
                  selectedAnswer === index ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 text-gray-500"
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="text-gray-700 flex-1 prose prose-sm sm:prose-base max-w-none">
                    <DynamicMarkdown>
                        {option}
                    </DynamicMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center gap-3 sm:gap-4 px-1 relative">
          <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-95 sm:transform sm:hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-initial cursor-pointer"
          >
              Voltar
          </button>
          <button
              onClick={handleNextQuestion}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-95 sm:transform sm:hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base flex-1 sm:flex-initial cursor-pointer"
          >
              {currentQuestion === questions.length - 1 ? 'Concluir' : 'Próximo'}
          </button>
      </div>
    </div>
  );
}
