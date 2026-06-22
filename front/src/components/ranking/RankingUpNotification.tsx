"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Trophy,
  Medal,
  Crown,
  Award,
  Brain,
  FileText,
  Target,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { animate, utils } from "animejs";
import {
  isRankUp,
  shouldShowRankUpPopup,
  RankType,
} from "@/lib/ranking/rankUpUtils";
import { computeBadges } from "@/lib/badges/badgeUtils";
import { getRankProgress, getRankFromScore } from "@/lib/ranking/rankUtils";
import { DEV_CONFIG } from "@/lib/data/profile";

// Cores das partículas por elo
const PARTICLE_COLORS = {
  Bronze: ["bg-orange-500", "bg-amber-600", "bg-yellow-700", "bg-orange-400"],
  Prata: ["bg-slate-400", "bg-slate-500", "bg-slate-300", "bg-zinc-400"],
  Ouro: ["bg-yellow-400", "bg-amber-500", "bg-yellow-600", "bg-amber-400"],
  Diamante: ["bg-cyan-400", "bg-blue-500", "bg-indigo-500", "bg-cyan-300"],
};

// Ícones correspondentes para as conquistas
const BADGE_ICONS = {
  Brain: Brain,
  FileText: FileText,
  Target: Target,
  Trophy: Trophy,
};

// Estilos temáticos para cada liga/elo das badges
const BADGE_TIER_STYLES = {
  bloqueado: {
    bg: "bg-slate-500/10 dark:bg-slate-800/20",
    border: "border-slate-200/50 dark:border-slate-800/40",
    text: "text-slate-500 dark:text-slate-400",
    iconText: "text-slate-600 dark:text-slate-400",
    label: "Bloqueado",
  },
  bronze: {
    bg: "bg-amber-500/[0.08]",
    border: "border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    iconText: "text-amber-600 dark:text-amber-400",
    label: "Bronze",
  },
  prata: {
    bg: "bg-gray-400/[0.08]",
    border: "border-gray-400/20",
    text: "text-slate-600 dark:text-slate-300",
    iconText: "text-slate-600 dark:text-slate-300",
    label: "Prata",
  },
  ouro: {
    bg: "bg-yellow-400/[0.08]",
    border: "border-yellow-500/20",
    text: "text-amber-600 dark:text-yellow-400",
    iconText: "text-amber-600 dark:text-yellow-400",
    label: "Ouro",
  },
  diamante: {
    bg: "bg-cyan-400/[0.08]",
    border: "border-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
    iconText: "text-cyan-600 dark:text-cyan-400",
    label: "Diamante",
  },
  platina: {
    bg: "bg-purple-500/[0.08]",
    border: "border-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
    iconText: "text-purple-600 dark:text-purple-400",
    label: "Platina",
  },
};

// Configurações visuais por Rank
const RANK_CONFIGS = {
  Bronze: {
    name: "Bronze",
    textColor: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    icon: Award,
    iconColor: "text-orange-600",
    mascote: "/Mascote/banners/Camaleão_10.png",
    accentGlow: "shadow-orange-500/20",
  },
  Prata: {
    name: "Prata",
    textColor: "text-slate-500 dark:text-slate-300",
    gradient: "from-slate-400 to-slate-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-400/30",
    icon: Medal,
    iconColor: "text-slate-500",
    mascote: "/Mascote/banners/Camaleão_29.png",
    accentGlow: "shadow-slate-400/20",
  },
  Ouro: {
    name: "Ouro",
    textColor: "text-yellow-600 dark:text-yellow-400",
    gradient: "from-yellow-400 via-amber-500 to-yellow-600",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    icon: Trophy,
    iconColor: "text-yellow-500",
    mascote: "/Mascote/banners/Camaleão_8.png",
    accentGlow: "shadow-yellow-500/20",
  },
  Diamante: {
    name: "Diamante",
    textColor: "text-cyan-500 dark:text-cyan-400",
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    icon: Crown,
    iconColor: "text-cyan-500",
    mascote: "/Mascote/banners/Camaleão_12.png",
    accentGlow: "shadow-cyan-500/20",
  },
};

type AnimationPhase =
  | "idle"
  | "progress-start"
  | "shattering"
  | "reveal"
  | "completed";

