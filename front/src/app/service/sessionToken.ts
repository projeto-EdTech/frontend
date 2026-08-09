/**
 * Leitura do JWT do backend a partir da requisição.
 *
 * Mesma ordem já usada em `src/app/api/Nota-corte/route.ts`: cabeçalho `Authorization`
 * primeiro, cookie `user_data` depois. A diferença é ler o cookie do próprio `Request` em
 * vez de `next/headers`, o que mantém as rotas testáveis fora do contexto de request do
 * Next.
 *
 * Não decodifica nem valida o token: quem valida é o BFF Java. Aqui ele serve como prova de
 * que existe uma sessão e como Bearer a repassar adiante.
 *
 * CACHE STRATEGY: no-store — dados de sessão, sem cache
 */

export function readUserToken(req: Request): string | null {
    const authHeader = req.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7).trim() || null;
    }

    return readCookie(req, 'user_data');
}

function readCookie(req: Request, name: string): string | null {
    const cookieHeader = req.headers.get('cookie');

    if (!cookieHeader) return null;

    for (const part of cookieHeader.split(';')) {
        const separator = part.indexOf('=');
        if (separator === -1) continue;

        if (part.slice(0, separator).trim() === name) {
            const value = part.slice(separator + 1).trim();
            return value ? decodeURIComponent(value) : null;
        }
    }

    return null;
}
