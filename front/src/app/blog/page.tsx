import React, { Suspense } from "react";
import BlogListSkeleton from "@/components/Skeletons/BlogListSkeleton";
import BlogDataServer from "@/components/blog/BlogDataServer";

// Depende da sessão do usuário (cookies), não pode ser pré-renderizada no build.
// O cache de 60s continua no fetch dentro de BlogDataServer.
export const dynamic = "force-dynamic";

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogListSkeleton />}>
      <BlogDataServer />
    </Suspense>
  );
}
