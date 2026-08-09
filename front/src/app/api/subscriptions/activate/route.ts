import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { readUserToken } from '@/app/service/sessionToken';
import { callBff, BFF_PAYMENT_PATHS } from '@/app/service/bffPayments';

/**
 * Ativação de tier — proxy fino para o BFF Java.
 *
 * Passos 6 a 10 de `docs/Pauta_para_reuniao.md` §2. **O navegador manda só um identificador**:
 * quem consulta a gateway (7), confere a titularidade contra a sessão (8) e ativa o tier no
 * banco (9) é o Java. Nenhuma dessas decisões acontece aqui.
 *
 * O que sobra para o Next é mecânica de cookie: quando o Java devolve um JWT novo, ele vira o
 * cookie `user_data` e o tier passa a valer sem o aluno relogar (10).
 *
 * Não substitui os webhooks, que agora chegam direto ao Java: eles reconciliam boleto, renovação
 * mensal e quem fechou o navegador. Esta rota é o caminho síncrono, disparado pela tela de
 * pagamento concluído e pelo polling do PIX.
 *
 * CACHE STRATEGY: no-store — dados financeiros, sem cache
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 30 dias, iguais aos de `api/sync-user`, para o cookie não expirar antes da sessão. */
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export async function POST(req: Request) {
    // `getToken` tipa para NextRequest; o cast segue o padrão de `api/sync-user/route.ts`.
    const sessionToken = await getToken({
        req: req as unknown as NextRequest,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!sessionToken) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // JWT do backend: é ele que autentica no BFF e identifica de quem é a sessão.
    const userToken = readUserToken(req);

    if (!userToken) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (body === null) {
        return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
    }

    const { gateway, paymentId } = body as Record<string, unknown>;

    const { status, data } = await callBff(BFF_PAYMENT_PATHS.activate, {
        method: 'POST',
        body: { gateway, paymentId },
        userToken,
    });

    const token = (data as { token?: unknown } | null)?.token;

    // O JWT novo **não volta ao navegador**: sai do corpo e vai só para o cookie HttpOnly.
    // Se voltasse, o cliente teria o token na mão e o guardaria no localStorage — a cópia
    // exposta que qualquer script na página lê.
    const corpo =
        data && typeof data === 'object' && !Array.isArray(data)
            ? (() => {
                  const { token: _token, ...resto } = data as Record<string, unknown>;
                  return resto;
              })()
            : data;

    const response = NextResponse.json(corpo, { status });

    // Só num 200 existe tier novo para carregar. Num 202 o pagamento ainda está pendente.
    if (status === 200 && typeof token === 'string' && token) {
        // Mesmos flags de `api/sync-user`: o tier novo passa a valer sem relogar.
        response.cookies.set('user_data', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE,
        });
    }

    return response;
}
