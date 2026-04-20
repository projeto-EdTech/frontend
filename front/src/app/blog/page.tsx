import React, { Suspense } from "react";
import BlogListSkeleton from "@/components/Skeletons/BlogListSkeleton";
import BlogDataServer from "@/components/blog/BlogDataServer";

export const revalidate = 60;

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogListSkeleton />}>
      <BlogDataServer />
    </Suspense>
  );
}
