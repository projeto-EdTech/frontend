import { NextResponse } from 'next/server';
import { universities } from '@/lib/dataUniversity';

export async function GET() {
  // Retorna a lista de universidades em formato JSON.
  return NextResponse.json(universities);
}

// Código para o futuro, caso queira buscar dados de uma API do Backend
/* export async function GET(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    return NextResponse.json({ error: 'A URL da API externa não está configurada no servidor.' }, { status: 500 });
  }

  try {
    // Objeto de configuração ao fetch
    const apiResponse = await fetch(`${externalApiUrl}/api/instituicao`, {
      next: {
        // Busca os dados do backend a cada 3600 segundos (1 hora) e guarda no cache do browser
        // Isso é útil para evitar chamadas excessivas à API externa
        revalidate: 3600, 
      },
    });

    if (!apiResponse.ok) {
      throw new Error(`Falha ao buscar dados do backend: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API_UNIVERSITIES_ERROR]', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno ao buscar os dados.' }, { status: 500 });
  }
} */