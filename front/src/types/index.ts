export type PostPreview = {
  id?: string;
  slug: string;
  title: string;
  publishedAt: string;
  readingTime?: number;
  popularity?: number;
  excerpt: string;
  category: string;
  stats: {
    readingTime?: number;
    views: number;
    likes: number;
  };
};

/**
 * Post completo — usado na página individual do artigo (/app/blog/[slug]/page.tsx).
 * Inclui o `content` em Markdown para renderização do artigo.
 */
export type Post = PostPreview & {
  content: string;
};