"use client";

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Play } from 'lucide-react';
import Image from 'next/image';

// Define a "forma" das props que o componente espera receber.
// Isso ajuda a garantir que estamos usando o componente corretamente.
interface QuestionCarouselProps {
  totalQuestions: number;
  currentQuestion: number;
  userAnswers: (number | null)[];
  onQuestionJump: (index: number) => void;
}

// Funções auxiliares para determinar o estilo de cada botão.
// Mantê-las aqui dentro deixa o componente mais independente.
type Status = 'current' | 'answered' | 'unanswered';

const getQuestionStatus = (index: number, currentQuestion: number, userAnswers: (number | null)[]): Status => {
  if (currentQuestion === index) return "current";
  if (userAnswers[index] !== null) return "answered";
  return "unanswered";
};

const getStatusIcon = (status: Status) => {
  if (status === "current") return <Play size={12} className="fill-current" />;
  if (status === "answered") return <CheckCircle size={12} />;
  return <Circle size={12} />;
};

const getStatusColor = (status: Status) => {
  switch (status) {
    case "current":
      return "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/50";
    case "answered":
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200/50";
    case "unanswered":
      return "bg-white text-gray-600 border-2 border-gray-200 shadow-sm hover:border-gray-300";
    default:
      return "";
  }
};


