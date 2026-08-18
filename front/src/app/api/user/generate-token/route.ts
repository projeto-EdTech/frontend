import { NextResponse } from 'next/server';
import { generateDiscordToken } from '@/app/service/discordToken.service';

// CACHE STRATEGY: no-store — token OTP single-use/sensível

// Extrai o ID do usuário a partir do token JWT (mesmo padrão de /api/planner e /api/user/stats).
function extractUserId(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload.id ?? payload.sub ?? payload.email ?? null;
  } catch {
    return null;
  }
}

/**
 * @api {post} /api/users/generate-token
 * @description Proxy fino que solicita ao BFF um token OTP (VEST-XXXXX) para vincular
 *              a conta Discord. Envia o `userId` extraído do JWT da sessão.
 *              Body de resposta: { token }.
 */
export async function POST(request: Request) {
  try {
    // 1. Obter o token JWT (Header Authorization ou cookie user_data).
    const authHeader = request.headers.get('Authorization');
    let userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!userToken) {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      userToken = cookieStore.get('user_data')?.value || null;
    }

    if (!userToken) {
      return NextResponse.json({ error: 'Não autorizado: token não fornecido.' }, { status: 401 });
    }

    // 2. Extrair o ID do usuário.
    const userId = extractUserId(userToken);
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado: ID do usuário inválido no token.' },
        { status: 401 },
      );
    }

    // 3. Delegar ao service (chamada ao BFF).
    const { token } = await generateDiscordToken(userId, userToken);
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    // Nunca expor stack/IP/detalhe interno ao cliente.
    console.error('[POST /api/users/generate-token] Erro ao gerar token:', error);
    return NextResponse.json(
      { error: 'Não foi possível gerar o token no momento. Tente novamente.' },
      { status: 500 },
    );
  }
}
