import { type University } from '@/types/university';
import { universities as localUniversities } from '@/lib/data/universities';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

/**
 * CACHE STRATEGY: ISR — revalidate 3600s (1h)
 * Motivo: Dados de instituições são estáveis e não variam por usuário.
 */

export async function getUniversities(): Promise<University[]> {
  // Simulação enquanto o backend não está em produção
  if (process.env.NODE_ENV !== 'production' || !BACKEND_API_URL) {
    return localUniversities.map((u, index) => ({
      ...u,
      id: index + 1
    })) as University[];
  }

  try {
    const res = await fetch(`${BACKEND_API_URL}/api/instituicao`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`[UniversityService] Erro ao buscar universidades: ${res.statusText}`);
      return localUniversities.map((u, index) => ({
        ...u,
        id: index + 1
      })) as University[];
    }

    return res.json();
  } catch (error) {
    console.error('[UniversityService] Falha na requisição:', error);
    // Fallback para dados locais em caso de erro na API
    return localUniversities.map((u, index) => ({
      ...u,
      id: index + 1
    })) as University[];
  }
}

export async function getUniversityBySlug(slug: string): Promise<University | null> {
  try {
    const universitiesList = await getUniversities();
    return universitiesList.find(u => u.slug === slug) || null;
  } catch (error) {
    console.error(`[UniversityService] Erro ao buscar universidade por slug (${slug}):`, error);
    return null;
  }
}
