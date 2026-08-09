import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function UniversitiesCountBadge() {
  const session = await getServerSession(authOptions);
  let count: number | null = null;
  let hasError = false;

  try {
    const externalApiUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
    
    // Tentamos buscar do backend diretamente se as variaveis e a sessao existirem
    if (session?.accessToken) {
      const apiResponse = await fetch(`${externalApiUrl}/api/instituicao`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        next: {
          revalidate: 3600, 
        },
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        if (Array.isArray(data)) {
          count = data.length;
        } else if (Array.isArray(data?.universities)) {
          count = data.universities.length;
        }
      } else {
        hasError = true;
      }
    } else {
      hasError = true; // Cai para o fallback visual
    }
  } catch (error) {
    hasError = true;
  }

  return (
    <div className="flex items-center gap-2 force-themed-card backdrop-blur-sm px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow select-none">
      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">🎓</span>
      </div>
      <span className="text-xs font-medium themed-text" aria-live="polite">
        {hasError && count === null && "Universidades"}
        {!hasError && count === null && "..."}
        {count !== null && `${count} Universidades`}
      </span>
    </div>
  );
}
