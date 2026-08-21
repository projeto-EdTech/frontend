"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { WORD_LENGTH, MAX_GUESSES, type LetterStatus, type FormattedLetter, } from "./lib/lexooData";
import { useCountdownToMidnight, useLexooGame } from "./functions/lexooLogic";

// Componente: Tecla Dividida (para modo Dulex)
const SplitKey = ({
  keyChar,
  statusLeft,
  statusRight,
  isPressed,
  onClick,
  theme,
}: {
  keyChar: string;
  statusLeft: LetterStatus;
  statusRight: LetterStatus;
  isPressed: boolean;
  onClick: () => void;
  theme: "light" | "dark";
}) => {
  const getColorClass = (status: LetterStatus) => {
    const baseClasses = {
      initial: theme === "dark" ? "bg-gray-700/80" : "bg-white",
      absent: theme === "dark" ? "bg-gray-800/90" : "bg-gray-300",
      present: "bg-gradient-to-br from-amber-500 to-yellow-600",
      correct: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
    };

    return baseClasses[status];
  };

  const borderClass =
    theme === "dark" ? "border-gray-600/50" : "border-gray-300";

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
      className={`
        relative flex-shrink-0 
        w-8 xs:w-9 sm:w-10 md:w-11 lg:w-12
        h-10 xs:h-11 sm:h-12 md:h-14 
        border rounded-md sm:rounded-lg 
        font-bold text-sm xs:text-base sm:text-lg 
        transition-all duration-200 shadow-md 
        cursor-pointer overflow-hidden 
        touch-manipulation active:scale-95
        ${borderClass}
      `}
      aria-label={`Key ${keyChar}`}
      type="button"
    >
      {/* Metade Esquerda */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1/2 ${getColorClass(statusLeft)} transition-colors duration-300`}
      />

      {/* Metade Direita */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-1/2 ${getColorClass(statusRight)} transition-colors duration-300`}
      />

      {/* Letra centralizada */}
      <span
        className={`relative z-20 ${
          theme === "dark" ? "text-white" : "text-gray-700"
        }`}
      >
        {keyChar}
      </span>
    </motion.button>
  );
};

// Componente: Célula Individual
const Cell = ({
  value,
  status,
  isRevealing,
  revealDelay,
  theme,
  mode = "classic",
}: {
  value: string;
  status: LetterStatus;
  isRevealing?: boolean;
  revealDelay?: number;
  theme: "light" | "dark";
  mode?: "classic" | "dulex";
}) => {
  // Responsivo para todos os dispositivos:
  // - Mobile (< 480px): w-[12vw] max-w-[44px]
  // - Mobile landscape / Tablet portrait: w-[8vw] max-w-[52px]  
  // - Tablet landscape / Desktop: max-w-[56px]
  const baseClass = `
    w-[12vw] xs:w-[11vw] sm:w-[10vw] md:w-[9vw] lg:w-[8vw]
    max-w-[44px] xs:max-w-[48px] sm:max-w-[52px] md:max-w-[56px]
    min-w-[36px]
    aspect-square 
    flex items-center justify-center 
    text-xl xs:text-2xl sm:text-3xl md:text-4xl 
    font-bold uppercase rounded-lg sm:rounded-xl 
    select-none touch-manipulation
  `.trim();

  const statusStyles = {
    initial:
      theme === "dark"
        ? "border-2 border-gray-500/40 bg-gray-700/30 text-white/70 shadow-sm"
        : "border-2 border-gray-300 bg-gray-100 text-gray-600 shadow-sm",
    absent:
      theme === "dark"
        ? "border-2 border-gray-600/50 bg-gray-700/60 text-white shadow-lg"
        : "border-2 border-gray-400 bg-gray-300 text-gray-700 shadow-lg",
    present:
      "border-0 bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-xl shadow-amber-900/40",
    correct:
      mode === "dulex"
        ? "border-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-xl shadow-purple-900/40"
        : "border-0 bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl shadow-teal-900/40",
  };

  const activeClass =
    value && status === "initial"
      ? theme === "dark"
        ? "border-gray-400 scale-105 shadow-lg bg-gray-600/50"
        : "border-gray-500 scale-105 shadow-lg bg-gray-200"
      : "";

  const flipClass = isRevealing ? "animate-flip" : "";
  const flipStyle = isRevealing ? { animationDelay: `${revealDelay}ms` } : {};

  return (
    <div
      className={`${baseClass} ${statusStyles[status]} ${activeClass} ${flipClass} transition-all duration-300`}
      style={flipStyle}
      aria-hidden={value === ""}
    >
      <motion.span
        key={value}
        initial={value ? { scale: 0.8, opacity: 0 } : false}
        animate={value ? { scale: 1, opacity: 1 } : false}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
      >
        {value}
      </motion.span>
    </div>
  );
};

