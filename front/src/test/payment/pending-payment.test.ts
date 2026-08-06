import { describe, it, expect } from 'vitest';
import {
    parsePendingPayment,
    isPendingPaymentExpired,
    shouldClearOnStatus,
    type PendingPayment,
} from '@/app/service/pendingPayment';

/**
 * O boleto era o único método sem caminho de ativação: PIX tem polling, cartão ativa na tela
 * de confirmação, e o boleto dependia só do webhook — que não consegue autenticar no BFF.
 * Quem pagava boleto nunca virava PRO.
 *
 * A reconciliação guarda o `payment_id` e pergunta de novo no próximo acesso do aluno, com o
 * JWT dele. Estas são as decisões puras desse fluxo.
 */

const AGORA = 1_770_000_000_000;

const entrada: PendingPayment = {
    gateway: 'mercadopago',
    paymentId: '1349817351',
    criadoEm: AGORA,
};

describe('parsePendingPayment', () => {
    it('lê uma entrada íntegra', () => {
        expect(parsePendingPayment(JSON.stringify(entrada))).toEqual(entrada);
    });

    it('descarta espaços em volta do id', () => {
        const raw = JSON.stringify({ ...entrada, paymentId: '  1349817351  ' });

        expect(parsePendingPayment(raw)?.paymentId).toBe('1349817351');
    });

    /** `localStorage` é entrada não confiável: o usuário edita, e versões antigas do app gravam outro formato. */
    it('devolve null para lixo, formato antigo ou campo faltando', () => {
        for (const raw of [
            null,
            undefined,
            '',
            'não é json',
            '[]',
            '"string"',
            'null',
            JSON.stringify({ gateway: 'paypal', paymentId: '1', criadoEm: AGORA }),
            JSON.stringify({ gateway: 'mercadopago', criadoEm: AGORA }),
            JSON.stringify({ gateway: 'mercadopago', paymentId: '', criadoEm: AGORA }),
            JSON.stringify({ gateway: 'mercadopago', paymentId: 1349817351, criadoEm: AGORA }),
            JSON.stringify({ gateway: 'mercadopago', paymentId: '1' }),
            JSON.stringify({ gateway: 'mercadopago', paymentId: '1', criadoEm: 'ontem' }),
        ]) {
            expect(parsePendingPayment(raw)).toBeNull();
        }
    });
});

describe('isPendingPaymentExpired', () => {
    it('mantém durante a janela de compensação do boleto', () => {
        expect(isPendingPaymentExpired(entrada, AGORA)).toBe(false);
        expect(isPendingPaymentExpired(entrada, AGORA + 6 * 24 * 60 * 60_000)).toBe(false);
    });

    it('expira depois de 7 dias — insistir só gasta requisição', () => {
        expect(isPendingPaymentExpired(entrada, AGORA + 8 * 24 * 60 * 60_000)).toBe(true);
    });
});

describe('shouldClearOnStatus', () => {
    it('limpa quando ativou', () => {
        expect(shouldClearOnStatus(200)).toBe(true);
    });

    /** Boleto esperando compensar é exatamente este caso — não pode descartar. */
    it('mantém em 202, o estado normal de um boleto pendente', () => {
        expect(shouldClearOnStatus(202)).toBe(false);
    });

    it('limpa nos estados terminais e nos de titularidade', () => {
        for (const status of [401, 403, 404, 409]) {
            expect(shouldClearOnStatus(status)).toBe(true);
        }
    });

    /** Falha nossa é transitória: descartar aqui perderia a ativação de quem já pagou. */
    it('mantém em erro de servidor', () => {
        expect(shouldClearOnStatus(500)).toBe(false);
        expect(shouldClearOnStatus(503)).toBe(false);
    });
});
