import { NextResponse } from 'next/server';
import { readSessionClaims, type ClaimsSource, type UserClaims } from '@/app/service/sessionClaims';

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
 * O cookie do NextAuth pode chegar **fragmentado** — `next-auth.session-token.0`, `.1`, … —
 * quando o valor passa dos 4096 bytes que o navegador aceita por cookie. Era o caso de toda
 * sessão até o callback `jwt` deixar de guardar o `account` inteiro do Google; sessões antigas
 * ainda chegam assim até expirar. Quem remonta é `readNextAuthSessionToken`, em
 * `sessionToken.ts`.
 *
 * Remontar não basta para ler: esse cookie é um **JWE cifrado** (`dir` + `A256GCM`), não um
 * JWT assinado. `jwt-decode` devolveria `null` — quem o abre é o `decode` do `next-auth/jwt`,
 * com a `NEXTAUTH_SECRET`. Por isso a regra "só o `jwtDecoder` lê JWT" continua valendo sem
 * exceção: o `jwtDecoder` cuida do token do Java, e o token do NextAuth não é JWT.
 *
 * A leitura das duas fontes mora em `src/app/service/sessionClaims.ts`, compartilhada com
 * `/api/generate-explanation` — as duas rotas decidem o tier pelo mesmo caminho.
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

export type { UserClaims } from '@/app/service/sessionClaims';

export async function GET(request: Request) {
    const sessao = await readSessionClaims(request);

    if (!sessao) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    return responder(sessao.claims, sessao.source);
}

function responder(claims: UserClaims, fonte: ClaimsSource) {
    return NextResponse.json(claims, {
        status: 200,
        headers: {
            'Cache-Control': 'no-store',
            'X-Claims-Source': fonte,
        },
    });
}
