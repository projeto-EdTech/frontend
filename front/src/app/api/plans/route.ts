import { NextResponse } from 'next/server';
import { callBff, BFF_PAYMENT_PATHS } from '@/app/service/bffPayments';

/**
 * Catálogo de planos — proxy fino para o BFF Java.
 *
 * A vitrine precisa exibir exatamente o que será cobrado, e quem sabe o preço é quem cria a
 * cobrança: o Java. Um catálogo local aqui voltaria a ser a segunda fonte de verdade que
 * `docs/Pauta_para_reuniao.md` §3 elimina.
 *
 * Só expõe dados públicos de catálogo — nenhum dado de usuário — por isso não exige sessão nem
 * manda `Authorization`.
 *
 * CACHE STRATEGY: ISR — revalidate 300s — catálogo público muda raramente
 */

export const runtime = 'nodejs';
export const revalidate = 300;

/** Forma da resposta do BFF, consumida por `paidPlan/page.tsx`. */
export interface PlanPricing {
    id: string;
    nome: string;
    descricao: string;
    amountCents: number;
    currency: string;
    billingMode: 'payment' | 'subscription';
    interval: 'month' | 'year' | null;
    /** Valor equivalente por mês, para comparar anual e mensal na vitrine. */
    monthlyEquivalentCents: number;
}

export async function GET() {
    const { status, data } = await callBff(BFF_PAYMENT_PATHS.plans, {
        method: 'GET',
        revalidate,
    });

    return NextResponse.json(data, { status });
}
