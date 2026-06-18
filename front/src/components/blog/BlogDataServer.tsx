import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import BlogClient from "./BlogClient";
import { PostPreview } from "@/types";

async function fetchBlogPosts(): Promise<PostPreview[]> {
  try {
    const externalApiUrl = process.env.BACKEND_API_URL;
    const session = await getServerSession(authOptions);
    const userToken = session?.accessToken || "";

    const backendUrl = `${externalApiUrl}/api/artigos`;
    
    // Configura o fetch para interagir com o BFF em Java diretamente, economizando tempo
    const apiResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        ...(userToken ? { 'Authorization': `Bearer ${userToken}` } : {})
      },
      next: { revalidate: 60 },
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      
      const formattedData = Array.isArray(data) ? data.map((post: any) => ({
        id: post.id,
        slug: post.slug || post.id, 
        title: post.titulo || "Sem título",
        publishedAt: post.dataPublicacao || new Date().toISOString(),
        excerpt: post.resumo || "",
        category: post.categoria || "Geral",
        stats: {
          readingTime: post.tempoLeitura || 5,
          views: post.visualizacoes || 0,
          likes: post.curtidas || 0,
        }
      })) : [];
      
      return formattedData;
    }
    
    return [];
  } catch (error) {
    console.error("Erro no fetchBlogPosts do servidor:", error);
    return [];
  }
}

export default async function BlogDataServer() {
  const posts = await fetchBlogPosts();
  return <BlogClient initialPosts={posts} />;
}
