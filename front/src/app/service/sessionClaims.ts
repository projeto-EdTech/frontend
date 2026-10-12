import { decode as decodeNextAuthSession } from 'next-auth/jwt';
import { readUserToken, readNextAuthSessionToken } from '@/app/service/sessionToken';
import { decodeJWT, normalizeTier, isTokenExpired, type Tier } from '@/app/service/jwtDecoder';

/**
 * Claims do aluno logado, lidos no servidor a partir dos cookies da requisição.
 *
 * Saiu de dentro de `/api/user/me` para que toda rota que precise do tier decida pelo mesmo
 * caminho — a explicação de gabarito por IA libera ou conta cota a partir daqui. Duas leituras
 * de sessão divergindo é exatamente o tipo de bug que fazia o aluno ser PRO numa tela e FREE
 * na seguinte.
 *
 * ## Duas fontes de sessão, nesta ordem
 *
 * 1. **`user_data`** — o JWT do BFF Java, gravado por `/api/sync-user`. Fonte completa e
 *    preferida: só ela tem o `id` do aluno no banco, o `tipo` confirmado pelo backend e a
 *    preferência de newsletter.
 * 2. **`next-auth.session-token`** — a sessão do NextAuth. Entra como *fallback* quando o
 *    `user_data` não existe ou não decodifica, o que acontece sempre que o `/api/sync-user`
 *    falha. Esse cookie é um **JWE cifrado**: quem o abre é o `decode` do `next-auth/jwt`, com a
 *    `NEXTAUTH_SECRET` — `jwt-decode` devolveria `null`.
 *
 * O que a fonte 2 **não** entrega, e por quê:
 *
 * | Campo | Valor | Motivo |
 * |---|---|---|
 * | `id` | sempre `null` | o `sub` do NextAuth é a conta Google, não o aluno no banco. Preencher com ele faria `SyncUserEffect` julgar a sessão sincronizada e nunca mais tentar gravar o `user_data` |
 * | `newsletter` | sempre `false` | o claim não existe na sessão do NextAuth |
 * | `tier` | `token.tier` normalizado | não expõe nada novo |
 *
 * CACHE STRATEGY: não se aplica — leitura por requisição, sem estado
 */

export interface UserClaims {
    id: string | null;
    nome: string | null;
    email: string | null;
    /** Já normalizado — a grafia que o BFF emite em `tipo` não é problema do cliente. */
    tier: Tier;
    newsletter: boolean;
}

export type ClaimsSource = 'user_data' | 'next-auth';

export interface SessionClaims {
    claims: UserClaims;
    source: ClaimsSource;
}

/** Claims da sessão, ou `null` quando nenhuma das duas fontes tem sessão válida. */
export async function readSessionClaims(request: Request): Promise<SessionClaims | null> {
    const doBff = lerClaimsDoUserData(request);
    if (doBff) return { claims: doBff, source: 'user_data' };

    const doNextAuth = await lerClaimsDoNextAuth(request);
    if (doNextAuth) return { claims: doNextAuth, source: 'next-auth' };

    return null;
}

/** Fonte 1: o JWT do BFF Java. `null` quando o cookie não existe, não decodifica ou venceu. */
function lerClaimsDoUserData(request: Request): UserClaims | null {
    const userToken = readUserToken(request);

    if (!userToken) return null;

    const decoded = decodeJWT(userToken);

    if (!decoded) return null;

    // `exp` ausente não invalida: nem todo JWT do backend carrega o claim, e quem julga a
    // validade do token de verdade é o BFF Java, a cada requisição. Mas `exp` vencido é
    // resposta clara e não custa nada respeitar.
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
        // erro do servidor — é ausência de sessão válida.
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
