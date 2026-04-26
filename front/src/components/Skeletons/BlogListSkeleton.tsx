import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogListSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <Header />
      <main className="flex-1 relative overflow-hidden animate-pulse pt-24">
        {/* Fake Hero/Header Banner */}
        <div className="relative py-20 md:py-32 bg-white flex flex-col items-center justify-center">
            <div className="h-10 w-64 bg-gray-200 rounded-full mb-6"></div>
            <div className="h-16 w-[60%] bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-6 w-[40%] bg-gray-200 rounded-lg mb-10"></div>
            <div className="flex gap-4">
                <div className="h-20 w-32 bg-gray-200 rounded-2xl"></div>
                <div className="h-20 w-32 bg-gray-200 rounded-2xl"></div>
                <div className="h-20 w-32 bg-gray-200 rounded-2xl"></div>
            </div>
        </div>

        {/* Fake Filters */}
        <div className="bg-white py-8 border-y border-gray-200">
           <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="h-12 w-full md:w-96 bg-gray-200 rounded-2xl"></div>
                <div className="h-10 w-64 bg-gray-200 rounded-full"></div>
           </div>
        </div>

        {/* Fake Articles */}
        <div className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="flex justify-center mb-8">
              <div className="h-12 w-64 bg-gray-200 rounded-2xl"></div>
            </div>
            {/* Featured Article Skeleton */}
            <div className="h-80 w-full bg-gray-200 rounded-3xl mb-16"></div>
            
            {/* Grid Skeleton */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-96 w-full bg-gray-200 rounded-3xl"></div>
              <div className="h-96 w-full bg-gray-200 rounded-3xl"></div>
              <div className="h-96 w-full bg-gray-200 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
