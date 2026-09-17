/**
 * Specs para o route handler GET /api/user/me.
 *
 * A rota tem duas fontes de sessão, nesta ordem:
 *
 * 1. `user_data` — o JWT do BFF Java, gravado por `/api/sync-user`. Fonte completa: traz o
 *    `id` do aluno no banco, o `tipo` e a preferência de newsletter.
 * 2. `next-auth.session-token` — a sessão do NextAuth. Existe sempre que o aluno passou pelo
 *    OAuth, mesmo quando o `sync-user` falhou, e é o que sustenta nome, e-mail e tier na tela
 *    enquanto o `user_data` não chega.
 *
 * A fonte 2 é **fragmentada** pelo NextAuth quando passa de ~3900 bytes — o que acontece neste
 * projeto, porque o callback `jwt` guarda o objeto `account` inteiro do Google. O cookie vira
 * `next-auth.session-token.0`, `.1`, … e só volta a ser legível depois de concatenado na ordem
 * numérica do sufixo. Esses são os casos 5–9 abaixo.
 *
 * A fonte 2 é **criptografada** (JWE `dir` + `A256GCM`): `jwt-decode` não a lê, só o `decode`
 * do próprio NextAuth. Por isso os testes cifram de verdade com `encode`, em vez de dublar.
 *
 * Segue o padrão de `sync-user.route.test.ts`: Vitest, ambiente node.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { encode } from 'next-auth/jwt';
import { GET } from '../src/app/api/user/me/route';

const SEGREDO = 'segredo-de-teste-para-o-nextauth-1234567890';

/** JWT de mentira do BFF: assinatura irrelevante, só o payload precisa decodificar. */
function makeJwt(payload: Record<string, unknown>): string {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`;
}

const JWT_DO_BFF = makeJwt({
    id: 'aluno-123',
    nome: 'Fulano do Java',
    email: 'fulano@exemplo.com',
    tipo: 'Simula PRO',
    newsletter: true,
    exp: Math.floor(Date.now() / 1000) + 3600,
});

/** Sessão do NextAuth no formato que `src/lib/core/auth.ts` monta. */
function tokenDoNextAuth(over: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        user: { name: 'Fulano do NextAuth', email: 'fulano@exemplo.com' },
        tier: 'Simula PRO',
        // O callback `jwt` guarda o `account` inteiro — é isto que estoura os 4KB do cookie.
        googleAccount: { id_token: 'x'.repeat(1200), access_token: 'y'.repeat(1200) },
        ...over,
    };
}

/**
 * Cifra de verdade, com o mesmo `encode` que o NextAuth usa para escrever o cookie. Dublar o
 * `decode` esconderia justamente o que estes testes existem para provar: que o valor remontado
 * dos chunks ainda é um JWE decifrável.
 */
async function cifrar(
    payload: Record<string, unknown> = tokenDoNextAuth(),
    { secret = SEGREDO, maxAge }: { secret?: string; maxAge?: number } = {},
): Promise<string> {
    return encode({ token: payload, secret, ...(maxAge === undefined ? {} : { maxAge }) });
}

/** Reproduz o fatiamento do NextAuth: pedaços de `tamanho` chars, sufixados `.0`, `.1`, … */
function fatiar(nomeBase: string, valor: string, tamanho: number): Array<[string, string]> {
    const partes: Array<[string, string]> = [];
    for (let i = 0; i * tamanho < valor.length; i++) {
        partes.push([`${nomeBase}.${i}`, valor.slice(i * tamanho, (i + 1) * tamanho)]);
    }
    return partes;
}

function makeReq(cookies: Array<[string, string]>): Request {
    const header = cookies.map(([nome, valor]) => `${nome}=${valor}`).join('; ');
    return new Request('http://localhost/api/user/me', {
        headers: header ? { cookie: header } : {},
    });
}

let logs: string[];

beforeEach(() => {
    process.env.NEXTAUTH_SECRET = SEGREDO;

    logs = [];
    const capturar =
        () =>
        (...args: unknown[]) => {
            logs.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
        };
    vi.spyOn(console, 'log').mockImplementation(capturar());
    vi.spyOn(console, 'warn').mockImplementation(capturar());
    vi.spyOn(console, 'error').mockImplementation(capturar());
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('GET /api/user/me — sem sessão', () => {
    it('1. devolve 401 quando não há cookie nenhum', async () => {
        const res = await GET(makeReq([]));

        expect(res.status).toBe(401);
    });

    it('2. devolve 401 quando só há cookies alheios à sessão', async () => {
        const res = await GET(
            makeReq([
                ['next-auth.csrf-token', 'abc%7Cdef'],
                ['next-auth.callback-url', 'http%3A%2F%2Flocalhost%3A3000'],
            ]),
        );

        expect(res.status).toBe(401);
    });
});

describe('GET /api/user/me — user_data (JWT do BFF) tem precedência', () => {
    it('3. responde com as claims do Java quando o cookie user_data existe', async () => {
        const res = await GET(makeReq([['user_data', JWT_DO_BFF]]));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({
            id: 'aluno-123',
            nome: 'Fulano do Java',
            email: 'fulano@exemplo.com',
            tier: 'SIMULAPRO',
            newsletter: true,
        });
        expect(res.headers.get('x-claims-source')).toBe('user_data');
    });

    it('4. ignora a sessão do NextAuth quando user_data está presente', async () => {
        const sessao = await cifrar(tokenDoNextAuth({ tier: 'FREE' }));

        const res = await GET(
            makeReq([['user_data', JWT_DO_BFF], ...fatiar('next-auth.session-token', sessao, 900)]),
        );
        const body = await res.json();

        expect(body.id).toBe('aluno-123');
        expect(body.tier).toBe('SIMULAPRO');
    });
});

describe('GET /api/user/me — sessão do NextAuth fragmentada', () => {
    it('5. junta next-auth.session-token.0 e .1 e responde 200', async () => {
        const sessao = await cifrar();
        const partes = fatiar('next-auth.session-token', sessao, Math.ceil(sessao.length / 2));

        // Guarda de sanidade: se o payload parar de estourar o limite, o teste vira tautologia.
        expect(partes.length).toBe(2);

        const res = await GET(makeReq(partes));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.nome).toBe('Fulano do NextAuth');
        expect(body.email).toBe('fulano@exemplo.com');
        expect(body.tier).toBe('SIMULAPRO');
        expect(res.headers.get('x-claims-source')).toBe('next-auth');
    });

    it('6. também aceita o cookie inteiro, sem sufixo', async () => {
        const sessao = await cifrar();

        const res = await GET(makeReq([['next-auth.session-token', sessao]]));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.email).toBe('fulano@exemplo.com');
    });

    it('7. ordena pelo sufixo, não pela ordem em que os chunks chegam no header', async () => {
        const sessao = await cifrar();
        const partes = fatiar('next-auth.session-token', sessao, 700);

        expect(partes.length).toBeGreaterThan(2);

        const res = await GET(makeReq([...partes].reverse()));

        expect(res.status).toBe(200);
    });

    it('8. ordena numericamente: .10 vem depois de .9, não depois de .1', async () => {
        const sessao = await cifrar();
        // Fatias pequenas o bastante para passar de 10 pedaços e expor ordenação lexicográfica.
        const partes = fatiar('next-auth.session-token', sessao, 200);

        expect(partes.length).toBeGreaterThan(10);

        const res = await GET(makeReq(partes));

        expect(res.status).toBe(200);
    });

    it('9. reconhece o nome com prefixo __Secure- usado em produção', async () => {
        const sessao = await cifrar();
        const partes = fatiar('__Secure-next-auth.session-token', sessao, 900);

        const res = await GET(makeReq(partes));

        expect(res.status).toBe(200);
        expect(res.headers.get('x-claims-source')).toBe('next-auth');
    });
});

describe('GET /api/user/me — sessão do NextAuth ilegível', () => {
    it('10. devolve 401, e não 500, quando falta um chunk', async () => {
        const sessao = await cifrar();
        const partes = fatiar('next-auth.session-token', sessao, 900);

        const res = await GET(makeReq(partes.slice(0, -1)));

        expect(res.status).toBe(401);
    });

    it('11. devolve 401 quando o segredo não confere', async () => {
        const sessao = await cifrar(tokenDoNextAuth(), { secret: 'outro-segredo-qualquer' });

        const res = await GET(makeReq(fatiar('next-auth.session-token', sessao, 900)));

        expect(res.status).toBe(401);
    });

    it('12. devolve 401 quando a sessão do NextAuth está expirada', async () => {
        const sessao = await cifrar(tokenDoNextAuth(), { maxAge: -60 });

        const res = await GET(makeReq([['next-auth.session-token', sessao]]));

        expect(res.status).toBe(401);
    });

    it('13. devolve 401 quando NEXTAUTH_SECRET não está configurada', async () => {
        const sessao = await cifrar();
        delete process.env.NEXTAUTH_SECRET;

        const res = await GET(makeReq(fatiar('next-auth.session-token', sessao, 900)));

        expect(res.status).toBe(401);
    });

    it('14. cai na sessão do NextAuth quando user_data existe mas não decodifica', async () => {
        const sessao = await cifrar();

        const res = await GET(
            makeReq([
                ['user_data', 'nao-e-um-jwt'],
                ...fatiar('next-auth.session-token', sessao, 900),
            ]),
        );
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.nome).toBe('Fulano do NextAuth');
    });
});

describe('GET /api/user/me — contrato da resposta', () => {
    it('15. id é null na sessão do NextAuth, para o SyncUserEffect seguir tentando sincronizar', async () => {
        const sessao = await cifrar();

        const res = await GET(makeReq(fatiar('next-auth.session-token', sessao, 900)));
        const body = await res.json();

        // `SyncUserEffect` só pula o sync quando `claims.id` é truthy. Preencher o `id` com o
        // `sub` do Google faria o aluno ficar preso sem nunca gravar o `user_data`.
        expect(body.id).toBeNull();
    });

    it('16. newsletter é false na sessão do NextAuth — o claim não existe lá', async () => {
        const sessao = await cifrar();

        const res = await GET(makeReq(fatiar('next-auth.session-token', sessao, 900)));
        const body = await res.json();

        expect(body.newsletter).toBe(false);
    });

    it('17. tier desconhecido cai para FREE em vez de liberar conteúdo pago', async () => {
        const sessao = await cifrar(tokenDoNextAuth({ tier: 'plano-inventado' }));

        const res = await GET(makeReq(fatiar('next-auth.session-token', sessao, 900)));
        const body = await res.json();

        expect(body.tier).toBe('FREE');
    });

    it('18. responde só os cinco campos de exibição, em qualquer fonte', async () => {
        const sessao = await cifrar();

        for (const cookies of [
            [['user_data', JWT_DO_BFF] as [string, string]],
            fatiar('next-auth.session-token', sessao, 900),
        ]) {
            const body = await (await GET(makeReq(cookies))).json();

            expect(Object.keys(body).sort()).toEqual([
                'email',
                'id',
                'newsletter',
                'nome',
                'tier',
            ]);
        }
    });

    it('19. nenhum token volta no corpo da resposta', async () => {
        const sessao = await cifrar();

        const corpoNextAuth = await (
            await GET(makeReq(fatiar('next-auth.session-token', sessao, 900)))
        ).text();
        const corpoJava = await (await GET(makeReq([['user_data', JWT_DO_BFF]]))).text();

        expect(corpoNextAuth).not.toContain(sessao.slice(0, 24));
        expect(corpoNextAuth).not.toContain('id_token');
        expect(corpoJava).not.toContain(JWT_DO_BFF.slice(0, 24));
    });

    it('20. nenhum token vai para o log', async () => {
        const sessao = await cifrar();

        await GET(makeReq(fatiar('next-auth.session-token', sessao, 900)));
        await GET(makeReq([['user_data', 'nao-e-um-jwt']]));

        const tudo = logs.join('\n');
        expect(tudo).not.toContain(sessao.slice(0, 16));
        expect(tudo).not.toContain(JWT_DO_BFF.slice(0, 16));
    });

    it('21. responde com Cache-Control no-store nas duas fontes', async () => {
        const sessao = await cifrar();

        const doJava = await GET(makeReq([['user_data', JWT_DO_BFF]]));
        const doNextAuth = await GET(makeReq(fatiar('next-auth.session-token', sessao, 900)));

        expect(doJava.headers.get('cache-control')).toContain('no-store');
        expect(doNextAuth.headers.get('cache-control')).toContain('no-store');
    });
});
