"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Loader2, Paperclip, FileText, X, FileImage, FileAudio, FileVideo, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (files: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxHeight?: number;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  isLoading = false,
  placeholder = "Escreva sua mensagem...",
  disabled = false,
  maxHeight = 128,
}: ChatInputProps) {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Auto-resize do textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px`;
    }
  }, [value, maxHeight]);

  // Handler para teclas
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachedFiles.length > 0) && !isLoading && !disabled) {
        setIsSending(true);
        onSend(attachedFiles);
        
        // Limpar arquivos após o envio
        setAttachedFiles([]);
        
        // Reset da animação após um curto delay
        setTimeout(() => {
          setIsSending(false);
        }, 600);
      }
    }
  };

  // Handler para o botão de enviar
  const handleSendClick = () => {
    if ((value.trim() || attachedFiles.length > 0) && !isLoading && !disabled) {
      setIsSending(true);
      onSend(attachedFiles);
      
      // Limpar arquivos após o envio
      setAttachedFiles([]);
      
      // Reset da animação após um curto delay
      setTimeout(() => {
        setIsSending(false);
      }, 600);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setAttachedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  };

  // Função para obter o ícone apropriado baseado no tipo de arquivo
  const getFileIcon = (file: File) => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Imagens
    if (fileType.startsWith('image/')) {
      return <FileImage className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
    // PDFs
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />;
    }
    // Documentos Word
    if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />;
    }
    // Áudio
    if (fileType.startsWith('audio/')) {
      return <FileAudio className="w-5 h-5 text-purple-500 flex-shrink-0" />;
    }
    // Vídeo
    if (fileType.startsWith('video/')) {
      return <FileVideo className="w-5 h-5 text-pink-500 flex-shrink-0" />;
    }
    // Padrão
    return <File className="w-5 h-5 text-gray-500 flex-shrink-0" />;
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Curva de animação Apple-like (cubic-bezier)
  const appleEase = [0.25, 0.46, 0.45, 0.94];

  // Variantes de animação Apple-like
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const fileItemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 8,
      transition: {
        duration: 0.2,
      },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.15,
      },
    },
  };

  const sendButtonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.08,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.92,
      transition: {
        duration: 0.15,
      },
    },
  };

  const iconVariants = {
    idle: { y: 0, rotate: 0 },
    sending: {
      y: -24,
      rotate: 20,
      opacity: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const loaderVariants = {
    idle: { opacity: 0, scale: 0.5 },
    loading: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const filesContainerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const paperTrailVariants = {
    initial: { 
      opacity: 1, 
      x: 0, 
      y: 0 
    },
    animate: {
      opacity: 0,
      x: 8,
      y: -8,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`backdrop-blur-xl border-t ${theme === 'dark' ? 'bg-[#1e1e1e]/95 border-gray-800/50' : 'bg-[#f5f5f7]/95 border-gray-200/50'}`}
    >
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Container do input */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`relative flex flex-col border rounded-2xl shadow-lg backdrop-blur-xl ${
            theme === 'dark'
              ? 'bg-[#2a2a2a]/80 border-gray-700/50 hover:border-gray-600 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:shadow-xl focus-within:shadow-blue-500/10'
              : 'bg-white/90 border-gray-300/50 hover:border-gray-400/50 focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-200/50 focus-within:shadow-xl'
          }`}
          whileHover={{
            y: -2,
            boxShadow: theme === 'dark'
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Pré-visualização de arquivos anexados */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                variants={filesContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`p-4 border-b backdrop-blur-xl ${
                  theme === 'dark'
                    ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50'
                    : 'border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Arquivos Anexados ({attachedFiles.length})
                  </motion.span>
                  <motion.button
                    onClick={() => setAttachedFiles([])}
                    whileHover={{ backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 242, 242, 1)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer ${
                      theme === 'dark'
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-red-600 hover:text-red-700'
                    }`}
                  >
                    Limpar Todos
                  </motion.button>
                </div>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.2,
                      },
                    },
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {attachedFiles.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        variants={fileItemVariants}
                        layout
                        className={`group flex items-center gap-3 rounded-xl p-3 shadow-md border ${
                          theme === 'dark'
                            ? 'bg-[#2a2a2a]/80 border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10'
                            : 'bg-white/90 border-gray-200/50 hover:border-blue-400/50 hover:shadow-lg backdrop-blur-sm'
                        }`}
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                      >
                        {/* Ícone do arquivo */}
                        <motion.div
                          className={`flex-shrink-0 p-2 rounded-lg ${
                            theme === 'dark' ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-50 group-hover:bg-gray-100'
                          }`}
                          whileHover={{
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 1)',
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {getFileIcon(file)}
                        </motion.div>
                        
                        {/* Informações do arquivo */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                            }`}
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className={`text-xs mt-0.5 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        {/* Botão remover */}
                        <motion.button
                          onClick={() => handleRemoveFile(file)}
                          className={`flex-shrink-0 p-1.5 rounded-lg cursor-pointer ${
                            theme === 'dark'
                              ? 'hover:bg-red-500/20'
                              : 'hover:bg-red-50'
                          }`}
                          title="Remover arquivo"
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          exit={{ opacity: 0, scale: 0 }}
                        >
                          <X className={`w-4 h-4 ${
                            theme === 'dark' ? 'text-red-400' : 'text-red-500'
                          }`} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-3 p-4">
            {/* Botão de anexo */}
            <motion.button
              onClick={handleFileSelect}
              disabled={disabled || isLoading}
              variants={buttonVariants}
              initial="idle"
              whileHover={!disabled ? "hover" : "idle"}
              whileTap={!disabled ? "tap" : "idle"}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700/80 active:bg-gray-600/80' 
                  : 'hover:bg-gray-100/80 active:bg-gray-200/80'
              }`}
              aria-label="Anexar arquivo"
            >
              <motion.div
                whileHover={{ rotate: 45 }}
                transition={{ duration: 0.3 }}
              >
                <Paperclip className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </motion.div>
            </motion.button>

            {/* Input de arquivo oculto */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />

            {/* Textarea */}
            <motion.textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`flex-1 resize-none bg-transparent border-none outline-none 
                       max-h-32 min-h-[24px] disabled:opacity-50 text-[15px] leading-relaxed ${
                         theme === 'dark'
                           ? 'text-gray-100 placeholder-gray-500'
                           : 'text-gray-900 placeholder-gray-400'
                       }`}
              rows={1}
              aria-label="Campo de mensagem"
            />

            {/* Botão de enviar */}
            <motion.button
              onClick={handleSendClick}
              disabled={(!value.trim() && attachedFiles.length === 0) || isLoading || disabled}
              variants={sendButtonVariants}
              initial="idle"
              whileHover={(!value.trim() && attachedFiles.length === 0) || isLoading || disabled ? "idle" : "hover"}
              whileTap={(!value.trim() && attachedFiles.length === 0) || isLoading || disabled ? "idle" : "tap"}
              className={`relative flex-shrink-0 w-11 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 
                       hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 
                       disabled:to-gray-500 rounded-xl flex items-center justify-center 
                       disabled:cursor-not-allowed 
                       shadow-lg overflow-hidden cursor-pointer`}
              aria-label="Enviar mensagem"
            >
              {/* Efeito de papel ao enviar */}
              <AnimatePresence>
                {isSending && (
                  <>
                    <motion.div
                      key="trail-1"
                      className="absolute inset-0 flex items-center justify-center"
                      variants={paperTrailVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Send className="w-5 h-5 text-white/30" />
                    </motion.div>
                    <motion.div
                      key="trail-2"
                      className="absolute inset-0 flex items-center justify-center"
                      variants={paperTrailVariants}
                      initial="initial"
                      animate="animate"
                      transition={{
                        duration: 0.6,
                        delay: 0.1,
                        ease: "easeInOut",
                      }}
                    >
                      <Send className="w-4 h-4 text-white/20" />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              
              {/* Ícone principal */}
              <motion.div
                className="relative z-10"
                variants={iconVariants}
                initial="idle"
                animate={isSending ? "sending" : "idle"}
              >
                {isLoading ? (
                  <motion.div
                    variants={loaderVariants}
                    initial="idle"
                    animate="loading"
                  >
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </motion.div>
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </motion.div>
              
              {/* Efeito de brilho ao enviar */}
              <AnimatePresence>
                {isSending && (
                  <motion.div
                    key="glow"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, repeat: 1 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* Instruções de uso */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`text-xs mt-3 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
        >
          Pressione{" "}
          <motion.kbd
            whileHover={{ scale: 1.05 }}
            className={`px-2 py-1 border rounded-lg font-mono text-xs shadow-sm inline-block ${
              theme === 'dark'
                ? 'bg-gray-800/80 border-gray-700/50 text-gray-300'
                : 'bg-gray-100/80 border-gray-300/50 text-gray-700'
            }`}
          >
            Enter
          </motion.kbd>{" "}
          para enviar •{" "}
          <motion.kbd
            whileHover={{ scale: 1.05 }}
            className={`px-2 py-1 border rounded-lg font-mono text-xs shadow-sm inline-block ${
              theme === 'dark'
                ? 'bg-gray-800/80 border-gray-700/50 text-gray-300'
                : 'bg-gray-100/80 border-gray-300/50 text-gray-700'
            }`}
          >
            Shift + Enter
          </motion.kbd>{" "}
          para nova linha
        </motion.p>
      </div>
    </motion.div>
  );
}
