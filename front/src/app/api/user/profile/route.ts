import { NextResponse } from 'next/server';
import { decodeJWT } from '@/app/service/jwtDecoder';

export async function POST(req: Request) {
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    console.error('[API_USER_PROFILE_ERROR] BACKEND_API_URL não está configurado.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  console.log('\n────────────────────────────────────────────────────────');
  console.log('[API_USER_PROFILE] ➡️  POST /api/user/profile recebido');
  console.log('[API_USER_PROFILE] 🌐 BACKEND_API_URL:', backendUrl);

  try {
    // 1. Obtém o token JWT da requisição (Authorization Header)
    const authHeader = req.headers.get('Authorization');
    const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    console.log('[API_USER_PROFILE] 🔑 Token presente:', !!userToken);

    if (!userToken) {
      console.warn('[API_USER_PROFILE] ❌ Requisição sem token JWT. → 401');
      return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
    }

    // 2. Decodifica o JWT para obter o ID do usuário (path param do backend)
    const decoded = decodeJWT(userToken);
    const usuarioId = decoded?.id || decoded?.sub;
    console.log('[API_USER_PROFILE] 🆔 usuarioId extraído do JWT:', usuarioId);

    if (!usuarioId) {
      console.warn('[API_USER_PROFILE] ❌ Token inválido: ID do usuário não encontrado. → 401');
      return NextResponse.json({ error: 'Não autorizado: Token inválido.' }, { status: 401 });
    }

    // 3. Obtém os dados do corpo da requisição (enviados pelo ProfileClient)
    const { targetExam, targetCourse, institution } = await req.json();
    console.log('[API_USER_PROFILE] 📥 Body recebido do client:', { targetExam, targetCourse, institution });

    // 4. Monta o payload no formato esperado pelo backend (camelCase)
    //    Backend: PATCH /usuarios/{usuarioId}/perfil
    //    Body: { provaAlvo, cursoAlvo, instituicao }
    const payload = {
      provaAlvo: targetExam,
      cursoAlvo: targetCourse,
      instituicao: institution,
    };

    const targetUrl = `${backendUrl}/usuarios/${usuarioId}/perfil`;
    console.log('[API_USER_PROFILE] 📤 PATCH', targetUrl);
    console.log('[API_USER_PROFILE] 📦 Payload enviado ao backend:', JSON.stringify(payload));

    // 5. Encaminha a requisição para o backend externo
    const response = await fetch(targetUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    console.log('[API_USER_PROFILE] 📡 Resposta do backend → status:', response.status, response.statusText, '| content-type:', contentType);
    let responseData;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    console.log('[API_USER_PROFILE] 📨 Corpo da resposta do backend:', responseData);

    if (!response.ok) {
      console.error('[API_USER_PROFILE] ❌ Erro retornado pelo backend. Status:', response.status, responseData);
      console.log('────────────────────────────────────────────────────────\n');
      return NextResponse.json(
        { error: typeof responseData === 'string' ? responseData : responseData?.message || 'Erro ao salvar perfil no backend.' },
        { status: response.status }
      );
    }

    console.log('[API_USER_PROFILE] ✅ Perfil atualizado no backend com sucesso! → 200');
    console.log('────────────────────────────────────────────────────────\n');
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('[API_USER_PROFILE_ERROR] Falha de comunicação com o backend:', error);
    console.log('────────────────────────────────────────────────────────\n');
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor do backend.' }, { status: 503 });
  }
}
