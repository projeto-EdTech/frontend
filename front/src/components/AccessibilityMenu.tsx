"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Type,
  AlignLeft,
  AlignRight,
  AlignJustify,
  AlignCenter,
  ArrowUpDown,
  ImageIcon,
  Sun,
  Moon,
  Eye,
  Settings,
  ChevronRight,
  Crown,
  Undo2,
} from "lucide-react";
import Image from "next/image";

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityMenu({
  isOpen,
  onClose,
}: AccessibilityMenuProps) {
  const {
    settings,
    setTextSize,
    resetAccessibility,
    toggleDyslexiaFont,
    toggleTextSpacing,
    setCursorSize,
    toggleHideImages,
    setAlignment,
    toggleFocusGuide,
    toggleKeyboardNav,
  } = useAccessibility();

  const { theme, toggleTheme } = useTheme();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [animateIn, setAnimateIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen) {
      timeoutId = setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  const textSizeOptions = [
    { label: "100%", value: 1.0 },
    { label: "125%", value: 1.25 },
    { label: "150%", value: 1.5 },
    { label: "175%", value: 1.75 },
    { label: "200%", value: 2.0 },
  ];

  const cursorSizeOptions = [
    { id: "default", label: "Padrão" },
    { id: "medium", label: "Médio" },
    { id: "large", label: "Grande" },
  ];

  const sections = {
    Visualização: [
      {
        label: theme === "dark" ? "Modo claro" : "Modo escuro",
        icon: theme === "dark" ? Sun : Moon,
        action: toggleTheme,
        disabled: false,
        description: "Alterne entre temas visuais para maior conforto",
        active: theme === "dark",
        gradient: "from-yellow-400 via-orange-500 to-pink-500",
        premium: false,
      },
    ],
    Conteúdo: [
      {
        label: "Fonte para dislexia",
        icon: Type,
        action: toggleDyslexiaFont,
        disabled: false,
        description:
          "Fonte especialmente desenvolvida para facilitar a leitura",
        active: settings.dyslexiaFont,
        gradient: "from-emerald-400 via-teal-500 to-cyan-600",
        premium: false,
      },
      {
        label: "Espaçamento do texto",
        icon: ArrowUpDown,
        action: toggleTextSpacing,
        disabled: false,
        description:
          "Aumenta o espaço entre linhas e letras para melhor legibilidade",
        active: settings.textSpacing,
        gradient: "from-purple-400 via-pink-500 to-red-500",
        premium: false,
      },
      {
        label: "Ocultar imagens",
        icon: ImageIcon,
        action: toggleHideImages,
        disabled: false,
        description: "Remove elementos visuais para focar no conteúdo textual",
        active: settings.hideImages,
        gradient: "from-amber-400 via-orange-500 to-red-500",
        premium: false,
      },
    ],
    Interação: [
      {
        label: "Navegação por teclado",
        icon: Settings,
        action: toggleKeyboardNav,
        disabled: false,
        description: "Ativa atalhos de teclado e links para pular seções",
        active: settings.keyboardNav,
        gradient: "from-cyan-400 via-blue-500 to-indigo-600",
        premium: false,
      },
      {
        label: "Guia de foco",
        icon: Eye,
        action: toggleFocusGuide,
        disabled: false,
        description: "Destaca visualmente elementos interativos em foco",
        active: settings.focusGuide,
        gradient: "from-green-400 via-emerald-500 to-teal-600",
        premium: false,
      },
    ],
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (!isOpen) {
    return null;
  }

  type AlignmentOption = "justified" | "left" | "center" | "right";

  const alignmentButtons = [
    { id: "justified", label: "Justificado", icon: AlignJustify },
    { id: "left", label: "Esquerda", icon: AlignLeft },
    { id: "center", label: "Centralizado", icon: AlignCenter },
    { id: "right", label: "Direita", icon: AlignRight },
  ];

  return (
    <>
      {/* Overlay com blur - estilo macOS */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          animateIn
            ? "backdrop-blur-sm bg-black/20"
            : "backdrop-blur-0 bg-black/0"
        }`}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      />

      <div
        ref={menuRef}
        className={`fixed right-0 top-0 h-full w-full z-50 transform transition-all duration-300 ease-out ${
          isFullScreen ? "max-w-full" : "max-w-md lg:max-w-lg"
        } ${
          animateIn ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Container principal - estilo macOS com vibrancy */}
        <div className="relative h-full bg-white backdrop-blur-xl backdrop-saturate-150 shadow-2xl border-l border-gray-200">
          <div className="relative h-full flex flex-col">
            {/* Header - estilo macOS com traffic lights */}
            <div className="flex-shrink-0 px-5 pt-4 pb-5 border-b border-gray-200">
              {/* Traffic lights do macOS */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                  onClick={onClose}
                  title="Fechar"
                />
                <div
                  className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"
                  onClick={onClose}
                  title="Minimizar"
                />
                {/* Botão Verde com onClick */}
                <div
                  className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"
                  onClick={toggleFullScreen}
                  title={isFullScreen ? "Restaurar tamanho" : "Maximizar"}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Ícone do mascote reduzido */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src="/Mascote/banners/Camaleão_4.png"
                      alt="Mascote SimulaVest"
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                      Acessibilidade
                    </h2>
                    <p className="text-md text-gray-500 mt-0.5">
                      Personalize sua experiência
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo scrollável - estilo macOS com scrollbar nativa */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Seção de tamanho do texto */}
              <section>
                <h3 className="text-md font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Tamanho do Texto
                </h3>
                <div className="p-3 rounded-lg bg-white">
                  <div className="flex gap-1.5">
                    {textSizeOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => setTextSize(option.value)}
                        className={`flex-1 px-2 py-2 text-md font-medium rounded-md transition-all duration-150 cursor-pointer ${
                          settings.textSize === option.value
                            ? "bg-gradient-to-b from-blue-500 to-blue-600 shadow-xl hover:shadow-blue-500/30 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Seção de tamanho do cursor */}
              <section>
                <h3 className="text-md font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Tamanho do Cursor
                </h3>
                <div className="p-3 rounded-lg bg-white">
                  <div className="flex gap-1.5">
                    {cursorSizeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() =>
                          setCursorSize(
                            option.id as "default" | "medium" | "large"
                          )
                        }
                        className={`flex-1 px-2 py-2 text-md font-medium rounded-md transition-all duration-150 cursor-pointer ${
                          settings.cursorSize === option.id
                            ? "bg-gradient-to-b from-blue-500 to-blue-600 shadow-xl hover:shadow-blue-500/30 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-md font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Alinhamento
                </h3>
                <div className="p-3 rounded-lg bg-white">
                  <div className="flex gap-1.5">
                    {alignmentButtons.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setAlignment(option.id as AlignmentOption)}
                        className={`flex-1 px-2 py-3 flex items-center justify-center gap-2 text-md font-medium rounded-md transition-all duration-150 cursor-pointer ${
                          settings.alignment === option.id
                            ? "bg-gradient-to-b from-blue-500 to-blue-600 shadow-xl hover:shadow-blue-500/30 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                        title={option.label}
                      >
                        <option.icon className="w-5 h-5" />
                        {/* Se quiser esconder o texto em telas pequenas, use 'hidden sm:block' */}
                        <span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Seções de funcionalidades - estilo macOS System Preferences */}
              {Object.entries(sections).map(([title, options]) => (
                <section key={title}>
                  <h3 className="text-md font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {title}
                  </h3>

                  <div className="space-y-1.5">
                    {options.map((option) => (
                      <button
                        key={option.label}
                        onClick={option.action}
                        disabled={option.disabled}
                        className={`group w-full p-3.5 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                          option.disabled
                            ? "bg-white cursor-not-allowed opacity-50"
                            : option.active
                              ? "bg-white border border-gray-200"
                              : "bg-white hover:bg-gray-100"
                        }`}
                        aria-label={`${option.label} - ${option.description}`}
                        aria-pressed={option.active}
                      >
                        <div className="flex items-center gap-3">
                          {/* Ícone com gradiente suave */}
                          <div
                            className={`w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0 ${
                              option.disabled
                                ? "bg-gray-200"
                                : `bg-gradient-to-br ${option.gradient}`
                            }`}
                          >
                            <option.icon
                              className="w-6 h-6 text-white"
                              strokeWidth={2}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-md font-medium mb-0.5 ${
                                option.disabled
                                  ? "text-gray-400"
                                  : option.active
                                    ? "text-blue-700"
                                    : "text-gray-900"
                              }`}
                            >
                              {option.label}
                              {option.premium && (
                                <Crown className="inline w-3.5 h-3.5 text-yellow-500 ml-1.5" />
                              )}
                            </h4>
                            <p
                              className={`text-sm leading-snug ${
                                option.disabled
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {option.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Toggle switch estilo macOS */}
                            {!option.disabled && (
                              <div
                                className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                                  option.active ? "bg-blue-500" : "!bg-gray-300"
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 left-0.5 w-5 h-5 !bg-white rounded-full shadow-sm transition-transform duration-200 ${
                                    option.active
                                      ? "translate-x-4"
                                      : "translate-x-0"
                                  }`}
                                ></div>
                              </div>
                            )}

                            {option.disabled && (
                              <div className="text-md text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
                                Em breve
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ))}

              {/* Botão de reset - estilo macOS */}
              <button
                onClick={resetAccessibility}
                className="group w-full p-3.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-md flex items-center justify-center flex-shrink-0">
                    <Undo2 className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-md font-medium text-gray-900">
                      Restaurar padrão
                    </span>
                    <span className="block text-md text-gray-500">
                      Reverter todas as personalizações
                    </span>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                    strokeWidth={2}
                  />
                </div>
              </button>

              {/* Card informativo final - estilo macOS */}
              <div className="p-4 bg-blue-100 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/Mascote/banners/Camaleão_3.png"
                      alt="Info"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-blue-900 text-md block mb-1">
                      Mais recursos em desenvolvimento
                    </span>
                    <span className="text-md text-blue-700 leading-relaxed block">
                      Estamos constantemente trabalhando para tornar nossa
                      plataforma mais acessível. Novos recursos serão
                      adicionados regularmente para melhorar sua experiência.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
