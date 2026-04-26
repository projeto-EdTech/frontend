import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProfileStatsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl flex-1 animate-pulse pt-24">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
             {/* Titulo */}
             <div className="mb-6">
                <div className="h-10 w-48 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-5 w-72 bg-gray-200 rounded"></div>
             </div>

             {/* Nav */}
             <div className="h-12 w-full max-w-3xl bg-gray-200 rounded-xl mb-8"></div>

             {/* General Stats - Cards Area */}
             <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
                 <div className="h-32 w-full bg-gray-200 rounded-2xl"></div>
                 <div className="h-32 w-full bg-gray-200 rounded-2xl"></div>
                 <div className="h-32 w-full bg-gray-200 rounded-2xl"></div>
                 <div className="h-32 w-full bg-gray-200 rounded-2xl"></div>
             </div>

             {/* Graph & Activities */}
             <div className="grid gap-6 md:grid-cols-2 mt-8">
                 <div className="h-96 w-full bg-gray-200 rounded-2xl"></div>
                 <div className="h-96 w-full bg-gray-200 rounded-2xl"></div>
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
