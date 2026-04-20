import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <Header />
      <main className="flex-1 relative overflow-hidden bg-white py-20 pt-24 animate-pulse">
        {/* Fake Banner */}
        <div className="container mx-auto px-4 md:px-6 mb-12">
            <div className="h-96 w-full bg-gray-200 rounded-3xl"></div>
        </div>

        {/* Fake Content & Sidebar */}
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
             <div className="flex-1">
                 <div className="h-12 w-[80%] bg-gray-200 rounded-lg mb-6"></div>
                 <div className="flex gap-4 mb-10">
                     <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                     <div className="flex flex-col gap-2 justify-center">
                         <div className="h-4 w-32 bg-gray-200 rounded"></div>
                         <div className="h-3 w-24 bg-gray-200 rounded"></div>
                     </div>
                 </div>

                 {/* Paragraphs */}
                 <div className="space-y-4">
                     <div className="h-4 w-full bg-gray-200 rounded"></div>
                     <div className="h-4 w-full bg-gray-200 rounded"></div>
                     <div className="h-4 w-[90%] bg-gray-200 rounded"></div>
                     <div className="h-4 w-full bg-gray-200 rounded"></div>
                     <div className="h-4 w-[85%] bg-gray-200 rounded"></div>
                 </div>
                 <br />
                 <div className="space-y-4">
                     <div className="h-4 w-full bg-gray-200 rounded"></div>
                     <div className="h-4 w-full bg-gray-200 rounded"></div>
                     <div className="h-4 w-[75%] bg-gray-200 rounded"></div>
                 </div>
             </div>

             {/* Sidebar */}
             <div className="w-full lg:w-96 space-y-8">
                 <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6"></div>
                 <div className="h-32 w-full bg-gray-200 rounded-2xl"></div>
                 <div className="h-32 w-full bg-gray-200 rounded-2xl"></div>
                 <div className="h-32 w-full bg-gray-200 rounded-2xl"></div>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
