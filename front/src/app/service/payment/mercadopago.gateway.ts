import { MercadoPagoConfig, Payment } from 'mercadopago';
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

export class MercadoPagoGateway implements IPaymentGateway {
  readonly type: PaymentGatewayType = 'mercadopago';
  private client: MercadoPagoConfig;

  constructor(accessToken: string, client?: MercadoPagoConfig) {
    this.client = client ?? new MercadoPagoConfig({ accessToken });
  }

  async createPixPayment(req: PixPaymentRequest): Promise<PixPaymentResult> {
    const payment = new Payment(this.client);
    const result = await payment.create({
      body: {
        transaction_amount: req.amount,
        description: `Assinatura Simula Pro - ${req.planId}`,
        payment_method_id: 'pix',
        payer: {
          email: req.email,
          ...(req.payerIdentification && {
            identification: req.payerIdentification,
          }),
        },
      },
    });

    if (!result.id) throw new GatewayError('MercadoPago PIX: resposta sem ID', 500);

    return {
      paymentId: String(result.id),
      status: result.status ?? 'pending',
      qrCode: result.point_of_interaction?.transaction_data?.qr_code ?? '',
      qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64 ?? '',
      gateway: this.type,
    };
  }

  async createBoletoPayment(req: BoletoPaymentRequest): Promise<BoletoPaymentResult> {
    const payment = new Payment(this.client);
    const sanitizedDoc = req.payer.docNumber.replace(/\D/g, '');

    const result = await payment.create({
      body: {
        transaction_amount: req.amount,
        description: `Assinatura Simula Pro - ${req.planId}`,
        payment_method_id: 'bolbradesco',
        payer: {
          email: req.payer.email,
          first_name: req.payer.firstName,
          last_name: req.payer.lastName,
          identification: {
            type: req.payer.docType,
            number: sanitizedDoc,
          },
          address: req.address,
        },
      },
    });

    if (!result.id) throw new GatewayError('MercadoPago Boleto: resposta sem ID', 500);

    return {
      paymentId: String(result.id),
      status: result.status ?? 'pending',
      boletoUrl: result.transaction_details?.external_resource_url ?? '',
      barcode: (result as any).barcode?.content ?? '',
      dueDate: result.date_of_expiration ?? '',
      gateway: this.type,
    };
  }

  async createCreditCardPayment(req: CreditCardPaymentRequest): Promise<CreditCardPaymentResult> {
    const payment = new Payment(this.client);
    const cleanedDoc = req.payer?.identification?.number?.replace(/\D/g, '');

    const result = await payment.create({
      body: {
        transaction_amount: req.amount,
        token: req.token,
        description: `Plano ${req.planId}`,
        installments: req.installments,
        payment_method_id: req.paymentMethodId,
        issuer_id: req.issuerId ? Number(req.issuerId) : undefined,
        payer: req.payer
          ? {
              ...req.payer,
              identification: req.payer.identification
                ? { ...req.payer.identification, number: cleanedDoc ?? '' }
                : undefined,
            }
          : undefined,
      },
    });

    if (!result.id) throw new GatewayError('MercadoPago CC: resposta sem ID', 500);

    return {
      paymentId: String(result.id),
      status: result.status ?? 'unknown',
      gateway: this.type,
    };
  }
}
