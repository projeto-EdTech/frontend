"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Subject, SubjectCardProps, SubjectGridProps, subjects, colorMappings, Entity, GuessFeedback, FeedbackStatus, attributeLabels, } from "./lib/enigma-data";
import { getTargetEntityForDay, getEntitiesForSubject, compareGuess, } from "./functions/enigma-logic";

// =============================================================================
// TYPES
// =============================================================================
type GameMode = "lobby" | "playing";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  suggestions: Entity[];
  onSelect: (entity: Entity) => void;
  disabled: boolean;
  subjectColor: string;
}

interface AttributeCellProps {
  value: string | number | string[];
  status: FeedbackStatus;
}

interface AttributeRowProps {
  feedback: GuessFeedback;
  index: number;
}

interface GuessesTableProps {
  guesses: GuessFeedback[];
}

interface VictoryModalProps {
  entity: Entity;
  attempts: number;
  onClose: () => void;
  subjectName: string;
  isVictory: boolean;
}

interface GameSummaryProps {
  guesses: GuessFeedback[];
  targetEntity: Entity;
}

// =============================================================================
// COMPONENTS
// =============================================================================
// -----------------------------------------------------------------------------
// GAMEPLAY COMPONENTS
// -----------------------------------------------------------------------------
function LivesDisplay({ currentGuesses, maxLives }: { currentGuesses: number; maxLives: number }) {
  const livesLeft = Math.max(0, maxLives - currentGuesses);
  const isDanger = livesLeft > 0 && livesLeft <= 3;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-2 mb-6"
    >
      <div className="flex gap-1.5">
        {[...Array(maxLives)].map((_, i) => {
          const isAlive = i < livesLeft;
          return (
            <motion.span
              key={i}
              initial={false}
              animate={{
                scale: isAlive ? (isDanger ? [1, 1.1, 1] : 1) : 0.8,
                opacity: isAlive ? 1 : 0.3,
                x: isAlive && isDanger ? [0, -0.6, 0.6, -0.6, 0.6, 0] : 0,
                rotate: isAlive && isDanger ? [0, -1, 1, -1, 1, 0] : 0,
              }}
              transition={{
                scale: isAlive && isDanger ? { repeat: Infinity, duration: 0.8 } : { duration: 0.2 },
                x: isAlive && isDanger ? { repeat: Infinity, duration: 0.25 } : { duration: 0.2 },
                rotate: isAlive && isDanger ? { repeat: Infinity, duration: 0.25 } : { duration: 0.2 },
              }}
              className="text-2xl inline-block"
            >
              {isAlive ? "❤️" : "🖤"}
            </motion.span>
          );
        })}
      </div>
      <motion.span 
        animate={isDanger ? { scale: [1, 1.02, 1], color: "#ef4444" } : { color: "#9ca3af" }}
        transition={isDanger ? { repeat: Infinity, duration: 1.5 } : {}}
        className="text-xs font-bold uppercase tracking-widest"
      >
        {livesLeft} {livesLeft === 1 ? "Vida Restante" : "Vidas Restantes"}
      </motion.span>
    </motion.div>
  );
}

