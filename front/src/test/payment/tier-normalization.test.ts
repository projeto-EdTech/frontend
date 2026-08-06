import { describe, it, expect } from 'vitest';
import { normalizeTier, isPaidTier } from '@/app/service/jwtDecoder';

/**
 * O aluno paga e continua FREE na tela — o pior desfecho possível deste checkout, e o mais
 * silencioso: o dinheiro entrou, o BFF ativou, e só a comparação de string no cliente falhou.
 *
 * `useUserTier` comparava `tipo === 'SIMULAPRO'`; o CLAUDE.md diz `"Simula PRO"`. Qual string o
 * BFF Java emite de fato não está confirmado com o backend (ponto de decisão em aberto na
 * `docs/Pauta_para_reuniao.md` §9), então a normalização precisa aceitar as variantes
 * plausíveis em vez de apostar numa.
 */
describe('normalizeTier', () => {
    it('reconhece as variantes de escrita do plano pago', () => {
        for (const variante of [
            'SIMULAPRO',
            'Simula PRO',
            'simula pro',
            'SIMULA_PRO',
            'simula-pro',
            '  Simula Pro  ',
        ]) {
            expect(normalizeTier(variante)).toBe('SIMULAPRO');
        }
    });

    it('reconhece os demais tiers independente de caixa', () => {
        expect(normalizeTier('TEACHER')).toBe('TEACHER');
        expect(normalizeTier('teacher')).toBe('TEACHER');
        expect(normalizeTier('ADMIN')).toBe('ADMIN');
        expect(normalizeTier('admin')).toBe('ADMIN');
        expect(normalizeTier('FREE')).toBe('FREE');
        expect(normalizeTier('free')).toBe('FREE');
    });

    /** Fail safe: desconhecido nunca vira acesso pago por acidente. */
    it('cai para FREE em valor ausente, vazio ou desconhecido', () => {
        expect(normalizeTier(undefined)).toBe('FREE');
        expect(normalizeTier(null)).toBe('FREE');
        expect(normalizeTier('')).toBe('FREE');
        expect(normalizeTier('   ')).toBe('FREE');
        expect(normalizeTier('PREMIUM')).toBe('FREE');
        expect(normalizeTier(42)).toBe('FREE');
        expect(normalizeTier({})).toBe('FREE');
    });

    it('não confunde substring com o tier', () => {
        expect(normalizeTier('NOTSIMULAPRO')).toBe('FREE');
        expect(normalizeTier('SIMULAPROX')).toBe('FREE');
    });
});

describe('isPaidTier', () => {
    it('trata SIMULAPRO, TEACHER e ADMIN como acesso liberado', () => {
        expect(isPaidTier('SIMULAPRO')).toBe(true);
        expect(isPaidTier('TEACHER')).toBe(true);
        expect(isPaidTier('ADMIN')).toBe(true);
        expect(isPaidTier('FREE')).toBe(false);
    });
});
