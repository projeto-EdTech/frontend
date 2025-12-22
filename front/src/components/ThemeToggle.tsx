"use client"

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative">
      <button 
        className="theme-toggle-modern"
        onClick={toggleTheme}
        aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
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