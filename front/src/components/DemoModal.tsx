import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "../contexts/ThemeContext";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ open, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      // Previne scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    } else {
      setIsMaximized(false);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-500 ${theme === 'dark' ? 'dark bg-black/60' : 'bg-black/30'}`}
      onClick={onClose}
    >
      {/* Efeito de partículas de fundo - Mantido mas sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-50"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 opacity-50"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500 opacity-50"></div>
      </div>

      <div
        className={`relative bg-white backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-300 ring-1 ring-black/5 transition-all duration-500 ease-in-out ${
          isMaximized 
            ? 'w-full h-full rounded-none' 
            : 'rounded-2xl max-w-5xl w-[95%] md:w-full max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-700'
        }`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        style={{
          boxShadow: theme === 'dark' 
            ? '0 0 0 1px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            : '0 0 0 1px rgba(255,255,255,0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Barra de Título estilo macOS Moderno (Glassmorphism) */}
        <div className="h-11 bg-white border-b border-gray-300 flex items-center px-5 justify-between shrink-0 select-none z-50 backdrop-blur-sm">
            <div className="flex items-center gap-2 group">
                {/* Botão Vermelho - Fechar */}
                <button 
                    onClick={onClose}
                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-all shadow-sm flex items-center justify-center group-hover:shadow-none cursor-pointer"
                    aria-label="Fechar"
                >
                    <svg className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {/* Botão Amarelo - Minimizar */}
                <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm flex items-center justify-center cursor-pointer group-hover:shadow-none" aria-label="Minimizar">
                    <svg className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12h16" />
                    </svg>
                </button>
                {/* Botão Verde - Maximizar/Restaurar */}
                <button 
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-all shadow-sm flex items-center justify-center group-hover:shadow-none cursor-pointer"
                    aria-label={isMaximized ? "Restaurar" : "Maximizar"}
                >
                    <svg className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                        {isMaximized ? (
                            <path d="M4 14h6v6L4 14zM20 10h-6V4l6 6z" />
                        ) : (
                            <path d="M14 3h7v7l-7-7zM10 21H3v-7l7 7z" />
                        )}
                    </svg>
                </button>
            </div>
            <div className="text-sm font-medium text-gray-700 absolute left-1/2 transform -translate-x-1/2 font-sans tracking-tight flex items-center gap-2">
                SimulaVest Demo
            </div>
            <div className="w-14"></div>
        </div>

        {/* Conteúdo com scroll - Transparente para efeito Glass */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
            
            {/* Header refinado com mascote e elementos visuais */}
            <div className="text-center mb-6 md:mb-10 relative">
            
            {/* Mascote de boas-vindas com design aprimorado */}
            <div className="relative inline-block mb-6">
                <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto">
                {/* Círculo de fundo com gradiente animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                
                {/* Círculo secundário para profundidade */}
                <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-10 blur-xl"></div>
                
                {/* Mascote com sombra aprimorada */}
                <div className="relative w-full h-full">
                    <Image 
                    src="/Mascote/banners/Camaleão_1.png" 
                    alt="Mascote SimulaVest - Demonstração"
                    fill
                    className="object-contain drop-shadow-2xl relative z-10 animate-wiggle"
                    priority
                    />
                </div>
                </div>

                {/* Partículas decorativas ao redor do mascote */}
                <div className="absolute -top-2 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-2 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 -right-4 w-2.5 h-2.5 bg-pink-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Título com efeito aprimorado */}
            <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-sm tracking-tight">
                Demonstração da Plataforma
            </h2>
            
            {/* Separador decorativo */}
            <div className="flex items-center justify-center gap-2 mb-5">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent to-blue-500 rounded-full"></div>
                <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                <div className="w-12 h-1 bg-gradient-to-l from-transparent to-pink-500 rounded-full"></div>
            </div>
            
            {/* Descrição com melhor hierarquia - Glassmorphism interno */}
            <div className="max-w-3xl mx-auto bg-white/40 rounded-2xl p-4 md:p-6 border border-white/60 shadow-sm backdrop-blur-md">
                <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                Descubra como o <span className="font-bold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-lg border border-blue-100/50">SimulaVest</span> pode 
                <span className="font-semibold text-purple-600"> transformar seu desempenho</span> no vestibular através de nossa 
                <span className="font-semibold text-pink-600"> plataforma inovadora</span>! 🎓✨
                </p>
            </div>
            </div>

            {/* Container do vídeo aprimorado */}
            <div className="flex-1 w-full relative group">
            {/* Container principal do vídeo */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/90 transform transition-all duration-500 group-hover:shadow-[0_0_50px_-12px_rgba(124,58,237,0.25)] border border-white/10">
                
                {/* Container interno do iframe */}
                <div className="relative aspect-video w-full">
                {/* Loading overlay aprimorado */}
                <div className="absolute inset-0 bg-[#1c1c1e] flex items-center justify-center z-10">
                    <div className="flex flex-col items-center space-y-6">
                    {/* Spinner customizado */}
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    
                    {/* Texto de loading */}
                    <div className="text-center space-y-2">
                        <p className="text-white text-base font-semibold">Carregando demonstração...</p>
                        <p className="text-gray-400 text-sm">Prepare-se para conhecer o SimulaVest!</p>
                    </div>

                    {/* Mascote pequeno no loading */}
                    <div className="relative w-16 h-16 opacity-60 animate-bounce-slow">
                        <Image 
                        src="/Mascote/banners/Camaleão_5.png" 
                        alt="Mascote SimulaVest"
                        fill
                        className="object-contain"
                        />
                    </div>
                    </div>
                </div>
                
                <iframe
                    className="w-full h-full relative z-20"
                    src={`https://www.youtube.com/embed/INSERIR_O_VIDEO_ID_AQUI?autoplay=1`}
                    title="Demo SimulaVest"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={(e) => {
                    const loadingOverlay = e.currentTarget.previousElementSibling;
                    if (loadingOverlay) {
                        (loadingOverlay as HTMLElement).style.opacity = '0';
                        setTimeout(() => {
                        (loadingOverlay as HTMLElement).style.display = 'none';
                        }, 300);
                    }
                    }}
                ></iframe>
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DemoModal;