import { NextResponse } from 'next/server';

// ============================================================
// GET — Busca os dados dos flash cards do backend externo
// ============================================================
export async function GET(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    console.error('[API_FLASHCARDS_ERROR] BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  const authHeader = request.headers.get('Authorization');
  const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!userToken) {
    console.warn('[API_FLASHCARDS] ❌ Requisição GET sem token JWT.');
    return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
  }

  const backendUrl = `${externalApiUrl}/games/flash-cards`;

  console.log('[API_FLASHCARDS] 📤 GET — Enviando requisição ao backend:');
  console.log('[API_FLASHCARDS]    URL:', backendUrl);
  console.log('[API_FLASHCARDS]    Token (primeiros 20 chars):', userToken.substring(0, 20) + '...');

  try {
    const apiResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      cache: 'no-store',
    });

    console.log('[API_FLASHCARDS] 📥 Resposta recebida do backend:');
    console.log('[API_FLASHCARDS]    Status:', apiResponse.status, apiResponse.statusText);

    const contentType = apiResponse.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await apiResponse.json();
      console.log('[API_FLASHCARDS]    Content-Type: application/json');
      console.log('[API_FLASHCARDS]    Dados recebidos:', JSON.stringify(data).substring(0, 300) + (JSON.stringify(data).length > 300 ? '...' : ''));
    } else {
      const textData = await apiResponse.text();
      console.warn('[API_FLASHCARDS] ⚠️  Resposta não-JSON do backend (GET):', textData);
      data = { message: textData || 'O servidor de destino não enviou uma resposta legível.' };
    }

    if (apiResponse.ok) {
      console.log('[API_FLASHCARDS] ✅ GET Sucesso! Retornando dados ao frontend.');
      return NextResponse.json(data, { status: apiResponse.status });
    } else {
      console.error('[API_FLASHCARDS] ❌ Erro no GET. Status:', apiResponse.status, '| Mensagem:', data.message);
      return NextResponse.json(
        { error: data.message || 'Ocorreu um erro no servidor de destino.' },
        { status: apiResponse.status }
      );
    }

  } catch (error) {
    console.error('[API_FLASHCARDS_ERROR] Erro de comunicação com o back-end (GET):', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}

// ============================================================
// POST — Envia os resultados do jogo para o backend externo
// ============================================================
export async function POST(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    console.error('[API_FLASHCARDS_ERROR] BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  const authHeader = request.headers.get('Authorization');
  const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!userToken) {
    console.warn('[API_FLASHCARDS] ❌ Requisição POST sem token JWT.');
    return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { correctIds } = body;

    const backendUrl = `${externalApiUrl}/games/flash-cards`;
    const requestPayload = { correctIds };

    console.log('[API_FLASHCARDS] 📤 POST — Enviando resultados ao backend:');
    console.log('[API_FLASHCARDS]    URL:', backendUrl);
    console.log('[API_FLASHCARDS]    Token (primeiros 20 chars):', userToken.substring(0, 20) + '...');
    console.log('[API_FLASHCARDS]    Payload:', JSON.stringify(requestPayload));

    const apiResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(requestPayload),
      cache: 'no-store',
    });

    console.log('[API_FLASHCARDS] 📥 Resposta recebida do backend:');
    console.log('[API_FLASHCARDS]    Status:', apiResponse.status, apiResponse.statusText);

    const contentType = apiResponse.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await apiResponse.json();
      console.log('[API_FLASHCARDS]    Content-Type: application/json');
      console.log('[API_FLASHCARDS]    Dados recebidos:', JSON.stringify(data).substring(0, 300) + (JSON.stringify(data).length > 300 ? '...' : ''));
    } else {
      const textData = await apiResponse.text();
      console.warn('[API_FLASHCARDS] ⚠️  Resposta não-JSON do backend (POST):', textData);
      data = { message: textData || 'O servidor de destino não enviou uma resposta legível.' };
    }

    if (apiResponse.ok) {
      console.log('[API_FLASHCARDS] ✅ POST Sucesso! Resultados salvos no backend.');
      return NextResponse.json(data, { status: apiResponse.status });
    } else {
      console.error('[API_FLASHCARDS] ❌ Erro no POST. Status:', apiResponse.status, '| Mensagem:', data.message);
      return NextResponse.json(
        { error: data.message || 'Ocorreu um erro no servidor de destino.' },
        { status: apiResponse.status }
      );
    }

  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      console.error('[API_FLASHCARDS_ERROR] Body da requisição mal formatado.');
      return NextResponse.json({ error: 'Corpo da requisição mal formatado.' }, { status: 400 });
    }
    console.error('[API_FLASHCARDS_ERROR] Erro de comunicação com o back-end (POST):', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}
