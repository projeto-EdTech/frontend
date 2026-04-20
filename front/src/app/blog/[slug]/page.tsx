import React, { Suspense } from "react";
import BlogPostSkeleton from "@/components/Skeletons/BlogPostSkeleton";
import BlogPostDataServer from "@/components/blog/BlogPostDataServer";

export const revalidate = 60;

// O Componente da Página agora é um Server Component
export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const slug = params.slug;
  const articleId = typeof searchParams.id === 'string' ? searchParams.id : undefined;

  return (
    <Suspense fallback={<BlogPostSkeleton />}>
      <BlogPostDataServer slug={slug} articleId={articleId} />
    </Suspense>
  );
}
