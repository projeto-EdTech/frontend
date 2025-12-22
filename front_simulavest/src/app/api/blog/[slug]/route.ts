import { NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/post';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // 1. Busca o post do seu arquivo 'post.ts'.
    //    Este 'post' já deve conter o objeto 'stats'.
  const post = getPostBySlug(slug); 

    // 2. Se o 'post.ts' não encontrar o slug, retorna 404.
    if (!post) {
      return NextResponse.json({ message: "Post não encontrado." }, { status: 404 });
    }

    // 3. Garante que 'stats' exista para evitar erros no cliente
    const safePost = {
      ...post,
      stats: post.stats ?? { views: 0, likes: 0 },
    };

    // 4. Retorna o objeto do post com 'stats' seguro
    return NextResponse.json(safePost);

  } catch (error) {
    // Bloco de segurança para qualquer outro erro
    console.error(`Erro ao buscar o post ${params.slug}:`, error);
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}