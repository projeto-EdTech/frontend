"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Bot, Menu, FileText, FileImage, FileAudio, FileVideo, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatSidebar from "@/components/Simula_PRO/chatbot/ChatSidebar";
import ChatInput from "@/components/Simula_PRO/chatbot/ChatInput";
import LoginModal from "@/components/Login-modal";
import PremiumFeatureModal from "@/components/PremiumFeatureModal";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserTier } from "@/hooks/useUserTier";

// Tipo para as mensagens
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachedFiles?: Array<{ name: string; size: number; type: string }>;
}

export default function IATutorPage() {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { isPro: hasPaidPlan, loading: tierLoading } = useUserTier();

  // Sincronizar montagem do componente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fechar sidebar em mobile por padrão após montagem
  useEffect(() => {
    if (!mounted) return;
    
    const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint (1024px)
    if (!isLargeScreen) {
      setIsSidebarOpen(false);
    }
  }, [mounted]);

  // Efeito para verificar se o usuário está autenticado e se tem plano pago
  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    } else if (status === 'authenticated' && !tierLoading && !hasPaidPlan) {
      setIsPremiumModalOpen(true);
    }
  }, [status, hasPaidPlan, tierLoading]);

  // Função para obter o ícone apropriado baseado no tipo de arquivo
  const getFileIcon = (fileType: string, fileName: string) => {
    const type = fileType.toLowerCase();
    const name = fileName.toLowerCase();

    // Imagens
    if (type.startsWith('image/')) {
      return <FileImage className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    }
    // PDFs
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />;
    }
    // Documentos Word
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) {
      return <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    }
    // Áudio
    if (type.startsWith('audio/')) {
      return <FileAudio className="w-4 h-4 text-purple-500 flex-shrink-0" />;
    }
    // Vídeo
    if (type.startsWith('video/')) {
      return <FileVideo className="w-4 h-4 text-pink-500 flex-shrink-0" />;
    }
    // Padrão
    return <File className="w-4 h-4 text-gray-500 flex-shrink-0" />;
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (!messagesEndRef.current || !messagesContainerRef.current) return;
    // Scroll container so the end ref is visible
    messagesEndRef.current.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isScrollable = container.scrollHeight > container.clientHeight;
    // Only auto-scroll when the content is taller than the visible area
    // and the user is near the bottom (shouldAutoScroll true).
    if (isScrollable && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  // Detecta posição do scroll para decidir se deve auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 150; // px
      const distanceFromBottom = container.scrollHeight - container.clientHeight - container.scrollTop;
      setShouldAutoScroll(distanceFromBottom <= threshold);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // inicializa o estado
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll as EventListener);
  }, []);

  const handleSendMessage = async (files: File[]) => {
    const content = inputValue.trim();
    if ((!content && files.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content,
      timestamp: new Date(),
      attachedFiles: files.length > 0 ? files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      })) : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", content);
      formData.append("history", JSON.stringify(messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))));

      files.forEach(file => {
        formData.append("files", file);
      });

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao comunicar com a IA");
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.response || "Desculpe, não consegui processar sua mensagem.",
        timestamp: new Date(),
      };

  setMessages((prev) => [...prev, aiMessage]);
  // After AI response, keep current auto-scroll behavior (respect user's preference)
    } catch (error) {
      console.error("Erro:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        timestamp: new Date(),
      };
  setMessages((prev) => [...prev, errorMessage]);
  // show error and keep scroll behavior
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(Date.now().toString());
    setIsSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
  };

  const suggestions = [
    {
      icon: "📐",
      title: "Trigonometria",
      description: "Explique conceitos de trigonometria",
    },
    {
      icon: "📚",
      title: "Preparação ENEM",
      description: "Como estudar efetivamente para o ENEM?",
    },
    {
      icon: "⚡",
      title: "Física",
      description: "Resolva uma questão de física",
    },
    {
      icon: "✍️",
      title: "Redação",
      description: "Dicas para melhorar a redação",
    },
  ];

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-[#f5f5f7]'}`}>
      <div className="relative z-30">
        <Header />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - renderizado apenas após montagem para evitar problemas de hidratação */}
        {mounted && (
          <ChatSidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
          />
        )}
        <main className="flex-1 flex flex-col overflow-hidden backdrop-blur-xl">
          {/* Botão menu mobile */}
          <div className={`lg:hidden p-4 border-b backdrop-blur-xl ${theme === 'dark' ? 'border-gray-800/50 bg-[#2a2a2a]/95' : 'border-gray-200/50 bg-white/80'}`}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2.5 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100/80 text-gray-700'} cursor-pointer`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto" ref={messagesContainerRef}>
            <div className="max-w-4xl mx-auto px-4 py-4 h-full">
              {messages.length === 0 && (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Ícone de boas-vindas */}
                  <motion.div 
                    className="relative mb-3"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <Image
                      src="/Mascote/banners/Camaleão_9.png"
                      alt="Ícone de boas-vindas"
                      width={240}
                      height={240}
                      className="object-contain drop-shadow-2xl"
                      priority
                      quality={95}
                    />
                  </motion.div>

                  <motion.h1 
                    className={`text-4xl font-semibold mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Como posso ajudar?
                  </motion.h1>
                  <motion.p 
                    className={`text-base max-w-2xl mb-8 font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Estou aqui para tirar suas dúvidas, explicar conceitos e
                    ajudar você a se preparar para o vestibular.
                  </motion.p>

                  {/* Sugestões em grid */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        onClick={() => {
                          setInputValue(suggestion.description);
                          // Enviar automaticamente após um pequeno delay para feedback visual
                          setTimeout(() => {
                            // Simular envio como se o usuário tivesse digitado
                            const syntheticMessage: Message = {
                              id: Date.now().toString(),
                              role: "user",
                              content: suggestion.description,
                              timestamp: new Date(),
                            };
                            setMessages((prev) => [...prev, syntheticMessage]);
                            setInputValue("");
                            setIsLoading(true);

                            fetch("/api/ai/chat", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                message: syntheticMessage.content,
                                history: messages.map((m) => ({
                                  role: m.role,
                                  content: m.content,
                                })),
                              }),
                            })
                              .then((response) => {
                                if (!response.ok) throw new Error("Erro ao comunicar com a IA");
                                return response.json();
                              })
                              .then((data) => {
                                const aiMessage: Message = {
                                  id: (Date.now() + 1).toString(),
                                  role: "assistant",
                                  content: data.response || "Desculpe, não consegui processar sua mensagem.",
                                  timestamp: new Date(),
                                };
                                setMessages((prev) => [...prev, aiMessage]);
                              })
                              .catch((error) => {
                                console.error("Erro:", error);
                                const errorMessage: Message = {
                                  id: (Date.now() + 1).toString(),
                                  role: "assistant",
                                  content: "Desculpe, ocorreu um erro ao processar sua mensagem.",
                                  timestamp: new Date(),
                                };
                                setMessages((prev) => [...prev, errorMessage]);
                              })
                                .finally(() => {
                                setIsLoading(false);
                              });
                          }, 100);
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                        className={`group p-4 rounded-2xl border transition-all duration-300 
                                 text-left cursor-pointer
                                 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-blue-500/30
                                 ${theme === 'dark' 
                                   ? 'bg-[#2a2a2a]/80 border-gray-800/50 hover:border-blue-500/50 hover:bg-[#2a2a2a]/90' 
                                   : 'bg-white/80 border-gray-200/50 hover:border-blue-400/50 hover:bg-white/95'}`}
                      >
                        <div className="flex items-start gap-3">
                          <motion.div 
                            className={`text-2xl p-2 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {suggestion.icon}
                          </motion.div>
                          <div className="flex-1">
                            <h3 className={`font-semibold mb-1.5 text-base transition-colors
                                          ${theme === 'dark' 
                                            ? 'text-white group-hover:text-blue-400' 
                                            : 'text-gray-900 group-hover:text-blue-600'}`}>
                              {suggestion.title}
                            </h3>
                            <p className={`text-sm transition-colors leading-relaxed
                                         ${theme === 'dark' 
                                           ? 'text-gray-400 group-hover:text-gray-300' 
                                           : 'text-gray-600 group-hover:text-gray-700'}`}>
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Mensagens */}
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex gap-4 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4, 
                        ease: "easeOut"
                      }}
                      layout
                    >
                      {message.role === "assistant" && (
                        <motion.div 
                          className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white/10"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <Bot className="w-5 h-5 text-white" />
                        </motion.div>
                      )}

                      <motion.div
                        className={`group max-w-[75%] rounded-3xl overflow-hidden transition-all duration-300 backdrop-blur-xl ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30"
                            : theme === 'dark'
                            ? "bg-[#2a2a2a]/80 border border-gray-800/50 shadow-lg hover:shadow-xl"
                            : "bg-white/80 border border-gray-200/50 shadow-md hover:shadow-lg"
                        }`}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Arquivos anexados - mostrar apenas nas mensagens do usuário */}
                        {message.role === "user" && message.attachedFiles && message.attachedFiles.length > 0 && (
                          <motion.div 
                            className="px-6 pt-5 pb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-1 h-5 bg-white/30 rounded-full"></div>
                              <p className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                                Arquivos ({message.attachedFiles.length})
                              </p>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5">
                              {message.attachedFiles.map((file, index) => (
                                <motion.div
                                  key={index}
                                  className="group/file flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-2xl p-3.5 backdrop-blur-sm transition-all duration-300 border border-white/10"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                                  whileHover={{ x: 4 }}
                                >
                                  <motion.div 
                                    className="flex-shrink-0 w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {getFileIcon(file.type, file.name)}
                                  </motion.div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate mb-1" title={file.name}>
                                      {file.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-white/70 font-medium">
                                        {formatFileSize(file.size)}
                                      </span>
                                      <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                                      <span className="text-xs text-white/70 font-medium">
                                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10"></div>
                          </motion.div>
                        )}

                        {/* Conteúdo da mensagem */}
                        <div className={`px-6 ${message.role === "user" && message.attachedFiles && message.attachedFiles.length > 0 ? 'pb-5' : 'py-5'}`}>
                          <motion.div 
                            className={`whitespace-pre-wrap break-words leading-relaxed text-[15px] ${
                              message.role === "user" ? "text-white" : theme === 'dark' ? "text-gray-100" : "text-gray-900"
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.05 }}
                          >
                            {message.content || (
                              <span className="text-white/70 italic">Arquivo(s) anexado(s)</span>
                            )}
                          </motion.div>
                          
                          {/* Footer com timestamp */}
                          <motion.div 
                            className="flex items-center gap-2 mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <div
                              className={`text-xs font-medium ${
                                message.role === "user"
                                  ? "text-white/50"
                                  : theme === 'dark'
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>

                      {message.role === "user" && (
                        <motion.div 
                          className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 ring-2 ring-white/10"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <User className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Indicador de digitação */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div 
                      className="flex gap-4 justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white/10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Bot className="w-5 h-5 text-white" />
                      </motion.div>
                      <motion.div 
                        className={`border rounded-3xl px-6 py-4 shadow-lg backdrop-blur-xl ${theme === 'dark' ? 'bg-[#2a2a2a]/80 border-gray-800/50' : 'bg-white/80 border-gray-200/50'}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`}
                                animate={{ 
                                  y: [0, -8, 0],
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                  duration: 0.6,
                                  delay: i * 0.1,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div ref={messagesEndRef} />
            </div>
          </div>
          {/* Input de mensagem */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder="Escreva sua mensagem ou anexe um arquivo..."
          />
        </main>
      </div>
      <Footer />

      <PremiumFeatureModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        featureName="VestIA"
        featureDescription="Seu tutor de IA personalizado para vestibulares"
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectTo="/VestIA"
        isRequired={status === 'unauthenticated'}
      />
    </div>
  );
}
