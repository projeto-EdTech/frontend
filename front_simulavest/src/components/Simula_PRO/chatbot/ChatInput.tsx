"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Loader2, Paperclip, FileText, X, FileImage, FileAudio, FileVideo, File } from "lucide-react";
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

  return (
    <div className={`backdrop-blur-xl border-t ${theme === 'dark' ? 'bg-[#1e1e1e]/95 border-gray-800/50' : 'bg-[#f5f5f7]/95 border-gray-200/50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Container do input */}
        <div className={`relative flex flex-col border rounded-2xl shadow-lg backdrop-blur-xl transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-[#2a2a2a]/80 border-gray-700/50 hover:border-gray-600 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:shadow-xl focus-within:shadow-blue-500/10'
            : 'bg-white/90 border-gray-300/50 hover:border-gray-400/50 focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-200/50 focus-within:shadow-xl'
        }`}>
          {/* Pré-visualização de arquivos anexados */}
          {attachedFiles.length > 0 && (
            <div className={`p-4 border-b backdrop-blur-xl ${
              theme === 'dark'
                ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50'
                : 'border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Arquivos Anexados ({attachedFiles.length})
                </span>
                <button
                  onClick={() => setAttachedFiles([])}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                    theme === 'dark'
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  Limpar Todos
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`group flex items-center gap-3 rounded-xl p-3 shadow-md border transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-[#2a2a2a]/80 border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10'
                        : 'bg-white/90 border-gray-200/50 hover:border-blue-400/50 hover:shadow-lg backdrop-blur-sm'
                    }`}
                  >
                    {/* Ícone do arquivo */}
                    <div className={`flex-shrink-0 p-2 rounded-lg transition-all duration-300 ${
                      theme === 'dark' ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-50 group-hover:bg-gray-100'
                    }`}>
                      {getFileIcon(file)}
                    </div>
                    
                    {/* Informações do arquivo */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`} title={file.name}>
                        {file.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Botão remover */}
                    <button
                      onClick={() => handleRemoveFile(file)}
                      className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                        theme === 'dark'
                          ? 'hover:bg-red-500/20 opacity-0 group-hover:opacity-100'
                          : 'hover:bg-red-50 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Remover arquivo"
                    >
                      <X className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-500'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-3 p-4">
            {/* Botão de anexo */}
            <button
              onClick={handleFileSelect}
              disabled={disabled || isLoading}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700/80 active:bg-gray-600/80' 
                  : 'hover:bg-gray-100/80 active:bg-gray-200/80'
              }`}
              aria-label="Anexar arquivo"
            >
              <Paperclip className={`w-5 h-5 transition-transform duration-300 hover:rotate-45 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} />
            </button>

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
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
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
            <button
              onClick={handleSendClick}
              disabled={(!value.trim() && attachedFiles.length === 0) || isLoading || disabled}
              className={`relative flex-shrink-0 w-11 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 
                       hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 
                       disabled:to-gray-500 rounded-xl flex items-center justify-center 
                       transition-all duration-300 disabled:cursor-not-allowed 
                       shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-blue-500/30 active:scale-95 disabled:shadow-md disabled:hover:scale-100 overflow-hidden cursor-pointer
                       ${isSending ? 'button-scale' : ''}`}
              aria-label="Enviar mensagem"
            >
              {/* Efeito de rastro do papel */}
              {isSending && (
                <>
                  <div className="absolute inset-0 paper-trail">
                    <Send className="w-5 h-5 text-white/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="absolute inset-0 paper-trail" style={{ animationDelay: '0.1s' }}>
                    <Send className="w-4 h-4 text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </>
              )}
              
              {/* Ícone principal */}
              <div className={`relative z-10 ${isSending ? 'fly-animation' : ''}`}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </div>
              
              {/* Efeito de brilho ao enviar */}
              {isSending && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-30 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Instruções de uso */}
        <p className={`text-xs mt-3 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Pressione{" "}
          <kbd className={`px-2 py-1 border rounded-lg font-mono text-xs shadow-sm transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-gray-800/80 border-gray-700/50 text-gray-300'
              : 'bg-gray-100/80 border-gray-300/50 text-gray-700'
          }`}>
            Enter
          </kbd>{" "}
          para enviar •{" "}
          <kbd className={`px-2 py-1 border rounded-lg font-mono text-xs shadow-sm transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-gray-800/80 border-gray-700/50 text-gray-300'
              : 'bg-gray-100/80 border-gray-300/50 text-gray-700'
          }`}>
            Shift + Enter
          </kbd>{" "}
          para nova linha
        </p>
      </div>
    </div>
  );
}
