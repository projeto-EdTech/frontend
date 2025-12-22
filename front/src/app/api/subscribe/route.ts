import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const backendApiUrl = process.env.BACKEND_API_URL;

export async function POST(req: Request) {
  if (!backendApiUrl) {
    console.error('BACKEND_API_URL não está configurado nas variáveis de ambiente.');
    return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  // 1. Obter a sessão do usuário no lado do servidor para segurança
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Não autorizado. Usuário precisa estar logado.' }, { status: 401 });
  }

  try {
    // 2. Obter apenas o campo 'newsletter' do corpo da requisição
    const body = await req.json();
    const { newsletter } = body;

    // Validação do dado recebido
    if (typeof newsletter !== 'boolean') {
      return NextResponse.json({ error: 'Dados inválidos. O status do newsletter é obrigatório.' }, { status: 400 });
    }

    // 3. Usar os dados da sessão e-mail e o 'newsletter' do corpo
    const response = await fetch(`${backendApiUrl}/CAMINHO_BACK_END`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        newsletter: newsletter,
      }),
    });

    const data = await response.json();

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