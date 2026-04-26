"use client";

import React from 'react';

export default function RankingTableSkeleton() {
  return (
    <div 
      className="rounded-[28px] shadow-lg border overflow-hidden relative animate-pulse bg-white/90 dark:bg-[#1d1d1f]/90 border-black/5 dark:border-white/5"
      aria-busy="true"
      aria-label="Carregando ranking..."
    >
      {/* Header Skeleton */}
      <div className="px-8 py-6 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
            <div className="h-4 w-40 bg-gray-100 dark:bg-white/5 rounded-md"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 ml-auto rounded"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50 dark:bg-white/5 border-black/5 dark:border-white/5">
            <tr>
              {['Posição', 'Competidor', 'Nível', 'Pontos'].map((header, i) => (
                <th key={header} className={`px-6 py-4 text-left ${i === 2 ? 'hidden sm:table-cell' : ''} ${i === 3 ? 'text-right' : ''}`}>
                  <div className={`h-3 w-16 bg-gray-200 dark:bg-white/10 rounded ${i === 3 ? 'ml-auto' : ''}`}></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded"></div>
                      <div className="h-3 w-20 bg-gray-100 dark:bg-white/5 rounded"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className="flex justify-center">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Skeleton */}
      <div className="px-8 py-6 border-t border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded"></div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
