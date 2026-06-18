"use client";

import React, { useEffect, useRef, memo } from 'react';
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
      return "bg-[#007AFF] text-white shadow-sm ring-1 ring-black/5"; // Apple System Blue
    case "answered":
      return "!bg-gray-100 !text-gray-900 backdrop-blur-sm"; // Glass-like "filled" state
    case "unanswered":
      return "bg-transparent text-gray-700 border-gray-200 hover:!bg-white hover:!text-gray-900 transition-colors"; // Clean default
  }
};

// Componente memoizado para evitar o recálculo dos botões inalterados
const CarouselItem = memo(function CarouselItem({ 
  index, 
  status, 
  onJump 
}: { 
  index: number; 
  status: Status; 
  onJump: (idx: number) => void;
}) {
  return (
    <button
      onClick={() => onJump(index)}
      // A classe flex-shrink-0 impede que os botões espremam um ao outro.
      className={`
        relative w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${getStatusColor(status)}
        group
        focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2
      `}
      aria-label={`Ir para a questão ${index + 1}`}
    >
      <span className="relative z-10">{index + 1}</span>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
      </div>
       <div className={`absolute top-0.5 right-0.5 transition-opacity ${status === 'answered' || status === 'current' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
        {getStatusIcon(status)}
      </div>
    </button>
  );
});


function QuestionCarouselBase({
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
        src: "/Mascote/banners/Camaleão_Confuso/Camaleão_2.png", 
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
    <div className="relative bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-8 overflow-hidden font-sans">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-5">
            {/* Mascote dinâmico baseado no progresso */}
            <div className="hidden sm:block">
              <Image 
                src={mascot.src}
                alt={mascot.alt}
                width={70}
                height={70}
                className="object-contain drop-shadow-sm transition-all duration-500"
              />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight text-gray-900">Navegação Rápida</h3>
              {/* Mensagem motivacional do mascote */}
              <p className="text-sm text-gray-500 leading-relaxed">
                {mascot.message}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-transparent border border-gray-200 text-xs font-medium text-gray-600">
                  <CheckCircle size={14} className="text-emerald-500/80" />
                  {answeredCount} de {totalQuestions}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md !bg-white border border-gray-200 text-xs font-medium text-[#007AFF]">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Navegação do Carrossel */}
          <div className="flex items-center gap-1">
            <button
                onClick={() => onQuestionJump(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-200 cursor-pointer"
                aria-label="Questão anterior"
            >
                <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button
                onClick={() => onQuestionJump(currentQuestion + 1)}
                disabled={currentQuestion === totalQuestions - 1}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-200 cursor-pointer"
                aria-label="Próxima questão"
            >
                <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>
      </div>
      
      {/* Barra de progresso com mascote animado */}
      <div className="mb-8 relative px-1">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
              className="h-full bg-[#007AFF] rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
          >
            {/* Efeito de brilho na barra - Opcional e sutil */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
          </div>
        </div>
        
        {/* Mascote pequeno "caminhando" na barra de progresso */}
        {progressPercentage > 0 && progressPercentage < 100 && (
          <div 
            className="absolute -top-7 transition-all duration-500 ease-out transform -translate-x-1/2 pointer-events-none"
            style={{ left: `${Math.min(progressPercentage, 98)}%` }}
          >
            <Image 
              src="/Mascote/banners/Camaleão_15.png"
              alt="Mascote progredindo"
              width={32}
              height={32}
              className="object-contain drop-shadow-sm"
            />
          </div>
        )}
        
        {/* Mascote comemorando quando completa 100% */}
        {progressPercentage === 100 && (
          <div 
            className="absolute -top-8 right-0 animate-celebration pointer-events-none"
          >
            <Image 
              src="/Mascote/banners/Camaleão_25.png"
              alt="Mascote comemorando"
              width={40}
              height={40}
              className="object-contain drop-shadow-sm"
            />
          </div>
        )}
      </div>

      {/* 3. A ESTRUTURA DO CARROSSEL (JSX) */}
      <div 
        ref={carouselRef} 
        className="flex items-center gap-3 overflow-x-auto py-5 px-2 scrollbar-hide"
      >
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const status = getQuestionStatus(index, currentQuestion, userAnswers);
          return (
            <CarouselItem 
              key={index} 
              index={index} 
              status={status} 
              onJump={onQuestionJump} 
            />
          );
        })}
      </div>
    </div>
  );
}

export default memo(QuestionCarouselBase);