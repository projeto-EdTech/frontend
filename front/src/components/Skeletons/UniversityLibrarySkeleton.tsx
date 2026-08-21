import React from 'react';

export function UniversityLibrarySkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      {/* Background decorativo minimalista */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-purple-400/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-10 right-1/3 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header e Search bar Skeleton */}
        <div className="mb-12 text-center">
          <div className="h-12 w-64 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-gray-200 rounded-xl mx-auto animate-pulse"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton (Filtros) */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-200 space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-8 w-full bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Grid Principal Skeleton */}
          <div className="flex-1 space-y-8">
            {/* Header do Grid */}
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-full animate-pulse hidden md:block"></div>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 flex flex-col items-center text-center h-[240px] space-y-4 animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl"></div>
                  <div className="h-5 w-4/5 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-100 rounded-md"></div>
                  <div className="flex gap-2 justify-center">
                    <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                    <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
