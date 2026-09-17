import { NextResponse } from 'next/server';
import { decode as decodeNextAuthSession } from 'next-auth/jwt';
import { readUserToken, readNextAuthSessionToken } from '@/app/service/sessionToken';
import { decodeJWT, normalizeTier, isTokenExpired } from '@/app/service/jwtDecoder';

/**
 * Claims de exibição do aluno logado.
 *
 * Existe para o navegador **não precisar do JWT na mão**. O token vive só em cookie HttpOnly,
 * que o JavaScript não consegue ler — é o que impede um script na página (dependência
 * comprometida, extensão, XSS) de levar a sessão do aluno embora numa linha. Quando a tela
 * precisa do tier ou da preferência de newsletter, quem lê o cookie, decodifica e responde é o
 * servidor.
 *
 * Devolve **apenas** os campos de `UserClaims`. Nada de `token`, `exp`, `iat` ou payload cru:
 * se o JWT voltasse por aqui, o cliente teria como guardá-lo de novo e a proteção seria só
 * aparente.
 *
 * ## Duas fontes de sessão, nesta ordem
 *
 * 1. **`user_data`** — o JWT do BFF Java, gravado por `/api/sync-user`. Fonte completa e
 *    preferida: só ela tem o `id` do aluno no banco, o `tipo` confirmado pelo backend e a
 *    preferência de newsletter.
 * 2. **`next-auth.session-token`** — a sessão do NextAuth. Entra como *fallback* quando o
 *    `user_data` não existe ou não decodifica, o que acontece sempre que o `/api/sync-user`
 *    falha (BFF fora do ar, endpoint divergente, `id_token` ausente). Sem ela, um aluno
 *    autenticado pelo OAuth aparece como deslogado na tela inteira só porque o Java não
 *    respondeu.
 *
 * O cookie do NextAuth chega **fragmentado** neste projeto — `next-auth.session-token.0`,
 * `.1`, … — porque o callback `jwt` guarda o objeto `account` inteiro do Google e o valor
 * passa dos 4096 bytes que o navegador aceita por cookie. Quem remonta é
 * `readNextAuthSessionToken`, em `sessionToken.ts`.
 *
 * Remontar não basta para ler: esse cookie é um **JWE cifrado** (`dir` + `A256GCM`), não um
 * JWT assinado. `jwt-decode` devolveria `null` — quem o abre é o `decode` do `next-auth/jwt`,
 * com a `NEXTAUTH_SECRET`. Por isso a regra "só o `jwtDecoder` lê JWT" continua valendo sem
 * exceção: o `jwtDecoder` cuida do token do Java, e o token do NextAuth não é JWT.
 *
 * O que a fonte 2 **não** entrega, e por quê:
 *
 * | Campo | Valor | Motivo |
 * |---|---|---|
 * | `id` | sempre `null` | o `sub` do NextAuth é a conta Google, não o aluno no banco. Preencher com ele faria `SyncUserEffect` julgar a sessão sincronizada e nunca mais tentar gravar o `user_data` |
 * | `newsletter` | sempre `false` | o claim não existe na sessão do NextAuth |
 * | `tier` | `token.tier` normalizado | o mesmo valor que `useUserTier` já usava como fallback pela sessão do cliente; não expõe nada novo |
 *
 * O header `X-Claims-Source` diz qual das duas respondeu. Existe para o diagnóstico não
 * depender de adivinhação: `next-auth` na resposta significa que o `user_data` não chegou, ou
 * seja, que o problema está no `/api/sync-user`, não aqui.
 *
 * CACHE STRATEGY: no-store — dado de sessão, muda com login, logout e ativação de tier
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface UserClaims {
    id: string | null;
    nome: string | null;
    email: string | null;
    /** Já normalizado — a grafia que o BFF emite em `tipo` não é problema do cliente. */
    tier: string;
    newsletter: boolean;
}

export async function GET(request: Request) {
    const claimsDoBff = lerClaimsDoUserData(request);

    if (claimsDoBff) {
        return responder(claimsDoBff, 'user_data');
    }

    const claimsDoNextAuth = await lerClaimsDoNextAuth(request);

    if (claimsDoNextAuth) {
        return responder(claimsDoNextAuth, 'next-auth');
    }

    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
}

/** Fonte 1: o JWT do BFF Java. `null` quando o cookie não existe, não decodifica ou venceu. */
function lerClaimsDoUserData(request: Request): UserClaims | null {
    const userToken = readUserToken(request);

    if (!userToken) return null;

    const decoded = decodeJWT(userToken);

    if (!decoded) return null;

    // `exp` ausente não invalida: nem todo JWT do backend carrega o claim, e esta rota não
    // libera acesso a nada — quem julga a validade do token de verdade é o BFF Java, a cada
    // requisição. Mas `exp` vencido é resposta clara e não custa nada respeitar.
    if (decoded.exp && isTokenExpired(userToken)) return null;

    return {
        id: typeof decoded.id === 'string' ? decoded.id : null,
        nome: typeof decoded.nome === 'string' ? decoded.nome : null,
        email: typeof decoded.email === 'string' ? decoded.email : null,
        tier: normalizeTier(decoded.tipo),
        // Duas grafias circulam no código (`newsletter` na interface do payload, `newsLetter` no
        // botão do blog) e a que o backend emite não está confirmada. Aceita as duas: errar aqui
        // faria o botão de newsletter mostrar o estado oposto do real.
        newsletter: decoded.newsletter === true || decoded.newsLetter === true,
    };
}

/** Fonte 2: a sessão do NextAuth, remontada dos chunks e decifrada. */
async function lerClaimsDoNextAuth(request: Request): Promise<UserClaims | null> {
    const sessionToken = readNextAuthSessionToken(request);
    const secret = process.env.NEXTAUTH_SECRET;

    if (!sessionToken || !secret) return null;

    let payload: Awaited<ReturnType<typeof decodeNextAuthSession>>;

    try {
        // Lança quando falta um chunk, o segredo não confere ou a sessão expirou. Nada disso é
        // erro do servidor — é ausência de sessão válida, e a resposta certa é 401.
        payload = await decodeNextAuthSession({ token: sessionToken, secret });
    } catch {
        return null;
    }

    if (!payload) return null;

    const user = payload.user as { name?: unknown; email?: unknown } | undefined;
    const nome = user?.name ?? payload.name;
    const email = user?.email ?? payload.email;

    return {
        // Nunca o `sub`: ver a tabela no cabeçalho deste arquivo.
        id: null,
        nome: typeof nome === 'string' ? nome : null,
        email: typeof email === 'string' ? email : null,
        tier: normalizeTier(payload.tier),
        newsletter: false,
    };
}

function responder(claims: UserClaims, fonte: 'user_data' | 'next-auth') {
    return NextResponse.json(claims, {
        status: 200,
        headers: {
            'Cache-Control': 'no-store',
            'X-Claims-Source': fonte,
        },
    });
}
