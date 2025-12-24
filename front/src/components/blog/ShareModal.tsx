"use client";

import { useState, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom'; 
import Image from 'next/image';
import { Share2, Twitter, Facebook, X, Copy, Sparkles } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface ShareModalProps {
  title: string;
}

export default function ShareModal({ title }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setPostUrl(window.location.href);
  }, []);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Pequeno delay para a animação CSS aplicar
      timeoutId = setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Espera a animação de saída terminar para restaurar o scroll
      timeoutId = setTimeout(() => {
        document.body.style.overflow = 'unset';
      }, 500); 
    }
    return () => {
      clearTimeout(timeoutId);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);


  const shareText = encodeURIComponent(`Confira este artigo incrível: ${title}`);
  
  // (Toda a sua lógica, como shareOptions, copyToClipboard, etc., permanece igual)
  const shareOptions = [
    { 
        name: 'WhatsApp',
        icon: <WhatsAppIcon />,
        url: `https://wa.me/?text=${shareText}%20${encodeURIComponent(postUrl)}`,
    },
    { 
        name: 'Twitter', 
        icon: <Twitter className="w-6 h-6" />, 
        url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${shareText}`, 
    },
    { 
        name: 'Facebook', 
        icon: <Facebook className="w-6 h-6" />, 
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, 
    },
    { 
        name: 'Instagram', 
        icon: <InstagramIcon />, 
        url: `https://www.instagram.com`, 
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 500); // Espera a animação de saída
  }

  // Modal estilo macOS
  const modalContent = isOpen ? (
    <div 
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        isAnimating 
          ? 'opacity-100' 
          : 'opacity-0'
      }`}
      onClick={closeModal}
    >
      {/* Backdrop estilo macOS */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-xl transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* Container do Modal estilo macOS */}
      <div 
        className={`relative bg-white backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-md mx-4 text-center border border-gray-200 overflow-hidden transform transition-all duration-300 ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de fechar estilo macOS */}
        <button 
          onClick={closeModal} 
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-700 transition-all duration-200 group backdrop-blur-sm"
        >
          <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" strokeWidth={2} />
        </button>

        {/* Conteúdo do Modal */}
        <div className="p-8">
          {/* Header com mascote */}
          <div className="mb-6">
            <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Image 
                src="/Mascote/banners/Camaleão_1.png" 
                alt="Mascote Vestibuline" 
                width={80} 
                height={80}
                className="relative z-10 drop-shadow-lg"
                style={{ animation: isAnimating ? 'float 3s ease-in-out infinite' : 'none' }}
              />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Compartilhar Artigo
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Gostou deste conteúdo? Espalhe o conhecimento! ✨
            </p>
          </div>

          {/* Opções de compartilhamento estilo macOS */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {shareOptions.map((option, index) => (
              <a 
                key={option.name} 
                href={option.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative w-full aspect-square flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105"
                title={`Compartilhar no ${option.name}`} 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative z-10 text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                  {option.icon}
                </div>
              </a>
            ))}
          </div>

          {/* Divider estilo macOS */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs font-medium text-gray-500">Ou copie o link</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Input de URL estilo macOS */}
          <div className="relative bg-gray-100 rounded-lg border border-gray-200 overflow-hidden transition-colors duration-200 focus-within:border-blue-500">
            <div className="flex items-center">
              <input 
                type="text" 
                value={postUrl} 
                readOnly 
                className="flex-1 bg-transparent px-3 py-2.5 text-xs text-gray-700 truncate focus:outline-none"
              />
              <button 
                onClick={copyToClipboard} 
                className={`px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  copySuccess 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {copySuccess ? (
                    'Copiado!'
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                      Copiar
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Footer com mascote */}
          <p className="mt-6 text-xs text-gray-500 flex items-center justify-center gap-2">
            <Image 
              src="/Mascote/banners/Camaleão_5.png" 
              alt="Mascote Vestibuline" 
              width={32} 
              height={32}
              className="inline-block"
            />
            Ajude outros a descobrirem este conteúdo incrível! 🚀
          </p>
        </div>

        <style jsx>{`
          @keyframes float { 
            0%, 100% { transform: translateY(0px) rotate(0deg); } 
            50% { transform: translateY(-8px) rotate(3deg); } 
          }
        `}</style>
      </div>
    </div>
  ) : null;
  
  // 4. O 'return' FINAL AGORA USA O PORTAL PARA RENDERIZAR A VARIÁVEL 'modalContent'
  return (
    <Fragment>
      {/* Botão de compartilhar estilo macOS */}
      <button 
        onClick={openModal}
        className="group relative flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 backdrop-blur-md transition-all duration-200 hover:shadow-md cursor-pointer"
      >
        <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" strokeWidth={2} />
        <span className="text-sm font-medium">Compartilhar</span>
        <Sparkles className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200" strokeWidth={2} />
      </button>

      {/* AQUI ESTÁ A CORREÇÃO: Usamos o Portal para renderizar o modal no final do <body> */}
      {isMounted ? createPortal(modalContent, document.body) : null}
    </Fragment>
  );
}