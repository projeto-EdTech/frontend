import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    console.error('[API_BLOG_ERROR] BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  try {
    // Lê o token JWT enviado pelo cliente no header Authorization
    const authHeader = request.headers.get('Authorization');
    const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!userToken) {
      console.warn('[API_BLOG] ❌ Requisição sem token JWT.');
      return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
    }

    const backendUrl = `${externalApiUrl}/api/artigos`;
    console.log('[API_BLOG] 📤 Enviando requisição ao backend:');
    console.log('[API_BLOG]    URL:', backendUrl);
    console.log('[API_BLOG]    Token (primeiros 20 chars):', userToken.substring(0, 20) + '...');

    // Faz a requisição ao backend externo repassando o Bearer token
    const apiResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      cache: 'no-store',
    });

    console.log('[API_BLOG] 📥 Resposta recebida do backend:');
    console.log('[API_BLOG]    Status:', apiResponse.status, apiResponse.statusText);

    const contentType = apiResponse.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await apiResponse.json();
      console.log('[API_BLOG]    Content-Type: application/json');
      console.log('[API_BLOG]    Dados recebidos:', JSON.stringify(data).substring(0, 300) + (JSON.stringify(data).length > 300 ? '...' : ''));
    } else {
      const textData = await apiResponse.text();
      console.warn('[API_BLOG] ⚠️  Resposta não-JSON do backend:', textData);
      data = { message: textData || 'O servidor de destino não enviou uma resposta legível.' };
    }

    if (apiResponse.ok) {
      console.log('[API_BLOG] ✅ Sucesso! Formatando e retornando dados ao frontend.');

      // Mapeia os dados do backend (português) para o contrato do frontend (inglês)
      const formattedData = Array.isArray(data) ? data.map((post: any) => ({
        id: post.id,
        slug: post.slug || post.id, // Fallback para ID se não houver slug
        title: post.titulo || 'Sem título',
        publishedAt: post.dataPublicacao || new Date().toISOString(),
        excerpt: post.resumo || '',
        category: post.categoria || 'Geral',
        stats: {
          readingTime: post.tempoLeitura || 5,
          views: post.visualizacoes || 0,
          likes: post.curtidas || 0,
        }
      })) : [];

      return NextResponse.json(formattedData, { status: apiResponse.status });
    } else {
      console.error('[API_BLOG] ❌ Erro retornado pelo backend. Status:', apiResponse.status, '| Mensagem:', data.message);
      return NextResponse.json(
        { error: data.message || 'Ocorreu um erro no servidor de destino.' },
        { status: apiResponse.status }
      );
    }

  } catch (error) {
    console.error('[API_BLOG_ERROR] Erro de comunicação com o back-end:', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}
