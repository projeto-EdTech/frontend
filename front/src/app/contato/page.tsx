"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Mail, Send, MessageCircle, Clock, CheckCircle, AlertCircle, Instagram, MessageSquare, Heart } from "lucide-react";
import emailjs from "@emailjs/browser";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function ContatoPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Refs para animações de scroll
  const heroRef = useRef(null);
  const formSectionRef = useRef(null);
  const socialSectionRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const formInView = useInView(formSectionRef, { once: true, margin: "-50px" });
  const socialInView = useInView(socialSectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (session && session.user) {
      setFormData(prev => ({
        ...prev,
        nome: session.user?.name || "",
        email: session.user?.email || ""
      }));
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await emailjs.send(
        'service_aij29ho',
        'template_lipq2g8',
        {
          name: formData.nome,
          email: formData.email,
          subject: formData.assunto,
          message: formData.mensagem,
        },
        'fT9AktnzX0qQojQTH'
      );
      
      setSubmitMessage("Mensagem enviada com sucesso!");
      setFormData({ nome: "", email: "", assunto: "", mensagem: "" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmitMessage(`Erro ao enviar mensagem: ${error.message}`);
      } else {
        setSubmitMessage("Erro ao enviar mensagem. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.nome && formData.email && formData.assunto && formData.mensagem;

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' 
        ? 'bg-[#1d1d1f]' 
        : 'bg-[#f5f5f7]'
    }`}>
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Subtle Background - macOS Style */}
        <motion.div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <motion.div 
            className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${
              theme === 'dark'
                ? 'bg-blue-600/10'
                : 'bg-blue-500/5'
            }`}
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${
              theme === 'dark'
                ? 'bg-purple-600/10'
                : 'bg-purple-500/5'
            }`}
            animate={{ 
              x: [0, -30, 0],
              y: [0, 20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        <div className="container mx-auto px-6 md:px-8 py-12 md:py-20 relative z-10 max-w-7xl">
          {/* Hero Section - macOS Style */}
          <motion.div 
            ref={heroRef}
            className="text-center mb-16 md:mb-20 relative"
            initial="initial"
            animate={heroInView ? "animate" : "initial"}
            variants={staggerContainer}
          >
            {/* Mascote decorativo esquerdo - Visível apenas em telas grandes */}
            <motion.div 
              className="hidden lg:block absolute -left-20 top-0 w-40 h-40"
              initial={{ opacity: 0, x: -100, rotate: -20 }}
              animate={heroInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [-5, 5, -5]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="/Mascote/banners/Camaleão_1.png"
                  alt="Mascote Vestibuline"
                  width={160}
                  height={160}
                  className="drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>

            {/* Mascote decorativo direito - Visível apenas em telas grandes */}
            <motion.div 
              className="hidden lg:block absolute -right-20 top-10 w-36 h-36"
              initial={{ opacity: 0, x: 100, rotate: 20 }}
              animate={heroInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            >
              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [5, -5, 5]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <Image
                  src="/Mascote/banners/Camaleão_3.png"
                  alt="Mascote Vestibuline"
                  width={140}
                  height={140}
                  className="drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>

            <motion.div 
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border ${
                theme === 'dark'
                  ? 'bg-gray-800/80 text-gray-300 border-white/10'
                  : 'bg-gray-100/80 text-gray-700 border-black/5'
              }`}
              variants={{
                initial: { opacity: 0, scale: 0.8, y: 20 },
                animate: { 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" }
                }
              }}
              animate={heroInView ? {
                opacity: 1,
                scale: 1,
                y: 0,
                animationDelay: "0.2s"
              } : {}}
              whileHover={{ scale: 1.05 }}
            >
              <MessageCircle size={14} />
              Estamos aqui para ajudar
            </motion.div>

            <motion.h1 
              className={`text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight tracking-tight ${
                theme === 'dark'
                  ? 'text-white'
                  : 'text-[#1d1d1f]'
              }`}
              variants={{
                initial: { opacity: 0, y: 40 },
                animate: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.8, ease: "easeOut", delay: 0.2 }
                }
              }}
            >
              Entre em Contato
            </motion.h1>

            <motion.p 
              className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
              variants={{
                initial: { opacity: 0, y: 30 },
                animate: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut", delay: 0.4 }
                }
              }}
            >
              Tem dúvidas, sugestões ou precisa de ajuda? Nossa equipe está pronta para responder suas perguntas e oferecer o melhor suporte possível.
            </motion.p>
          </motion.div>

          {/* Main Content Grid - macOS Style */}
          <motion.div 
            ref={formSectionRef}
            className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16"
            initial="initial"
            animate={formInView ? "animate" : "initial"}
            variants={staggerContainer}
          >
            {/* Contact Info Sidebar - Hidden on mobile */}
            <motion.div 
              className="xl:col-span-1 space-y-6 hidden md:block"
              variants={fadeInLeft}
            >
              {/* Main Contact Card */}
              <motion.div 
                className={`backdrop-blur-sm rounded-[28px] p-8 border shadow-lg relative overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-[#1d1d1f]/90 border-white/5'
                    : 'bg-white/90 border-black/5'
                }`}
                variants={scaleIn}
              >
                <motion.div 
                  className="flex items-center gap-3 mb-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={formInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.div 
                    className={`w-12 h-12 rounded-[12px] flex items-center justify-center shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30'
                        : 'bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/50'
                    }`}
                  >
                    <MessageCircle className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={24} />
                  </motion.div>
                  <h2 className={`text-2xl font-semibold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'}`}>
                    Fale Conosco
                  </h2>
                </motion.div>
                
                <motion.div 
                  className="space-y-6"
                  variants={staggerContainer}
                >
                  {/* Email */}
                  <motion.div 
                    className="group"
                    variants={staggerItem}
                  >
                    <div className={`flex items-start gap-4 p-4 rounded-[12px] transition-all duration-300 ${
                      theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'
                    }`}>
                      <motion.div 
                        className={`w-12 h-12 rounded-[12px] flex items-center justify-center shadow-md ${
                          theme === 'dark'
                            ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30'
                            : 'bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/50'
                        }`}
                      >
                        <Mail className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={22} />
                      </motion.div>
                      <div>
                        <h3 className={`font-semibold mb-1 text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'}`}>
                          Email
                        </h3>
                        <p className={`font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          suporte@vestibuline.com
                        </p>
                        <p className={`text-sm mt-2 flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <CheckCircle size={12} className="text-green-500" />
                          Respondemos em até 24 horas
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Hours */}
                  <motion.div 
                    className="group"
                    variants={staggerItem}
                  >
                    <div className={`flex items-start gap-4 p-4 rounded-[12px] transition-all duration-300 ${
                      theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'
                    }`}>
                      <motion.div 
                        className={`w-12 h-12 rounded-[12px] flex items-center justify-center shadow-md ${
                          theme === 'dark'
                            ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30'
                            : 'bg-gradient-to-br from-green-50 to-green-100/80 border border-green-200/50'
                        }`}
                      >
                        <Clock className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} size={22} />
                      </motion.div>
                      <div>
                        <h3 className={`font-semibold mb-2 text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'}`}>
                          Horário de Atendimento
                        </h3>
                        <div className="space-y-1">
                          <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Segunda a Sexta: 9h às 18h
                          </p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Sábado: 9h às 14h
                          </p>
                          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Exceto feriados nacionais
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* FAQ Card - Hidden on mobile */}
              <motion.div 
                className={`backdrop-blur-sm rounded-[28px] p-6 border shadow-lg ${
                  theme === 'dark'
                    ? 'bg-[#1d1d1f]/90 border-white/5'
                    : 'bg-white/90 border-black/5'
                }`}
                variants={{
                  initial: { opacity: 0, y: 40 },
                  animate: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut", delay: 0.4 }
                  }
                }}
              >
                <motion.h3 
                  className={`font-semibold tracking-tight mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={formInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <AlertCircle className="text-amber-500" size={20} />
                  Perguntas Frequentes
                </motion.h3>
                <motion.div 
                  className="space-y-3 text-sm"
                  variants={staggerContainer}
                  initial="initial"
                  animate={formInView ? "animate" : "initial"}
                >
                  {[
                    "Como funciona o plano gratuito?",
                    "Posso cancelar quando quiser?",
                    "Como acompanhar meu progresso?"
                  ].map((faq, index) => (
                    <motion.div 
                      key={index}
                      className={`flex items-start gap-2 transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-300' 
                          : 'text-gray-600'
                      }`}
                      variants={staggerItem}
                    >
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{faq}</span>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.a 
                  href="/faq" 
                  className={`inline-flex items-center gap-2 font-semibold mt-4 transition-all duration-300 ${
                    theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={formInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.8 }}
                >
                  Ver todas as perguntas →
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Contact Form - Full width on mobile */}
            <motion.div 
              className="xl:col-span-2 md:col-span-1"
              variants={fadeInRight}
            >
              <motion.div 
                className={`backdrop-blur-sm rounded-[28px] p-10 md:p-12 shadow-lg border ${
                  theme === 'dark'
                    ? 'bg-[#1d1d1f]/90 border-white/5'
                    : 'bg-white/90 border-black/5'
                }`}
              >
                <motion.div 
                  className="flex items-center gap-3 mb-8"
                  initial={{ opacity: 0, x: 20 }}
                  animate={formInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.div 
                    className={`w-12 h-12 rounded-[12px] flex items-center justify-center shadow-md ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-50 to-pink-50/80 border border-purple-200/50'
                    }`}
                  >
                    <Send className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={24} />
                  </motion.div>
                  <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight ${
                    theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'
                  }`}>
                    Envie sua Mensagem
                  </h2>
                </motion.div>
                
                {/* Status Message */}
                {submitMessage && (
                  <motion.div 
                    className={`mb-6 px-5 py-4 rounded-[12px] flex items-center gap-3 border ${
                      submitMessage.includes("sucesso")
                        ? theme === 'dark' 
                          ? 'bg-green-900/20 text-green-300 border-green-500/30'
                          : 'bg-green-50 text-green-700 border-green-200/50'
                        : theme === 'dark'
                        ? 'bg-red-900/20 text-red-300 border-red-500/30'
                        : 'bg-red-50 text-red-700 border-red-200/50'
                    }`}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    {submitMessage.includes("sucesso") ? (
                      <CheckCircle size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                    <span className="font-medium">{submitMessage}</span>
                  </motion.div>
                )}

                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={formInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    variants={staggerContainer}
                    initial="initial"
                    animate={formInView ? "animate" : "initial"}
                  >
                    {/* Nome */}
                    <motion.div className="group" variants={staggerItem}>
                      <label className={`block text-sm font-semibold mb-2.5 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Nome Completo *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('nome')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className={`w-full px-4 py-3 border rounded-[12px] focus:outline-none transition-all duration-300 placeholder:text-gray-400 ${
                            focusedField === 'nome'
                              ? theme === 'dark'
                                ? 'border-blue-500/50 bg-blue-500/5 text-white'
                                : 'border-blue-500 bg-blue-50/50'
                              : theme === 'dark'
                              ? 'border-white/10 bg-white/5 text-white hover:border-white/20'
                              : 'border-black/10 hover:border-black/20'
                          }`}
                          placeholder="Digite seu nome completo"
                        />
                        {formData.nome && (
                          <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                        )}
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div className="group" variants={staggerItem}>
                      <label className={`block text-sm font-semibold mb-2.5 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Email *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className={`w-full px-4 py-3 border rounded-[12px] focus:outline-none transition-all duration-300 placeholder:text-gray-400 ${
                            focusedField === 'email'
                              ? theme === 'dark'
                                ? 'border-blue-500/50 bg-blue-500/5 text-white'
                                : 'border-blue-500 bg-blue-50/50'
                              : theme === 'dark'
                              ? 'border-white/10 bg-white/5 text-white hover:border-white/20'
                              : 'border-black/10 hover:border-black/20'
                          }`}
                          placeholder="seu@email.com"
                        />
                        {formData.email && (
                          <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                        )}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Assunto */}
                  <motion.div 
                    className="group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={formInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <label className={`block text-sm font-semibold mb-2.5 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Assunto *
                    </label>
                    <div className="relative">
                      <select
                        name="assunto"
                        value={formData.assunto}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('assunto')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`w-full px-4 py-3 border rounded-[12px] focus:outline-none transition-all duration-300 cursor-pointer ${
                          focusedField === 'assunto'
                            ? theme === 'dark'
                              ? 'border-blue-500/50 bg-blue-500/5 text-white'
                              : 'border-blue-500 bg-blue-50/50'
                            : theme === 'dark'
                            ? 'border-white/10 bg-white/5 text-white hover:border-white/20'
                            : 'border-black/10 hover:border-black/20'
                        }`}
                      >
                        <option value="">Selecione um assunto</option>
                        <option value="duvida-tecnica">Dúvida Técnica</option>
                        <option value="problemas-acesso">Problemas de Acesso</option>
                        <option value="sugestao">Sugestão</option>
                        <option value="planos-precos">Planos e Preços</option>
                        <option value="cancelamento">Cancelamento</option>
                        <option value="outros">Outros</option>
                      </select>
                      {formData.assunto && (
                        <CheckCircle size={18} className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" />
                      )}
                    </div>
                  </motion.div>

                  {/* Mensagem */}
                  <motion.div 
                    className="group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={formInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <label className={`block text-sm font-semibold mb-2.5 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Mensagem *
                    </label>
                    <div className="relative">
                      <textarea
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('mensagem')}
                        onBlur={() => setFocusedField(null)}
                        required
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-[12px] focus:outline-none transition-all duration-300 resize-none placeholder:text-gray-400 ${
                          focusedField === 'mensagem'
                            ? theme === 'dark'
                              ? 'border-blue-500/50 bg-blue-500/5 text-white'
                              : 'border-blue-500 bg-blue-50/50'
                            : theme === 'dark'
                            ? 'border-white/10 bg-white/5 text-white hover:border-white/20'
                            : 'border-black/10 hover:border-black/20'
                        }`}
                        placeholder="Descreva sua dúvida, sugestão ou problema em detalhes..."
                      />
                      {formData.mensagem && (
                        <CheckCircle size={18} className="absolute right-4 top-4 text-green-500" />
                      )}
                    </div>
                    <motion.div 
                      className={`text-right text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                      animate={{ 
                        color: formData.mensagem.length > 450 ? "#ef4444" : theme === 'dark' ? "#9ca3af" : "#6b7280"
                      }}
                    >
                      {formData.mensagem.length}/500 caracteres
                    </motion.div>
                  </motion.div>

                  {/* Submit Button - macOS Style */}
                  <motion.button
                      type="submit"
                      disabled={isSubmitting || !isFormValid}
                      className={`w-full py-4 px-8 rounded-[12px] font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                        isFormValid && !isSubmitting
                          ? theme === 'dark'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] hover:shadow-blue-500/30 cursor-pointer'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] hover:shadow-blue-500/30 cursor-pointer'
                          : theme === 'dark'
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-gray-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={formInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.8, duration: 0.5 }}
                  >
                      {isSubmitting ? (
                          <>
                              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Enviando...</span>
                          </>
                      ) : (
                          <>
                              <Send size={20} />
                              <span>Enviar Mensagem</span>
                          </>
                      )}
                  </motion.button>
                </motion.form>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Social Contact Section - macOS Style */}
          <motion.div 
            ref={socialSectionRef}
            className={`backdrop-blur-sm rounded-[28px] p-10 md:p-12 border shadow-lg ${
              theme === 'dark'
                ? 'bg-[#1d1d1f]/90 border-white/5'
                : 'bg-white/90 border-black/5'
            }`}
            initial={{ opacity: 0, y: 60 }}
            animate={socialInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={socialInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className={`text-3xl md:text-4xl font-semibold tracking-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'}`}>
                Outras Formas de Contato
              </h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Escolha a forma mais conveniente para se conectar
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate={socialInView ? "animate" : "initial"}
            >
              {/* Instagram Card */}
              <motion.div 
                className={`group rounded-[24px] p-8 text-center shadow-md transition-all duration-300 border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-50/50 border-black/5 hover:bg-gray-100/50'
                }`}
                variants={staggerItem}
              >
                <div 
                  className={`w-16 h-16 rounded-[12px] flex items-center justify-center mx-auto mb-5 shadow-md ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-pink-500/20 to-yellow-500/20 border border-pink-500/30'
                      : 'bg-gradient-to-br from-pink-50 to-yellow-50/80 border border-pink-200/50'
                  }`}
                >
                  <Instagram className={theme === 'dark' ? 'text-pink-400' : 'text-pink-600'} size={32} />
                </div>
                <h3 className={`font-semibold tracking-tight mb-3 text-xl ${theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'}`}>
                  Instagram
                </h3>
                <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Acompanhe nossas novidades
                </p>
                <a 
                  href="https://www.instagram.com/Vestibuline/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 font-semibold ${
                    theme === 'dark' ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-500'
                  }`}
                >
                  @vestibuline
                </a>
              </motion.div>

              {/* Discord Card */}
              <motion.div 
                className={`group rounded-[24px] p-8 text-center shadow-md transition-all duration-300 border relative ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-50/50 border-black/5 hover:bg-gray-100/50'
                }`}
                variants={staggerItem}
              >
                <motion.div 
                  className="absolute -top-2 -right-2 w-16 h-16"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={socialInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                </motion.div>

                <div 
                  className={`w-16 h-16 rounded-[12px] flex items-center justify-center mx-auto mb-5 shadow-md ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30'
                      : 'bg-gradient-to-br from-indigo-50 to-purple-50/80 border border-indigo-200/50'
                  }`}
                >
                  <MessageSquare className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} size={32} />
                </div>
                <h3 className={`font-semibold tracking-tight mb-3 text-xl ${theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'}`}>
                  Discord
                </h3>
                <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Participe da nossa comunidade
                </p>
                <a 
                  href="https://discord.gg/GZZjDKNk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 font-semibold ${
                    theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                  }`}
                >
                  Entrar no Discord
                </a>
              </motion.div>

              {/* Feedback Card */}
              <motion.div 
                className={`group rounded-[24px] p-8 text-center shadow-md transition-all duration-300 border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-50/50 border-black/5 hover:bg-gray-100/50'
                }`}
                variants={staggerItem}
              >
                <div 
                  className={`w-16 h-16 rounded-[12px] flex items-center justify-center mx-auto mb-5 shadow-md ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                      : 'bg-gradient-to-br from-purple-50 to-pink-50/80 border border-purple-200/50'
                  }`}
                >
                  <Heart className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={32} />
                </div>
                <h3 className={`font-semibold tracking-tight mb-3 text-xl ${theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]'}`}>
                  Feedback
                </h3>
                <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Compartilhe sua experiência
                </p>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`inline-flex items-center gap-2 font-semibold ${
                    theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                  }`}
                >
                  Deixar Feedback
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Animation Elements */}
        <motion.div
          className="fixed top-20 right-10 w-4 h-4 bg-blue-400/20 rounded-full pointer-events-none"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="fixed bottom-32 left-10 w-6 h-6 bg-purple-400/20 rounded-full pointer-events-none"
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="fixed top-1/2 left-5 w-3 h-3 bg-pink-400/30 rounded-full pointer-events-none"
          animate={{
            x: [0, 25, 0],
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.4, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </main>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <Footer />
      </motion.div>
    </div>
  );
}