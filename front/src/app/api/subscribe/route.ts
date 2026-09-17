import { NextResponse } from 'next/server';
import { readUserToken } from '@/app/service/sessionToken';

export async function POST(req: Request) {
  if (!process.env.BACKEND_API_URL) {
    console.error('BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  try {
    // 1. O JWT sai da sessão (header ou cookie `user_data`), nunca do corpo. Um token que o
    // cliente escolhe qual mandar é um token que ele pode trocar pelo de outro aluno.
    const userToken = readUserToken(req);

    if (!userToken) {
      return NextResponse.json({ error: 'Não autorizado: Token do backend não encontrado.' }, { status: 401 });
    }

    const { email } = await req.json();

    // 2. Enviar o e-mail para o back-end com o Bearer token do nosso backend
    const response = await fetch(`${process.env.BACKEND_API_URL}/usuarios/newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        email: email,
      }),
    });

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