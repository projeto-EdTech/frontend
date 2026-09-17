import { NextResponse } from 'next/server';
import { decodeJWT } from '@/app/service/jwtDecoder';
import { readUserToken } from '@/app/service/sessionToken';

// ============================================================
// GET — Busca os dados dos flash cards do backend externo
// ============================================================
export async function GET(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    console.error('[API_FLASHCARDS_ERROR] BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  // Header ou cookie `user_data` — ver `src/app/service/sessionToken.ts`.
  const userToken = readUserToken(request);

  if (!userToken) {
    console.warn('[API_FLASHCARDS] ❌ Requisição GET sem token JWT.');
    return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
  }

  // Decodifica o token para pegar o UserID
  const decodedToken = decodeJWT(userToken);
  const userId = decodedToken?.id;

  if (!userId) {
    console.error('[API_FLASHCARDS] ❌ Não foi possível extrair o UserID do token.');
    return NextResponse.json({ error: 'Erro ao processar identificação do usuário.' }, { status: 400 });
  }

  // Adiciona o userId como query parameter conforme a imagem
  const backendUrl = `${externalApiUrl}/flashcards/recomendacao?userId=${userId}`;

  console.log('[API_FLASHCARDS] 📤 GET — Enviando requisição ao backend:');
  console.log('[API_FLASHCARDS]    URL:', backendUrl);

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