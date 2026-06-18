import { Suspense } from "react";
import { RankingDataServer } from "@/components/ranking/RankingDataServer";
import RankingTableSkeleton from "@/components/Skeletons/RankingTableSkeleton";

// CACHE STRATEGY: ISR — revalidate 60s
// Motivo: conteúdo de ranking público, não varia instantaneamente por usuário.
export const revalidate = 60;

/**
 * RankingPage - Entry point for /ranking
 * 
 * Orchestrates the layout and uses Streaming with Suspense.
 * The shell is delivered instantly, while data is streamed.
 */
export default function RankingPage() {
  return (
    <Suspense fallback={<RankingPageSkeleton />}>
      <RankingDataServer />
    </Suspense>
  );
}

/**
 * Minimal skeleton for the entire page to avoid layout shift.
 * Wraps the existing Table Skeleton.
 */
function RankingPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      {/* Note: Header is usually better to be outside Suspense for instant feedback, 
          but here we wrap the whole server component. 
          If Header has no dynamic data, it could be separate. */}
      <main className="flex-1 container mx-auto px-6 md:px-8 py-12 md:py-20 max-w-7xl">
        <div className="h-48 mb-12 flex flex-col items-center justify-center">
           <div className="w-64 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4" />
           <div className="w-96 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <RankingTableSkeleton />
      </main>
    </div>
  );
}