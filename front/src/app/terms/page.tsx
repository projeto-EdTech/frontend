"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, Variants } from "framer-motion";

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

export default function TermsPage() {
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
            whileInView="show"
            viewport={{ once: true, amount: 0.01 }}
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
                Termos de Uso e Serviço
              </motion.h1>
              <motion.p
                variants={fadeIn("up", 0.25)}
                className={`text-lg md:text-xl mb-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Vestibuline
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
              <motion.div variants={fadeIn("up", 0.3)} className="space-y-5 relative">
                <p className={`text-lg md:text-xl leading-relaxed font-normal ${
                  theme === 'dark'
                    ? 'text-gray-300'
                    : 'text-[#1d1d1f]'
                }`}>
                  Seja Bem-Vindo ao Vestibuline. Antes de explorar tudo o que temos a oferecer, é importante que você entenda e concorde com algumas regras básicas que regem o uso do nosso site www.vestibuline.com, e qualquer outro serviço digital que nós oferecemos, como planos pagos para melhora de performance e afins.
                </p>
                <p className={`text-lg md:text-xl leading-relaxed font-normal ${
                  theme === 'dark'
                    ? 'text-gray-300'
                    : 'text-[#1d1d1f]'
                }`}>
                  Ao usar nosso site e serviços, você automaticamente concorda em seguir as regras que estabelecemos aqui. Caso não concorde com algo, por favor, considere não usar nossos serviços. É muito importante para nós que você se sinta seguro e informado a todo momento.
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
                      }`}>Aceitando os Termos</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Ao navegar pelo site do Vestibuline, você concorda automaticamente com nossas regras e condições. Estamos sempre procurando melhorar, então esses termos podem mudar de vez em quando. Se fizermos alterações significativas, vamos postar as atualizações aqui no site. Continuar usando o site após essas mudanças significa que você aceita os novos termos.
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
                      }`}>Como Usar o Nosso Site</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        A maior parte do nosso site está aberta para você sem a necessidade do plano pago. No entanto, algumas seções especiais podem exigir que você tenha o plano pago ou realize login. Pedimos que você seja honesto ao fornecer suas informações, caso decida compartilhar algum conteúdo conosco, como comentários, por favor, faça-o de maneira respeitosa e dentro da lei.
                      </p>
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
                      }`}>Sua Privacidade</h2>
                      <div className="space-y-5">
                        <p className={`text-base md:text-lg leading-relaxed ${
                          theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}>
                          No Vestibuline, a privacidade é um valor essencial. Ao interagir com nosso site, você aceita nossa Política de Privacidade, que detalha nossa abordagem responsável e conforme às leis para o manejo dos seus dados pessoais. Nosso compromisso é com a transparência e a sua segurança: explicamos como coletamos, usamos e protegemos suas informações, garantindo sua privacidade e oferecendo controle sobre seus dados.
                        </p>
                        <p className={`text-base md:text-lg leading-relaxed ${
                          theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}>
                          Adotamos práticas de segurança para proteger suas informações contra acesso não autorizado e compartilhamento indevido, assegurando que qualquer cooperação com terceiros ocorra apenas com base na sua aprovação ou exigências legais claras, reafirmando nosso comprometimento com a sua confiança e segurança digital.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Section 4 - macOS Style */}
                <motion.section variants={fadeIn("up", 0.7)} className="group relative">
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
                      }`}>Direitos de Conteúdo</h2>
                      <div className="space-y-5">
                        <p className={`text-base md:text-lg leading-relaxed ${
                          theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}>
                          O conteúdo disponível no site do Vestibuline, incluindo, mas não se limitando a, textos, imagens, ilustrações, designs, ícones, fotografias, programas de computador, videoclipes e áudios, constitui propriedade intelectual protegida tanto pela legislação nacional quanto por tratados internacionais sobre direitos autorais e propriedade industrial. Essa propriedade engloba não apenas materiais diretamente produzidos e publicados por nós, mas também conteúdos que são utilizados sob licença ou permissão de terceiros, garantindo que todos os direitos sejam respeitados conforme as normativas vigentes.
                        </p>
                        <p className={`text-base md:text-lg leading-relaxed ${
                          theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}>
                          Ao acessar nosso site, você recebe uma licença limitada, não exclusiva e revogável para visualizar e usar o conteúdo para fins pessoais e não comerciais. Isso implica que qualquer reprodução, distribuição, transmissão ou modificação do conteúdo, sem a devida autorização escrita do Vestibuline, é estritamente proibida. Tal restrição visa proteger os direitos de propriedade intelectual associados aos materiais disponibilizados, assegurando que sua utilização não infrinja os direitos dos criadores ou detentores desses direitos, além de promover um ambiente de respeito e valorização da criatividade e inovação.
                        </p>
                      </div>
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
                        Respeito e Transparência!
                      </h3>
                      <p className={`text-lg md:text-xl ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Estamos aqui para garantir sua melhor experiência
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
                      }`}>Cookies e Mais</h2>
                      <div className="space-y-5">
                        <p className={`text-base md:text-lg leading-relaxed ${
                          theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}>
                          Utilizamos cookies para melhorar sua experiência, coletando informações anônimas durante sua visita, como suas preferências de idioma, duração da visita, páginas acessadas, e outras estatísticas de uso. Esses dados nos ajudam a personalizar seu conteúdo, otimizar a navegação, melhorar continuamente o site em design e funcionalidade, e garantir sua segurança online. Esta prática é essencial para nos permitir oferecer um serviço mais ajustado às suas necessidades e resolver qualquer problema que possa surgir mais rapidamente.
                        </p>
                        <p className={`text-base md:text-lg leading-relaxed ${
                          theme === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}>
                          Se você preferir limitar ou recusar o uso de cookies, a configuração pode ser ajustada através do seu navegador. Isso pode afetar a sua experiência no site, pois algumas funcionalidades dependem dos cookies para funcionar corretamente. Entendemos a importância do controle sobre suas informações e queremos que você saiba que, ao ajustar as configurações para bloquear cookies, algumas partes do nosso site podem não oferecer a experiência completa pretendida.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Section 6 - macOS Style */}
                <motion.section variants={fadeIn("up", 0.9)} className="group relative">
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
                      }`}>Explorando Links Externos</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Nosso site pode incluir links para sites externos que achamos que podem ser do seu interesse. Note que não temos controle sobre esses sites externos e, portanto, não somos responsáveis pelo seu conteúdo ou políticas.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Contact section - macOS Style */}
                <motion.section variants={fadeIn("up", 1.0)} className={`group relative rounded-[28px] p-8 md:p-12 overflow-hidden ${
                  theme === 'dark' ? 'bg-[#1d1d1f]' : 'bg-[#f5f5f7]'
                }`}>
                  {/* Mascot */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="hidden md:block absolute -right-6 -top-2 w-32 h-32 z-10"
                  >
                    <Image
                      src="/Mascote/banners/Camaleão_5.png"
                      alt="Mascote Contato"
                      fill
                      className="object-contain drop-shadow-2xl"
                    />
                  </motion.div>
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-2xl flex-shrink-0 shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-teal-500 to-teal-600'
                        : 'bg-gradient-to-br from-teal-500 to-teal-600'
                    }`}>📧</div>
                    <div className="flex-1 pr-0 md:pr-24">
                      <h2 className={`text-2xl md:text-3xl font-semibold mb-4 tracking-tight ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-[#1d1d1f]'
                      }`}>Dúvidas ou Comentários?</h2>
                      <p className={`text-base md:text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}>
                        Se tiver dúvidas sobre estes termos, não hesite em nos contatar através do e-mail{" "}
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