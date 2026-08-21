import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Webhook recebido:', body);

        // 'body.action' ou 'body.type' contém o tipo de evento
        const eventType = body.action || body.type;

        if (eventType === 'subscription.updated' || eventType === 'subscription.authorized') {
            const subscriptionId = body.data.id;
            console.log(`Assinatura ${subscriptionId} foi atualizada/autorizada.`);
            // LÓGICA: Buscar a assinatura no Mercado Pago pelo ID para verificar o status
            // e atualizar o status do usuário no seu banco de dados.
        }
        
        if (eventType === 'subscription.cancelled') {
            const subscriptionId = body.data.id;
            console.log(`Assinatura ${subscriptionId} foi cancelada.`);
            // LÓGICA: Atualizar o status do usuário para "cancelado" no seu banco de dados.
        }

        // É crucial responder com status 200 para o Mercado Pago saber que você recebeu a notificação.
        return NextResponse.json({ status: 'received' }, { status: 200 });

    } catch (error: any) {
        console.error('Erro no webhook do Mercado Pago:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}