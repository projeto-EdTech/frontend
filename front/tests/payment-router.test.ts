import { describe, it, expect, vi, afterEach } from 'vitest';
import { routePayment } from '../src/app/service/payment/payment-router.service';
import {
  GatewayError,
  type IPaymentGateway,
  type PixPaymentResult,
  type BoletoPaymentResult,
  type CreditCardPaymentResult,
} from '../src/app/service/payment/payment-gateway.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeGateway(type: 'mercadopago' | 'stripe', overrides: Partial<IPaymentGateway> = {}): IPaymentGateway {
  return {
    type,
    createPixPayment: vi.fn().mockResolvedValue({
      paymentId: `${type}-pix-1`,
      status: 'pending',
      qrCodeBase64: 'base64==',
      qrCode: 'pix-code',
      gateway: type,
    } satisfies PixPaymentResult),
    createBoletoPayment: vi.fn().mockResolvedValue({
      paymentId: `${type}-boleto-1`,
      status: 'pending',
      boletoUrl: 'https://boleto.url',
      barcode: '1234.5678',
      dueDate: '2026-07-10',
      gateway: type,
    } satisfies BoletoPaymentResult),
    createCreditCardPayment: vi.fn().mockResolvedValue({
      paymentId: `${type}-cc-1`,
      status: 'approved',
      gateway: type,
    } satisfies CreditCardPaymentResult),
    ...overrides,
  };
}

const PIX_REQ = { email: 'test@test.com', amount: 50, planId: 'mensal' };

// ─── Router: comportamento básico ─────────────────────────────────────────────

describe('routePayment — gateway primário disponível', () => {
  it('usa gateway primário e retorna resultado com gateway correto', async () => {
    const primary = makeGateway('mercadopago');
    const fallback = makeGateway('stripe');

    const result = await routePayment(gw => gw.createPixPayment(PIX_REQ), [primary, fallback]);

    expect(result.gateway).toBe('mercadopago');
    expect(primary.createPixPayment).toHaveBeenCalledTimes(1);
    expect(fallback.createPixPayment).not.toHaveBeenCalled();
  });

  it('não chama fallback quando primário responde com sucesso', async () => {
    const primary = makeGateway('stripe');
    const fallback = makeGateway('mercadopago');

    await routePayment(gw => gw.createCreditCardPayment({
      token: 'tok_test', email: 'a@b.com', amount: 50, planId: 'mensal', installments: 1,
    }), [primary, fallback]);

    expect(fallback.createCreditCardPayment).not.toHaveBeenCalled();
  });
});

// ─── Router: fallback em erros de rede/timeout ────────────────────────────────

describe('routePayment — fallback em erros de rede e timeout', () => {
  it('usa fallback quando primário lança AbortError (timeout)', async () => {
    const abortError = new DOMException('timeout', 'AbortError');
    const primary = makeGateway('mercadopago', {
      createPixPayment: vi.fn().mockRejectedValue(abortError),
    });
    const fallback = makeGateway('stripe');

    const result = await routePayment(gw => gw.createPixPayment(PIX_REQ), [primary, fallback]);

    expect(result.gateway).toBe('stripe');
    expect(fallback.createPixPayment).toHaveBeenCalledTimes(1);
  });

  it('usa fallback quando primário lança TypeError (network failure)', async () => {
    const networkError = new TypeError('fetch failed');
    const primary = makeGateway('mercadopago', {
      createBoletoPayment: vi.fn().mockRejectedValue(networkError),
    });
    const fallback = makeGateway('stripe');
    const req = {
      email: 'test@test.com', amount: 50, planId: 'mensal',
      payer: { docType: 'CPF', docNumber: '12345678901', email: 'test@test.com', firstName: 'Test', lastName: 'User' },
      address: { zip_code: '01001000', street_name: 'Rua A', street_number: '1', neighborhood: 'Centro', city: 'SP', federal_unit: 'SP' },
    };

    const result = await routePayment(gw => gw.createBoletoPayment(req), [primary, fallback]);

    expect(result.gateway).toBe('stripe');
  });

  it('usa fallback quando primário lança GatewayError com status 5xx', async () => {
    const serverError = new GatewayError('Internal Server Error', 500);
    const primary = makeGateway('mercadopago', {
      createPixPayment: vi.fn().mockRejectedValue(serverError),
    });
    const fallback = makeGateway('stripe');

    const result = await routePayment(gw => gw.createPixPayment(PIX_REQ), [primary, fallback]);

    expect(result.gateway).toBe('stripe');
  });
});

// ─── Router: sem fallback em erros de validação (4xx) ─────────────────────────

