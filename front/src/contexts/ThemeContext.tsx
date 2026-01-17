"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isAuthenticated?: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  isAuthenticated?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, isAuthenticated = false }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Se o usuário está deslogado, força tema claro
    if (!isAuthenticated) {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
      return;
    }

    // Se autenticado, carrega preferência salva
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Detecta preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Se autenticado, salva a preferência de tema
    if (isAuthenticated) {
      localStorage.setItem('theme', theme);
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, isAuthenticated]);

  const toggleTheme = () => {
    // Apenas permite alternar tema se o usuário estiver autenticado
    if (isAuthenticated) {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAuthenticated }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};