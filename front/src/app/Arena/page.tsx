"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import LoginModal from "@/components/Login-modal";
import { minigamesData } from "@/lib/Data_games";
import { Gamepad2, Trophy, Target, Zap, Crown, Star, Clock, TrendingUp, Lock, SpellCheck, Grid3x3, CircleHelp, } from "lucide-react";

// Helper function para retornar o ícone correto
const getIcon = (iconName: string, className: string = "w-8 h-8") => {
  const icons: { [key: string]: React.ReactNode } = {
    zap: <Zap className={className} />,
    target: <Target className={className} />,
    trophy: <Trophy className={className} />,
    clock: <Clock className={className} />,
    crown: <Crown className={className} />,
    spellcheck: <SpellCheck className={className} />,
    grid3x3: <Grid3x3 className={className} />,
    CircleHelp: <CircleHelp className={className} />,
  };
  return icons[iconName] || icons[iconName.toLowerCase()] || <Gamepad2 className={className} />;
};

// Variantes para animações Apple-like
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function ArenaPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    }
  }, [status]);

  // Verificar se o usuário tem plano pago
  const hasPaidPlan = session?.user?.tier && session.user.tier !== "FREE";

  const handleNavigation = (href: string, requiresPlan = false) => {
    if (requiresPlan && !hasPaidPlan) {
      if (!isAuthenticated) {
        setIsLoginModalOpen(true);
      } else {
        setIsNavigating(true);
        router.push("/paidPlan");
      }
      return;
    }
    setIsNavigating(true);
    router.push(href);
  };

  if (isNavigating) {
    return <LoadingScreen message="Carregando Arena..." />;
  }

  return (
    <div className="themed-main-container min-h-screen force-themed-bg flex flex-col">
      <Header />

      <motion.main 
        className="flex-1" 
        id="arena"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto px-6 py-12 max-w-[1400px]">
          {/* Hero Section - macOS Style */}
          <div className="mb-16">
            <div className="text-center mb-8">
              {/* Badge - macOS Style */}
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2 bg-gray-100 backdrop-blur-xl themed-text px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-gray-200"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Hub de Minigames</span>
              </motion.div>

              {/* Título - macOS Style */}
              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-7xl font-bold themed-text mb-6 tracking-tight"
              >
                Arena Vestibuline
              </motion.h1>

              {/* Subtítulo - macOS Style */}
              <motion.p 
                variants={itemVariants}
                className="themed-text-secondary text-lg md:text-xl max-w-3xl mx-auto mb-8 font-normal"
              >
                Aprenda de forma interativa através de jogos educativos.
                <br className="hidden md:block" />
                Desafie-se, evolua e divirta-se enquanto estuda.
              </motion.p>

              {/* Quick Stats - macOS Style */}
              <motion.div 
                variants={containerVariants}
                className="flex flex-wrap gap-8 justify-center items-center mb-8"
              >
                <motion.div variants={itemVariants} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-semibold themed-text">
                      {minigamesData.length}
                    </div>
                    <div className="text-sm themed-text-secondary font-medium">
                      Jogos
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-semibold themed-text">
                      {minigamesData.filter((g) => g.featured).length}
                    </div>
                    <div className="text-sm themed-text-secondary font-medium">
                      Destaque
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-semibold themed-text">
                      {
                        minigamesData.filter(
                          (g) => g.status === "premium"
                        ).length
                      }
                    </div>
                    <div className="text-sm themed-text-secondary font-medium">
                      PRO
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Mascot - macOS Style */}
              <motion.div 
                variants={itemVariants}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative inline-block mt-8"
              >
                <div className="relative w-56 h-56 md:w-64 md:h-64">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/Mascote/banners/Camaleão_22.png"
                      alt="Mascote Vestibuline Arena"
                      width={220}
                      height={220}
                      className="w-52 h-52 md:w-60 md:h-60 object-contain drop-shadow-2xl"
                    />
                  </div>
                  {/* Subtle glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Jogos em Destaque - App Store Style */}
          {minigamesData.filter((game) => game.featured).length > 0 && (
            <motion.div variants={itemVariants} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h2 className="text-3xl font-semibold themed-text tracking-tight">
                  Em Destaque
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {minigamesData
                  .filter((game) => game.featured)
                  .map((game) => (
                    <motion.div
                      key={game.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative bg-white backdrop-blur-xl rounded-[28px] p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Premium Badge */}
                      {game.status === "premium" && (
                        <div className="absolute top-6 right-6 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                          <Crown className="w-3.5 h-3.5" />
                          PRO
                        </div>
                      )}

                      {/* Coming Soon Badge */}
                      {game.status === "coming-soon" && (
                        <div className="absolute top-6 right-6 z-20 bg-gray-500/90 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          EM BREVE
                        </div>
                      )}

                      <div className="relative z-10">
                        {/* Icon */}
                        <motion.div
                          className={`w-20 h-20 bg-gradient-to-br ${game.color} rounded-[22px] flex items-center justify-center text-white mb-6 transition-transform duration-300 shadow-xl group-hover:scale-105`}
                        >
                          {getIcon(game.iconName, "w-10 h-10")}
                        </motion.div>

                        {/* Title & Description */}
                        <h3 className="text-2xl font-semibold themed-text mb-3 tracking-tight">
                          {game.title}
                        </h3>
                        <p className="themed-text-secondary text-base mb-6 leading-relaxed line-clamp-2">
                          {game.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-2 mb-6 text-sm themed-text-secondary">
                          <Target className="w-4 h-4" />
                          <span className="font-medium">{game.difficulty}</span>
                        </div>

                        {/* CTA Button - App Store Style */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            game.status !== "coming-soon" &&
                            handleNavigation(
                              `/Arena/${game.slug}`,
                              game.status === "premium"
                            )
                          }
                          disabled={game.status === "coming-soon"}
                          className={`w-full py-4 px-6 rounded-[14px] font-semibold text-white bg-gradient-to-br ${game.color} transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg ${
                            game.status === "coming-soon"
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:opacity-95 cursor-pointer"
                          }`}
                        >
                          {game.status === "coming-soon" ? (
                            <>
                              <Clock className="w-5 h-5" />
                              <span>Em Breve</span>
                            </>
                          ) : game.status === "premium" && !hasPaidPlan ? (
                            <>
                              <Lock className="w-5 h-5" />
                              <span>Obter com PRO</span>
                            </>
                          ) : (
                            <>
                              <Gamepad2 className="w-5 h-5" />
                              <span>Jogar Agora</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Todos os Minigames - App Store Grid Style */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Gamepad2 className="w-8 h-8 text-blue-500" />
              <h2 className="text-3xl font-semibold themed-text tracking-tight">
                Todos os Minigames
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {minigamesData.map((game) => (
                <motion.div
                  key={game.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-white backdrop-blur-xl rounded-[28px] p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Premium Badge */}
                  {game.status === "premium" && (
                    <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                      <Crown className="w-3.5 h-3.5" />
                      PRO
                    </div>
                  )}

                  {/* Coming Soon Badge */}
                  {game.status === "coming-soon" && (
                    <div className="absolute top-4 right-4 z-20 bg-gray-500/90 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      EM BREVE
                    </div>
                  )}

                  <div className="relative z-10 h-full">
                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-[18px] flex items-center justify-center text-white mb-4 transition-transform duration-300 shadow-xl group-hover:scale-105`}
                    >
                      {getIcon(game.iconName, "w-8 h-8")}
                    </motion.div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-semibold themed-text mb-2 tracking-tight">
                      {game.title}
                    </h3>
                    <p className="themed-text-secondary text-sm mb-4 leading-relaxed line-clamp-2">
                      {game.description}
                    </p>

                    {/* Meta Info - Grid Style */}
                    <div className="flex items-center gap-2 mb-4 text-xs themed-text-secondary">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">{game.difficulty}</span>
                    </div>

                    {/* CTA Button - App Store Style */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        game.status !== "coming-soon" &&
                        handleNavigation(
                          `/Arena/${game.slug}`,
                          game.status === "premium"
                        )
                      }
                      disabled={game.status === "coming-soon"}
                      className={`w-full py-3 px-4 rounded-[12px] font-semibold text-white bg-gradient-to-br ${game.color} transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                        game.status === "coming-soon"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-95 cursor-pointer"
                      }`}
                    >
                      {game.status === "coming-soon" ? (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Em Breve</span>
                        </>
                      ) : game.status === "premium" && !hasPaidPlan ? (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Obter com PRO</span>
                        </>
                      ) : (
                        <>
                          <Gamepad2 className="w-4 h-4" />
                          <span>Jogar Agora</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA para usuários FREE - macOS Style */}
          {!hasPaidPlan && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="mb-16"
            >
              <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-[32px] p-10 md:p-14 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>

                <div className="relative z-10 text-center text-white">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-20 h-20 bg-white backdrop-blur-xl rounded-[22px] flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  >
                    <Crown className="w-10 h-10 text-blue-600" />
                  </motion.div>

                  <h3 className="text-4xl font-bold mb-4 tracking-tight">
                    Desbloqueie Todos os Minigames
                  </h3>

                  <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
                    Assine o plano PRO e tenha acesso ilimitado a todos os
                    minigames, modos exclusivos e conquistas especiais.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation("/paidPlan")}
                      className="bg-white text-blue-600 font-semibold py-4 px-8 rounded-[14px] transition-all duration-300 shadow-xl flex items-center gap-2.5 cursor-pointer"
                    >
                      <Crown className="w-5 h-5" />
                      <span>Assinar PRO Agora</span>
                    </motion.button>

                    <Link
                      href="/#planos"
                      className="text-white/90 font-medium hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span>Ver todos os benefícios</span>
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Benefícios da Arena - macOS Clean Style */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-semibold themed-text text-center mb-10 tracking-tight">
              Por que jogar na Arena?
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              { [
                {
                  icon: <TrendingUp className="w-7 h-7" />,
                  title: "Aprenda Brincando",
                  description:
                    "Absorva conteúdo de forma natural e divertida enquanto joga",
                  color: "from-green-500 to-emerald-600",
                },
                {
                  icon: <Trophy className="w-7 h-7" />,
                  title: "Compita e Evolua",
                  description:
                    "Desafie outros estudantes e acompanhe seu progresso no ranking",
                  color: "from-amber-500 to-yellow-600",
                },
                {
                  icon: <Star className="w-7 h-7" />,
                  title: "Conquistas Únicas",
                  description:
                    "Desbloqueie badges e recompensas exclusivas pelos seus feitos",
                  color: "from-purple-500 to-pink-600",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white backdrop-blur-xl rounded-[24px] p-8 shadow-sm border border-gray-200 text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-[18px] flex items-center justify-center text-white mx-auto mb-5 shadow-lg transition-transform duration-300`}
                  >
                    {benefit.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold themed-text mb-3 tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="themed-text-secondary text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/Arena"
        isRequired={status === 'unauthenticated'}
      />

      <Footer />
    </div>
  );
}