// Componente: Linha de Tentativa
const Row = ({
  guess,
  currentGuess,
  isCurrent,
  isRevealing,
  theme,
  mode = "classic",
}: {
  guess?: FormattedLetter[];
  currentGuess?: string;
  isCurrent?: boolean;
  isRevealing?: boolean;
  theme: "light" | "dark";
  mode?: "classic" | "dulex";
}) => {
  // Classes responsivas para gap entre células
  const rowClasses = "flex gap-1.5 xs:gap-2 sm:gap-2.5 justify-center mb-1.5 xs:mb-2 sm:mb-2.5 select-none touch-manipulation";

  if (guess) {
    return (
      <div className={rowClasses}>
        {guess.map((l, i) => (
          <Cell
            key={i}
            value={l.key}
            status={l.status}
            isRevealing={isRevealing}
            revealDelay={i * 150}
            theme={theme}
            mode={mode}
          />
        ))}
      </div>
    );
  }

  if (isCurrent && currentGuess) {
    const splitGuess = currentGuess.split("");
    const emptyCells = [...Array(WORD_LENGTH - splitGuess.length)];

    return (
      <div className={rowClasses}>
        {splitGuess.map((letter, i) => (
          <Cell
            key={i}
            value={letter}
            status="initial"
            theme={theme}
            mode={mode}
          />
        ))}
        {emptyCells.map((_, i) => (
          <Cell
            key={i + splitGuess.length}
            value=""
            status="initial"
            theme={theme}
            mode={mode}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={rowClasses}>
      {[...Array(WORD_LENGTH)].map((_, i) => (
        <Cell key={i} value="" status="initial" theme={theme} mode={mode} />
      ))}
    </div>
  );
};

const Dulex = ({
  guesses,
  guessesB,
  currentGuess,
  isGameOver,
  turn,
  revealingRow,
  revealingRowB,
  theme,
  maxGuesses,
  isSolvedA,
  isSolvedB,
}: {
  guesses: FormattedLetter[][];
  guessesB: FormattedLetter[][];
  currentGuess: string;
  isGameOver: boolean;
  turn: number;
  revealingRow: number | null;
  revealingRowB: number | null;
  theme: "light" | "dark";
  maxGuesses: number;
  isSolvedA: boolean;
  isSolvedB: boolean;
}) => {
  const showInputA =
    !isGameOver && !isSolvedA && turn < maxGuesses && revealingRow === null;
  const emptyRowsA = Math.max(
    0,
    maxGuesses - guesses.length - (showInputA ? 1 : 0)
  );

  const showInputB =
    !isGameOver && !isSolvedB && turn < maxGuesses && revealingRowB === null;
  const emptyRowsB = Math.max(
    0,
    maxGuesses - guessesB.length - (showInputB ? 1 : 0)
  );

  return (
    // mobile-first: stack A/B, on md+ show two columns side-by-side
    <div className="mb-4 py-4 select-none grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 items-start">
      {/* LADO A */}
      <div
        className={`transition-opacity duration-500 ${isSolvedA ? "opacity-70" : "opacity-100"}`}
      >
        {guesses.map((g, i) => (
          <Row
            key={`a-${i}`}
            guess={g}
            isRevealing={i === revealingRow}
            theme={theme}
            mode="dulex"
          />
        ))}
        {showInputA && (
          <Row
            currentGuess={currentGuess}
            isCurrent={true}
            theme={theme}
            mode="dulex"
          />
        )}
        {[...Array(emptyRowsA)].map((_, i) => (
          <Row key={`a-empty-${i}`} theme={theme} mode="dulex" />
        ))}
      </div>

      {/* LADO B */}
      <div
        className={`transition-opacity duration-500 ${isSolvedB ? "opacity-70" : "opacity-100"}`}
      >
        {guessesB.map((g, i) => (
          <Row
            key={`b-${i}`}
            guess={g}
            isRevealing={i === revealingRowB}
            theme={theme}
            mode="dulex"
          />
        ))}
        {showInputB && (
          <Row
            currentGuess={currentGuess}
            isCurrent={true}
            theme={theme}
            mode="dulex"
          />
        )}
        {[...Array(emptyRowsB)].map((_, i) => (
          <Row key={`b-empty-${i}`} theme={theme} mode="dulex" />
        ))}
      </div>
    </div>
  );
};

// Defina a interface para as props
interface GameInstanceProps {
  mode: "classic" | "dulex";
  setMode: (mode: "classic" | "dulex") => void;
}

// Tipos para detecção de dispositivo
type DeviceType = "mobile" | "tablet" | "desktop";
type OrientationType = "portrait" | "landscape";

interface DeviceInfo {
  type: DeviceType;
  orientation: OrientationType;
  isTouchDevice: boolean;
  hasNotch: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

// Hook customizado para detecção avançada de dispositivos
const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: "desktop",
    orientation: "portrait",
    isTouchDevice: false,
    hasNotch: false,
    // Sem ler window aqui: o branch servidor/cliente daria um valor no HTML do
    // SSR e outro na hidratação. O detectDevice abaixo preenche na montagem.
    screenWidth: 1024,
    screenHeight: 768,
    pixelRatio: 1,
  });

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent.toLowerCase();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Detecta touch
      const isTouchDevice = 
        "ontouchstart" in window || 
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - para navegadores mais antigos
        (window.DocumentTouch && document instanceof window.DocumentTouch);

      // Detecta se é dispositivo móvel por UA
      const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
      
      // Detecta se é iPad (incluindo iPadOS 13+ que reporta como Mac)
      const isIPad = /ipad/i.test(ua) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Detecta outros tablets Android
      const isAndroidTablet = /android/i.test(ua) && !/mobile/i.test(ua);
      
      // Detecta tablet por tamanho de tela (entre 600px e 1024px em landscape ou portrait)
      const isTabletSize = (screenWidth >= 600 && screenWidth <= 1366) || 
        (screenHeight >= 600 && screenHeight <= 1366);

      // Determina o tipo de dispositivo
      let type: DeviceType = "desktop";
      
      if (isMobileUA && !isIPad && !isAndroidTablet) {
        type = "mobile";
      } else if (isIPad || isAndroidTablet || (isTouchDevice && isTabletSize && screenWidth >= 600)) {
        type = "tablet";
      } else if (screenWidth < 600) {
        type = "mobile";
      }

      // Detecta orientação
      const orientation: OrientationType = screenWidth > screenHeight ? "landscape" : "portrait";

      // Detecta notch (iPhone X+, alguns Android)
      const hasNotch = (() => {
        // Verifica se tem safe area insets
        if (typeof CSS !== "undefined" && CSS.supports) {
          return CSS.supports("padding-top: env(safe-area-inset-top)");
        }
        // Fallback para iPhones com notch
        return /iphone/i.test(ua) && screenHeight >= 812;
      })();

      setDeviceInfo({
        type,
        orientation,
        isTouchDevice,
        hasNotch,
        screenWidth,
        screenHeight,
        pixelRatio,
      });
    };

    detectDevice();
    
    // Listeners para mudanças
    window.addEventListener("resize", detectDevice);
    window.addEventListener("orientationchange", detectDevice);
    
    // Media query para detectar mudanças de orientação em tempo real
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleOrientationChange = () => detectDevice();
    mediaQuery.addEventListener("change", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", detectDevice);
      window.removeEventListener("orientationchange", detectDevice);
      mediaQuery.removeEventListener("change", handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};

// Hook para viewport height dinâmico (resolve problema do 100vh em mobile)
const useViewportHeight = () => {
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", () => {
      // Delay para garantir que a orientação foi aplicada
      setTimeout(setVH, 100);
    });

    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);
};

