import { NextRequest, NextResponse } from 'next/server';
import { routePayment, pixGateways } from '@/app/service/payment/payment-router.service';
import { GatewayError } from '@/app/service/payment/payment-gateway.types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction_amount, payer } = body;

    if (!transaction_amount || !payer?.email) {
      return NextResponse.json(
        { message: 'Dados insuficientes para criar o pagamento PIX.' },
        { status: 400 },
      );
    }

    const result = await routePayment(
      gw => gw.createPixPayment({
        email: payer.email,
        amount: Number(transaction_amount),
        planId: body.planId ?? 'mensal',
        payerIdentification: payer.identification,
      }),
      pixGateways(),
    );

    return NextResponse.json({
      payment_id: result.paymentId,
      status: result.status,
      qr_code: result.qrCode,
      qr_code_base64: result.qrCodeBase64,
      gateway: result.gateway,
    }, { status: 201 });

  } catch (err: unknown) {
    console.error('[pix/route] Erro ao criar pagamento PIX:', err);

    if (err instanceof GatewayError && err.status < 500) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }

    const message = err instanceof Error ? err.message : 'Erro interno ao processar pagamento.';
    return NextResponse.json({ message }, { status: 503 });
  }
}
