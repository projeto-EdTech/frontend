import { NextResponse } from 'next/server';
import type { GatewayHealthResult } from '@/app/service/payment/payment-gateway.types';

// CACHE STRATEGY: ISR — revalidate 30s — gateway availability can change
export const revalidate = 30;

async function pingMercadoPago(): Promise<boolean> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    const res = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

async function pingStripe(): Promise<boolean> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    const res = await fetch('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(): Promise<NextResponse<GatewayHealthResult>> {
  const [mpAvailable, stripeAvailable] = await Promise.all([pingMercadoPago(), pingStripe()]);

  const health: GatewayHealthResult = {
    mercadopagoAvailable: mpAvailable,
    stripeAvailable,
    // Credit card: Stripe primary, MP fallback
    creditCard: stripeAvailable ? 'stripe' : 'mercadopago',
    // PIX/Boleto: MP primary, Stripe fallback
    pix: mpAvailable ? 'mercadopago' : 'stripe',
    boleto: mpAvailable ? 'mercadopago' : 'stripe',
  };

  return NextResponse.json(health);
}
