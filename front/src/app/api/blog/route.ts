import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/post';

export async function GET() {
  try {
    // Busca TODOS os posts
    const posts = getAllPosts();

    // Retorna a lista de posts
    return NextResponse.json(posts);

  } catch (error) {
    // Bloco catch para erros inesperados
    console.error(`Erro ao buscar todos os posts:`, error);
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}