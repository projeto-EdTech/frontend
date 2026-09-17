import { NextResponse } from 'next/server';
import { readUserToken } from '@/app/service/sessionToken';

export async function GET(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    return NextResponse.json({ error: 'A URL da API externa não está configurada no servidor.' }, { status: 500 });
  }

  try {
    // Header ou cookie `user_data`: o cookie é HttpOnly e acompanha sozinho todo fetch
    // same-origin, então o cliente não precisa (nem deve) montar o Bearer a partir do JWT.
    const userToken = readUserToken(request);

    if (!userToken) {
       return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
    }

    const apiResponse = await fetch(`${externalApiUrl}/api/instituicao`, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      next: {
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
}