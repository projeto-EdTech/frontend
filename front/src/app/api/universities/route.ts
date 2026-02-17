import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    return NextResponse.json({ error: 'A URL da API externa não está configurada no servidor.' }, { status: 500 });
  }

  try {
    const apiResponse = await fetch(`${externalApiUrl}/api/sigla`, {
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