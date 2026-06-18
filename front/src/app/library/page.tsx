import { Suspense } from 'react';
import { UniversityDataServer } from '@/components/Library/UniversityDataServer';
import { UniversityLibrarySkeleton } from '@/components/Skeletons/UniversityLibrarySkeleton';

/**
 * CACHE STRATEGY: ISR — revalidate 3600s (1h)
 * Motivo: O catálogo de universidades é um conteúdo estável.
 * O streaming via Suspense garante que a casca da página (Header/Sidebar) seja entregue imediatamente.
 */
export const revalidate = 3600;

export default function LibraryPage() {
  return (
    <Suspense fallback={<UniversityLibrarySkeleton />}>
      <UniversityDataServer />
    </Suspense>
  );
}