function GameSummary({ guesses, targetEntity }: GameSummaryProps) {
  const summary: Record<string, { value: string | number | string[]; status: FeedbackStatus; range?: string }> = {};

  // Inicializa o resumo com campos vazios
  Object.keys(targetEntity.attributes).forEach((key) => {
    summary[key] = { value: "", status: "incorrect" };
  });

  guesses.forEach((guess) => {
    guess.feedback.forEach((attr) => {
      const current = summary[attr.key];
      
      // Se já acertou, mantém
      if (current.status === "correct") return;

      if (attr.status === "correct") {
        summary[attr.key] = { value: attr.value, status: "correct" };
      } else if (attr.status === "higher" || attr.status === "lower") {
        // Lógica de intervalo para números (Século, etc.)
        const val = attr.value as number;
        const targetVal = targetEntity.attributes[attr.key] as number;
        
        // Inicializa limites se não existirem
        const lowerBound = guesses
          .filter(g => g.feedback.find(f => f.key === attr.key && f.status === "higher"))
          .map(g => g.feedback.find(f => f.key === attr.key)?.value as number)
          .reduce((max, curr) => Math.max(max, curr), -Infinity);

        const upperBound = guesses
          .filter(g => g.feedback.find(f => f.key === attr.key && f.status === "lower"))
          .map(g => g.feedback.find(f => f.key === attr.key)?.value as number)
          .reduce((min, curr) => Math.min(min, curr), Infinity);

        const rangeStr = `${lowerBound === -Infinity ? "?" : lowerBound} < X < ${upperBound === Infinity ? "?" : upperBound}`;
        summary[attr.key] = { value: rangeStr, status: "partial" };
      }
    });
  });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-6"
    >
      <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs font-bold uppercase tracking-widest">
        <span>📋 Resumo do Conhecimento</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(summary).map(([key, data]) => (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-500 uppercase font-semibold">
              {attributeLabels[key] || key}
            </span>
            <div
              className={`
                px-3 py-2 rounded-lg text-xs font-bold text-center border h-10 flex items-center justify-center
                ${data.status === "correct" ? "bg-green-100 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-400"}
              `}
            >
              {data.status === "correct" ? (
                Array.isArray(data.value) ? data.value.join(", ") : data.value
              ) : (
                data.status === "partial" ? data.value : "???"
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AttributeCell({ value, status }: AttributeCellProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "correct":
        return { bg: "#dcfce7", border: "#86efac", text: "#166534" };
      case "incorrect":
        return { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b" };
      case "partial":
        return { bg: "#fef9c3", border: "#fde047", text: "#854d0e" };
      case "higher":
      case "lower":
        return { bg: "#fef9c3", border: "#fde047", text: "#854d0e" };
      default:
        return { bg: "#f3f4f6", border: "#e5e7eb", text: "#374151" };
    }
  };

  const styles = getStatusStyles();
  const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
  const arrow = status === "higher" ? "⬆️" : status === "lower" ? "⬇️" : null;

  return (
    <div
      className="px-3 py-2 rounded-lg text-center text-sm font-medium min-w-[100px]"
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
        color: styles.text,
        borderWidth: 1,
        borderStyle: "solid",
      }}
    >
      {displayValue} {arrow}
    </div>
  );
}

function AttributeRow({ feedback, index }: AttributeRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex flex-col sm:flex-row gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      <div className="flex items-center gap-2 min-w-[140px] pb-2 sm:pb-0 border-b sm:border-b-0 sm:border-r border-gray-200 pr-3">
        <span className="font-semibold text-gray-800 text-sm">
          {feedback.entity.name}
        </span>
      </div>
      <div className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto">
        {feedback.feedback.map((attr) => (
          <div key={attr.key} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
              {attributeLabels[attr.key] || attr.key}
            </span>
            <AttributeCell value={attr.value} status={attr.status} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function GuessesTable({ guesses }: GuessesTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [guesses]);

  if (guesses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Nenhuma tentativa ainda</p>
        <p className="text-sm mt-1">Digite o nome de um(a) autor(a) ou conceito para começar</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2"
      style={{ scrollBehavior: "smooth" }}
    >
      {guesses.map((guess, index) => (
        <AttributeRow key={guess.entity.id + index} feedback={guess} index={index} />
      ))}
    </div>
  );
}

function SearchBar({
  query,
  setQuery,
  suggestions,
  onSelect,
  disabled,
  subjectColor,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter((entity) =>
    entity.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSuggestions[highlightedIndex]) {
        onSelect(filteredSuggestions[highlightedIndex]);
        setQuery("");
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (entity: Entity) => {
    onSelect(entity);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const colors = colorMappings[subjectColor] || colorMappings["bg-blue-50"];

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? "Você acertou! 🎉" : "Digite o nome..."}
        className="
          w-full px-4 py-3 rounded-xl
          border-2 transition-all duration-200
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
          borderColor: disabled ? "#e5e7eb" : colors.borderHex,
          backgroundColor: disabled ? "#f9fafb" : "white",
        }}
      />

      <AnimatePresence>
        {isOpen && query.length > 0 && filteredSuggestions.length > 0 && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full left-0 right-0 mt-2
              bg-white rounded-xl border border-gray-200
              shadow-lg overflow-hidden z-50
              max-h-[240px] overflow-y-auto
            "
          >
            {filteredSuggestions.map((entity, index) => (
              <button
                key={entity.id}
                onMouseDown={() => handleSelect(entity)}
                className="
                  w-full px-4 py-3 text-left
                  transition-colors duration-100
                  border-b border-gray-50 last:border-b-0 cursor-pointer
                "
                style={{
                  backgroundColor:
                    index === highlightedIndex ? colors.background : "white",
                  color: index === highlightedIndex ? colors.colorHex : "#374151",
                }}
              >
                <span className="font-medium">{entity.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && query.length > 0 && filteredSuggestions.length === 0 && !disabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="
            absolute top-full left-0 right-0 mt-2
            bg-white rounded-xl border border-gray-200
            shadow-lg p-4 text-center text-gray-500 text-sm
          "
        >
          Nenhum resultado encontrado
        </motion.div>
      )}
    </div>
  );
}

function VictoryModal({ entity, attempts, onClose, subjectName, isVictory }: VictoryModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="
            bg-white rounded-2xl p-8 max-w-md w-full
            shadow-2xl text-center
          "
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div className="text-5xl mb-4">{isVictory ? "🎉" : "💀"}</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {isVictory ? "Parabéns!" : "Fim de Jogo!"}
          </h2>
          <p className="text-gray-600 mb-4">
            {isVictory 
              ? `Você descobriu o enigma de ${subjectName}!` 
              : `Não foi dessa vez! A resposta de ${subjectName} era:`}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-lg font-semibold text-gray-800">{entity.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {isVictory 
                ? `em ${attempts} ${attempts === 1 ? "tentativa" : "tentativas"}` 
                : "Suas vidas acabaram"}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {isVictory 
              ? "Continue estudando! Cada enigma te aproxima mais do vestibular. 📚" 
              : "Não desanime! Amanhã tem um novo enigma para você. 💪"}
          </p>
          <button
            onClick={onClose}
            className="
              w-full py-3 rounded-xl
              bg-gray-900 text-white font-medium
              hover:bg-gray-800 transition-colors duration-200 cursor-pointer
            "
          >
            Voltar ao Lobby
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// LOBBY COMPONENTS
// -----------------------------------------------------------------------------

function SubjectCard({ subject, isPlayed, onSelect, isHighlighted, isDisabled }: SubjectCardProps & { isHighlighted?: boolean; isDisabled?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!isDisabled) {
      onSelect(subject);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(subject);
    }
  };

  const colors = colorMappings[subject.bgColor] || colorMappings["bg-blue-50"];
  const active = isHighlighted || isHovered;

  return (
    <motion.button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={
        isPlayed ? `${subject.name} - já jogado hoje` : `Jogar ${subject.name}`
      }
      animate={{
        y: active ? -8 : 0,
        scale: active ? 1.05 : 1,
        borderColor: isHighlighted ? colors.colorHex : (isHovered ? colors.borderHex : "#e5e7eb"),
        boxShadow: active
          ? `0 20px 25px -5px ${colors.shadow}`
          : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }}
      whileTap={(!isDisabled && !isPlayed) ? { scale: 0.98, y: 0 } : {}}
      transition={{
        duration: isHighlighted ? 0.1 : 0.2,
        ease: "easeOut",
      }}
      className={`
        relative w-full aspect-square rounded-2xl border p-6
        flex flex-col items-center justify-center gap-3
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
        ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
      `}
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        backgroundColor: active ? colors.background : "white",
        borderWidth: isHighlighted ? "3px" : "1px",
      }}
    >
      <motion.span
        animate={{
          scale: active ? 1.1 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="text-4xl md:text-5xl"
        role="img"
        aria-hidden="true"
      >
        {subject.icon}
      </motion.span>

      <motion.span
        animate={{
          color: active ? colors.colorHex : "#374151",
        }}
        transition={{ duration: 0.2 }}
        className="
          text-sm md:text-base font-medium tracking-wide
        "
      >
        {subject.name}
      </motion.span>

      {isPlayed && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="
            absolute top-3 right-3
            text-xs font-medium
            px-2 py-1 rounded-full
            border
          "
          style={{
            backgroundColor: isHovered ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.8)",
            borderColor: isHovered ? "#d1d5db" : "#e5e7eb",
            color: isHovered ? "#4b5563" : "#6b7280",
          }}
        >
          ✓ Jogado
        </motion.span>
      )}
    </motion.button>
  );
}

function SubjectGrid({
  subjects,
  playedSubjects,
  onSelectSubject,
  highlightedSubjectId,
  isSpinning,
}: SubjectGridProps & { highlightedSubjectId?: string | null; isSpinning?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="
        grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
        gap-4 md:gap-6
        w-full max-w-4xl mx-auto
      "
    >
      {subjects.map((subject, index) => (
        <motion.div
          key={subject.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            ease: "easeOut",
          }}
        >
          <SubjectCard
            subject={subject}
            isPlayed={playedSubjects.includes(subject.id)}
            onSelect={onSelectSubject}
            isHighlighted={highlightedSubjectId === subject.id}
            isDisabled={isSpinning}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function EnigmaLobby() {
  const MAX_LIVES = 8;
  // Game Mode State
  const [mode, setMode] = useState<GameMode>("lobby");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [playedSubjects] = useState<string[]>([]);

  // Roulette/Spin State
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedSubjectId, setHighlightedSubjectId] = useState<string | null>(null);

  // Gameplay State
  const [query, setQuery] = useState("");
  const [guesses, setGuesses] = useState<GuessFeedback[]>([]);
  const [targetEntity, setTargetEntity] = useState<Entity | null>(null);
  const [solved, setSolved] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Efeitos de som e confete ao vencer ou perder
  useEffect(() => {
    if (solved) {
      const audio = new Audio("/fanfare-trumpets.mp3");
      audio.volume = 0.7;
      audio.play().catch(() => {});
      
      // Carregamento dinâmico do confete para manter performance
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      });
    } else if (isGameOver) {
      const audio = new Audio("/Game-Over.mp3");
      audio.volume = 0.7;
      audio.play().catch(() => {});
    }
  }, [solved, isGameOver]);

  const availableEntities = selectedSubject
    ? getEntitiesForSubject(selectedSubject.id)
    : [];

  const guessedIds = guesses.map((g) => g.entity.id);
  const suggestions = availableEntities.filter(
    (entity) => !guessedIds.includes(entity.id)
  );

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    const target = getTargetEntityForDay(subject.id);
    setTargetEntity(target);
    setGuesses([]);
    setSolved(false);
    setShowVictoryModal(false);
    setQuery("");
    setMode("playing");
  };

  const handleRandomSubject = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Define o alvo final
    const unplayedSubjects = subjects.filter(s => !playedSubjects.includes(s.id));
    const pool = unplayedSubjects.length > 0 ? unplayedSubjects : subjects;
    const targetSubject = pool[Math.floor(Math.random() * pool.length)];
    const targetIndex = subjects.findIndex(s => s.id === targetSubject.id);

    // Configuração da animação: garantir pelo menos 2 voltas completas (2 * subjects.length)
    // e parar exatamente no índice do alvo.
    const cycles = 2;
    const totalSteps = (cycles * subjects.length) + targetIndex; 
    let currentStep = 0;
    
    const spin = () => {
      if (currentStep > totalSteps) {
        // Para exatamente no alvo
        setHighlightedSubjectId(targetSubject.id);
        
        setTimeout(() => {
          handleSelectSubject(targetSubject);
          setIsSpinning(false);
          setHighlightedSubjectId(null);
        }, 800);
        return;
      }

      // Segue a ordem sequencial 1 a 1
      const sequentialIndex = currentStep % subjects.length;
      setHighlightedSubjectId(subjects[sequentialIndex].id);
      
      currentStep++;

      // Efeito de desaceleração (easing)
      const progress = currentStep / totalSteps;
      const delay = 60 + (Math.pow(progress, 2) * 400);
      
      setTimeout(spin, delay);
    };

    spin();
  };

  const handleGuess = (entity: Entity) => {
    if (!targetEntity || solved || isGameOver) return;
    if (guessedIds.includes(entity.id)) return;

    const feedback = compareGuess(entity, targetEntity);
    const newGuesses = [...guesses, feedback];
    setGuesses(newGuesses);

    if (feedback.isCorrect) {
      setSolved(true);
      setTimeout(() => setShowVictoryModal(true), 500);
    } else if (newGuesses.length >= MAX_LIVES) {
      setIsGameOver(true);
      setTimeout(() => setShowVictoryModal(true), 500);
    }
  };

  const handleBackToLobby = () => {
    setMode("lobby");
    setSelectedSubject(null);
    setTargetEntity(null);
    setGuesses([]);
    setSolved(false);
    setShowVictoryModal(false);
    setQuery("");
    setShowSummary(false);
    setIsGameOver(false);
  };

  const colors = selectedSubject
    ? colorMappings[selectedSubject.bgColor] || colorMappings["bg-blue-50"]
    : colorMappings["bg-blue-50"];

  // =========================================================================
  // PLAYING MODE
  // =========================================================================
  if (mode === "playing" && selectedSubject) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="
          min-h-screen w-full
          px-4 py-8 md:py-12
          flex flex-col items-center
          bg-white
        "
      >
        <div className="w-full max-w-3xl">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <button
              onClick={handleBackToLobby}
              className="
                mb-4 text-sm text-gray-500 hover:text-gray-700
                transition-colors duration-200 flex items-center gap-1
                mx-auto cursor-pointer
              "
            >
              ← Voltar ao lobby
            </button>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
              style={{
                backgroundColor: colors.background,
                color: colors.colorHex,
              }}
            >
              <span className="text-xl">{selectedSubject.icon}</span>
              <span className="font-medium">{selectedSubject.name}</span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-2"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
              }}
            >
              Enigma do Dia
            </h1>
            <p
              className="text-gray-500"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
              }}
            >
              Descubra quem é a personalidade de hoje
            </p>
          </motion.header>

          <LivesDisplay currentGuesses={guesses.length} maxLives={MAX_LIVES} />

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-4 px-1">
              <span className="text-sm font-medium text-gray-500">O que você já descobriu:</span>
              <button
                onClick={() => setShowSummary(!showSummary)}
                className={`
                  text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 border-2
                  ${showSummary 
                    ? "bg-gray-900 border-gray-900 text-white" 
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"}
                `}
              >
                {showSummary ? "Esconder Resumo" : "Mostrar Resumo"}
              </button>
            </div>

            <AnimatePresence>
              {showSummary && targetEntity && (
                <GameSummary guesses={guesses} targetEntity={targetEntity} />
              )}
            </AnimatePresence>

            <SearchBar
              query={query}
              setQuery={setQuery}
              suggestions={suggestions}
              onSelect={handleGuess}
              disabled={solved || isGameOver}
              subjectColor={selectedSubject.bgColor}
            />
          </motion.div>

          {/* Guesses Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GuessesTable guesses={guesses} />
          </motion.div>

          {/* Attempts Counter */}
          {guesses.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-6 text-sm text-gray-400"
            >
              {guesses.length} {guesses.length === 1 ? "tentativa" : "tentativas"}
            </motion.div>
          )}
        </div>

        {/* Victory Modal */}
        {showVictoryModal && targetEntity && (
          <VictoryModal
            entity={targetEntity}
            attempts={guesses.length}
            onClose={handleBackToLobby}
            subjectName={selectedSubject.name}
            isVictory={solved}
          />
        )}
      </motion.main>
    );
  }

  // =========================================================================
  // LOBBY MODE
  // =========================================================================
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="
        min-h-screen w-full
        px-4 py-12 md:py-16
        flex flex-col items-center
        bg-white
      "
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl"
      >
        <header className="text-center mb-12 flex flex-col items-center">
          <h1
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-3"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            }}
          >
            Enigma Game
          </h1>
          <p
            className="text-lg md:text-xl text-gray-500 font-normal mb-8"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
            }}
          >
            Descubra o conteúdo do dia
          </p>

          <motion.button
            whileHover={!isSpinning ? { scale: 1.05 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
            onClick={handleRandomSubject}
            disabled={isSpinning}
            className={`
              mb-8 px-6 py-3 rounded-xl
              bg-indigo-600 text-white font-medium
              shadow-lg transition-all duration-200
              flex items-center gap-2
              ${isSpinning ? "opacity-50 cursor-not-allowed bg-gray-400" : "hover:bg-indigo-700 cursor-pointer"}
            `}
          >
            <span className={`text-xl ${isSpinning ? "animate-spin" : ""}`}>
              {isSpinning ? "🕒" : "🎲"}
            </span>
            {isSpinning ? "Sorteando..." : "Selecionar aleatoriamente"}
          </motion.button>
        </header>

        <SubjectGrid
          subjects={subjects}
          playedSubjects={playedSubjects}
          onSelectSubject={handleSelectSubject}
          highlightedSubjectId={highlightedSubjectId}
          isSpinning={isSpinning}
        />

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <p
            className="text-sm text-gray-700"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
            }}
          >
            Novos enigmas disponíveis todos os dias à meia-noite
          </p>
        </motion.footer>
      </motion.div>
    </motion.main>
  );
}
