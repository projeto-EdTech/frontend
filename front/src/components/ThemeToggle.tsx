"use client"

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isAuthenticated } = useTheme();

  return (
    <div className="relative">
      <button 
        className={`theme-toggle-modern ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={toggleTheme}
        disabled={!isAuthenticated}
        aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        title={isAuthenticated ? `Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}` : 'Faça login para alterar o tema'}
      >
        {/* Background animado */}
        <div className={`theme-toggle-bg ${theme === 'dark' ? 'theme-toggle-bg-dark' : 'theme-toggle-bg-light'}`}></div>
        
        {/* Círculo deslizante */}
        <div className={`theme-toggle-circle ${theme === 'dark' ? 'theme-toggle-circle-dark' : 'theme-toggle-circle-light'}`}>
          {theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500 transition-all duration-300" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-200 transition-all duration-300" />
          )}
        </div>
        
        {/* Efeito de brilho */}
        <div className="theme-toggle-glow"></div>
      </button>
    </div>
  );
};

export default ThemeToggle;