export default function RankingUpNotification() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [popupData, setPopupData] = useState<{
    oldRank: RankType;
    newRank: RankType;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle");
  const [userStats, setUserStats] = useState<any>(null);
  const [userScore, setUserScore] = useState<number>(0);

  // Função central para gerenciar a transição de ranking
  const handleRankTransition = (currentRank: RankType) => {
    const storedLastRank = localStorage.getItem(
      "last_user_rank",
    ) as RankType | null;

    if (!storedLastRank) {
      // Primeira carga: Apenas salva o ranking atual para referência
      localStorage.setItem("last_user_rank", currentRank);
    } else if (storedLastRank !== currentRank) {
      // Detectado mudança de rank! Dispara o modal e atualiza o storage
      setPopupData({ oldRank: storedLastRank, newRank: currentRank });
      localStorage.setItem("last_user_rank", currentRank);
    }
  };

  // Efeito 1: Polling periódico para verificar o ranking atual do usuário via API (Geral / Mensal)
  useEffect(() => {
    if (status !== "authenticated") return;

    const checkRanking = async () => {
      try {
        const token = localStorage.getItem("user_data");
        if (!token) return;

        const res = await fetch(
          "/api/ranking?universidade=geral&periodo=mensal",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) return;

        const data = await res.json();
        if (!Array.isArray(data)) return;

        const currentUser = data.find((u: any) => u.isCurrentUser === true);
        if (!currentUser) return;

        // ━━ DEV MODE: Substitui o rank se habilitado ━━
        if (DEV_CONFIG.enabled) {
          currentUser.score = DEV_CONFIG.devScore;
          currentUser.rank = getRankFromScore(DEV_CONFIG.devScore);
        }

        handleRankTransition(currentUser.rank as RankType);
      } catch (error) {
        console.error(
          "[RankingUpNotification] Erro ao consultar ranking via API:",
          error,
        );
      }
    };

    checkRanking();
    const interval = setInterval(checkRanking, 20000);

    return () => clearInterval(interval);
  }, [status]);

  // Efeito 2: Escuta alterações na variável "userRank" do sessionStorage e no evento "rankUpdated"
  useEffect(() => {
    const checkSessionStorageRank = () => {
      const currentRank = sessionStorage.getItem("userRank") as RankType | null;
      if (currentRank) {
        handleRankTransition(currentRank);
      }
    };

    // Executa uma verificação inicial
    checkSessionStorageRank();

    // Registra o ouvinte para o evento disparado quando o app atualiza o rank do usuário
    window.addEventListener("rankUpdated", checkSessionStorageRank);

    // Também escuta eventos storage para sincronizar abas do mesmo navegador
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userRank" && e.newValue) {
        handleRankTransition(e.newValue as RankType);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("rankUpdated", checkSessionStorageRank);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Efeito auxiliar para testes manuais diretos via console (evento personalizado customizado)
  useEffect(() => {
    const handleTestEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { oldRank, newRank } = customEvent.detail || {};
      if (oldRank && newRank) {
        setPopupData({ oldRank, newRank });
      }
    };

    window.addEventListener("test-rank-up", handleTestEvent);
    return () => window.removeEventListener("test-rank-up", handleTestEvent);
  }, []);

  // Efeito 3: Controla se exibimos o modal com base na rota atual (supressão na simulação de prova)
  useEffect(() => {
    if (popupData && shouldShowRankUpPopup(pathname)) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [pathname, popupData]);

  // Efeito 3.5: Notifica outros componentes (ex: Header) sobre o estado do modal via custom event
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(showModal ? "rankingModalOpen" : "rankingModalClose"),
    );
    return () => {
      // Garante que ao desmontar o componente o header sempre limpe o blur
      window.dispatchEvent(new CustomEvent("rankingModalClose"));
    };
  }, [showModal]);

  // Efeito 4: Máquina de estados das animações estilo FPS
  useEffect(() => {
    if (!showModal || !popupData) {
      setAnimationPhase("idle");
      return;
    }

    // Fase 1: Inicia a animação de preenchimento/esvaziamento do elo antigo
    setAnimationPhase("progress-start");

    // Fase 2: Após 1.2s, inicia o tremor (shake) e quebra do elo antigo (shatter)
    const shatterTimer = setTimeout(() => {
      setAnimationPhase("shattering");

      // Gatilho de partículas de shatter do elo antigo
      triggerParticles(".shatter-particle", 120);

      // Fase 3: Após 0.6s de tremor/shatter, revela o novo elo com flash e shockwave
      const revealTimer = setTimeout(() => {
        setAnimationPhase("reveal");

        // Gatilho de partículas de luz/confete do elo novo
        triggerParticles(".reveal-particle", 220);

        // Fase 4: Após 0.8s de impacto da revelação, estabiliza no estado final (completed)
        const completedTimer = setTimeout(() => {
          setAnimationPhase("completed");
        }, 800);

        return () => clearTimeout(completedTimer);
      }, 600);

      return () => clearTimeout(revealTimer);
    }, 1200);

    return () => clearTimeout(shatterTimer);
  }, [showModal, popupData]);

  // Efeito 5: Busca as estatísticas e pontuação do usuário quando o modal é aberto
  useEffect(() => {
    if (!showModal) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("user_data");
        if (!token) return;

        const res = await fetch("/api/user/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUserStats(data.stats);
        }
      } catch (error) {
        console.error(
          "[RankingUpNotification] Erro ao buscar estatísticas do usuário:",
          error,
        );
      }
    };

    const fetchScore = async () => {
      // ━━ DEV MODE: usa score estático definido em profile.ts (DEV_CONFIG.devScore) ━━
      if (DEV_CONFIG.enabled) {
        setUserScore(DEV_CONFIG.devScore);
        console.debug(
          `[RankingUpNotification] 🚧 DEV MODE — score mockado: ${DEV_CONFIG.devScore} pts`,
        );
        return;
      }

      try {
        const token = localStorage.getItem("user_data");
        if (!token) return;

        const res = await fetch(
          "/api/ranking?universidade=geral&periodo=mensal",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const currentUser = data.find((u: any) => u.isCurrentUser === true);
            if (currentUser?.score != null) {
              setUserScore(currentUser.score);
            }
          }
        }
      } catch (error) {
        console.error(
          "[RankingUpNotification] Erro ao buscar pontuação do usuário:",
          error,
        );
      }
    };

    fetchStats();
    fetchScore();
  }, [showModal]);

  // Função para disparar a explosão física das partículas com Anime.js
  const triggerParticles = (className: string, radius: number) => {
    // Reseta as partículas na origem
    animate(className, {
      translateX: 0,
      translateY: 0,
      scale: 0,
      opacity: 0,
      duration: 0,
    });

    // Anima a dispersão usando a API do animejs v4
    animate(className, {
      translateX: () => utils.random(-radius, radius),
      translateY: () => utils.random(-radius, radius),
      scale: () => [0, utils.random(0.8, 1.6), 0],
      opacity: [0, 1, 0],
      rotate: () => utils.random(-360, 360),
      duration: () => utils.random(1500, 2500),
      easing: "easeOutExpo",
      delay: utils.stagger(10),
    });
  };

  const handleClose = () => {
    // Limpa a notificação da fila
    setPopupData(null);
    setShowModal(false);
  };

  if (!popupData) return null;

  const isPromotion = isRankUp(popupData.oldRank, popupData.newRank);
  const currentConfig = RANK_CONFIGS[popupData.newRank];
  const oldConfig = RANK_CONFIGS[popupData.oldRank] || RANK_CONFIGS.Bronze;
  const IconComponent = currentConfig.icon;
  const OldIconComponent = oldConfig.icon;

  // Estatísticas e computação das Badges
  const stats = userStats || { questoes: 250, simulados: 12, percentagem: 85 };
  const computedStats = {
    questoes: stats.questoes || 0,
    simulados: stats.simulados || 0,
    acertos: stats.acertos || 0,
    percentagem: stats.percentagem || 0,
    trend_simulados: { value: 0, type: "up" as const },
    trend_questoes: { value: 0, type: "up" as const },
    trend_acertos: { value: 0, type: "up" as const },
    trend_percentagem: { value: 0, type: "up" as const },
  };
  const rankingData = {
    position: 1,
    name: session?.user?.name || "Usuário",
    score: userScore,
    rank: popupData.newRank,
    isCurrentUser: true,
  };

  // Calcula os limites de pontos do elo antigo e novo para exibir na barra de progresso
  // Usa os thresholds do próprio rank para calcular pontos necessários
  const scoreProgress = getRankProgress(userScore);
  const displayScore = userScore > 0 ? userScore.toLocaleString("pt-BR") : "—";
  const nextThresholdLabel = scoreProgress.nextRank
    ? `${scoreProgress.nextThreshold.toLocaleString("pt-BR")} pts`
    : "MAX";
  const currentThresholdLabel = `${scoreProgress.currentThreshold.toLocaleString("pt-BR")} pts`;
  const badges = computeBadges(computedStats, rankingData);

  // Variantes de Tremor de Tela (Screen Shake) do Modal
  const shakeVariants = {
    shake: {
      x: [0, -5, 5, -5, 5, -3, 3, -1, 1, 0],
      y: [0, 2, -2, 2, -2, 1, -1, 0],
      transition: { duration: 0.5 },
    },
    heavyShake: {
      x: [0, -10, 10, -10, 10, -6, 6, -3, 3, 0],
      y: [0, 8, -8, 8, -8, 4, -4, 2, -2, 0],
      transition: { duration: 0.6 },
    },
    idle: { x: 0, y: 0 },
  };

  // Título e subtexto dinâmicos com base em promoção ou rebaixamento
  const titleText = isPromotion ? "NOVO RANK ALCANCADO!" : "LIGA REBAIXADA";
  const subText = isPromotion
    ? "Seu esforço nos estudos está dando resultados. Você subiu de liga!"
    : "Não desanime! Revise seus erros nos simulados e dê a volta por cima.";

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay de fundo escurecido com blur sutil e elegante (Glassmorphism) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/25 dark:bg-black/60 backdrop-blur-[6px]"
          />

          {/* Container Principal do Modal com Spring Animation e Screen Shake */}
          <motion.div
            variants={shakeVariants}
            animate={
              animationPhase === "shattering"
                ? "shake"
                : animationPhase === "reveal"
                  ? "heavyShake"
                  : "idle"
            }
            initial="idle"
            className={`relative max-w-md w-full bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-white/10 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center text-center transition-all duration-500 ${
              animationPhase === "completed"
                ? currentConfig.accentGlow
                : oldConfig.accentGlow
            }`}
          >
            {/* Efeitos de Fundo de Gradiente Radial translúcido */}
            <div
              className={`absolute -top-24 -left-24 w-52 h-52 rounded-full bg-gradient-to-br ${
                animationPhase === "progress-start" ||
                animationPhase === "shattering"
                  ? oldConfig.gradient
                  : currentConfig.gradient
              } opacity-15 blur-3xl pointer-events-none transition-all duration-500`}
            />
            <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            {/* Flash de Revelação Branco (Flash Overlay) */}
            {animationPhase === "reveal" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 2] }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 bg-white dark:bg-cyan-200 pointer-events-none z-40"
              />
            )}

            {/* Área Hero do Ícone e Partículas */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-6 z-20">
              {/* Shockwave Ring */}
              {animationPhase === "reveal" && (
                <motion.div
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute inset-0 rounded-full border-4 border-cyan-400 opacity-80`}
                  style={{
                    borderColor: currentConfig.textColor.includes("cyan")
                      ? "#22d3ee"
                      : currentConfig.textColor.includes("yellow")
                        ? "#eab308"
                        : currentConfig.textColor.includes("slate")
                          ? "#94a3b8"
                          : "#f97316",
                  }}
                />
              )}

              {/* Brilho pulsante de fundo */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${
                  animationPhase === "progress-start" ||
                  animationPhase === "shattering"
                    ? oldConfig.gradient
                    : currentConfig.gradient
                } opacity-40 blur-xl transition-all duration-500`}
              />

              <AnimatePresence mode="wait">
                {animationPhase === "progress-start" ||
                animationPhase === "shattering" ? (
                  <motion.div
                    key="old-icon"
                    animate={
                      animationPhase === "shattering"
                        ? {
                            scale: [1, 1.15, 0],
                            opacity: [1, 1, 0],
                            rotate: [0, -10, 15],
                            transition: { duration: 0.5 },
                          }
                        : { scale: 1, opacity: 1 }
                    }
                    exit={{ scale: 0, opacity: 0 }}
                    className={`relative w-20 h-20 rounded-full bg-transparent flex items-center justify-center ${
                      animationPhase === "shattering" && !isPromotion
                        ? "grayscale contrast-125"
                        : ""
                    }`}
                  >
                    <OldIconComponent
                      className={`w-10 h-10 ${oldConfig.textColor}`}
                    />

                    {/* Crack SVG lines overlay para rebaixamentos */}
                    {animationPhase === "shattering" && !isPromotion && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.85 }}
                        className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden pointer-events-none"
                      >
                        <svg
                          className="w-full h-full absolute inset-0 text-red-600/70"
                          viewBox="0 0 100 100"
                        >
                          <path
                            d="M 50 10 L 48 35 L 56 48 L 44 65 L 50 90 M 25 50 L 48 48 L 56 48 L 78 52"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="new-icon"
                    initial={{ scale: 0, rotate: -45, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 14 }}
                    className="relative w-20 h-20 rounded-full bg-transparent flex items-center justify-center"
                  >
                    <IconComponent
                      className={`w-10 h-10 ${currentConfig.textColor}`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Partículas de Shatter (Elo antigo) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 35 }).map((_, i) => {
                  const colors = PARTICLE_COLORS[popupData.oldRank] || [
                    "bg-slate-400",
                  ];
                  const randomColor = colors[i % colors.length];
                  return (
                    <div
                      key={`shatter-p-${i}`}
                      className={`shatter-particle absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full ${randomColor}`}
                      style={{
                        transform: "translate(-50%, -50%) scale(0)",
                        opacity: 0,
                      }}
                    />
                  );
                })}
              </div>

              {/* Partículas de Revelação (Elo novo) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 45 }).map((_, i) => {
                  const colors = PARTICLE_COLORS[popupData.newRank] || [
                    "bg-blue-500",
                  ];
                  const randomColor = colors[i % colors.length];
                  return (
                    <div
                      key={`reveal-p-${i}`}
                      className={`reveal-particle absolute left-1/2 top-1/2 w-3 h-3 rounded-full ${randomColor}`}
                      style={{
                        transform: "translate(-50%, -50%) scale(0)",
                        opacity: 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Barra de Progresso Linear Celebrativa (FPS Style) */}
            <div className="w-full max-w-xs mb-8 z-20 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="tracking-widest text-[10px]">
                  PROGRESSO DE LIGA
                </span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {animationPhase === "progress-start" ||
                  animationPhase === "shattering"
                    ? isPromotion
                      ? `${displayScore} pts → ${nextThresholdLabel}`
                      : `${displayScore} pts → ${currentThresholdLabel}`
                    : `${displayScore} pts / ${nextThresholdLabel}`}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800/40 rounded-full overflow-hidden clay-card relative">
                <motion.div
                  initial={{ width: isPromotion ? "80%" : "20%" }}
                  animate={{
                    width:
                      animationPhase === "progress-start" ||
                      animationPhase === "shattering"
                        ? isPromotion
                          ? "100%"
                          : "0%"
                        : animationPhase === "reveal"
                          ? isPromotion
                            ? "0%"
                            : "100%"
                          : isPromotion
                            ? `${scoreProgress.percent}%`
                            : `${scoreProgress.percent}%`,
                  }}
                  transition={
                    animationPhase === "reveal"
                      ? { duration: 0 } // reseta instantaneamente na revelação
                      : { duration: 1.1, ease: "easeInOut" }
                  }
                  className={`h-full bg-gradient-to-r ${
                    animationPhase === "progress-start" ||
                    animationPhase === "shattering"
                      ? oldConfig.gradient
                      : currentConfig.gradient
                  } rounded-full shadow-sm`}
                />
              </div>
            </div>

            {/* Elementos Finais (Mascote, Título, Descrição, Badges e Botões) com transição de altura fluida */}
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={
                animationPhase === "completed"
                  ? { opacity: 1, height: "auto", transitionEnd: { overflow: "visible" } }
                  : { opacity: 0, height: 0, overflow: "hidden" }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full flex flex-col items-center z-20"
            >
              {/* Mascote Festivo / Triste */}
              <motion.div className="relative w-28 h-28 mb-4 flex justify-center items-center">
                <Image
                  src={
                    isPromotion
                      ? currentConfig.mascote
                      : "/Mascote/banners/Camaleão_triste/Camaleão_2.png"
                  }
                  alt={isPromotion ? "Mascote Comemorando" : "Mascote Triste"}
                  width={110}
                  height={110}
                  className="object-contain drop-shadow-xl"
                />
              </motion.div>

              {/* Título de Conquista */}
              <h2
                className={`text-2xl font-bold bg-gradient-to-r ${currentConfig.gradient} bg-clip-text text-transparent tracking-tight mb-2`}
              >
                {titleText}
              </h2>

              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium max-w-xs mb-6">
                {subText}
              </p>

              {/* Comparativo de Ranks (Progresso) */}
              <div className="flex items-center gap-4 bg-gray-100/80 dark:bg-slate-950/40 border border-gray-200/50 dark:border-slate-800/30 px-6 py-3 rounded-2xl mb-6 clay-card">
                <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  <OldIconComponent className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm">{popupData.oldRank}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-1.5 font-bold">
                  <IconComponent
                    className={`w-4 h-4 ${currentConfig.textColor}`}
                  />
                  <span
                    className={`text-sm bg-gradient-to-r ${currentConfig.gradient} bg-clip-text text-transparent`}
                  >
                    {popupData.newRank}
                  </span>
                </div>
              </div>

              {/* Seção de Badges (Grade de Conquistas) */}
              <div className="w-full flex flex-col items-start mb-6 text-left">
                <span className="tracking-widest text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase">
                  Suas Badges & Ligas
                </span>
                <div className="grid grid-cols-2 gap-3 w-full p-1">
                  {badges.map((badge) => {
                    const Icon =
                      BADGE_ICONS[badge.icon as keyof typeof BADGE_ICONS] ||
                      Brain;
                    const tierStyle =
                      BADGE_TIER_STYLES[
                        badge.currentTier as keyof typeof BADGE_TIER_STYLES
                      ] || BADGE_TIER_STYLES.bloqueado;

                    const badgeProgressPct =
                      badge.nextTierRequirement && badge.nextTierRequirement > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (badge.progress / badge.nextTierRequirement) * 100,
                            ),
                          )
                        : badge.currentTier !== "bloqueado"
                          ? 100
                          : 0;

                    const isMaxTier =
                      !badge.nextTierRequirement &&
                      badge.currentTier !== "bloqueado";

                    const isUnlocked = badge.currentTier !== "bloqueado";

                    return (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className={`relative bg-gray-100/50 dark:bg-slate-950/40 border rounded-3xl p-3 flex flex-col gap-2 transition-all duration-300 ${
                          tierStyle.border
                        } hover:shadow-md hover:scale-[1.02] clay-card ${!isUnlocked ? "opacity-60 grayscale" : ""}`}
                        style={{
                          boxShadow: isUnlocked
                            ? `0 0 12px -4px var(--badge-glow, rgba(0,0,0,0)), inset 1px 1px 3px var(--clay-highlight), inset -1px -1px 3px var(--clay-shadow)`
                            : `inset 1px 1px 3px var(--clay-highlight), inset -1px -1px 3px var(--clay-shadow)`,
                        }}
                      >
                        {/* Linha superior: ícone + nome + tier */}
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border relative overflow-hidden ${
                              tierStyle.bg
                            } ${tierStyle.border}`}
                          >
                            {isUnlocked ? (
                              <Icon className={`w-4 h-4 ${tierStyle.iconText}`} />
                            ) : (
                              <>
                                <Icon className="w-4 h-4 grayscale opacity-30 text-slate-500" />
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-200/55 dark:bg-slate-950/50 backdrop-blur-[2px] rounded-xl z-20">
                                  <Lock size={14} className="text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                              {badge.name}
                            </span>
                            <span
                              className={`text-[9px] font-bold tracking-wide uppercase leading-none mt-0.5 ${tierStyle.text}`}
                            >
                              {isUnlocked ? (isMaxTier ? `★ ${tierStyle.label}` : tierStyle.label) : "Bloqueado"}
                            </span>
                          </div>
                        </div>

                        {/* Mini barra de progresso da badge */}
                        {!isMaxTier ? (
                          <div className="flex flex-col gap-1">
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${badgeProgressPct}%` }}
                                transition={{
                                  duration: 0.8,
                                  delay: 0.3,
                                  ease: "easeOut",
                                }}
                                className={`h-full bg-gradient-to-r ${
                                  isUnlocked
                                    ? "from-blue-500 to-indigo-500"
                                    : "from-slate-400 to-slate-350 dark:from-slate-600 dark:to-slate-500"
                                } rounded-full`}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] text-slate-500 dark:text-slate-400 font-mono">
                                {badge.progress.toLocaleString("pt-BR")}
                              </span>
                              <span className="text-[8px] text-slate-400 dark:text-slate-600 font-mono">
                                /{" "}
                                {badge.nextTierRequirement?.toLocaleString(
                                  "pt-BR",
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[8px] text-slate-600 dark:text-slate-400 font-medium">
                            Nível máximo atingido
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Fechar com Interação HIG (Scale Tap) e Claymorphism */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleClose}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${currentConfig.gradient} text-white font-bold text-base clay-button cursor-pointer`}
              >
                {isPromotion ? "Continuar Estudando" : "Voltar aos Estudos"}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
