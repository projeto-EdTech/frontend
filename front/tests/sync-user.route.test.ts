/**
 * Specs para o route handler POST /api/sync-user.
 *
 * Esta rota é a única que grava o cookie `user_data` no login. Quando ela falha em silêncio,
 * o aplicativo inteiro se comporta como deslogado — 401 em `/api/user/me` e em todas as telas
 * que dependem da sessão — sem nada na tela que aponte a causa. Os casos abaixo cobrem os três
 * modos de falha que já custaram depuração: BFF inalcançável, BFF respondendo em formato
 * inesperado, e valor gravado no cookie que não é um JWT.
 *
 * Segue o padrão de `generate-token.route.test.ts`: Vitest, ambiente node, `fetch` global
 * dublado e `getToken` do NextAuth mockado.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getToken } from 'next-auth/jwt';
import { POST } from '../src/app/api/sync-user/route';

vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));

const getTokenMock = vi.mocked(getToken);

/** JWT de mentira: assinatura irrelevante, só o payload precisa decodificar. */
function makeJwt(payload: Record<string, unknown>): string {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`;
}

const JWT_DO_BFF = makeJwt({
    id: 'aluno-123',
    nome: 'Fulano',
    email: 'fulano@exemplo.com',
    tipo: 'Simula PRO',
});

function makeReq(): Request {
    return new Request('http://localhost/api/sync-user', { method: 'POST' });
}

/** Token do NextAuth com o `id_token` do Google — o caminho feliz da rota. */
function tokenComIdToken() {
    return { googleAccount: { id_token: 'id-token-do-google' } };
}

function bffJson(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

function bffTexto(status: number, body: string): Response {
    return new Response(body, {
        status,
        headers: { 'content-type': 'text/plain' },
    });
}

let fetchMock: ReturnType<typeof vi.fn>;
let logs: string[];

beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://bff.local:8081';
    process.env.NEXTAUTH_SECRET = 'segredo-de-teste';

    getTokenMock.mockReset();
    getTokenMock.mockResolvedValue(tokenComIdToken() as never);

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    // Captura tudo que a rota escreve no console: o caso 12 prova que o JWT nunca aparece ali.
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
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('POST /api/sync-user — sessão ausente', () => {
    it('1. devolve 401 e não grava cookie quando não há googleAccount', async () => {
        getTokenMock.mockResolvedValue({} as never);

        const res = await POST(makeReq());

        expect(res.status).toBe(401);
        expect(res.cookies.get('user_data')).toBeUndefined();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('2. devolve 401 e não grava cookie quando googleAccount não traz id_token', async () => {
        getTokenMock.mockResolvedValue({ googleAccount: {} } as never);

        const res = await POST(makeReq());

        expect(res.status).toBe(401);
        expect(res.cookies.get('user_data')).toBeUndefined();
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('POST /api/sync-user — configuração', () => {
    it('3. devolve 500 quando BACKEND_API_URL não está definida', async () => {
        delete process.env.BACKEND_API_URL;

        const res = await POST(makeReq());

        expect(res.status).toBe(500);
        expect(res.cookies.get('user_data')).toBeUndefined();
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('POST /api/sync-user — BFF inalcançável', () => {
    it('4. devolve 504 quando o fetch falha por rede, sem vazar host nem stack', async () => {
        const erroDeRede = new TypeError('fetch failed');
        (erroDeRede as unknown as { cause: unknown }).cause = {
            code: 'UND_ERR_CONNECT_TIMEOUT',
            message: 'Connect Timeout Error (attempted address: 26.251.198.75:8081)',
        };
        fetchMock.mockRejectedValue(erroDeRede);

        const res = await POST(makeReq());
        const body = JSON.stringify(await res.json());

        expect(res.status).toBe(504);
        expect(res.cookies.get('user_data')).toBeUndefined();
        expect(body).not.toContain('bff.local');
        expect(body).not.toContain('26.251.198.75');
        expect(body).not.toContain('UND_ERR');
        // O diagnóstico existe — mas só no log do servidor.
        expect(logs.join('\n')).toContain('[sync-user][NET]');
        expect(logs.join('\n')).toContain('UND_ERR_CONNECT_TIMEOUT');
    });

    it('5. devolve 504 quando o BFF pendura e o timeout dispara', async () => {
        fetchMock.mockRejectedValue(
            new DOMException('The operation was aborted due to timeout', 'TimeoutError'),
        );

        const res = await POST(makeReq());

        expect(res.status).toBe(504);
        expect(res.cookies.get('user_data')).toBeUndefined();
        expect(logs.join('\n')).toContain('[sync-user][NET]');
    });

    it('5b. passa um AbortSignal ao fetch para não depender do timeout padrão do undici', async () => {
        fetchMock.mockResolvedValue(bffJson(200, { token: JWT_DO_BFF }));

        await POST(makeReq());

        const init = fetchMock.mock.calls[0][1] as RequestInit;
        expect(init.signal).toBeInstanceOf(AbortSignal);
    });
});

describe('POST /api/sync-user — BFF respondeu com erro', () => {
    it('6. relaya o status do BFF sem repassar o corpo interno', async () => {
        fetchMock.mockResolvedValue(
            bffJson(401, {
                message: 'br.com.vestibuline.AuthException em 10.0.0.5',
                stack: 'at br.com.vestibuline...',
            }),
        );

        const res = await POST(makeReq());
        const body = JSON.stringify(await res.json());

        expect(res.status).toBe(401);
        expect(res.cookies.get('user_data')).toBeUndefined();
        expect(body).not.toContain('vestibuline.AuthException');
        expect(body).not.toContain('10.0.0.5');
        expect(body).not.toContain('at br.com');
    });

    it('6b. relaya 500 do BFF como 500, distinguindo no log de erro de rede', async () => {
        fetchMock.mockResolvedValue(bffJson(500, { message: 'boom' }));

        const res = await POST(makeReq());

        expect(res.status).toBe(500);
        expect(logs.join('\n')).toContain('[sync-user][BFF]');
        expect(logs.join('\n')).not.toContain('[sync-user][NET]');
    });
});

describe('POST /api/sync-user — caminho feliz', () => {
    it('7. grava o cookie quando o BFF devolve o JWT como string crua', async () => {
        fetchMock.mockResolvedValue(bffTexto(200, JWT_DO_BFF));

        const res = await POST(makeReq());
        const cookie = res.cookies.get('user_data');

        expect(res.status).toBe(200);
        expect(cookie?.value).toBe(JWT_DO_BFF);
        expect(cookie?.httpOnly).toBe(true);
        expect(cookie?.sameSite).toBe('lax');
        expect(cookie?.path).toBe('/');
        expect(cookie?.maxAge).toBe(30 * 24 * 60 * 60);
    });

    it('7b. não devolve o JWT no corpo — só o que o cliente usa nos analytics', async () => {
        fetchMock.mockResolvedValue(bffJson(200, { token: JWT_DO_BFF }));

        const res = await POST(makeReq());
        const body = await res.json();

        expect(body).toEqual({ ok: true, id: 'aluno-123', tipo: 'Simula PRO' });
        expect(JSON.stringify(body)).not.toContain(JWT_DO_BFF);
    });

    it('8. grava o cookie quando o BFF devolve { token }', async () => {
        fetchMock.mockResolvedValue(bffJson(200, { token: JWT_DO_BFF }));

        const res = await POST(makeReq());

        expect(res.status).toBe(200);
        expect(res.cookies.get('user_data')?.value).toBe(JWT_DO_BFF);
    });

    it.each([
        ['{ accessToken }', { accessToken: JWT_DO_BFF }],
        ['{ jwt }', { jwt: JWT_DO_BFF }],
        ['{ data: { token } }', { data: { token: JWT_DO_BFF } }],
    ])('9. grava o cookie quando o BFF devolve %s', async (_nome, corpo) => {
        fetchMock.mockResolvedValue(bffJson(200, corpo));

        const res = await POST(makeReq());

        expect(res.status).toBe(200);
        expect(res.cookies.get('user_data')?.value).toBe(JWT_DO_BFF);
    });
});

describe('POST /api/sync-user — resposta do BFF em formato inesperado', () => {
    it('10. devolve 502 e não finge sucesso quando não acha o JWT na resposta', async () => {
        fetchMock.mockResolvedValue(bffJson(200, { usuario: { id: 'aluno-123' } }));

        const res = await POST(makeReq());
        const body = await res.json();

        expect(res.status).toBe(502);
        expect(res.cookies.get('user_data')).toBeUndefined();
        // A armadilha antiga: 200 com { ok: false }, que o cliente engolia calado.
        expect(body).not.toHaveProperty('ok', false);
        expect(logs.join('\n')).toContain('[sync-user][SHAPE]');
        // O log ajuda a descobrir o formato certo sem expor valores.
        expect(logs.join('\n')).toContain('usuario');
    });

    it('11. apara o prefixo Bearer antes de gravar o cookie', async () => {
        fetchMock.mockResolvedValue(bffJson(200, { token: `Bearer ${JWT_DO_BFF}` }));

        const res = await POST(makeReq());

        expect(res.status).toBe(200);
        expect(res.cookies.get('user_data')?.value).toBe(JWT_DO_BFF);
    });

    it('11b. nunca grava "[object Object]" quando o token vem como objeto', async () => {
        fetchMock.mockResolvedValue(bffJson(200, { token: { valor: JWT_DO_BFF } }));

        const res = await POST(makeReq());

        expect(res.status).toBe(502);
        expect(res.cookies.get('user_data')).toBeUndefined();
        expect(res.headers.get('set-cookie') ?? '').not.toContain('object Object');
    });

    it('11c. devolve 502 quando o valor recebido não decodifica como JWT', async () => {
        fetchMock.mockResolvedValue(bffJson(200, { token: 'eyJhbGciOiJIUzI1NiJ9.@@@@.sig' }));

        const res = await POST(makeReq());

        expect(res.status).toBe(502);
        expect(res.cookies.get('user_data')).toBeUndefined();
    });
});

describe('POST /api/sync-user — o JWT nunca vai para o log', () => {
    it.each([
        ['sucesso', () => bffJson(200, { token: JWT_DO_BFF })],
        ['formato inesperado', () => bffJson(200, { token: { valor: JWT_DO_BFF } })],
    ])('12. nenhum console.* contém o JWT no caminho de %s', async (_nome, resposta) => {
        fetchMock.mockResolvedValue(resposta());

        await POST(makeReq());

        const tudo = logs.join('\n');
        expect(tudo).not.toContain(JWT_DO_BFF);
        // Nem o começo dele: a regra do CLAUDE.md proíbe até os primeiros caracteres.
        expect(tudo).not.toContain(JWT_DO_BFF.slice(0, 16));
    });

    it('12b. o id_token do Google também não vaza para o log', async () => {
        fetchMock.mockResolvedValue(bffJson(200, { token: JWT_DO_BFF }));

        await POST(makeReq());

        expect(logs.join('\n')).not.toContain('id-token-do-google');
    });
});
