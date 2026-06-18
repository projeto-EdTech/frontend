import React from 'react';

export default function UniversitiesCountSkeleton() {
  return (
    <div className="flex items-center gap-2 force-themed-card backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
      <div className="w-6 h-6 bg-gray-200 animate-pulse rounded-full flex items-center justify-center"></div>
      <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
    </div>
  );
}
