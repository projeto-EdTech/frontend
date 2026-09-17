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
        // Sem Authorization: o cookie `user_data` é HttpOnly e acompanha sozinho todo fetch
        // same-origin. A rota o lê no servidor com `readUserToken`.
        const response = await fetch('/api/universities', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar universidades');
        }
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Resposta inesperada do servidor (não-JSON)');
        }
        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map((u: University) => ({
              ...u,
              logo: u.logo && !u.logo.startsWith('/') && !u.logo.startsWith('http')
                ? `/${u.logo}`
                : u.logo,
            }))
          : data;
        setUniversities(normalized);
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
