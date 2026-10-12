import { createHash } from 'node:crypto';
import { FREE_DAILY_EXPLANATIONS } from '@/lib/core/aiQuota';

export { FREE_DAILY_EXPLANATIONS };

/**
 * Cota diária de explicações de gabarito por IA para o aluno FREE.
 *
 * O limite antes era contado no cliente, em `localStorage`, por um componente que lia `isFree`
 * de `useUserTier()` — campo que o hook nunca devolveu. `isFree` saía `undefined`, o contador
 * nunca subia e o FREE tinha uso ilimitado do Gemini. Agora quem conta é o servidor, e o PRO
 * (`isPaidTier`) não tem cota.
 *
 * O contador vive num cookie **HttpOnly**: o JavaScript da página não o lê nem o escreve, e o
 * valor só muda quando a rota aceita uma requisição. Formato: `dia.usados.marca`, em que `marca`
 * é um hash curto do identificador do aluno — sem dado pessoal em claro — para dois alunos no
 * mesmo navegador não dividirem a mesma cota.
 *
 * **Limite conhecido:** é uma cota de navegador. Quem apaga o cookie pelas ferramentas de
 * desenvolvedor recomeça do zero. Medição à prova disso precisa de estado no servidor, e esse
 * estado mora no BFF Java — está registrado como pendência no `README.md`.
 *
 * CACHE STRATEGY: não se aplica — utilitário sem estado
 */

export const AI_QUOTA_COOKIE = 'ai_explanations';

/** O cookie vive até o fim do dia seguinte, no máximo; o dia gravado é o que manda. */
export const AI_QUOTA_COOKIE_MAX_AGE = 2 * 24 * 60 * 60;

export interface Cota {
    /** `AAAA-MM-DD` no fuso de Brasília. */
    dia: string;
    usados: number;
}

const FORMATO_DIA = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

/** Dia corrente em Brasília: o aluno espera a cota renovar à meia-noite dele, não à de UTC. */
export function diaDeHoje(agora: Date = new Date()): string {
    return FORMATO_DIA.format(agora);
}

function marcaDoAluno(chaveDoAluno: string): string {
    return createHash('sha256').update(chaveDoAluno).digest('base64url').slice(0, 12);
}

export function serializarCota(cota: Cota, chaveDoAluno: string): string {
    return `${cota.dia}.${cota.usados}.${marcaDoAluno(chaveDoAluno)}`;
}

/**
 * Lê a cota do cookie. Nunca lança.
 *
 * Cookie ausente, de outro dia, de outro aluno ou ilegível vale como cota nova — o mesmo efeito
 * de apagar o cookie, que já está ao alcance de qualquer um. Valor negativo não vira crédito.
 */
export function lerCota(valor: string | null | undefined, chaveDoAluno: string, hoje: string): Cota {
    const nova: Cota = { dia: hoje, usados: 0 };

    if (!valor) return nova;

    const partes = valor.split('.');
    if (partes.length !== 3) return nova;

    const [dia, usadosBruto, marca] = partes;
    if (dia !== hoje || marca !== marcaDoAluno(chaveDoAluno)) return nova;

    const usados = Number(usadosBruto);
    if (!Number.isInteger(usados) || usados < 0) return nova;

    return { dia, usados };
}

export function restantes(cota: Cota): number {
    return Math.max(0, FREE_DAILY_EXPLANATIONS - cota.usados);
}
