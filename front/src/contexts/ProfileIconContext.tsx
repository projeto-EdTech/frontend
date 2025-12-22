"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define o tipo de dado que o contexto irá guardar
interface ProfileIconContextType {
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;
}

// Cria o contexto com um valor padrão
const ProfileIconContext = createContext<ProfileIconContextType | undefined>(undefined);

// Cria o Provedor do Contexto. Ele vai envolver sua aplicação.
export const ProfileIconProvider = ({ children }: { children: ReactNode }) => {
  const [selectedIcon, setSelectedIcon] = useState("M"); // O estado agora vive aqui

  return (
    <ProfileIconContext.Provider value={{ selectedIcon, setSelectedIcon }}>
      {children}
    </ProfileIconContext.Provider>
  );
};

// Cria um hook customizado para facilitar o uso do contexto nos componentes
export const useProfileIcon = () => {
  const context = useContext(ProfileIconContext);
  if (context === undefined) {
    throw new Error('useProfileIcon deve ser usado dentro de um ProfileIconProvider');
  }
  return context;
};