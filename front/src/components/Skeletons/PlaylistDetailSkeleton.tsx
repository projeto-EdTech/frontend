import { cn } from "@/lib/core/utils";

export function PlaylistDetailSkeleton() {
  return (
    <div className="min-h-screen selection:bg-green-500/30 bg-[#121212] text-white">
      {/* Hero Skeleton */}
      <div className="relative pt-24 pb-12 px-6 md:px-10 flex flex-col md:flex-row items-end gap-8 bg-black/40">
        <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-lg bg-white/5 animate-pulse shrink-0" aria-busy="true" />
        
        <div className="flex flex-col gap-4 w-full">
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          <div className="h-16 md:h-24 w-3/4 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-full max-w-2xl bg-white/10 rounded animate-pulse" />
          
          <div className="flex items-center gap-4 mt-2">
            <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-6 md:px-10 mt-8 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 w-full bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
