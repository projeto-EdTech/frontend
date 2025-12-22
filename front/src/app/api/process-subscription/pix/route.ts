import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(req: NextRequest) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  // Verifica se o token de acesso está configurado
  if (!accessToken) {
    console.error('ERRO CRÍTICO: MERCADO_PAGO_ACCESS_TOKEN não está definido.');
    return NextResponse.json(
      { message: 'A chave de acesso para pagamentos não está configurada no servidor.' },
      { status: 500 }
    );
  }

  const client = new MercadoPagoConfig({
    accessToken: accessToken,
  });

  try {
    const bodyRequest = await req.json();
    const { transaction_amount, payer } = bodyRequest;

    if (!transaction_amount || !payer || !payer.email || !payer.identification?.number) {
      return NextResponse.json(
        { message: 'Dados insuficientes para criar o pagamento.' }, 
        { status: 400 }
      );
    }

    const payment = new Payment(client);
    const paymentBody = {
      transaction_amount: Number(transaction_amount),
      description: 'Assinatura Simula Pro',
      payment_method_id: 'pix',
      payer: {
        email: payer.email,
        first_name: payer.first_name,
        last_name: payer.last_name,
        identification: {
          type: payer.identification.type,
          number: payer.identification.number,
        },
      },
    };

    const result = await payment.create({ body: paymentBody });

    return NextResponse.json({
      payment_id: result.id,
      status: result.status,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('--- ERRO AO CRIAR PAGAMENTO PIX ---', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || 'Ocorreu um erro interno no servidor.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Erro desconhecido ao criar o pagamento.' },
      { status: 500 }
    );
  }
}

