import { NextResponse } from 'next/server';
import { readUserToken } from '@/app/service/sessionToken';
import { callBff, sanitizeCheckoutBody, BFF_PAYMENT_PATHS } from '@/app/service/bffPayments';

/**
 * Boleto — proxy fino para o BFF Java.
 *
 * Mesmas regras das rotas irmãs (`../pix`, `../credit-card`). O boleto compensa em dias: quem
 * reconcilia é o webhook que chega direto ao Java, e `hooks/usePendingPaymentReconciliation`
 * cobre o intervalo até o aluno voltar ao site.
 *
 * CACHE STRATEGY: no-store — dados financeiros, sem cache
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const userToken = readUserToken(req);

    if (!userToken) {
        console.warn('[API_BOLETO] Requisição sem sessão.');
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (body === null) {
        return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
    }

    const { status, data } = await callBff(BFF_PAYMENT_PATHS.checkoutBoleto, {
        method: 'POST',
        body: sanitizeCheckoutBody(body),
        userToken,
    });

    return NextResponse.json(data, { status });
}
