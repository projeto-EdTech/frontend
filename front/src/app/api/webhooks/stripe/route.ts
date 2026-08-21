import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error('[stripe-webhook] STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET ausentes');
    return NextResponse.json({ error: 'Webhook não configurado' }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-06-24.dahlia' });
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Assinatura stripe-signature ausente' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] Assinatura inválida:', (err as Error).message);
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.log(`[stripe-webhook] Pagamento confirmado: ${intent.id} — R$ ${(intent.amount / 100).toFixed(2)}`);

      const bffUrl = process.env.BACKEND_API_URL;
      if (bffUrl) {
        await fetch(`${bffUrl}/payments/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gateway: 'stripe',
            payment_id: intent.id,
            status: intent.status,
            amount: intent.amount / 100,
            currency: intent.currency,
            customer_email: intent.receipt_email,
          }),
        }).catch(e => console.error('[stripe-webhook] Falha ao notificar BFF:', e.message));
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.error(`[stripe-webhook] Pagamento falhou: ${intent.id} — ${intent.last_payment_error?.message}`);
    }

    // Sempre retorna 200 para Stripe não reenviar o evento
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (err) {
    console.error('[stripe-webhook] Erro ao processar evento:', err);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
