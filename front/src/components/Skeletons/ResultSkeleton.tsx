import React from 'react';

export default function ResultSkeleton() {
  return (
    <div className="space-y-5 animate-pulse w-full">
      <div className="bg-white/70 border-gray-200/40 p-5 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="space-y-2.5 flex-1">
            <div className="h-5 bg-gray-200 rounded-lg w-44"></div>
            <div className="h-3.5 bg-gray-200 rounded w-28"></div>
          </div>
          <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
            <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto"></div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5 w-full">
        <div className="bg-white/70 border-gray-200/40 p-5 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div className="space-y-2.5 flex-1">
              <div className="h-5 bg-gray-200 rounded-lg w-44"></div>
              <div className="h-3.5 bg-gray-200 rounded w-28"></div>
            </div>
            <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
              <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto"></div>
          </div>
        </div>
        <div className="bg-white/70 border-gray-200/40 p-5 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div className="space-y-2.5 flex-1">
              <div className="h-5 bg-gray-200 rounded-lg w-44"></div>
              <div className="h-3.5 bg-gray-200 rounded w-28"></div>
            </div>
            <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
              <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
