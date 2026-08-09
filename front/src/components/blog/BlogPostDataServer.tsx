import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import BlogPostClient from "@/components/blog/BlogPostClient";
import { Post, PostPreview } from "@/types";

export default async function BlogPostDataServer({ slug, articleId }: { slug: string, articleId?: string }) {
  try {
    const externalApiUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
    const session = await getServerSession(authOptions);
    const userToken = session?.accessToken || "";

    const idParam = articleId ? `?id=${articleId}` : "";
    const postUrl = `${externalApiUrl}/api/artigos/${slug}${idParam}`;
    const allPostsUrl = `${externalApiUrl}/api/artigos`;

    const headers = { 
        ...(userToken ? { 'Authorization': `Bearer ${userToken}` } : {}) 
    };

    const [postRes, relatedRes] = await Promise.all([
      fetch(postUrl, { method: "GET", headers, next: { revalidate: 60 } }),
      fetch(allPostsUrl, { method: "GET", headers, next: { revalidate: 60 } })
    ]);

    let post: Post | null = null;
    if (postRes.ok) {
        // Formata os dados vindo do backend para coincidir com a interface Post
        const backendPost = await postRes.json();
        post = {
            id: backendPost.id,
            slug: backendPost.slug || backendPost.id,
            title: backendPost.titulo || "Sem título",
            publishedAt: backendPost.dataPublicacao || new Date().toISOString(),
            content: backendPost.conteudo || "",
            coverImage: backendPost.coverImage || "/placeholder-blog.jpg",
            author: {
               name: backendPost.autor?.nome || backendPost.autor || "Vestibuline",
               avatar: backendPost.autor?.avatar || "/Avatar/Camaleão_1.png",
               role: "Redator",
            },
            category: backendPost.categoria || "Geral",
            stats: {
                readingTime: backendPost.tempoLeitura || 5,
                views: backendPost.visualizacoes || 0,
                likes: backendPost.curtidas || 0,
            },
            tags: backendPost.tags || []
        } as any as Post;
    } else if (postRes.status === 404) {
      post = null; // Cliente lida disparando notFound
    }

    let relatedPosts: PostPreview[] = [];
    if (relatedRes.ok) {
        const data = await relatedRes.json();
        const formattedData = Array.isArray(data) ? data.map((p: any) => ({
            id: p.id,
            slug: p.slug || p.id, 
            title: p.titulo || "Sem título",
            publishedAt: p.dataPublicacao || new Date().toISOString(),
            excerpt: p.resumo || "",
            category: p.categoria || "Geral",
            stats: {
                readingTime: p.tempoLeitura || 5,
                views: p.visualizacoes || 0,
                likes: p.curtidas || 0,
            }
        })) : [];
        
        relatedPosts = formattedData
           .filter((p: any) => p.slug !== slug)
           .slice(0, 3);
    }

    return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
  } catch (error) {
    console.error("Erro no fetch BlogPostDataServer:", error);
    return <BlogPostClient post={null} relatedPosts={[]} />;
  }
}
