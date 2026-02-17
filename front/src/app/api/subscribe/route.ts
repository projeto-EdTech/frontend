import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  if (!process.env.BACKEND_API_URL) {
    console.error('BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  // 1. Obter a sessão do usuário no lado do servidor para segurança
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Não autorizado. Usuário precisa estar logado.' }, { status: 401 });
  }

  try {
    // 2. O JSON a ser enviado deve conter apenas o e-mail, conforme solicitado.
    // Usaremos o e-mail da sessão validada no passo anterior.

    // 3. Enviar apenas o e-mail para o back-end
    const response = await fetch(`${process.env.BACKEND_API_URL}/usuarios/newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
      }),
    });

    // Diagnóstico: Verificando o status e o tipo de conteúdo da resposta
    console.log(`[Newsletter] Status do Backend: ${response.status}`);
    const contentType = response.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      console.log('[Newsletter] Resposta JSON do Backend:', data);
    } else {
      const textData = await response.text();
      console.warn('[Newsletter] Backend response:', textData);
      data = { message: textData || 'O servidor de destino não enviou uma resposta legível.' };
    }

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(
        { error: data.message || 'Ocorreu um erro no servidor de destino.' },
        { status: response.status }
      );
    }

  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Corpo da requisição mal formatado.' }, { status: 400 });
    }
    console.error('Erro de comunicação com o back-end:', error);
    return NextResponse.json({ error: 'Não foi possível se conectar ao servidor.' }, { status: 503 });
  }
}