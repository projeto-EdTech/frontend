"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Tipos existentes
type CursorSize = 'default' | 'medium' | 'large';
type Alignment = 'left' | 'center' | 'right' | 'justified';

// Interface que define a estrutura de todas as configurações de acessibilidade.
interface AccessibilitySettings {
  textSize: number;
  dyslexiaFont: boolean;
  textSpacing: boolean;
  cursorSize: CursorSize;
  alignment: Alignment;
  hideImages: boolean;
  focusGuide: boolean;
  keyboardNav: boolean; // NOVO: Estado para navegação por teclado
}

// Interface que define o que o contexto de acessibilidade irá fornecer.
interface AccessibilityContextType {
  settings: AccessibilitySettings;
  setTextSize: (size: number) => void;
  toggleDyslexiaFont: () => void;
  toggleTextSpacing: () => void;
  setCursorSize: (size: CursorSize) => void;
  setAlignment: (alignment: Alignment) => void;
  toggleHideImages: () => void;
  toggleFocusGuide: () => void;
  toggleKeyboardNav: () => void; // NOVO: Função para alternar a navegação por teclado
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Estado que armazena todas as configurações de acessibilidade.
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textSize: 1.0,
    dyslexiaFont: false,
    textSpacing: false,
    cursorSize: 'default',
    alignment: 'left',
    hideImages: false,
    focusGuide: false,
    keyboardNav: false, // NOVO: Estado inicial
  });

  // --- Efeitos para aplicar as configurações no DOM ---

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.textSize * 16}px`;
  }, [settings.textSize]);

  useEffect(() => {
    document.documentElement.classList.toggle('dyslexia-font-enabled', settings.dyslexiaFont);
  }, [settings.dyslexiaFont]);

  useEffect(() => {
    document.documentElement.classList.toggle('text-spacing-enabled', settings.textSpacing);
  }, [settings.textSpacing]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('cursor-medium', 'cursor-large');
    if (settings.cursorSize === 'medium') body.classList.add('cursor-medium');
    else if (settings.cursorSize === 'large') body.classList.add('cursor-large');
  }, [settings.cursorSize]);

  useEffect(() => {
    const docElement = document.documentElement;
    docElement.classList.remove('alignment-left', 'alignment-center', 'alignment-right', 'alignment-justified');
    if (settings.alignment) {
        docElement.classList.add(`alignment-${settings.alignment}`);
    }
  }, [settings.alignment]);

  useEffect(() => {
    document.documentElement.classList.toggle('images-hidden', settings.hideImages);
  }, [settings.hideImages]);

  useEffect(() => {
    document.documentElement.classList.toggle('focus-guide-enabled', settings.focusGuide);
  }, [settings.focusGuide]);

  // NOVO: Efeito para habilitar/desabilitar a navegação por teclado.
  useEffect(() => {
    document.documentElement.classList.toggle('keyboard-nav-enabled', settings.keyboardNav);
  }, [settings.keyboardNav]);


  // --- Funções para atualizar o estado de cada configuração ---

  const setTextSize = (size: number) => setSettings(prev => ({ ...prev, textSize: size }));
  const toggleDyslexiaFont = () => setSettings(prev => ({ ...prev, dyslexiaFont: !prev.dyslexiaFont }));
  const toggleTextSpacing = () => setSettings(prev => ({ ...prev, textSpacing: !prev.textSpacing }));
  const setCursorSize = (size: CursorSize) => setSettings(prev => ({ ...prev, cursorSize: size }));
  const toggleHideImages = () => setSettings(prev => ({ ...prev, hideImages: !prev.hideImages }));
  
  const setAlignment = (alignment: Alignment) => {
    setSettings(prev => ({ ...prev, alignment }));
  };

  const toggleFocusGuide = () => setSettings(prev => ({ ...prev, focusGuide: !prev.focusGuide }));
  const toggleKeyboardNav = () => setSettings(prev => ({ ...prev, keyboardNav: !prev.keyboardNav }));

  const resetAccessibility = () => {
    setSettings({
      textSize: 1.0,
      dyslexiaFont: false,
      textSpacing: false,
      cursorSize: 'default',
      alignment: 'justified',
      hideImages: false,
      focusGuide: false,
      keyboardNav: false, // NOVO: Reseta o estado
    });
  };
  
  const value = {
    settings,
    setTextSize,
    toggleDyslexiaFont,
    toggleTextSpacing,
    setCursorSize,
    setAlignment,
    toggleHideImages,
    toggleFocusGuide,
    toggleKeyboardNav, // Adicionado ao contexto
    resetAccessibility,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};