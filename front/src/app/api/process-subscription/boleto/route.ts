import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// 1. INICIALIZAÇÃO SEGURA DO CLIENTE
// O Access Token é lido das variáveis de ambiente do servidor.
// Nunca exponha essa chave no lado do cliente (no React).
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

// Verificação crítica: se a chave não estiver configurada, a API não pode funcionar.
if (!accessToken) {
  console.error('ERRO CRÍTICO: MERCADO_PAGO_ACCESS_TOKEN não está definido.');
  // Em produção, você poderia retornar um erro genérico para não expor detalhes.
  throw new Error('A chave de acesso para pagamentos não está configurada no servidor.');
}

const client = new MercadoPagoConfig({
  accessToken: accessToken,
});


export async function POST(req: NextRequest) {
  try {
    // 2. RECEBIMENTO E VALIDAÇÃO DOS DADOS DO FRONTEND
    const bodyRequest = await req.json();
    const { transaction_amount, payer } = bodyRequest;

    // Validação robusta para garantir que todos os dados necessários foram enviados
    if (
        !transaction_amount || 
        !payer || 
        !payer.email || 
        !payer.firstName || 
        !payer.lastName || 
        !payer.docType || 
        !payer.docNumber || 
        !payer.address ||
        !payer.address.zip_code
    ) {
      return NextResponse.json(
        { message: 'Dados insuficientes para criar o boleto. Verifique se todos os campos, incluindo o endereço, foram enviados.' }, 
        { status: 400 } // Bad Request
      );
    }

    const payment = new Payment(client);
    const sanitizedDocNumber = payer.docNumber.replace(/\D/g, '');

    // 3. MONTAGEM DO CORPO DA REQUISIÇÃO PARA O MERCADO PAGO
    const paymentBody = {
      transaction_amount: Number(transaction_amount),
      description: 'Assinatura Simula Pro', 
      payment_method_id: 'bolbradesco', 
      payer: {
        email: payer.email,
        first_name: payer.firstName,
        last_name: payer.lastName,
        identification: {
          type: payer.docType,
          // Use a variável sanitizada aqui
          number: sanitizedDocNumber,
        },
        address: {
            zip_code: payer.address.zip_code,
            street_name: payer.address.street_name,
            street_number: payer.address.street_number,
            neighborhood: payer.address.neighborhood,
            city: payer.address.city,
            federal_unit: payer.address.federal_unit,
        }
      },
    };

    // 4. CRIAÇÃO DO PAGAMENTO
    const result = await payment.create({ body: paymentBody });

    // 5. RESPOSTA DE SUCESSO PARA O FRONTEND
    // Enviamos de volta apenas os dados que o frontend precisa para exibir o boleto.
    return NextResponse.json({
      payment_id: result.id,
      status: result.status,
      boleto_url: result.transaction_details?.external_resource_url, // Link para o PDF
      boleto_code: result.barcode?.content, // Linha digitável (código de barras)
      due_date: result.date_of_expiration, // Data de vencimento
    }, { status: 201 }); // 201 Created

  } catch (error: any) {
    // 6. TRATAMENTO DE ERROS
    console.error('--- ERRO AO CRIAR BOLETO (BACKEND) ---', error);
    
    // Tenta extrair a mensagem de erro específica da API do Mercado Pago, que é mais útil para depuração.
    const errorMessage = error.cause?.error?.message || error.message || 'Ocorreu um erro interno no servidor.';
    const status = error.cause?.statusCode || 500; // Usa o status code do MP se disponível, senão 500.

    return NextResponse.json({ message: errorMessage }, { status });
  }
}

