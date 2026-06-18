import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    console.error('[API_USER_PROFILE_ERROR] BACKEND_API_URL não está configurado.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  try {
    // 1. Obtém o token JWT da requisição (Authorization Header)
    const authHeader = req.headers.get('Authorization');
    const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!userToken) {
      console.warn('[API_USER_PROFILE] ❌ Requisição sem token JWT.');
      return NextResponse.json({ error: 'Não autorizado: Token não fornecido.' }, { status: 401 });
    }

    // 2. Obtém os dados do corpo da requisição
    const { targetExam, targetCourse, institution } = await req.json();

    // 3. Monta o payload de envio para o backend
    // Enviamos tanto em snake_case quanto em camelCase para garantir a compatibilidade com o backend
    const payload = {
      prova_alvo: targetExam,
      curso_alvo: targetCourse,
      instituicao: institution,
      targetExam,
      targetCourse,
      institution
    };

    console.log('[API_USER_PROFILE] 📤 Enviando atualização de perfil ao backend:', payload);

    // 4. Encaminha a requisição para o backend externo
    const response = await fetch(`${backendUrl}/user/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    let responseData;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      console.error('[API_USER_PROFILE] ❌ Erro retornado pelo backend. Status:', response.status, responseData);
      return NextResponse.json(
        { error: typeof responseData === 'string' ? responseData : responseData?.message || 'Erro ao salvar perfil no backend.' },
        { status: response.status }
      );
    }

    console.log('[API_USER_PROFILE] ✅ Perfil atualizado no backend com sucesso!');
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('[API_USER_PROFILE_ERROR] Falha de comunicação com o backend:', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor do backend.' }, { status: 503 });
  }
}
