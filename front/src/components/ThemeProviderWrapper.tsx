"use client"

import React, { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface ThemeProviderWrapperProps {
  children: ReactNode;
}

export const ThemeProviderWrapper: React.FC<ThemeProviderWrapperProps> = ({ children }) => {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <ThemeProvider isAuthenticated={isAuthenticated}>
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderWrapper;
