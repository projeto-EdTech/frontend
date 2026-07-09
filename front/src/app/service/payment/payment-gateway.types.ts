export type PaymentGatewayType = 'mercadopago' | 'stripe';

export interface PayerIdentification {
  type: string;
  number: string;
}

export interface PayerAddress {
  zip_code: string;
  street_name: string;
  street_number: string;
  neighborhood: string;
  city: string;
  federal_unit: string;
}

export interface PayerData {
  email: string;
  firstName: string;
  lastName: string;
  docType: string;
  docNumber: string;
}

export interface PixPaymentRequest {
  email: string;
  amount: number;
  planId: string;
  payerName?: string;
  payerIdentification?: PayerIdentification;
}

export interface PixPaymentResult {
  paymentId: string;
  status: string;
  qrCodeBase64: string;
  qrCode: string;
  gateway: PaymentGatewayType;
}

export interface BoletoPaymentRequest {
  email: string;
  amount: number;
  planId: string;
  payer: PayerData;
  address: PayerAddress;
}

export interface BoletoPaymentResult {
  paymentId: string;
  status: string;
  boletoUrl: string;
  barcode: string;
  dueDate: string;
  gateway: PaymentGatewayType;
}

export interface CreditCardPaymentRequest {
  token: string;
  email: string;
  amount: number;
  planId: string;
  installments: number;
  issuerId?: string;
  paymentMethodId?: string;
  payer?: {
    email: string;
    identification?: PayerIdentification;
  };
  gatewayHint?: PaymentGatewayType;
}

export interface CreditCardPaymentResult {
  paymentId: string;
  status: string;
  gateway: PaymentGatewayType;
}

export interface GatewayHealthResult {
  creditCard: PaymentGatewayType;
  pix: PaymentGatewayType;
  boleto: PaymentGatewayType;
  stripeAvailable: boolean;
  mercadopagoAvailable: boolean;
}

export interface IPaymentGateway {
  readonly type: PaymentGatewayType;
  createPixPayment(req: PixPaymentRequest): Promise<PixPaymentResult>;
  createBoletoPayment(req: BoletoPaymentRequest): Promise<BoletoPaymentResult>;
  createCreditCardPayment(req: CreditCardPaymentRequest): Promise<CreditCardPaymentResult>;
}

export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'GatewayError';
    Object.setPrototypeOf(this, GatewayError.prototype);
  }
}
