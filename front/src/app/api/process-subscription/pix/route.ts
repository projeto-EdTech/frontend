import { NextResponse } from 'next/server';
import { readUserToken } from '@/app/service/sessionToken';
import { callBff, sanitizeCheckoutBody, BFF_PAYMENT_PATHS } from '@/app/service/bffPayments';

/**
 * PIX — proxy fino para o BFF Java.
 *
 * Mesmas regras da rota de cartão (`../credit-card`): o navegador manda `planId` e dados de
 * identificação, o Java resolve o valor e cria a cobrança, e o QR code volta por aqui.
 *
 * A confirmação do PIX é assíncrona: `hooks/usePixPaymentStatus` pergunta a
 * `../../subscriptions/activate` enquanto o QR está na tela, e o webhook direto no Java
 * reconcilia quem fechou o navegador.
 *
 * CACHE STRATEGY: no-store — dados financeiros, sem cache
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const userToken = readUserToken(req);

    if (!userToken) {
        console.warn('[API_PIX] Requisição sem sessão.');
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (body === null) {
        return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
    }

    const { status, data } = await callBff(BFF_PAYMENT_PATHS.checkoutPix, {
        method: 'POST',
        body: sanitizeCheckoutBody(body),
        userToken,
    });

    return NextResponse.json(data, { status });
}
