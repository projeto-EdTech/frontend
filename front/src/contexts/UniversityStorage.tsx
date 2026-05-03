"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { University } from '@/types/university';

interface UniversityContextType {
  universities: University[];
  loading: boolean;
  error: string | null;
  isUsingLocalFallback: boolean;
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

interface UniversityStorageProps {
  children: ReactNode;
}

export const UniversityStorage: React.FC<UniversityStorageProps> = ({ children }) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingLocalFallback, setIsUsingLocalFallback] = useState<boolean>(false);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const storedToken = localStorage.getItem('user_data');
        
        const response = await fetch('/api/universities', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        const data = await response.json();
        setUniversities(data);
        setIsUsingLocalFallback(false);
      } catch (err) {
        console.warn('Falha ao buscar universidades da API, carregando dados locais:', err);
        
        // Fallback para dados locais em caso de falha
        try {
          const { universities: localUniversities } = await import('@/lib/dataUniversity');
          setUniversities(localUniversities);
          setIsUsingLocalFallback(true);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✓ Usando dados locais de universidades (fallback)');
          }
        } catch (fallbackErr) {
          console.error('Erro ao carregar dados locais de universidades:', fallbackErr);
          setError('Não foi possível carregar as universidades.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  return (
    <UniversityContext.Provider value={{ universities, loading, error, isUsingLocalFallback }}>
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
