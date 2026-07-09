import { GatewayError, type IPaymentGateway } from './payment-gateway.types';
import { MercadoPagoGateway } from './mercadopago.gateway';
import { StripeGateway } from './stripe.gateway';

export { GatewayError };

const GATEWAY_TIMEOUT_MS = 15_000;

function isRetryableError(err: unknown): boolean {
  if (err instanceof GatewayError) return err.status >= 500;
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (err instanceof TypeError) return true;
  return false;
}

async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fn();
  } catch (err) {
    if (controller.signal.aborted) {
      throw new DOMException(`Payment gateway timed out after ${ms}ms`, 'AbortError');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function routePayment<T>(
  method: (gw: IPaymentGateway) => Promise<T>,
  gateways: IPaymentGateway[],
): Promise<T> {
  let lastError: unknown;

  for (const gw of gateways) {
    try {
      const result = await withTimeout(() => method(gw), GATEWAY_TIMEOUT_MS);
      return result;
    } catch (err) {
      if (!isRetryableError(err)) throw err;
      console.warn(`[payment-router] ${gw.type} falhou, tentando próximo gateway`, (err as Error).message);
      lastError = err;
    }
  }

  throw new Error(
    `Todos os gateways de pagamento estão indisponíveis. Tente novamente em instantes. (${(lastError as Error)?.message ?? 'unknown'})`,
  );
}

let _mpGateway: MercadoPagoGateway | null = null;
let _stripeGateway: StripeGateway | null = null;

export function getMercadoPagoGateway(): MercadoPagoGateway {
  if (!_mpGateway) {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    _mpGateway = new MercadoPagoGateway(token);
  }
  return _mpGateway;
}

export function getStripeGateway(): StripeGateway {
  if (!_stripeGateway) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY não configurado');
    _stripeGateway = new StripeGateway(key);
  }
  return _stripeGateway;
}

export const pixGateways = (): IPaymentGateway[] => [getMercadoPagoGateway(), getStripeGateway()];
export const boletoGateways = (): IPaymentGateway[] => [getMercadoPagoGateway(), getStripeGateway()];
export const creditCardGateways = (): IPaymentGateway[] => [getStripeGateway(), getMercadoPagoGateway()];
