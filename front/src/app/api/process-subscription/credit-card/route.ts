import { NextRequest, NextResponse } from 'next/server';
import { getMercadoPagoGateway, getStripeGateway } from '@/app/service/payment/payment-router.service';
import { GatewayError } from '@/app/service/payment/payment-gateway.types';
import type { PaymentGatewayType } from '@/app/service/payment/payment-gateway.types';

// Credit card tokens are gateway-specific (Stripe PM ID ≠ MP card token).
// The client sends gatewayHint matching whichever form was rendered based on health check.
// No server-side gateway fallback here — wrong token format would just fail anyway.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.token || !body.transaction_amount) {
      return NextResponse.json(
        { message: 'Token e valor são obrigatórios.' },
        { status: 400 },
      );
    }

    const hint: PaymentGatewayType = body.gatewayHint ?? 'stripe';
    const gw = hint === 'mercadopago' ? getMercadoPagoGateway() : getStripeGateway();

    const result = await gw.createCreditCardPayment({
      token: body.token,
      email: body.payer?.email ?? '',
      amount: Number(body.transaction_amount),
      planId: body.planId ?? body.description ?? 'mensal',
      installments: body.installments ?? 1,
      issuerId: body.issuer_id,
      paymentMethodId: body.payment_method_id,
      payer: body.payer,
      gatewayHint: hint,
    });

    return NextResponse.json({
      payment_id: result.paymentId,
      status: result.status,
      gateway: result.gateway,
    }, { status: 200 });

  } catch (err: unknown) {
    console.error('[credit-card/route] Erro ao processar cartão:', err);

    if (err instanceof GatewayError && err.status < 500) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }

    const message = err instanceof Error ? err.message : 'Erro interno ao processar pagamento.';
    return NextResponse.json({ message }, { status: 503 });
  }
}
