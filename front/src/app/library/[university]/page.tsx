import React, { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LibraryUniversityDataServer from "@/components/Library/LibraryUniversityDataServer";
import LibraryConfigSkeleton from "@/components/Skeletons/LibraryConfigSkeleton";

export const revalidate = 60;

export default async function LibraryUniversityPage(props: { params: Promise<{ university: string }> }) {
  const params = await props.params;
  const slug = params.university;

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col relative overflow-hidden">
      {/* macOS-style subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-white"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/3 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/3 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      {/* Header component */}
      <Header />

      {/* Main content */}
      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-6 py-10">
          <Suspense fallback={<LibraryConfigSkeleton />}>
            <LibraryUniversityDataServer slug={slug} />
          </Suspense>
        </div>
      </main>

      {/* Footer component */}
      <Footer />
    </div>
  );
}