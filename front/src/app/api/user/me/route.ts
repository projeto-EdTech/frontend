import { NextResponse } from 'next/server';
import { readUserToken } from '@/app/service/sessionToken';
import { decodeJWT, normalizeTier, isTokenExpired } from '@/app/service/jwtDecoder';

/**
 * Claims de exibição do aluno logado.
 *
 * Existe para o navegador **não precisar do JWT na mão**. O token vive só no cookie `user_data`
 * HttpOnly, que o JavaScript não consegue ler — é o que impede um script na página (dependência
 * comprometida, extensão, XSS) de levar a sessão do aluno embora numa linha. Quando a tela
 * precisa do tier ou da preferência de newsletter, quem lê o cookie, decodifica e responde é o
 * servidor.
 *
 * Devolve **apenas** os campos abaixo. Nada de `token`, `exp`, `iat` ou payload cru: se o JWT
 * voltasse por aqui, o cliente teria como guardá-lo de novo e a proteção seria só aparente.
 *
 * A decodificação usa `jwtDecoder.ts`, o único lugar do projeto autorizado a ler JWT
 * (regra do `CLAUDE.md`).
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
    const userToken = readUserToken(request);

    if (!userToken) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const decoded = decodeJWT(userToken);

    if (!decoded) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // `exp` ausente não invalida: nem todo JWT do backend carrega o claim, e esta rota não
    // libera acesso a nada — quem julga a validade do token de verdade é o BFF Java, a cada
    // requisição. Mas `exp` vencido é resposta clara e não custa nada respeitar.
    if (decoded.exp && isTokenExpired(userToken)) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const claims: UserClaims = {
        id: typeof decoded.id === 'string' ? decoded.id : null,
        nome: typeof decoded.nome === 'string' ? decoded.nome : null,
        email: typeof decoded.email === 'string' ? decoded.email : null,
        tier: normalizeTier(decoded.tipo),
        // Duas grafias circulam no código (`newsletter` na interface do payload, `newsLetter` no
        // botão do blog) e a que o backend emite não está confirmada. Aceita as duas: errar aqui
        // faria o botão de newsletter mostrar o estado oposto do real.
        newsletter: decoded.newsletter === true || decoded.newsLetter === true,
    };

    return NextResponse.json(claims, {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
    });
}