export default function QuestionCarousel({
  totalQuestions,
  currentQuestion,
  userAnswers,
  onQuestionJump,
}: QuestionCarouselProps) {
  // 1. A REFERÊNCIA (useRef)
  // O 'useRef' cria uma referência direta ao elemento <div> do carrossel no HTML.
  // Pense nisso como um "gancho" para podermos manipular o elemento via código.
  const carouselRef = useRef<HTMLDivElement>(null);

  // 2. O EFEITO (useEffect) - A MÁGICA DO SCROLL AUTOMÁTICO
  // Este bloco de código é executado sempre que o valor de 'currentQuestion' muda.
  useEffect(() => {
    if (carouselRef.current) {
      // Encontramos o elemento HTML do botão da questão atual.
      const currentQuestionElement = carouselRef.current.children[currentQuestion] as HTMLElement;
      
      if (currentQuestionElement) {
        // Calculamos a posição para centralizar o botão na tela.
        const carouselWidth = carouselRef.current.offsetWidth;
        const elementWidth = currentQuestionElement.offsetWidth;
        const scrollPosition = currentQuestionElement.offsetLeft - (carouselWidth / 2) + (elementWidth / 2);

        // Usamos a API do navegador para rolar suavemente até a posição.
        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
  }, [currentQuestion]); // A dependência [currentQuestion] garante que o efeito só rode quando a questão mudar.

  const answeredCount = userAnswers.filter((answer) => answer !== null).length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Função para escolher o mascote baseado no progresso
  const getMascotImage = () => {
    if (progressPercentage >= 100) {
      return { 
        src: "/Mascote/banners/Camaleão_25.png", 
        alt: "Mascote comemorando - 100% concluído!",
        message: "Parabéns! 🎉 Todas as questões respondidas!"
      };
    } else if (progressPercentage >= 80) {
      return { 
        src: "/Mascote/banners/Camaleão_23.png", 
        alt: "Mascote animado - Quase lá!",
        message: "Incrível! Você está quase lá! 🚀"
      };
    } else if (progressPercentage >= 50) {
      return { 
        src: "/Mascote/banners/Camaleão_15.png", 
        alt: "Mascote motivado - Continue assim!",
        message: "Ótimo progresso! Continue assim! 💪"
      };
    } else if (progressPercentage >= 20) {
      return { 
        src: "/Mascote/banners/Camaleão_5.png", 
        alt: "Mascote incentivando - Você consegue!",
        message: "Você consegue! Foco no objetivo! 🎯"
      };
    } else if (progressPercentage > 0) {
      return { 
        src: "/Mascote/banners/Camaleão_Confuso/Gemini_Generated_Image_f7g8iff7g8iff7g8.png", 
        alt: "Mascote curioso - Vamos começar!",
        message: "Vamos começar essa jornada! 📚"
      };
    }
    return { 
      src: "/Mascote/banners/Camaleão_1.png", 
      alt: "Mascote pronto para começar!",
      message: "Vamos começar! Boa sorte! 🍀"
    };
  };

  const mascot = getMascotImage();

  return (
    <div className="relative bg-white border border-gray-200 rounded-3xl shadow-xl p-6 sm:p-8 mb-8 overflow-hidden">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Mascote dinâmico baseado no progresso */}
            <div className="hidden sm:block">
              <Image 
                src={mascot.src}
                alt={mascot.alt}
                width={80}
                height={80}
                className="object-contain drop-shadow-lg transition-all duration-500"
              />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Navegação Rápida</h3>
              {/* Mensagem motivacional do mascote */}
              <p className="text-sm font-medium text-blue-600 mb-2 italic">
                {mascot.message}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-emerald-500" />
                  {answeredCount} de {totalQuestions} respondidas
                </span>
                <span className="text-blue-600 font-medium">
                  {Math.round(progressPercentage)}% concluído
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Navegação do Carrossel */}
          <div className="flex gap-2">
            <button
                onClick={() => onQuestionJump(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                className="p-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 hover:from-blue-100 hover:to-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-sm"
                aria-label="Questão anterior"
            >
                <ChevronLeft size={18} />
            </button>
            <button
                onClick={() => onQuestionJump(currentQuestion + 1)}
                disabled={currentQuestion === totalQuestions - 1}
                className="p-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 hover:from-blue-100 hover:to-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-sm"
                aria-label="Próxima questão"
            >
                <ChevronRight size={18} />
            </button>
          </div>
      </div>
      
      {/* Barra de progresso com mascote animado */}
      <div className="mb-6 relative">
        <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner overflow-hidden">
          <div 
              className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 transition-all duration-500 ease-out relative shadow-lg"
              style={{ width: `${progressPercentage}%` }}
          >
            {/* Efeito de brilho na barra */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        {/* Mascote pequeno "caminhando" na barra de progresso */}
        {progressPercentage > 0 && progressPercentage < 100 && (
          <div 
            className="absolute -top-8 transition-all duration-500 ease-out transform -translate-x-1/2"
            style={{ left: `${Math.min(progressPercentage, 95)}%` }}
          >
            <Image 
              src="/Mascote/banners/Camaleão_15.png"
              alt="Mascote progredindo"
              width={40}
              height={40}
              className="object-contain drop-shadow-md animate-bounce-gentle"
            />
          </div>
        )}
        
        {/* Mascote comemorando quando completa 100% */}
        {progressPercentage === 100 && (
          <div 
            className="absolute -top-8 right-0 animate-celebration"
          >
            <Image 
              src="/Mascote/banners/Camaleão_25.png"
              alt="Mascote comemorando"
              width={50}
              height={50}
              className="object-contain drop-shadow-lg"
            />
          </div>
        )}
      </div>

      {/* 3. A ESTRUTURA DO CARROSSEL (JSX) */}
      <div 
        ref={carouselRef} 
        className="flex items-center gap-3 overflow-x-auto pb-4 -mb-4 scrollbar-hide"
      >
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const status = getQuestionStatus(index, currentQuestion, userAnswers);
          return (
            <button
              key={index}
              onClick={() => onQuestionJump(index)}
              // A classe flex-shrink-0 impede que os botões espremam um ao outro.
              className={`
                relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl font-bold text-sm 
                transition-all duration-300 transform hover:scale-110 hover:-translate-y-1
                ${getStatusColor(status)}
                group
              `}
              aria-label={`Ir para a questão ${index + 1}`}
            >
              <span className="relative z-10">{index + 1}</span>
              <div className="absolute top-1 right-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {getStatusIcon(status)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}