// Transforme o Lexoo atual em GameInstance (remova o export default)
const GameInstance = ({ mode, setMode }: GameInstanceProps) => {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const countdownToMidnight = useCountdownToMidnight();
  
  // Sistema de detecção de dispositivo aprimorado
  const deviceInfo = useDeviceDetection();
  useViewportHeight();
  
  // Estados derivados do deviceInfo
  const isMobile = deviceInfo.type === "mobile";
  const isTablet = deviceInfo.type === "tablet";
  const isDesktop = deviceInfo.type === "desktop";
  const isLandscape = deviceInfo.orientation === "landscape";
  const isTouchDevice = deviceInfo.isTouchDevice;
  
  // Determina se deve usar teclado nativo ou virtual
  // Mobile: sempre teclado nativo | Tablet: opção de escolha | Desktop: sempre virtual
  const [preferVirtualKeyboard, setPreferVirtualKeyboard] = useState(false);
  const shouldShowVirtualKeyboard = isDesktop || (isTablet && preferVirtualKeyboard);
  const shouldUseNativeKeyboard = isMobile || (isTablet && !preferVirtualKeyboard);
  
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Usa o hook de lógica do jogo
  const {
    solution,
    solutionDefinition,
    solutionB,
    solutionBDefinition,
    guesses,
    guessesB,
    currentGuess,
    isGameOver,
    turn,
    keyboardStatus,
    keyboardStatusA,
    keyboardStatusB,
    revealingRow,
    revealingRowB,
    pressedKey,
    keyboardVisible,
    errorMessage,
    showError,
    handleKeyup,
    showStatsModal,
    setShowStatsModal,
    stats,
    resetGame,
    maxGuesses,
    isSolvedA,
    isSolvedB,
  } = useLexooGame(mode);

  useEffect(() => {
    if (showStatsModal && isGameOver) {
      // 1. Calcula se houve vitória no modo Classic (verificando se a última tentativa está toda correta)
      const isClassicWin =
        mode === "classic" &&
        guesses.length > 0 &&
        guesses[guesses.length - 1].every((l) => l.status === "correct");

      // 2. Calcula se houve vitória no modo Dulex
      const isDulexWin = mode === "dulex" && isSolvedA && isSolvedB;

      // 3. Verifica Vitória Geral
      if (isClassicWin || isDulexWin) {
        // Vitória: toca som e dispara confetti igual ao Nexo
        try {
          const audio = new Audio("/fanfare-trumpets.mp3");
          audio.volume = 0.7;
          audio.play().catch(() => {});
        } catch {}

        import("canvas-confetti").then((confetti) => {
          // Confete Central
          confetti.default({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
            zIndex: 9999,
          });
          // Efeito extra: esquerda
          confetti.default({
            particleCount: 80,
            angle: 60,
            spread: 100,
            origin: { x: 0, y: 0.7 },
            zIndex: 9999,
          });
          // Efeito extra: direita
          confetti.default({
            particleCount: 80,
            angle: 120,
            spread: 100,
            origin: { x: 1, y: 0.7 },
            zIndex: 9999,
          });
        });
      } else {
        // Derrota: som de game over
        try {
          const audio = new Audio("/Game-Over.mp3");
          audio.volume = 0.7;
          audio.play().catch(() => {});
        } catch {}
      }
    }
  }, [showStatsModal, isGameOver, isSolvedA, isSolvedB, mode, guesses]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showModeMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest(".mode-menu-container")) {
          setShowModeMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModeMenu]);

  // Focar no input invisível em dispositivos móveis/tablets para abrir teclado nativo
  useEffect(() => {
    if (shouldUseNativeKeyboard && inputRef.current && !isGameOver) {
      // Delay para garantir que o DOM está pronto
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldUseNativeKeyboard, isGameOver]);

  // Log de debug para dispositivo (pode remover em produção)
  useEffect(() => {
    console.log("Device Detection:", {
      type: deviceInfo.type,
      orientation: deviceInfo.orientation,
      isTouchDevice: deviceInfo.isTouchDevice,
      hasNotch: deviceInfo.hasNotch,
      screenSize: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
      shouldShowVirtualKeyboard,
      shouldUseNativeKeyboard,
    });
  }, [deviceInfo, shouldShowVirtualKeyboard, shouldUseNativeKeyboard]);

  useEffect(() => {
    const handleGlobalKeyup = (e: KeyboardEvent) => {
      // Ignora se estiver segurando Ctrl/Alt/Meta (atalhos do navegador)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Bloqueia digitação se os modais estiverem abertos (opcional, mas recomendado para UX)
      if (showStatsModal || showHelpModal) return;

      // Chama a função da lógica do jogo
      handleKeyup({ key: e.key });
    };

    window.addEventListener("keyup", handleGlobalKeyup);

    // Limpeza ao desmontar o componente
    return () => window.removeEventListener("keyup", handleGlobalKeyup);
  }, [handleKeyup, showStatsModal, showHelpModal]);

  // Controla qual lado do cartão mostrar ao abrir o modal
  useEffect(() => {
    if (showStatsModal) {
      if (isGameOver) {
        setIsFlipped(false); // Mostra Definição (Frente) ao terminar
      } else {
        setIsFlipped(true); // Mostra Stats (Verso) se abrir durante o jogo
      }
    }
  }, [showStatsModal, isGameOver]);

  // Função de Compartilhamento
  const handleShare = async () => {
    const isWin =
      mode === "classic"
        ? guesses.length > 0 &&
          guesses[guesses.length - 1].every((l) => l.status === "correct")
        : isSolvedA && isSolvedB;

    const guessCount = isWin ? turn : "X";
    const title = mode === "classic" ? "LEXOO" : "DULEX";

    // Cabeçalho do texto
    let shareText = `${title} ${guessCount}/${maxGuesses}\n\n`;

    // Gera o Grid de Emojis
    if (mode === "classic") {
      shareText += guesses
        .map((row) => {
          return row
            .map((letter) => {
              if (letter.status === "correct") return "🟩"; // ou 🟪 para Dulex
              if (letter.status === "present") return "🟨"; // ou 🟧
              return theme === "dark" ? "⬛" : "⬜";
            })
            .join("");
        })
        .join("\n");
    } else {
      // Lógica simplificada para Dulex (mostra status geral)
      shareText += `Palavra 1: ${isSolvedA ? "✅" : "❌"}\nPalavra 2: ${isSolvedB ? "✅" : "❌"}`;
    }

    // Adiciona link ou rodapé
    shareText += `\n\nJogue agora: lexoo.game`;

    // Tenta usar a API nativa de compartilhamento (Mobile) ou Clipboard (PC)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Lexoo Resultado",
          text: shareText,
        });
      } catch (e) {
        console.log("Compartilhamento cancelado");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      // Aqui você poderia mostrar um toast "Copiado!" se tiver um sistema de notificação
      alert("Resultado copiado para a área de transferência!");
    }
  };

  // Classes responsivas baseadas no dispositivo
  const containerClasses = `
    flex flex-col items-center 
    min-h-screen 
    min-h-[calc(var(--vh,1vh)*100)]
    p-2 xs:p-3 sm:p-4 
    pt-2 
    transition-colors duration-500
    ${deviceInfo.hasNotch ? "pt-safe" : ""}
    ${theme === "dark" ? "bg-[#121213]" : "bg-white"}
    ${isLandscape && isMobile ? "landscape-mobile" : ""}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Input invisível para dispositivos com teclado nativo (mobile e tablet) */}
      {shouldUseNativeKeyboard && (
        <input
          ref={inputRef}
          type="text"
          value={currentGuess}
          onChange={(e) => {
            const newValue = e.target.value.toUpperCase();
            // Simula digitação via handleKeyup
            if (newValue.length > currentGuess.length) {
              const newChar = newValue[newValue.length - 1];
              handleKeyup({ key: newChar });
            } else if (newValue.length < currentGuess.length) {
              handleKeyup({ key: "Backspace" });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleKeyup({ key: "Enter" });
              e.preventDefault();
            }
          }}
          onBlur={(e) => {
            // Manter o foco no input quando não está em um modal
            if (!showStatsModal && !showHelpModal && !isGameOver) {
              setTimeout(() => e.target.focus(), 150);
            }
          }}
          onFocus={() => {
            // Scroll para garantir visibilidade em mobile
            if (isMobile) {
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 300);
            }
          }}
          maxLength={WORD_LENGTH}
          className="fixed top-0 left-0 w-full h-12 opacity-0 pointer-events-auto z-10 text-[16px]"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="done"
          autoFocus={!isGameOver}
        />
      )}

      {/* Indicador de tipo de teclado para tablets */}
      {isTablet && (
        <button
          onClick={() => setPreferVirtualKeyboard(!preferVirtualKeyboard)}
          className={`fixed bottom-4 right-4 z-40 p-3 rounded-full shadow-lg transition-all duration-200 ${
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
          }`}
          title={preferVirtualKeyboard ? "Usar teclado nativo" : "Usar teclado virtual"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {preferVirtualKeyboard ? (
              // Ícone de teclado físico
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            ) : (
              // Ícone de teclado virtual
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            )}
          </svg>
        </button>
      )}

      {/* Container Principal com estilo macOS */}
      <div className="w-full max-w-2xl">
        {/* Header com estilo macOS - mobile-first: compacto em telas pequenas */}
        <div className="text-center mb-3 pb-2 flex items-center justify-between relative">
          {/* Botões de controle à esquerda */}
          <div className="flex gap-3">
            <div className="relative mode-menu-container">
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  theme === "dark"
                    ? `bg-gray-700/50 hover:bg-gray-600/50 border-gray-600/30 text-gray-300 hover:text-white ${mode === "classic" ? "hover:border-teal-500/50 hover:text-teal-400" : "hover:border-purple-500/50 hover:text-purple-400"}`
                    : `bg-white/80 hover:bg-white border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm ${mode === "classic" ? "hover:border-teal-400 hover:text-teal-600" : "hover:border-purple-400 hover:text-purple-600"}`
                }`}
              >
                <motion.svg
                  animate={{ rotate: showModeMenu ? 180 : 0 }}
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </motion.svg>
              </button>

              {/* Menu Dropdown de Modos */}
              <AnimatePresence>
                {showModeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute top-12 left-0 z-50 backdrop-blur-lg border rounded-xl shadow-2xl overflow-hidden min-w-[200px] ${
                      theme === "dark"
                        ? "bg-gray-800/95 border-gray-700/50"
                        : "bg-white/95 border-gray-300/50"
                    }`}
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setMode("classic");
                          setShowModeMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left rounded-lg transition-all duration-200 font-semibold flex items-center gap-3 cursor-pointer ${
                          theme === "dark"
                            ? "text-white hover:bg-gray-700/50"
                            : "text-gray-800 hover:bg-gray-100"
                        } ${mode === "classic" ? "bg-teal-500/20" : ""}`}
                      >
                        <span className="text-teal-400">●</span>
                        Lexoo
                      </button>
                      <button
                        onClick={() => {
                          setMode("dulex");
                          setShowModeMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left rounded-lg transition-all duration-200 font-semibold flex items-center gap-3 cursor-pointer ${
                          theme === "dark"
                            ? "text-white hover:bg-gray-700/50"
                            : "text-gray-800 hover:bg-gray-100"
                        } ${mode === "dulex" ? "bg-purple-500/20" : ""}`}
                      >
                        <span className="text-purple-400">●</span>
                        Dulex
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowHelpModal(true)}
              className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                theme === "dark"
                  ? `bg-gray-700/50 hover:bg-gray-600/50 border-gray-600/30 text-gray-300 hover:text-white ${mode === "classic" ? "hover:border-teal-500/50 hover:text-teal-400" : "hover:border-purple-500/50 hover:text-purple-400"}`
                  : `bg-white/80 hover:bg-white border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm ${mode === "classic" ? "hover:border-teal-400 hover:text-teal-600" : "hover:border-purple-400 hover:text-purple-600"}`
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>

          {/* Título central - Reduzir tamanho */}
          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-wider flex-1 select-none ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {mode === "classic" ? (
              <>
                LE<span className="text-teal-400">X</span>OO
              </>
            ) : (
              <>
                DU<span className="text-purple-400">L</span>EX
              </>
            )}
          </h1>

          {/* Botões de configuração à direita */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowStatsModal(true)}
              className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                theme === "dark"
                  ? `bg-gray-700/50 hover:bg-gray-600/50 border-gray-600/30 text-gray-300 hover:text-white ${mode === "classic" ? "hover:border-teal-500/50 hover:text-teal-400" : "hover:border-purple-500/50 hover:text-purple-400"}`
                  : `bg-white/80 hover:bg-white border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm ${mode === "classic" ? "hover:border-teal-400 hover:text-teal-600" : "hover:border-purple-400 hover:text-purple-600"}`
              }`}
              title="Estatísticas"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>

            {/* Botão de Reset/Novo Jogo */}
            {session?.user?.tier === "SIMULAPRO" && (
              <button
                onClick={() => {
                  resetGame();
                }}
                className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  theme === "dark"
                    ? `bg-gray-700/50 border-gray-600/30 text-gray-300 ${mode === "classic" ? "hover:border-teal-500/50 hover:text-teal-400" : "hover:border-purple-500/50 hover:text-purple-400"}`
                    : `bg-white/80 border-gray-300 text-gray-600 shadow-sm ${mode === "classic" ? "hover:border-teal-400 hover:text-teal-600" : "hover:border-purple-400 hover:text-purple-600"}`
                }`}
                title="Novo Jogo"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-1 sm:gap-1.5 justify-center mb-2">
          {Array.from({ length: maxGuesses }).map((_, i) => {
            const livesRemaining = maxGuesses - turn;
            const isAlive = i < livesRemaining;
            const shouldPulse = isAlive && livesRemaining <= 3;
            return (
              <Heart
                key={i}
                size={28}
                strokeWidth={2.5}
                className={`transition-all duration-500 ${
                  isAlive
                    ? `fill-red-500 text-red-500 scale-100 drop-shadow-sm ${shouldPulse ? "animate-pulse" : ""}`
                    : theme === "dark"
                      ? "fill-transparent text-gray-700 scale-90"
                      : "fill-transparent text-gray-300 scale-90"
                }`}
                style={{
                  animationDelay: shouldPulse ? `${i * 100}ms` : "0ms",
                }}
              />
            );
          })}
        </div>

        {/* Grid do Jogo (Clássico vs Dueto) - mobile-first: rows mais compactas em telas pequenas */}
        {mode === "classic" ? (
          <div className="mb-4 py-3 select-none">
            {guesses.map((g, i) => (
              <Row
                key={i}
                guess={g}
                isRevealing={i === revealingRow}
                theme={theme}
              />
            ))}
            {!isGameOver && turn < maxGuesses && revealingRow === null && (
              <Row currentGuess={currentGuess} isCurrent={true} theme={theme} />
            )}
            {[...Array(Math.max(0, maxGuesses - 1 - turn))].map((_, i) => (
              <Row key={i} theme={theme} />
            ))}
          </div>
        ) : (
          <Dulex
            guesses={guesses}
            guessesB={guessesB}
            currentGuess={currentGuess}
            isGameOver={isGameOver}
            turn={turn}
            revealingRow={revealingRow}
            revealingRowB={revealingRowB}
            theme={theme}
            maxGuesses={maxGuesses}
            isSolvedA={isSolvedA}
            isSolvedB={isSolvedB}
          />
        )}

        {/* Mensagem de Erro - Estilo macOS com animações suaves */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div
                className={`relative rounded-[18px] px-5 py-4 shadow-2xl border backdrop-blur-2xl min-w-[320px] ${
                  theme === "dark"
                    ? "bg-red-500/90 border-red-400/30 text-white"
                    : "bg-red-500/95 border-red-600/20 text-white"
                }`}
                style={{
                  boxShadow:
                    theme === "dark"
                      ? "0 20px 40px -12px rgba(239, 68, 68, 0.6), 0 8px 16px -8px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                      : "0 20px 40px -12px rgba(239, 68, 68, 0.5), 0 8px 16px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)",
                }}
              >
                {/* Brilho sutil no topo */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="flex items-center gap-3">
                  {/* Ícone com animação de pulse */}
                  <div className="relative flex-shrink-0">
                    <svg
                      className="w-7 h-7 drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>

                  {/* Mensagem de erro */}
                  <div className="flex-1">
                    <p className="font-semibold text-[15px] leading-snug drop-shadow-sm">
                      {errorMessage}
                    </p>
                  </div>

                  {/* Indicador de progresso (desaparecimento) */}
                  <div className="relative w-1 h-10 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ height: "0%" }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                      className="absolute bottom-0 left-0 right-0 bg-white/60 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teclado Virtual - Exibido em desktop e opcionalmente em tablets */}
        {shouldShowVirtualKeyboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={keyboardVisible ? { opacity: 1, y: 0 } : { opacity: 0 }}
            className={`
              backdrop-blur-sm rounded-xl sm:rounded-2xl 
              p-2 xs:p-2.5 sm:p-3 md:p-4 
              shadow-xl border 
              mx-auto max-w-full
              ${isTablet ? "mb-16" : ""}
              ${theme === "dark"
                ? "bg-gradient-to-b from-gray-800/30 via-gray-800/40 to-gray-900/50 border-gray-700/20"
                : "bg-gradient-to-b from-white via-gray-50/90 to-gray-100/80 border-gray-300/50"
              }
            `}
          >
            <div className="space-y-0.5 xs:space-y-1">
              <div
                className="flex gap-0.5 xs:gap-1 sm:gap-1.5 justify-center overflow-x-auto no-scrollbar px-0.5 sm:px-1"
                style={{ opacity: keyboardVisible ? 1 : 0 }}
              >
                {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map(
                  (key) => {
                    if (mode === "dulex") {
                      const statusLeft = keyboardStatusA[key] || "initial";
                      const statusRight = keyboardStatusB[key] || "initial";
                      const isPressed = pressedKey === key;

                      return (
                        <SplitKey
                          key={key}
                          keyChar={key}
                          statusLeft={statusLeft}
                          statusRight={statusRight}
                          isPressed={isPressed}
                          onClick={() => handleKeyup({ key })}
                          theme={theme}
                        />
                      );
                    }

                    const status = keyboardStatus[key] || "initial";
                    const isPressed = pressedKey === key;
                    const keyStyles = {
                      initial:
                        theme === "dark"
                          ? "bg-gray-700/80 hover:bg-gray-600/80 text-white border-gray-600/50"
                          : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
                      absent:
                        theme === "dark"
                          ? "bg-gray-800/90 text-gray-500 border-gray-700/50"
                          : "bg-gray-300 text-gray-600 border-gray-400",
                      present:
                        "bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-amber-600/50 shadow-lg shadow-amber-900/30",
                      correct:
                        "bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-teal-600/50 shadow-lg shadow-teal-900/30",
                    };

                    return (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleKeyup({ key })}
                        className={`
                          flex-shrink-0 
                          w-7 xs:w-8 sm:w-9 md:w-10 lg:w-11
                          h-9 xs:h-10 sm:h-11 md:h-12 lg:h-14 
                          ${keyStyles[status]} 
                          border rounded-md sm:rounded-lg 
                          font-bold text-sm xs:text-base sm:text-lg 
                          transition-all duration-200 shadow-md 
                          cursor-pointer touch-manipulation
                          active:scale-95
                          ${isPressed ? "scale-95" : ""}
                        `}
                        type="button"
                        aria-label={`Key ${key}`}
                      >
                        {key}
                      </motion.button>
                    );
                  }
                )}
              </div>

              <div
                className="flex gap-0.5 xs:gap-1 sm:gap-1.5 justify-center overflow-x-auto no-scrollbar px-0.5 sm:px-1"
                style={{ opacity: keyboardVisible ? 1 : 0 }}
              >
                {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((key) => {
                  if (mode === "dulex") {
                    const statusLeft = keyboardStatusA[key] || "initial";
                    const statusRight = keyboardStatusB[key] || "initial";
                    const isPressed = pressedKey === key;

                    return (
                      <SplitKey
                        key={key}
                        keyChar={key}
                        statusLeft={statusLeft}
                        statusRight={statusRight}
                        isPressed={isPressed}
                        onClick={() => handleKeyup({ key })}
                        theme={theme}
                      />
                    );
                  }

                  const status = keyboardStatus[key] || "initial";
                  const isPressed = pressedKey === key;
                  const keyStyles = {
                    initial:
                      theme === "dark"
                        ? "bg-gray-700/80 hover:bg-gray-600/80 text-white border-gray-600/50"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
                    absent:
                      theme === "dark"
                        ? "bg-gray-800/90 text-gray-500 border-gray-700/50"
                        : "bg-gray-300 text-gray-600 border-gray-400",
                    present:
                      "bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-amber-600/50 shadow-lg shadow-amber-900/30",
                    correct:
                      "bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-teal-600/50 shadow-lg shadow-teal-900/30",
                  };

                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeyup({ key })}
                      className={`
                        flex-shrink-0 
                        w-7 xs:w-8 sm:w-9 md:w-10 lg:w-11
                        h-9 xs:h-10 sm:h-11 md:h-12 lg:h-14 
                        ${keyStyles[status]} 
                        border rounded-md sm:rounded-lg 
                        font-bold text-sm xs:text-base sm:text-lg 
                        transition-all duration-200 shadow-md 
                        cursor-pointer touch-manipulation
                        active:scale-95
                        ${isPressed ? "scale-95" : ""}
                      `}
                      type="button"
                      aria-label={`Key ${key}`}
                    >
                      {key}
                    </motion.button>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKeyup({ key: "Backspace" })}
                  className={`
                    flex-shrink-0 
                    px-2 xs:px-2.5 sm:px-3 md:px-4 lg:px-5 
                    h-9 xs:h-10 sm:h-11 md:h-12 lg:h-14 
                    border rounded-md sm:rounded-lg 
                    font-bold text-base sm:text-lg 
                    transition-all duration-200 shadow-md 
                    cursor-pointer touch-manipulation
                    active:scale-95
                    ${theme === "dark"
                      ? "bg-gray-700/80 hover:bg-gray-600/80 text-white border-gray-600/50"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                    } 
                    ${pressedKey === "BACKSPACE" ? "scale-95" : ""}
                  `}
                  type="button"
                  aria-label="Backspace"
                >
                  ⌫
                </motion.button>
              </div>
              <div
                className="flex gap-0.5 xs:gap-1 sm:gap-1.5 justify-center overflow-x-auto no-scrollbar px-0.5 sm:px-1"
                style={{ opacity: keyboardVisible ? 1 : 0 }}
              >
                {["Z", "X", "C", "V", "B", "N", "M"].map((key) => {
                  if (mode === "dulex") {
                    const statusLeft = keyboardStatusA[key] || "initial";
                    const statusRight = keyboardStatusB[key] || "initial";
                    const isPressed = pressedKey === key;

                    return (
                      <SplitKey
                        key={key}
                        keyChar={key}
                        statusLeft={statusLeft}
                        statusRight={statusRight}
                        isPressed={isPressed}
                        onClick={() => handleKeyup({ key })}
                        theme={theme}
                      />
                    );
                  }

                  const status = keyboardStatus[key] || "initial";
                  const isPressed = pressedKey === key;
                  const keyStyles = {
                    initial:
                      theme === "dark"
                        ? "bg-gray-700/80 hover:bg-gray-600/80 text-white border-gray-600/50"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
                    absent:
                      theme === "dark"
                        ? "bg-gray-800/90 text-gray-500 border-gray-700/50"
                        : "bg-gray-300 text-gray-600 border-gray-400",
                    present:
                      "bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-amber-600/50 shadow-lg shadow-amber-900/30",
                    correct:
                      "bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-teal-600/50 shadow-lg shadow-teal-900/30",
                  };
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeyup({ key })}
                      className={`
                        flex-shrink-0 
                        w-7 xs:w-8 sm:w-9 md:w-10 lg:w-11
                        h-9 xs:h-10 sm:h-11 md:h-12 lg:h-14 
                        ${keyStyles[status]} 
                        border rounded-md sm:rounded-lg 
                        font-bold text-sm xs:text-base sm:text-lg 
                        transition-all duration-200 shadow-md 
                        cursor-pointer touch-manipulation
                        active:scale-95
                        ${isPressed ? "scale-95" : ""}
                      `}
                      type="button"
                      aria-label={`Key ${key}`}
                    >
                      {key}
                    </motion.button>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKeyup({ key: "Enter" })}
                  className={`
                    flex-shrink-0 
                    px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 
                    h-9 xs:h-10 sm:h-11 md:h-12 lg:h-14 
                    border rounded-md sm:rounded-lg 
                    font-bold text-xs xs:text-sm sm:text-base 
                    transition-all duration-200 shadow-md 
                    cursor-pointer touch-manipulation
                    active:scale-95
                    ${theme === "dark"
                      ? "bg-gray-700/80 hover:bg-gray-600/80 text-white border-gray-600/50"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                    } 
                    ${pressedKey === "ENTER" ? "scale-95" : ""}
                  `}
                  type="button"
                  aria-label="Enter"
                >
                  ENTER
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal de Estatísticas - Estilo macOS */}
      {/* --- NOVO MODAL 3D (Frente: Definição | Verso: Stats) --- */}
      <AnimatePresence>
        {showStatsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4"
          >
            {/* Backdrop (Fundo Escuro) */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              onClick={() => setShowStatsModal(false)}
            />

            {/* Container que Gira (O Cartão) */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotateY: isFlipped ? 180 : 0
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-full sm:max-w-md cursor-default"
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
            >
              {/* ===================================================
                  LADO A: FRENTE (DEFINIÇÃO / VOCABULÁRIO)
                 =================================================== */}
              {/* 1. Lógica de Cores (Adicione isso logo aqui dentro) */}
              {(() => {
                 // Verifica Vitória
                 const isWin = mode === "classic"
                   ? guesses.length > 0 && guesses[guesses.length - 1].every((l) => l.status === "correct")
                   : isSolvedA && isSolvedB;
               
                 // Verifica Derrota (Acabou e não ganhou)
                 const isLoss = isGameOver && !isWin;

                 // Define estilos baseados no resultado
                 let bgClass = theme === "dark" ? "bg-[#1e1e1e] border-white/10" : "bg-white border-gray-200";
                 let textTitleClass = theme === "dark" ? "text-white" : "text-gray-800";
                 let textDescClass = theme === "dark" ? "text-gray-300" : "text-gray-600";
                 let decorationColor = theme === "dark" ? "bg-teal-500" : "bg-teal-400";
                 let headerBg = theme === "dark" ? "border-white/5 bg-white/5" : "border-black/5 bg-gray-50";
                 let subTitleColor = theme === "dark" ? "text-teal-400" : "text-teal-600";

                 // Sobrescreve se Ganhou (Verde Sólido igual Stats)
                 if (isWin) {
                     bgClass = "bg-green-500 border-green-400";
                     textTitleClass = "text-white";
                     textDescClass = "text-white/90";
                     decorationColor = "bg-white"; // Linha branca
                     headerBg = "border-white/20 bg-black/10";
                     subTitleColor = "text-white/90";
                 } 
                 // Sobrescreve se Perdeu (Vermelho Sólido igual Stats)
                 else if (isLoss) {
                     bgClass = "bg-red-500 border-red-400";
                     textTitleClass = "text-white";
                     textDescClass = "text-white/90";
                     decorationColor = "bg-white"; // Linha branca
                     headerBg = "border-white/20 bg-black/10";
                     subTitleColor = "text-white/90";
                 }

                 return (
                  <div
                    className={`absolute inset-0 w-full h-full rounded-[24px] shadow-2xl overflow-hidden flex flex-col border ${bgClass}`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    {/* Cabeçalho da Definição */}
                    <div className={`p-6 border-b text-center relative ${headerBg}`}>
                      <h3 className={`text-sm font-bold tracking-widest uppercase ${subTitleColor}`}>
                        VOCABULÁRIO DO DIA
                      </h3>
                      <button
                        onClick={() => setIsFlipped(true)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          isWin || isLoss 
                            ? "bg-white/20 hover:bg-white/30 text-white" 
                            : (theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-gray-700")
                        }`}
                      >
                        Ver Stats ➜
                      </button>
                    </div>

                    {/* Conteúdo: Palavra(s) e Significado(s) */}
                    <div className="flex-1 p-6 flex flex-col justify-center items-center text-center overflow-y-auto custom-scrollbar">
                      {/* Palavra A */}
                      <div className="w-full mb-6 last:mb-0">
                        <h2 className={`text-3xl sm:text-4xl font-black tracking-tight mb-3 ${textTitleClass}`}>
                          {solution}
                        </h2>
                        {/* Linha Decorativa */}
                        <div className={`h-1 w-12 mx-auto mb-3 rounded-full ${decorationColor}`} />
                        <p className={`text-base sm:text-lg italic font-serif leading-relaxed px-2 ${textDescClass}`}>
                          {solutionDefinition || "Definição indisponível."}
                        </p>
                      </div>

                      {/* Palavra B (Se for Dulex) */}
                      {mode === "dulex" && (
                        <>
                          <div className={`w-full h-px my-4 ${isWin || isLoss ? "bg-white/20" : (theme === "dark" ? "bg-white/10" : "bg-black/10")}`} />
                          <div className="w-full">
                            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight mb-3 ${textTitleClass}`}>
                              {solutionB}
                            </h2>
                            <div className={`h-1 w-12 mx-auto mb-3 rounded-full ${mode === 'dulex' && !isWin && !isLoss ? (theme==="dark"?"bg-purple-500":"bg-purple-400") : decorationColor}`} />
                            <p className={`text-base sm:text-lg italic font-serif leading-relaxed px-2 ${textDescClass}`}>
                              {solutionBDefinition || "Definição indisponível."}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Rodapé da Frente */}
                    <div
                      className={`p-4 text-center text-xs border-t ${
                        isWin || isLoss 
                          ? "border-white/20 text-white/80" 
                          : (theme === "dark" ? "border-white/5 text-gray-400 opacity-60" : "border-black/5 text-gray-500 opacity-60")
                      }`}
                    >
                      {isGameOver
                        ? "Toque no botão acima para ver seus resultados"
                        : "Jogo em andamento..."}
                    </div>
                  </div>
                 );
              })()}

              {/* ===================================================
                  LADO B: VERSO (ESTATÍSTICAS - O MODAL ANTIGO)
                 =================================================== */}
              <div
                className={`relative rounded-[16px] shadow-2xl w-full overflow-hidden ${
                  theme === "dark" ? "bg-[#1e1e1e]" : "bg-white/95"
                }`}
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* Header Stats */}
                <div
                  className={`px-5 pt-5 pb-4 border-b ${
                    theme === "dark" ? "border-white/10" : "border-black/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Botão Voltar para Definição (Só aparece se for Game Over) */}
                    {isGameOver ? (
                      <button
                        onClick={() => setIsFlipped(false)}
                        className={`text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer ${
                          theme === "dark" ? "text-teal-400" : "text-teal-600"
                        }`}
                      >
                        ← Definição
                      </button>
                    ) : (
                      <span /> // Espaçador
                    )}

                    <h2
                      className={`text-xl font-semibold tracking-tight absolute left-1/2 -translate-x-1/2 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Estatísticas
                    </h2>

                    <button
                      onClick={() => setShowStatsModal(false)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer ${
                        theme === "dark"
                          ? "hover:bg-white/10 text-gray-400 hover:text-white"
                          : "hover:bg-black/5 text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* CONTEÚDO ORIGINAL DE STATS (Copiado do seu arquivo anterior) */}
                <div className="px-4 py-5 space-y-5">
                  {/* Cards de Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { value: stats.gamesPlayed, label: "Jogos" },
                      { value: stats.winPercentage, label: "Vitórias %" },
                      { value: stats.currentStreak, label: "Sequência" },
                      { value: stats.maxStreak, label: "Recorde" },
                    ].map((stat, idx) => (
                      <div
                        key={idx}
                        className={`text-center py-4 px-2 rounded-xl transition-all duration-200 ${
                          theme === "dark"
                            ? "bg-white/5 hover:bg-white/10"
                            : "bg-black/5 hover:bg-black/8"
                        }`}
                      >
                        <div
                          className={`text-3xl font-semibold tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                        >
                          {stat.value}
                        </div>
                        <div
                          className={`text-[11px] font-medium mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Distribuição de Tentativas */}
                  <div>
                    <h3
                      className={`text-sm font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      Distribuição de Tentativas
                    </h3>

                    <div className="space-y-2">
                      {/* Barras de Vitórias (1 a 6) */}
                      {stats.guessDistribution.map((count, index) => {
                        // Calcula totais para porcentagem
                        const totalWins = stats.guessDistribution.reduce(
                          (a, b) => a + b,
                          0
                        );
                        const lossCount = stats.gamesPlayed - totalWins;
                        // O máximo deve considerar também as derrotas para a escala ficar correta
                        const maxCount = Math.max(
                          ...stats.guessDistribution,
                          lossCount
                        );
                        const percentage =
                          maxCount > 0 ? (count / maxCount) * 100 : 0;

                        // Verifica se ESTA linha é a linha da vitória atual para destacar
                        const isCurrentWinRow =
                          isGameOver &&
                          index + 1 === turn &&
                          ((mode === "classic" &&
                            guesses[guesses.length - 1]?.every(
                              (l) => l.status === "correct"
                            )) ||
                            (mode === "dulex" && isSolvedA && isSolvedB));

                        return (
                          <div key={index} className="flex items-center gap-3">
                            {/* Número da tentativa */}
                            <div
                              className={`text-sm font-semibold w-4 text-right ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {index + 1}
                            </div>

                            {/* Barra Azul */}
                            <div className="flex-1 flex items-center">
                              <div
                                className="relative w-full h-7 rounded-lg overflow-hidden"
                                style={{
                                  backgroundColor:
                                    theme === "dark"
                                      ? "rgba(255,255,255,0.05)"
                                      : "rgba(0,0,0,0.05)",
                                }}
                              >
                                <div
                                  className={`h-full flex items-center justify-end px-3 text-xs font-semibold text-white transition-all duration-1000 ease-out rounded-lg ${
                                    isCurrentWinRow
                                      ? "bg-green-500 brightness-110" // Destaque se ganhou nesta tentativa
                                      : "bg-[#007AFF]" // Azul padrão
                                  }`}
                                  style={{
                                    width: `${Math.max(percentage, count > 0 ? 8 : 0)}%`, // Garante visibilidade mínima se > 0
                                    minWidth: count > 0 ? "24px" : "0",
                                  }}
                                >
                                  {count > 0 && count}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Linha da Caveira (Derrotas) */}
                      {(() => {
                        const totalWins = stats.guessDistribution.reduce(
                          (a, b) => a + b,
                          0
                        );
                        const lossCount = stats.gamesPlayed - totalWins;
                        const maxCount = Math.max(
                          ...stats.guessDistribution,
                          lossCount
                        );
                        const percentage =
                          maxCount > 0 ? (lossCount / maxCount) * 100 : 0;

                        // Verifica se acabou de perder
                        const isCurrentLoss =
                          isGameOver &&
                          ((mode === "classic" &&
                            !guesses[guesses.length - 1]?.every(
                              (l) => l.status === "correct"
                            )) ||
                            (mode === "dulex" && (!isSolvedA || !isSolvedB)));

                        return (
                          <div className="flex items-center gap-3">
                            <div
                              className={`text-sm font-semibold w-4 text-right flex justify-end ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                            >
                              💀
                            </div>
                            <div className="flex-1 flex items-center">
                              <div
                                className="relative w-full h-7 rounded-lg overflow-hidden"
                                style={{
                                  backgroundColor:
                                    theme === "dark"
                                      ? "rgba(255,255,255,0.05)"
                                      : "rgba(0,0,0,0.05)",
                                }}
                              >
                                <div
                                  className={`h-full flex items-center justify-end px-3 text-xs font-semibold text-white transition-all duration-1000 ease-out rounded-lg ${
                                    isCurrentLoss ? "bg-red-600" : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${Math.max(percentage, lossCount > 0 ? 8 : 0)}%`,
                                    minWidth: lossCount > 0 ? "24px" : "0",
                                  }}
                                >
                                  {lossCount > 0 && lossCount}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Próxima Palavra e Compartilhar */}
                  <div
                    className={`rounded-xl p-4 ${theme === "dark" ? "bg-white/5" : "bg-black/5"}`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Próxima Palavra
                      </span>
                      <span
                        className={`text-xl font-mono font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        {countdownToMidnight}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    className="w-full py-3 rounded-xl font-bold bg-[#007AFF] hover:bg-[#006ee6] active:scale-95 transition-all text-white shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    Compartilhar
                  </button>
                </div>
                {/* FIM DO VERSO */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Ajuda */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border ${
                theme === "dark"
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-300"
              }`}
            >
              {/* Header do Modal */}
              <div
                className={`sticky top-0 backdrop-blur-md p-6 border-b flex items-center justify-between ${
                  theme === "dark"
                    ? "bg-gray-800/95 border-gray-700/50"
                    : "bg-white/95 border-gray-300"
                }`}
              >
                <h2
                  className={`text-2xl font-bold flex items-center gap-3 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  <span className="text-3xl">🎮</span>
                  Como Jogar LEXOO
                </h2>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                    theme === "dark"
                      ? "bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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

              {/* Conteúdo do Modal */}
              <div className="p-6 space-y-6">
                {/* Objetivo */}
                <div>
                  <h3 className="text-lg font-bold text-teal-400 mb-2">
                    🎯 Objetivo
                  </h3>
                  <p
                    className={`leading-relaxed ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Descubra a palavra secreta de{" "}
                    <strong
                      className={
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }
                    >
                      {WORD_LENGTH} letras
                    </strong>{" "}
                    em até{" "}
                    <strong
                      className={
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }
                    >
                      {MAX_GUESSES} tentativas
                    </strong>
                    . Após cada tentativa, as cores das letras mudarão para
                    mostrar o quão perto você está da solução.
                  </p>
                </div>

                {/* Exemplos */}
                <div>
                  <h3 className="text-lg font-bold text-teal-400 mb-3">
                    💡 Exemplos
                  </h3>

                  {/* Exemplo 1 - Correto */}
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        T
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-500/40 bg-gray-700/30 text-white/70 shadow-sm"
                            : "border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
                        }`}
                      >
                        E
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-500/40 bg-gray-700/30 text-white/70 shadow-sm"
                            : "border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
                        }`}
                      >
                        R
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-500/40 bg-gray-700/30 text-white/70 shadow-sm"
                            : "border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
                        }`}
                      >
                        M
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-500/40 bg-gray-700/30 text-white/70 shadow-sm"
                            : "border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
                        }`}
                      >
                        O
                      </div>
                    </div>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      A letra <strong className="text-teal-400">T</strong> está na
                      palavra e na posição correta.
                    </p>
                  </div>

                  {/* Exemplo 2 - Presente */}
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-600/50 bg-gray-700/30 text-white/70"
                            : "border-gray-300 bg-gray-100 text-gray-600"
                        }`}
                      >
                        P
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        O
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-600/50 bg-gray-700/30 text-white/70"
                            : "border-gray-300 bg-gray-100 text-gray-600"
                        }`}
                      >
                        D
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-600/50 bg-gray-700/30 text-white/70"
                            : "border-gray-300 bg-gray-100 text-gray-600"
                        }`}
                      >
                        E
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-600/50 bg-gray-700/30 text-white/70"
                            : "border-gray-300 bg-gray-100 text-gray-600"
                        }`}
                      >
                        R
                      </div>
                    </div>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      A letra <strong className="text-amber-400">O</strong> está
                      na palavra, mas em outra posição.
                    </p>
                  </div>

                  {/* Exemplo 3 - Ausente */}
                  <div>
                    <div className="flex gap-2 mb-2">
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-500/40 bg-gray-700/30 text-white/70 shadow-sm"
                            : "border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
                        }`}
                      >
                        S
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-500/40 bg-gray-700/30 text-white/70 shadow-sm"
                            : "border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
                        }`}
                      >
                        A
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg ${
                          theme === "dark"
                            ? "border-gray-600/50 bg-gray-700/60 text-white"
                            : "border-gray-400 bg-gray-300 text-gray-700"
                        }`}
                      >
                        G
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-500/40 bg-gray-700/30 text-white/70 shadow-sm"
                            : "border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
                        }`}
                      >
                        A

                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-xl ${
                          theme === "dark"
                            ? "border-gray-500/40 bg-gray-700/30 text-white/70 shadow-sm"
                            : "border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
                        }`}
                      >
                        Z
                      </div>
                    </div>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      A letra{" "}
                      <strong
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        G
                      </strong>{" "}
                      não está na palavra.
                    </p>
                  </div>
                </div>

                {/* Dicas */}
                <div>
                  <h3 className="text-lg font-bold text-teal-400 mb-2">
                                   ✨ Dicas
                  </h3>
                  <ul
                    className={`space-y-2 text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 mt-1">•</span>
                      <span>
                        Use as cores do teclado para lembrar quais letras já foram
                        tentadas
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 mt-1">•</span>
                      <span>
                        Comece com palavras que tenham vogais diferentes
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 mt-1">•</span>
                      <span>
                        Preste atenção nas letras amarelas para reposicioná-las
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 mt-1">•</span>
                      <span>Uma nova palavra está disponível a cada jogo!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Lexoo() {
  const [mode, setMode] = useState<"classic" | "dulex">("classic");

  return <GameInstance key={mode} mode={mode} setMode={setMode} />;
}
