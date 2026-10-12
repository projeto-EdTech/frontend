/**
 * Specs para `src/app/service/bffTimeout.ts`.
 *
 * Sem teto próprio, uma chamada ao BFF Java só desiste no connect timeout de 10s do undici —
 * e se o Java aceitar a conexão e não responder, não desiste nunca. O helper centraliza o
 * teto e a classificação do erro, para toda rota responder 504 do mesmo jeito.
 *
 * Vitest, ambiente node.
 */
import { describe, it, expect } from 'vitest';
import { BFF_TIMEOUT_MS, bffTimeoutSignal, isBffUnreachable } from '../src/app/service/bffTimeout';

describe('bffTimeout — teto', () => {
    it('1. o teto padrão corta antes dos 10s de connect timeout do undici', () => {
        expect(BFF_TIMEOUT_MS).toBeGreaterThan(0);
        expect(BFF_TIMEOUT_MS).toBeLessThan(10_000);
    });

    it('2. o sinal aborta com TimeoutError quando o prazo vence', async () => {
        const signal = bffTimeoutSignal(10);

        expect(signal.aborted).toBe(false);
        await new Promise((r) => setTimeout(r, 50));

        expect(signal.aborted).toBe(true);
        expect((signal.reason as DOMException).name).toBe('TimeoutError');
    });

    it('3. cada chamada devolve um sinal novo — um timeout não contamina a próxima requisição', () => {
        expect(bffTimeoutSignal()).not.toBe(bffTimeoutSignal());
    });
});

describe('bffTimeout — classificação do erro', () => {
    it('4. timeout do nosso AbortSignal é BFF inalcançável', () => {
        expect(isBffUnreachable(new DOMException('timeout', 'TimeoutError'))).toBe(true);
    });

    it('5. abort genérico é BFF inalcançável', () => {
        const erro = new Error('aborted');
        erro.name = 'AbortError';

        expect(isBffUnreachable(erro)).toBe(true);
    });

    it('6. `fetch failed` do undici (TypeError com cause) é BFF inalcançável', () => {
        const erro = new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } });

        expect(isBffUnreachable(erro)).toBe(true);
    });

    it('7. bug nosso não é confundido com rede fora', () => {
        expect(isBffUnreachable(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false);
        expect(isBffUnreachable(new SyntaxError('Unexpected token < in JSON'))).toBe(false);
        expect(isBffUnreachable('string solta')).toBe(false);
        expect(isBffUnreachable(null)).toBe(false);
    });
});
