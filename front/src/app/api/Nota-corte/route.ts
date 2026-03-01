import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    console.error('[API_NOTA_CORTE_ERROR] BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  try {
    // 1. Lê o token JWT enviado pelo cliente no header Authorization
    const authHeader = request.headers.get('Authorization');
    const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!userToken) {
      console.warn('[API_NOTA_CORTE] ❌ Requisição sem token JWT.');
      return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
    }

    // 2. Lê e valida o body enviado pelo frontend
    const body = await request.json();
    const { userScore, targetCourse, targetInstitution } = body;

    if (userScore === undefined || targetCourse === undefined) {
      console.warn('[API_NOTA_CORTE] ⚠️  Parâmetros obrigatórios ausentes:', { userScore, targetCourse });
      return NextResponse.json(
        { error: 'Parâmetros "userScore" e "targetCourse" são obrigatórios.' },
        { status: 400 }
      );
    }

    const backendUrl = `${externalApiUrl}/nota-de-corte`;
    const requestPayload = { userScore, targetCourse, targetInstitution };

    console.log('[API_NOTA_CORTE] 📤 Enviando requisição ao backend:');
    console.log('[API_NOTA_CORTE]    URL:', backendUrl);
    console.log('[API_NOTA_CORTE]    Token (primeiros 20 chars):', userToken.substring(0, 20) + '...');
    console.log('[API_NOTA_CORTE]    Payload:', JSON.stringify(requestPayload));

    // 3. Faz a requisição ao backend externo repassando o token e o body
    const apiResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(requestPayload),
      cache: 'no-store',
    });

    console.log('[API_NOTA_CORTE] 📥 Resposta recebida do backend:');
    console.log('[API_NOTA_CORTE]    Status:', apiResponse.status, apiResponse.statusText);

    const contentType = apiResponse.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await apiResponse.json();
      console.log('[API_NOTA_CORTE]    Content-Type: application/json');
      console.log('[API_NOTA_CORTE]    Dados recebidos:', JSON.stringify(data).substring(0, 300) + (JSON.stringify(data).length > 300 ? '...' : ''));
    } else {
      const textData = await apiResponse.text();
      console.warn('[API_NOTA_CORTE] ⚠️  Resposta não-JSON do backend:', textData);
      data = { message: textData || 'O servidor de destino não enviou uma resposta legível.' };
    }

    if (apiResponse.ok) {
      console.log('[API_NOTA_CORTE] ✅ Sucesso! Retornando dados ao frontend.');
      return NextResponse.json(data, { status: apiResponse.status });
    } else {
      console.error('[API_NOTA_CORTE] ❌ Erro retornado pelo backend. Status:', apiResponse.status, '| Mensagem:', data.message);
      return NextResponse.json(
        { error: data.message || 'Ocorreu um erro no servidor de destino.' },
        { status: apiResponse.status }
      );
    }

  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      console.error('[API_NOTA_CORTE_ERROR] Body da requisição mal formatado.');
      return NextResponse.json({ error: 'Corpo da requisição mal formatado.' }, { status: 400 });
    }
    console.error('[API_NOTA_CORTE_ERROR] Erro de comunicação com o back-end:', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}
