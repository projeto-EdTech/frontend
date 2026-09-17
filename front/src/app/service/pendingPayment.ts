/**
 * Cobrança que ficou pendente no navegador do aluno, à espera de reconciliação.
 *
 * Nasce do boleto. PIX tem polling enquanto o QR está na tela e cartão ativa na tela de
 * confirmação; o boleto compensa em dias e o aluno fecha o navegador muito antes. Quem ativa
 * nesse caso é o webhook que a gateway manda direto ao BFF Java.
 *
 * Isto é a rede de segurança do intervalo: enquanto o webhook não chegou (ou chegou e o aluno
 * ainda não voltou), lembrar qual pagamento perguntar faz a tela refletir o tier no próximo
 * acesso. `POST /api/subscriptions/activate` já é o caminho — o BFF reconsulta a gateway e
 * confere a titularidade antes de liberar qualquer coisa.
 *
 * **O que é guardado não é credencial nem dado sensível** — é o mesmo `payment_id` que já
 * aparece na tela do boleto. Sozinho não prova nada: o servidor reconsulta o Mercado Pago e
 * confere a titularidade contra a sessão antes de ativar.
 *
 * Este arquivo tem só as decisões puras, para serem testáveis fora do navegador; o efeito
 * (ler/gravar `localStorage`, chamar a rota) vive em `hooks/usePendingPaymentReconciliation`.
 *
 * CACHE STRATEGY: no-store — dados financeiros, sem cache
 */

export const PENDING_PAYMENT_KEY = 'pending_payment';

/**
 * Boleto vence em 3 dias úteis e o Mercado Pago ainda leva até 2 dias para confirmar a
 * compensação. 7 dias cobre isso com folga; passado o prazo, insistir só gasta requisição.
 */
const TTL_MS = 7 * 24 * 60 * 60_000;

export interface PendingPayment {
    gateway: 'mercadopago' | 'stripe';
    paymentId: string;
    /** Epoch em ms de quando a cobrança foi criada. */
    criadoEm: number;
}

/**
 * Lê o que está no `localStorage`, que é entrada não confiável — o usuário pode editar, e uma
 * versão anterior do app pode ter gravado outro formato.
 *
 * @returns `null` para qualquer coisa que não seja uma entrada íntegra.
 */
export function parsePendingPayment(raw: string | null | undefined): PendingPayment | null {
    if (!raw) return null;

    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }

    if (typeof parsed !== 'object' || parsed === null) return null;

    const { gateway, paymentId, criadoEm } = parsed as Record<string, unknown>;

    if (gateway !== 'mercadopago' && gateway !== 'stripe') return null;
    if (typeof paymentId !== 'string' || !paymentId.trim()) return null;
    if (typeof criadoEm !== 'number' || !Number.isFinite(criadoEm)) return null;

    return { gateway, paymentId: paymentId.trim(), criadoEm };
}

export function isPendingPaymentExpired(entry: PendingPayment, now: number): boolean {
    return now - entry.criadoEm > TTL_MS;
}

/**
 * Decide o destino da entrada a partir da resposta de `/api/subscriptions/activate`.
 *
 * - `200` — ativado. Acabou.
 * - `202` — pago mas o BFF ainda não confirmou, ou o boleto segue pendente. **Manter**: é o
 *   estado normal de um boleto esperando compensar.
 * - `404` — o gateway não conhece o id. Não vai passar a conhecer.
 * - `409` — estado terminal (cancelado, expirado). Não adianta perguntar de novo.
 * - `401`/`403` — sessão errada ou pagamento de outra pessoa. Descartar antes que vire
 *   requisição repetida em toda visita.
 * - `5xx` — falha nossa, transitória. Manter para a próxima visita.
 */
export function shouldClearOnStatus(status: number): boolean {
    if (status === 200) return true;
    if (status === 202) return false;

    return status === 401 || status === 403 || status === 404 || status === 409;
}
