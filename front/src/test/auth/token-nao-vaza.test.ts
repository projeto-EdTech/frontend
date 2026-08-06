import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { jwtFalso } from './jwtFalso';

const mocks = vi.hoisted(() => ({
    getToken: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

/**
 * As duas rotas que recebem um JWT do backend **gravam o cookie e não devolvem o token**.
 *
 * É aqui que o desvio D2 nasce ou morre. Enquanto `/api/sync-user` e `/api/subscriptions/activate`
 * devolviam o JWT no corpo, o cliente tinha o token na mão e o guardava no `localStorage` — e
 * qualquer script na página o lia numa linha. Apagar a gravação sem fechar a torneira só adiaria
 * o problema até alguém reintroduzir o `setItem`.
 *
 * O cookie `user_data` continua sendo gravado, HttpOnly: é ele que faz o passo 10 do fluxo valer
 * (o tier muda sem o aluno relogar).
 */

const BFF = 'https://bff.example';
const JWT_NOVO = jwtFalso({ id: 'uuid-do-aluno', email: 'maria@example.com', tipo: 'Simula PRO' });

function respostaBff(status: number, data: unknown): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('BACKEND_API_URL', BFF);
    vi.stubEnv('NEXTAUTH_SECRET', 'segredo-de-teste');
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('POST /api/sync-user', () => {
    beforeEach(() => {
        mocks.getToken.mockResolvedValue({ googleAccount: { id_token: 'id-token-do-google' } });
        fetchMock.mockResolvedValue(respostaBff(200, { token: JWT_NOVO }));
    });

    function buildRequest(): Request {
        return new Request('http://localhost:3000/api/sync-user', { method: 'POST' });
    }

    it('grava o cookie user_data HttpOnly', async () => {
        const { POST } = await import('@/app/api/sync-user/route');
        const response = await POST(buildRequest());

        const cookie = response.cookies.get('user_data');

        expect(cookie?.value).toBe(JWT_NOVO);
        expect(cookie?.httpOnly).toBe(true);
        expect(cookie?.path).toBe('/');
    });

    it('**não devolve o JWT no corpo**', async () => {
        const { POST } = await import('@/app/api/sync-user/route');
        const response = await POST(buildRequest());
        const json = await response.json();

        expect(JSON.stringify(json)).not.toContain(JWT_NOVO);
        expect(json).not.toHaveProperty('token');
    });

    it('devolve só o que o cliente usa para analytics', async () => {
        const { POST } = await import('@/app/api/sync-user/route');
        const json = await (await POST(buildRequest())).json();

        expect(json).toMatchObject({ ok: true, id: 'uuid-do-aluno', tipo: 'Simula PRO' });
    });

    it('backend devolvendo o JWT como string crua também vira cookie, e não corpo', async () => {
        fetchMock.mockResolvedValue(
            new Response(JWT_NOVO, { status: 200, headers: { 'Content-Type': 'text/plain' } })
        );

        const { POST } = await import('@/app/api/sync-user/route');
        const response = await POST(buildRequest());

        expect(response.cookies.get('user_data')?.value).toBe(JWT_NOVO);
        expect(JSON.stringify(await response.json())).not.toContain(JWT_NOVO);
    });

    it('erro do backend não vaza detalhe interno ao navegador', async () => {
        fetchMock.mockResolvedValue(
            respostaBff(500, { message: 'java.lang.NullPointerException em 10.0.0.7' })
        );

        const { POST } = await import('@/app/api/sync-user/route');
        const response = await POST(buildRequest());
        const corpo = JSON.stringify(await response.json());

        expect(response.status).toBe(500);
        expect(corpo).not.toContain('NullPointerException');
        expect(corpo).not.toContain('10.0.0.7');
    });
});

describe('POST /api/subscriptions/activate', () => {
    const PEDIDO = { gateway: 'stripe', paymentId: 'pi_123' };

    function buildRequest(): Request {
        return new Request('http://localhost:3000/api/subscriptions/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', cookie: 'user_data=jwt.do.aluno' },
            body: JSON.stringify(PEDIDO),
        });
    }

    beforeEach(() => {
        mocks.getToken.mockResolvedValue({ email: 'maria@example.com' });
        fetchMock.mockResolvedValue(
            respostaBff(200, {
                activated: true,
                status: 'paid',
                tier: 'Simula PRO',
                expiresAt: null,
                token: JWT_NOVO,
            })
        );
    });

    it('grava o cookie com o JWT novo', async () => {
        const { POST } = await import('@/app/api/subscriptions/activate/route');
        const response = await POST(buildRequest());

        expect(response.cookies.get('user_data')?.value).toBe(JWT_NOVO);
        expect(response.cookies.get('user_data')?.httpOnly).toBe(true);
    });

    it('**não devolve o JWT no corpo**', async () => {
        const { POST } = await import('@/app/api/subscriptions/activate/route');
        const json = await (await POST(buildRequest())).json();

        expect(JSON.stringify(json)).not.toContain(JWT_NOVO);
        expect(json).not.toHaveProperty('token');
    });

    it('o resto da resposta continua chegando inteiro', async () => {
        const { POST } = await import('@/app/api/subscriptions/activate/route');
        const json = await (await POST(buildRequest())).json();

        expect(json).toMatchObject({ activated: true, status: 'paid', tier: 'Simula PRO' });
    });

    it('202 pendente também não carrega token', async () => {
        fetchMock.mockResolvedValue(
            respostaBff(202, { activated: false, status: 'pending', token: JWT_NOVO })
        );

        const { POST } = await import('@/app/api/subscriptions/activate/route');
        const response = await POST(buildRequest());
        const json = await response.json();

        expect(response.status).toBe(202);
        expect(response.cookies.get('user_data')).toBeUndefined();
        expect(json).not.toHaveProperty('token');
    });
});
