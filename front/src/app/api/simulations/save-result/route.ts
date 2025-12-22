import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL;
  const apiKey = process.env.BACKEND_API_KEY;

  if (!backendUrl || !apiKey) {
    console.error("Variáveis de ambiente do backend não configuradas.");
    return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 });
  }

  try {
    const resultDataFromFrontend = await request.json();
    const backendResponse = await fetch(`${backendUrl}/CAMINHO DO BACKEND`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, 
      },
      body: JSON.stringify(resultDataFromFrontend),
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();
      console.error("Erro do backend externo:", errorBody);
      throw new Error(`Erro na comunicação com o backend: status ${backendResponse.status}`);
    }

    const dataFromBackend = await backendResponse.json();

    return NextResponse.json(dataFromBackend, { status: backendResponse.status });

  } catch (error) {
    console.error('[API_PROXY_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao processar a solicitação.' }, { status: 500 });
  }
}