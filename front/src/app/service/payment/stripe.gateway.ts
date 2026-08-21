import Stripe from 'stripe';
import {
  GatewayError,
  type IPaymentGateway,
  type PaymentGatewayType,
  type PixPaymentRequest,
  type PixPaymentResult,
  type BoletoPaymentRequest,
  type BoletoPaymentResult,
  type CreditCardPaymentRequest,
  type CreditCardPaymentResult,
} from './payment-gateway.types';

export class StripeGateway implements IPaymentGateway {
  readonly type: PaymentGatewayType = 'stripe';
  private stripe: Stripe;

  constructor(secretKey: string, stripeClient?: Stripe) {
    this.stripe = stripeClient ?? new Stripe(secretKey, { apiVersion: '2026-06-24.dahlia' });
  }

  async createPixPayment(req: PixPaymentRequest): Promise<PixPaymentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(req.amount * 100),
      currency: 'brl',
      payment_method_types: ['pix'],
      description: `Assinatura Simula Pro - ${req.planId}`,
      receipt_email: req.email,
    });

    const pixData = intent.next_action?.pix_display_qr_code;
    if (!pixData) throw new GatewayError('Stripe PIX: QR code não retornado', 500);

    const imageUrl = (pixData as any).image_url_png ?? '';
    const pixCode = (pixData as any).data ?? '';

    return {
      paymentId: intent.id,
      status: intent.status,
      qrCode: pixCode,
      qrCodeBase64: imageUrl,
      gateway: this.type,
    };
  }

  async createBoletoPayment(req: BoletoPaymentRequest): Promise<BoletoPaymentResult> {
    const sanitizedDoc = req.payer.docNumber.replace(/\D/g, '');
    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'boleto',
      boleto: { tax_id: sanitizedDoc },
      billing_details: {
        name: `${req.payer.firstName} ${req.payer.lastName}`,
        email: req.payer.email,
        address: {
          postal_code: req.address.zip_code,
          line1: `${req.address.street_name}, ${req.address.street_number}`,
          city: req.address.city,
          state: req.address.federal_unit,
          country: 'BR',
        },
      },
    });

    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(req.amount * 100),
      currency: 'brl',
      payment_method_types: ['boleto'],
      payment_method: paymentMethod.id,
      confirm: true,
      description: `Assinatura Simula Pro - ${req.planId}`,
      receipt_email: req.email,
    });

    const boletoData = intent.next_action?.boleto_display_details;
    if (!boletoData) throw new GatewayError('Stripe Boleto: dados não retornados', 500);

    return {
      paymentId: intent.id,
      status: intent.status,
      boletoUrl: (boletoData as any).pdf ?? '',
      barcode: (boletoData as any).number ?? '',
      dueDate: (boletoData as any).expires_at
        ? new Date((boletoData as any).expires_at * 1000).toISOString()
        : '',
      gateway: this.type,
    };
  }

  async createCreditCardPayment(req: CreditCardPaymentRequest): Promise<CreditCardPaymentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(req.amount * 100),
      currency: 'brl',
      payment_method: req.token,
      confirm: true,
      description: `Plano ${req.planId}`,
      receipt_email: req.email,
    });

    return {
      paymentId: intent.id,
      status: intent.status,
      gateway: this.type,
    };
  }
}
