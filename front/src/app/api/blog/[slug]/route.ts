import { NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/post';

export async function GET(
  request: Request,
  // 1. Defina a tipagem correta para Next.js 15 (Promise)
  props: { params: Promise<{ slug: string }> }
) {
  try {
    // 2. Aguarde a resolução dos parâmetros
    const params = await props.params;
    const slug = params.slug;

    // Busca o post
    const post = getPostBySlug(slug); 

    if (!post) {
      return NextResponse.json({ message: "Post não encontrado." }, { status: 404 });
    }

    const safePost = {
      ...post,
      stats: post.stats ?? { views: 0, likes: 0 },
    };

    return NextResponse.json(safePost);

  } catch (error) {
    console.error(`Erro ao buscar o post:`, error); // Remova params.slug do log se ele falhar antes de ser definido
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}