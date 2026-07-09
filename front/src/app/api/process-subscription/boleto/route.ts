import { NextRequest, NextResponse } from 'next/server';
import { routePayment, boletoGateways } from '@/app/service/payment/payment-router.service';
import { GatewayError } from '@/app/service/payment/payment-gateway.types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction_amount, payer } = body;

    if (
      !transaction_amount ||
      !payer?.email ||
      !payer?.firstName ||
      !payer?.lastName ||
      !payer?.docType ||
      !payer?.docNumber ||
      !payer?.address?.zip_code
    ) {
      return NextResponse.json(
        { message: 'Dados insuficientes para criar o boleto. Verifique se todos os campos foram preenchidos.' },
        { status: 400 },
      );
    }

    const result = await routePayment(
      gw => gw.createBoletoPayment({
        email: payer.email,
        amount: Number(transaction_amount),
        planId: body.planId ?? 'mensal',
        payer: {
          email: payer.email,
          firstName: payer.firstName,
          lastName: payer.lastName,
          docType: payer.docType,
          docNumber: payer.docNumber,
        },
        address: payer.address,
      }),
      boletoGateways(),
    );

    return NextResponse.json({
      payment_id: result.paymentId,
      status: result.status,
      boleto_url: result.boletoUrl,
      boleto_code: result.barcode,
      due_date: result.dueDate,
      gateway: result.gateway,
    }, { status: 201 });

  } catch (err: unknown) {
    console.error('[boleto/route] Erro ao criar boleto:', err);

    if (err instanceof GatewayError && err.status < 500) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }

    const message = err instanceof Error ? err.message : 'Erro interno ao processar boleto.';
    return NextResponse.json({ message }, { status: 503 });
  }
}
