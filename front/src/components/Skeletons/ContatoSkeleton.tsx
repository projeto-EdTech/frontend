export function ContatoSkeleton() {
  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16"
      aria-busy="true"
      aria-label="Buscando seus dados..."
    >
      {/* Sidebar skeleton — oculto no mobile */}
      <div className="xl:col-span-1 space-y-6 hidden md:block">
        <div className="rounded-[28px] p-8 border border-black/5 dark:border-white/5 bg-white/90 dark:bg-[#1d1d1f]/90 animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[12px] bg-gray-200 dark:bg-white/10" />
            <div className="h-6 bg-gray-200 dark:bg-white/10 rounded-md w-32" />
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-[12px]">
              <div className="w-12 h-12 rounded-[12px] bg-gray-200 dark:bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-24" />
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-40" />
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[28px] p-6 border border-black/5 dark:border-white/5 bg-white/90 dark:bg-[#1d1d1f]/90 animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-40" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-white/10 rounded" />
          ))}
        </div>
      </div>

      {/* Form skeleton */}
      <div className="xl:col-span-2">
        <div className="rounded-[28px] p-10 md:p-12 border border-black/5 dark:border-white/5 bg-white/90 dark:bg-[#1d1d1f]/90 animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[12px] bg-gray-200 dark:bg-white/10" />
            <div className="h-7 bg-gray-200 dark:bg-white/10 rounded w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24" />
                <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-[12px]" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16" />
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-[12px]" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20" />
            <div className="h-36 bg-gray-200 dark:bg-white/10 rounded-[12px]" />
          </div>
          <div className="h-14 bg-gray-200 dark:bg-white/10 rounded-[12px]" />
        </div>
      </div>
    </div>
  )
}
