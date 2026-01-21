"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// Motion variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const fadeIn = (direction = "up", delay = 0): Variants => ({
  hidden: {
    opacity: 0,
    y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
    x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
    scale: 0.97,
    filter: "blur(10px)",
  },
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
      mass: 0.8,
      delay: delay,
    },
  },
});

export default function PrivacyPolicyPage() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' 
        ? 'bg-[#1d1d1f]' 
        : 'bg-[#f5f5f7]'
    }`}>
      <Header />
      <main className="flex-1 relative overflow-hidden">
        {/* Subtle Background - macOS Style */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${
            theme === 'dark'
              ? 'bg-blue-600/10'
              : 'bg-blue-500/5'
          }`}></div>
          <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${
            theme === 'dark'
              ? 'bg-purple-600/10'
              : 'bg-purple-500/5'
          }`}></div>
        </div>

        <div className="max-w-5xl mx-auto py-12 md:py-20 px-6 md:px-8 relative z-10">
          {/* Floating welcome mascot - macOS Style */}
          <motion.div
            className="fixed top-28 right-8 md:right-12 lg:right-16 w-20 h-20 md:w-24 md:h-24 z-50 hidden lg:block"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="relative w-full h-full drop-shadow-2xl">
              <Image
                src="/Mascote/banners/Camaleão_11.png"
                alt="Mascote Guia"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* Header Section - macOS Style */}
            <div className="text-center mb-16 md:mb-20 relative">
              {/* Mascot Hero */}
              <motion.div 
                variants={fadeIn("down", 0.1)}
                className="flex justify-center mb-10 md:mb-12"
              >
                <div className="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56">
                  <motion.div
                    className="relative w-full h-full"
                    whileHover={{ scale: 1.02, rotate: 1.5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Image
                      src="/Mascote/banners/Camaleão_1.png"
                      alt="Mascote vestibuline"
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </motion.div>
                  {/* Subtle ring */}
                  <div className={`absolute inset-[-12px] border rounded-full ${
                    theme === 'dark' ? 'border-white/10' : 'border-black/5'
                  }`}></div>
                </div>
              </motion.div>

              <motion.h1
                variants={fadeIn("up", 0.2)}
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 tracking-tight px-4 ${
                  theme === 'dark'
                    ? 'text-white'
                    : 'text-[#1d1d1f]'
                }`}
              >
                Política de Privacidade
              </motion.h1>
              <motion.p
                variants={fadeIn("up", 0.25)}
                className={`text-lg md:text-xl mb-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                vestibuline
              </motion.p>
            </div>

            {/* Main content card - macOS Style */}
            <motion.div 
              variants={fadeIn("up", 0.3)}
              className={`rounded-[28px] shadow-lg p-8 sm:p-10 md:p-12 lg:p-16 space-y-10 md:space-y-12 ${
                theme === 'dark'
                  ? 'bg-[#2d2d2f] border border-white/5'
                  : 'bg-white border border-black/5'
              }`}
            >
              
              {/* Introduction */}
              <motion.div variants={fadeIn("up", 0.3)} className="space-y-4 relative">
                <p className={`text-lg md:text-xl leading-relaxed font-normal ${
                  theme === 'dark'
                    ? 'text-gray-300'
                    : 'text-[#1d1d1f]'
                }`}>
                  Sua privacidade é fundamental para nós. Esta Política de Privacidade explica como coletamos, usamos, protegemos e compartilhamos suas informações ao utilizar o site www.vestibuline.com e nossos serviços digitais.
                </p>
              </motion.div>

              {/* Sections - macOS Clean Style */}
              <div className="space-y-10 md:space-y-14">
                
                {/* Section 1 - macOS Style */}
                <motion.section variants={fadeIn("up", 0.4)} className="group relative">
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>1</div>
                    <div className="flex-1">
                      <h2 className={`text-2xl md:text-3xl font-semibold mb-4 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>Coleta de Informações</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Coletamos informações fornecidas por você ao se cadastrar, preencher formulários ou interagir com nossos serviços. Também coletamos dados automaticamente, como tipo de navegador, proporção de tela e afins, páginas acessadas e cookies para melhorar sua experiência.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Section 2 - macOS Style */}
                <motion.section variants={fadeIn("up", 0.5)} className="group relative">
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                        : 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                    }`}>2</div>
                    <div className="flex-1">
                      <h2 className={`text-2xl md:text-3xl font-semibold mb-4 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>Uso das Informações</h2>
                      <p className={`text-base md:text-lg leading-relaxed mb-5 ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Utilizamos suas informações para:
                      </p>
                      <ul className={`space-y-3 text-base md:text-lg ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <li className="flex items-start gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${
                            theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'
                          }`}></span>
                          <span>Fornecer e aprimorar nossos serviços;</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${
                            theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'
                          }`}></span>
                          <span>Personalizar sua experiência;</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${
                            theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'
                          }`}></span>
                          <span>Entrar em contato sobre novidades, atualizações ou suporte;</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${
                            theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'
                          }`}></span>
                          <span>Cumprir obrigações legais e regulatórias.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.section>

                {/* Section 3 - macOS Style */}
                <motion.section variants={fadeIn("up", 0.6)} className="group relative">
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                        : 'bg-gradient-to-br from-purple-500 to-purple-600'
                    }`}>3</div>
                    <div className="flex-1">
                      <h2 className={`text-2xl md:text-3xl font-semibold mb-4 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>Compartilhamento de Dados</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Não vendemos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário para prestação dos serviços, cumprimento de obrigações legais ou mediante seu consentimento.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Section 4 - macOS Style */}
                <motion.section variants={fadeIn("up", 0.7)} className="group">
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                        : 'bg-gradient-to-br from-pink-500 to-pink-600'
                    }`}>4</div>
                    <div className="flex-1">
                      <h2 className={`text-2xl md:text-3xl font-semibold mb-4 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>Cookies e Tecnologias Semelhantes</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Utilizamos cookies para melhorar a navegação, analisar o uso do site e personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Decorative Break Section - macOS Style */}
                <motion.div 
                  variants={fadeIn("up", 0.75)}
                  className={`relative py-12 md:py-16 my-12 md:my-16 rounded-[24px] ${
                    theme === 'dark' ? 'bg-[#1d1d1f]' : 'bg-[#f5f5f7]'
                  }`}
                >
                  <div className="relative flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 px-8">
                    {/* Left mascot */}
                    <motion.div
                      className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 relative flex-shrink-0"
                      animate={{ 
                        y: [0, -8, 0],
                        rotate: [0, 3, 0, -3, 0],
                      }}
                      transition={{ 
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Image
                        src="/Mascote/banners/Camaleão_19.png"
                        alt="Mascote"
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </motion.div>
                    
                    {/* Message */}
                    <div className="text-center max-w-xl z-10">
                      <h3 className={`text-2xl md:text-3xl lg:text-4xl font-semibold mb-3 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>
                        Sua privacidade é nossa prioridade!
                      </h3>
                      <p className={`text-lg md:text-xl ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Continue lendo para conhecer todos os seus direitos
                      </p>
                    </div>
                    
                    {/* Right mascot */}
                    <motion.div
                      className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 relative flex-shrink-0"
                      animate={{ 
                        y: [0, -8, 0],
                        rotate: [0, -3, 0, 3, 0],
                      }}
                      transition={{ 
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 3.5
                      }}
                    >
                      <Image
                        src="/Mascote/banners/Camaleão_20.png"
                        alt="Mascote"
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Section 5 - macOS Style */}
                <motion.section variants={fadeIn("up", 0.8)} className="group relative">
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                        : 'bg-gradient-to-br from-rose-500 to-rose-600'
                    }`}>5</div>
                    <div className="flex-1">
                      <h2 className={`text-2xl md:text-3xl font-semibold mb-4 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>Segurança</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Adotamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum sistema é totalmente seguro e não podemos garantir a segurança absoluta dos dados.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Section 6 - macOS Style */}
                <motion.section variants={fadeIn("up", 0.9)} className="group">
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                        : 'bg-gradient-to-br from-orange-500 to-orange-600'
                    }`}>6</div>
                    <div className="flex-1">
                      <h2 className={`text-2xl md:text-3xl font-semibold mb-4 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>Seus Direitos</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Você pode solicitar acesso, correção ou exclusão de seus dados pessoais a qualquer momento, bem como revogar seu consentimento para o uso de determinadas informações.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Section 7 - macOS Style */}
                <motion.section variants={fadeIn("up", 1.0)} className="group">
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                    }`}>7</div>
                    <div className="flex-1">
                      <h2 className={`text-2xl md:text-3xl font-semibold mb-4 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>Alterações nesta Política</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas por meio do site ou outros canais de contato fornecidos por você.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Section 8 - Contact - macOS Style */}
                <motion.section variants={fadeIn("up", 1.1)} className="group relative">
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-2xl flex-shrink-0 shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>📧</div>
                    <div className="flex-1">
                      <h2 className={`text-2xl md:text-3xl font-semibold mb-4 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>Contato</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Em caso de dúvidas sobre esta Política de Privacidade, entre em contato pelo e-mail{" "}
                        <a 
                          href="mailto:suporte@vestibuline.com" 
                          className={`font-semibold transition-colors duration-200 break-all ${
                            theme === 'dark'
                              ? 'text-blue-400 hover:text-blue-300'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          suporte@vestibuline.com
                        </a>.
                      </p>
                    </div>
                  </div>
                </motion.section>

              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}