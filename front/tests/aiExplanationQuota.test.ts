/**
 * Specs para `src/app/service/aiExplanationQuota.ts` — a cota diária de explicações por IA
 * do aluno FREE.
 *
 * Antes, o contador vivia em `localStorage` e era lido por `const { isFree } = useUserTier()` —
 * só que o hook devolve `{ tier, isPro, loading }`. `isFree` saía sempre `undefined`, o contador
 * nunca subia e o FREE tinha uso ilimitado. Agora quem conta é o servidor, num cookie HttpOnly
 * que o JavaScript da página não lê nem escreve.
 *
 * O formato do cookie é `dia.usados.marcaDoAluno`. A marca é um hash curto do identificador do
 * aluno — sem dado pessoal no cookie — e existe para dois alunos no mesmo navegador não
 * dividirem a mesma cota.
 *
 * Vitest, ambiente node.
 */
import { describe, it, expect } from 'vitest';
import {
    FREE_DAILY_EXPLANATIONS,
    diaDeHoje,
    lerCota,
    serializarCota,
    restantes,
} from '../src/app/service/aiExplanationQuota';

const ALUNO = 'aluno-123';
const OUTRO = 'aluno-456';

describe('aiExplanationQuota — dia de referência', () => {
    it('1. o dia vira à meia-noite de Brasília, não à de UTC', () => {
        // 02:30 UTC de 11/03 ainda é 23:30 de 10/03 em São Paulo.
        expect(diaDeHoje(new Date('2026-03-11T02:30:00Z'))).toBe('2026-03-10');
        expect(diaDeHoje(new Date('2026-03-11T03:30:00Z'))).toBe('2026-03-11');
    });
});

describe('aiExplanationQuota — leitura', () => {
    it('2. sem cookie, o aluno começa com a cota cheia', () => {
        const cota = lerCota(undefined, ALUNO, '2026-09-18');

        expect(cota.usados).toBe(0);
        expect(restantes(cota)).toBe(FREE_DAILY_EXPLANATIONS);
    });

    it('3. o que foi gravado volta igual', () => {
        const valor = serializarCota({ dia: '2026-09-18', usados: 3 }, ALUNO);

        expect(lerCota(valor, ALUNO, '2026-09-18').usados).toBe(3);
    });

    it('4. no dia seguinte a cota zera', () => {
        const valor = serializarCota({ dia: '2026-09-17', usados: FREE_DAILY_EXPLANATIONS }, ALUNO);

        expect(lerCota(valor, ALUNO, '2026-09-18').usados).toBe(0);
    });

    it('5. o cookie de outro aluno no mesmo navegador não gasta a cota deste', () => {
        const valor = serializarCota({ dia: '2026-09-18', usados: FREE_DAILY_EXPLANATIONS }, OUTRO);

        expect(lerCota(valor, ALUNO, '2026-09-18').usados).toBe(0);
    });

    it('6. o cookie não carrega o identificador do aluno em claro', () => {
        const valor = serializarCota({ dia: '2026-09-18', usados: 1 }, 'fulano@exemplo.com');

        expect(valor).not.toContain('fulano');
        expect(valor).not.toContain('exemplo.com');
    });

    it('7. valor adulterado para negativo não vira cota extra', () => {
        const valor = serializarCota({ dia: '2026-09-18', usados: 0 }, ALUNO).replace('.0.', '.-50.');

        expect(restantes(lerCota(valor, ALUNO, '2026-09-18'))).toBeLessThanOrEqual(FREE_DAILY_EXPLANATIONS);
    });

    it('8. lixo no cookie é tratado como cota nova, sem lançar', () => {
        expect(() => lerCota('isto.nao.e.uma.cota', ALUNO, '2026-09-18')).not.toThrow();
        expect(lerCota('isto.nao.e.uma.cota', ALUNO, '2026-09-18').usados).toBe(0);
    });
});

describe('aiExplanationQuota — restantes', () => {
    it('9. nunca devolve número negativo', () => {
        expect(restantes({ dia: '2026-09-18', usados: FREE_DAILY_EXPLANATIONS + 3 })).toBe(0);
    });
});
