"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { University } from '@/types/university';

interface UniversityContextType {
  universities: University[];
  loading: boolean;
  error: string | null;
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

interface UniversityStorageProps {
  children: ReactNode;
}

export const UniversityStorage: React.FC<UniversityStorageProps> = ({ children }) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('/api/universities');
        if (!response.ok) {
          throw new Error('Falha ao buscar universidades');
        }
        const data = await response.json();
        setUniversities(data);
      } catch (err) {
        console.error('Erro ao carregar universidades:', err);
        setError('Não foi possível carregar as universidades.');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  return (
    <UniversityContext.Provider value={{ universities, loading, error }}>
      {children}
    </UniversityContext.Provider>
  );
};

export const useUniversityStorage = () => {
  const context = useContext(UniversityContext);
  if (context === undefined) {
    throw new Error('useUniversityStorage must be used within a UniversityStorage');
  }
  return context;
};
