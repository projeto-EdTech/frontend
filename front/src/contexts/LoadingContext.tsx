"use client";

import React, { createContext, useContext, ReactNode } from 'react';

// Define a estrutura do contexto, mas com funções vazias.
interface LoadingContextType {
  showLoader: () => void;
  hideLoader: () => void;
  isLoading: boolean;
}

// Cria o contexto com valores padrão que não fazem nada.
const LoadingContext = createContext<LoadingContextType>({
  showLoader: () => {}, // Função vazia
  hideLoader: () => {}, // Função vazia
  isLoading: false,
});

// Hook customizado para usar o contexto (não é estritamente necessário agora, mas é uma boa prática)
export const useLoading = () => {
  return useContext(LoadingContext);
};

// Componente Provedor que simplesmente renderiza os filhos, sem lógica adicional por enquanto.
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    isLoading: false,
    showLoader: () => {},
    hideLoader: () => {},
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};
