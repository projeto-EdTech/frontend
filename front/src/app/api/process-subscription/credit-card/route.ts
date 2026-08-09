import { NextResponse } from 'next/server';
import { readUserToken } from '@/app/service/sessionToken';
import { callBff, sanitizeCheckoutBody, BFF_PAYMENT_PATHS } from '@/app/service/bffPayments';

/**
 * Cartão de crédito — proxy fino para o BFF Java.
 *
 * Passos 1 a 3 do fluxo de `docs/Pauta_para_reuniao.md` §2: o navegador manda `planId`, o Java
 * resolve o preço na fonte de verdade, cria a cobrança e devolve o `clientSecret`. Daqui não
 * sai chamada a gateway nenhuma — preço, idempotência e criação da assinatura vivem no Java.
 *
 * O cartão em si nunca toca servidor algum: o Payment Element tokeniza direto com a Stripe no
 * navegador, usando o `clientSecret` que esta rota apenas repassa (passo 4).
 *
 * CACHE STRATEGY: no-store — dados financeiros, sem cache
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    // Cobrança é ação de usuário autenticado. Barrar aqui evita uma ida ao BFF, mas quem
    // realmente valida o JWT é o Java.
    const userToken = readUserToken(req);

    if (!userToken) {
        console.warn('[API_CARD] Requisição sem sessão.');
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (body === null) {
        return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
    }

    const { status, data } = await callBff(BFF_PAYMENT_PATHS.checkoutCard, {
        method: 'POST',
        body: sanitizeCheckoutBody(body),
        userToken,
    });

    return NextResponse.json(data, { status });
}
