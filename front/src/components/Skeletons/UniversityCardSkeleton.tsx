"use client";

import React from 'react';

export default function UniversityCardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse" aria-busy="true" aria-label="Carregando universidades...">
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={i}
          className="bg-white dark:bg-[#1d1d1f] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center text-center h-full relative overflow-hidden min-h-[220px]"
        >
          {/* Indicator Skeleton */}
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-200 dark:bg-white/10"></div>
          
          {/* Logo Container Skeleton */}
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-md"></div>
          </div>
          
          {/* Content Skeleton */}
          <div className="flex-1 flex flex-col justify-between space-y-3 w-full">
            <div className="space-y-2 w-full">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-white/10 mx-auto rounded"></div>
              <div className="h-3 w-full bg-gray-100 dark:bg-white/5 mx-auto rounded"></div>
              <div className="h-3 w-5/6 bg-gray-100 dark:bg-white/5 mx-auto rounded"></div>
              
              <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                <div className="h-6 w-16 bg-gray-100 dark:bg-white/5 rounded-full"></div>
                <div className="h-6 w-12 bg-gray-100 dark:bg-white/5 rounded-full"></div>
              </div>
            </div>
            
            {/* Action Indicator Skeleton */}
            <div className="h-4 w-24 bg-gray-100 dark:bg-white/5 mx-auto rounded mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
