export type Post = {
  slug: string;
  title: string;
  publishedAt: string;
  readingTime: number;
  excerpt: string;
  content: string;
  category: string;
  popularity: number;
  stats: {
    views: number;
    likes: number;
  };
};