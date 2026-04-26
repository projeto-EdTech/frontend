"use client";

import React from 'react';

export default function PricingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto py-12 px-4 animate-pulse" aria-busy="true" aria-label="Carregando planos...">
      {Array.from({ length: 2 }).map((_, i) => (
        <div 
          key={i}
          className="relative rounded-3xl p-8 flex flex-col bg-white dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-white/5 shadow-md overflow-hidden"
        >
          {/* Header Skeleton */}
          <div className="text-center mb-6 space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-white/10 mx-auto rounded-lg"></div>
            <div className="h-4 w-1/2 bg-gray-100 dark:bg-white/5 mx-auto rounded-md"></div>
            
            {/* Price Skeleton */}
            <div className="flex items-baseline justify-center gap-1 mt-6">
              <div className="h-12 w-24 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
              <div className="h-6 w-12 bg-gray-100 dark:bg-white/5 rounded-md"></div>
            </div>
            <div className="h-3 w-40 bg-gray-100 dark:bg-white/5 mx-auto rounded"></div>
          </div>

          {/* Benefits Skeleton */}
          <div className="space-y-4 mb-8 flex-grow">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-white/10 flex-shrink-0"></div>
                <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded"></div>
              </div>
            ))}
          </div>

          {/* Button Skeleton */}
          <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
}
export { PricingSkeleton };
