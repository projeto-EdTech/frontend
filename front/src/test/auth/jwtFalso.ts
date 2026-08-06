/**
 * JWT de mentira para os testes de autenticação.
 *
 * `decodeJWT` usa `jwt-decode`, que só lê o payload em base64url — não verifica assinatura.
 * Quem valida de verdade é o BFF Java. Por isso um token de teste não precisa ser assinado:
 * precisa apenas ter as três partes e um payload legível.
 */

function base64url(valor: unknown): string {
    return Buffer.from(JSON.stringify(valor)).toString('base64url');
}

export function jwtFalso(payload: Record<string, unknown>): string {
    return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(payload)}.assinatura-de-mentira`;
}

/** Segundos desde a epoch, para montar `exp` sem depender do relógio do teste. */
export function emSegundos(offsetMs: number): number {
    return Math.floor((Date.now() + offsetMs) / 1000);
}