describe('routePayment — sem fallback em erros 4xx', () => {
  it('não usa fallback quando primário lança GatewayError 400', async () => {
    const validationError = new GatewayError('Dados inválidos', 400);
    const primary = makeGateway('mercadopago', {
      createPixPayment: vi.fn().mockRejectedValue(validationError),
    });
    const fallback = makeGateway('stripe');

    await expect(
      routePayment(gw => gw.createPixPayment(PIX_REQ), [primary, fallback])
    ).rejects.toThrow(GatewayError);

    expect(fallback.createPixPayment).not.toHaveBeenCalled();
  });

  it('não usa fallback quando primário lança GatewayError 422', async () => {
    const unprocessable = new GatewayError('Unprocessable Entity', 422);
    const primary = makeGateway('stripe', {
      createCreditCardPayment: vi.fn().mockRejectedValue(unprocessable),
    });
    const fallback = makeGateway('mercadopago');

    await expect(
      routePayment(gw => gw.createCreditCardPayment({
        token: 'tok_test', email: 'a@b.com', amount: 50, planId: 'mensal', installments: 1,
      }), [primary, fallback])
    ).rejects.toThrow(GatewayError);

    expect(fallback.createCreditCardPayment).not.toHaveBeenCalled();
  });
});

// ─── Router: ambas as gateways falham ─────────────────────────────────────────

describe('routePayment — ambas as gateways falham', () => {
  it('lança erro quando primary e fallback falham com erro de rede', async () => {
    const networkError = new TypeError('fetch failed');
    const primary = makeGateway('mercadopago', {
      createPixPayment: vi.fn().mockRejectedValue(networkError),
    });
    const fallback = makeGateway('stripe', {
      createPixPayment: vi.fn().mockRejectedValue(networkError),
    });

    await expect(
      routePayment(gw => gw.createPixPayment(PIX_REQ), [primary, fallback])
    ).rejects.toThrow();
  });

  it('erro final tem mensagem indicando falha de ambas as gateways', async () => {
    const serverError = new GatewayError('MP down', 503);
    const stripeError = new TypeError('Stripe unreachable');
    const primary = makeGateway('mercadopago', {
      createPixPayment: vi.fn().mockRejectedValue(serverError),
    });
    const fallback = makeGateway('stripe', {
      createPixPayment: vi.fn().mockRejectedValue(stripeError),
    });

    await expect(
      routePayment(gw => gw.createPixPayment(PIX_REQ), [primary, fallback])
    ).rejects.toThrow(/indispon|unavailable|falhou|failed/i);
  });
});

// ─── GatewayError ─────────────────────────────────────────────────────────────

describe('GatewayError', () => {
  it('preserva status e mensagem', () => {
    const err = new GatewayError('Not Found', 404);
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not Found');
    expect(err).toBeInstanceOf(Error);
  });

  it('é identificável pelo instanceof', () => {
    const err = new GatewayError('bad', 400);
    expect(err instanceof GatewayError).toBe(true);
  });
});

// ─── Mapeamento de resposta MP PIX ────────────────────────────────────────────
// Inject a mock MP client directly into the constructor (dependency injection).

describe('MercadoPagoGateway — mapeamento PIX', () => {
  it('mapeia resposta MP para PixPaymentResult com gateway mercadopago', async () => {
    const { MercadoPagoGateway } = await import('../src/app/service/payment/mercadopago.gateway');
    const { MercadoPagoConfig, Payment } = await import('mercadopago');

    const mockPaymentCreate = vi.fn().mockResolvedValue({
      id: 42,
      status: 'pending',
      point_of_interaction: {
        transaction_data: {
          qr_code: 'pix-code-string',
          qr_code_base64: 'base64string==',
        },
      },
    });

    vi.spyOn(Payment.prototype, 'create').mockImplementation(mockPaymentCreate);

    const fakeClient = new MercadoPagoConfig({ accessToken: 'fake' });
    const gw = new MercadoPagoGateway('fake', fakeClient);
    const result = await gw.createPixPayment(PIX_REQ);

    expect(result.gateway).toBe('mercadopago');
    expect(result.paymentId).toBe('42');
    expect(result.qrCode).toBe('pix-code-string');
    expect(result.qrCodeBase64).toBe('base64string==');

    vi.restoreAllMocks();
  });
});

// ─── Mapeamento de resposta Stripe PIX ───────────────────────────────────────
// Inject a mock Stripe instance via the optional constructor param.

describe('StripeGateway — mapeamento PIX', () => {
  it('mapeia resposta Stripe para PixPaymentResult com gateway stripe', async () => {
    const { StripeGateway } = await import('../src/app/service/payment/stripe.gateway');

    const mockStripe = {
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'pi_stripe_pix',
          status: 'requires_action',
          next_action: {
            pix_display_qr_code: {
              image_url_png: 'https://qr.stripe.com/img.png',
              data: 'stripe-pix-code',
            },
          },
        }),
      },
    } as any;

    const gw = new StripeGateway('sk_test_fake', mockStripe);
    const result = await gw.createPixPayment(PIX_REQ);

    expect(result.gateway).toBe('stripe');
    expect(result.paymentId).toBe('pi_stripe_pix');
    expect(result.qrCode).toBe('stripe-pix-code');
  });
});
