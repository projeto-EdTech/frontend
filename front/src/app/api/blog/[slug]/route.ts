import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    console.error('[API_BLOG_SLUG_ERROR] BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  try {
    // Aguarda a resolução dos parâmetros (Next.js 15)
    const params = await props.params;
    const slug = params.slug;

    console.log('[API_BLOG_SLUG] 📝 Slug recebido:', slug);

    // Lê o token JWT enviado pelo cliente no header Authorization
    const authHeader = request.headers.get('Authorization');
    const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!userToken) {
      console.warn('[API_BLOG_SLUG] ❌ Requisição sem token JWT para slug:', slug);
      return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
    }

    const backendUrl = `${externalApiUrl}/blog/${slug}`;
    console.log('[API_BLOG_SLUG] 📤 Enviando requisição ao backend:');
    console.log('[API_BLOG_SLUG]    URL:', backendUrl);
    console.log('[API_BLOG_SLUG]    Token (primeiros 20 chars):', userToken.substring(0, 20) + '...');

    // Faz a requisição ao backend externo repassando o Bearer token
    const apiResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      cache: 'no-store',
    });

    console.log('[API_BLOG_SLUG] 📥 Resposta recebida do backend:');
    console.log('[API_BLOG_SLUG]    Status:', apiResponse.status, apiResponse.statusText);

    const contentType = apiResponse.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await apiResponse.json();
      console.log('[API_BLOG_SLUG]    Content-Type: application/json');
      console.log('[API_BLOG_SLUG]    Dados recebidos:', JSON.stringify(data).substring(0, 300) + (JSON.stringify(data).length > 300 ? '...' : ''));
    } else {
      const textData = await apiResponse.text();
      console.warn('[API_BLOG_SLUG] ⚠️  Resposta não-JSON do backend:', textData);
      data = { message: textData || 'O servidor de destino não enviou uma resposta legível.' };
    }

    if (apiResponse.ok) {
      console.log('[API_BLOG_SLUG] ✅ Sucesso! Retornando dados ao frontend.');
      return NextResponse.json(data, { status: apiResponse.status });
    } else {
      console.error('[API_BLOG_SLUG] ❌ Erro retornado pelo backend. Status:', apiResponse.status, '| Mensagem:', data.message);
      return NextResponse.json(
        { error: data.message || 'Ocorreu um erro no servidor de destino.' },
        { status: apiResponse.status }
      );
    }

  } catch (error) {
    console.error('[API_BLOG_SLUG_ERROR] Erro de comunicação com o back-end:', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}