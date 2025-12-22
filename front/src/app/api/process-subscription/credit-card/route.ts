import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cleanedIdentificationNumber = body.payer.identification.number.replace(/\D/g, '');

    const payment = new Payment(client);

    const response = await payment.create({
      body: {
        transaction_amount: body.transaction_amount,
        token: body.token,
        description: `Plano ${body.planId}`,
        installments: body.installments,
        payment_method_id: body.payment_method_id,
        issuer_id: body.issuer_id,
        payer: {
          ...body.payer,
          identification: {
            ...body.payer.identification,
            number: cleanedIdentificationNumber,
          }
        },
      },
    });

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (err: unknown) {
    console.error('ERRO AO PROCESSAR PAGAMENTO:', err);

    if (err instanceof Error) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ error: 'Erro desconhecido ao processar o pagamento.' }),
      { status: 500 }
    );
  }
}