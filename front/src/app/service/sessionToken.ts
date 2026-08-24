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
 * Este arquivo é o **único parser de sessão do projeto** (regra do `CLAUDE.md`) — é por isso
 * que a remontagem do cookie fragmentado do NextAuth mora aqui, e não dentro da rota.
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

/**
 * Nomes do cookie de sessão do NextAuth. O prefixo `__Secure-` é o que ele usa quando a
 * `NEXTAUTH_URL` é HTTPS — ou seja, o de produção. Os dois precisam ser reconhecidos: um
 * `if` só pelo nome curto funciona em `localhost` e falha calado no deploy.
 */
const NEXTAUTH_COOKIE_NAMES = [
    '__Secure-next-auth.session-token',
    'next-auth.session-token',
] as const;

/**
 * Devolve o cookie de sessão do NextAuth **já remontado**.
 *
 * O NextAuth fatia esse cookie quando o valor passa de ~3900 bytes, porque 4096 é o teto que
 * os navegadores aceitam por cookie. Neste projeto ele passa: o callback `jwt` de
 * `src/lib/core/auth.ts` guarda o objeto `account` inteiro do Google (`id_token`,
 * `access_token`, `refresh_token`, scopes). O que chega no navegador é
 * `next-auth.session-token.0`, `.1`, … e nenhum pedaço isolado é legível.
 *
 * A ordenação é **numérica**, não alfabética: com onze ou mais pedaços, ordenar como texto
 * põe `.10` logo depois de `.1` e o valor remontado sai embaralhado — falha que aparece só
 * quando a sessão cresce, e como "token inválido", não como "ordem errada".
 *
 * O valor devolvido é um **JWE cifrado** (`dir` + `A256GCM`), não um JWT legível. Quem o abre
 * é o `decode` do `next-auth/jwt`, com a `NEXTAUTH_SECRET`. `jwt-decode` não serve aqui.
 */
export function readNextAuthSessionToken(req: Request): string | null {
    const cookies = parseCookies(req);

    for (const base of NEXTAUTH_COOKIE_NAMES) {
        const inteiro = cookies.get(base);
        if (inteiro) return inteiro;

        const pedacos: Array<{ indice: number; valor: string }> = [];

        for (const [nome, valor] of cookies) {
            if (!nome.startsWith(`${base}.`)) continue;

            const sufixo = nome.slice(base.length + 1);
            // Só sufixo inteiramente numérico: `.0`, `.1`, … Qualquer outra coisa é outro
            // cookie que por acaso começa igual, e concatenar lixo estraga a sessão inteira.
            if (!/^\d+$/.test(sufixo)) continue;

            pedacos.push({ indice: Number(sufixo), valor });
        }

        if (pedacos.length === 0) continue;

        return pedacos
            .sort((a, b) => a.indice - b.indice)
            .map((p) => p.valor)
            .join('');
    }

    return null;
}

function readCookie(req: Request, name: string): string | null {
    return parseCookies(req).get(name) ?? null;
}

function parseCookies(req: Request): Map<string, string> {
    const cookies = new Map<string, string>();
    const cookieHeader = req.headers.get('cookie');

    if (!cookieHeader) return cookies;

    for (const part of cookieHeader.split(';')) {
        const separator = part.indexOf('=');
        if (separator === -1) continue;

        const name = part.slice(0, separator).trim();
        const value = part.slice(separator + 1).trim();
        if (!name || !value) continue;

        cookies.set(name, decodeCookieValue(value));
    }

    return cookies;
}

/**
 * Um pedaço de cookie fragmentado pode terminar no meio de um `%XX` e derrubar o
 * `decodeURIComponent`. Nesse caso o valor cru já é o correto — o JWE do NextAuth é
 * base64url e não tem nada a decodificar.
 */
function decodeCookieValue(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}
