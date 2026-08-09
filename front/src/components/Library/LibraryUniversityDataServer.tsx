import React from 'react';
import LibraryUniversityClient from './LibraryUniversityClient';
import { type University } from '@/types/university';
import { cookies } from "next/headers";

interface LibraryUniversityDataServerProps {
  slug: string;
}

export default async function LibraryUniversityDataServer({ slug }: LibraryUniversityDataServerProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_data')?.value;

  let universityInfo: University | null = null;

  try {
    const externalApiUrl = process.env.BACKEND_API_URL;
    if (externalApiUrl && token) {
      const apiResponse = await fetch(`${externalApiUrl}/api/instituicao`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        next: {
          revalidate: 3600, // cache de 1 hora
        },
      });

      if (apiResponse.ok) {
        const data: University[] = await apiResponse.json();
        const found = data.find((u) => u.slug === slug);
        if (found) {
          universityInfo = found;
        }
      }
    }
  } catch (error) {
    console.error('[LibraryUniversityDataServer] Erro ao buscar universidade:', error);
  }

  // Se não tem banco ou erro com timeout, passamos o fetch falho para o client 
  // (ou null, e o client lida com "Universidade não encontrada")
  
  return <LibraryUniversityClient slug={slug} universityInfo={universityInfo} />;
}
