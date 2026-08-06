import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getToken: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({ getToken: mocks.getToken }));

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

/**
 * `POST /api/subscriptions/activate` como proxy fino — passos 6 e 10 do fluxo proposto.
 *
 * O navegador manda **só o identificador** da cobrança. Quem consulta a gateway, confere a
 * titularidade contra a sessão e ativa o tier no banco é o BFF Java; aqui só sobra o que é
 * mecânica do Next: exigir sessão, encaminhar, e gravar o JWT novo no cookie `user_data` para
 * o tier valer sem o aluno relogar.
 */

const BFF = 'https://bff.example';
const URL_ROTA = 'http://localhost:3000/api/subscriptions/activate';
const COOKIE_SESSAO = 'user_data=jwt.do.aluno';

function buildRequest(body: unknown, cookie: string | null = COOKIE_SESSAO): Request {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (cookie !== null) headers['cookie'] = cookie;

    return new Request(URL_ROTA, { method: 'POST', headers, body: JSON.stringify(body) });
}

function respostaBff(status: number, data: unknown): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

const PEDIDO = { gateway: 'stripe', paymentId: 'pi_123' };

describe('POST /api/subscriptions/activate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('BACKEND_API_URL', BFF);
        vi.stubEnv('NEXTAUTH_SECRET', 'segredo-de-teste');
        mocks.getToken.mockResolvedValue({ email: 'aluno@example.com' });
        fetchMock.mockResolvedValue(
            respostaBff(200, {
                activated: true,
                status: 'paid',
                tier: 'Simula PRO',
                expiresAt: null,
                token: 'jwt.novo.com.tier',
            })
        );
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('porteiro', () => {
        it('401 sem sessão NextAuth, sem chamar o BFF', async () => {
            mocks.getToken.mockResolvedValue(null);

            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO));

            expect(response.status).toBe(401);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('401 sem o JWT do backend — é ele que autentica no BFF', async () => {
            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO, null));

            expect(response.status).toBe(401);
            expect(fetchMock).not.toHaveBeenCalled();
        });
    });

    describe('encaminhamento', () => {
        it('manda gateway e paymentId ao BFF com o JWT do aluno', async () => {
            const { POST } = await import('@/app/api/subscriptions/activate/route');

            await POST(buildRequest(PEDIDO));

            const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

            expect(url).toBe(`${BFF}/subscriptions/activate`);
            expect(init.method).toBe('POST');
            expect(init.cache).toBe('no-store');
            expect(new Headers(init.headers).get('authorization')).toBe('Bearer jwt.do.aluno');
            expect(JSON.parse(String(init.body))).toMatchObject(PEDIDO);
        });

        it('não decide nada sobre o pagamento: nenhuma consulta a gateway sai daqui', async () => {
            const { POST } = await import('@/app/api/subscriptions/activate/route');

            await POST(buildRequest({ ...PEDIDO, status: 'approved', amount: 1 }));

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock.mock.calls[0][0]).toBe(`${BFF}/subscriptions/activate`);
        });
    });

    describe('JWT novo no cookie (passo 10)', () => {
        it('200 com token grava user_data HttpOnly', async () => {
            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO));

            const cookie = response.cookies.get('user_data');

            expect(response.status).toBe(200);
            expect(cookie?.value).toBe('jwt.novo.com.tier');
            expect(cookie?.httpOnly).toBe(true);
            expect(cookie?.path).toBe('/');
        });

        it('o token vai para o cookie e **não** para o corpo', async () => {
            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO));
            const json = await response.json();

            // Se voltasse no corpo, o cliente teria o JWT na mão e o guardaria no localStorage —
            // que é exatamente o desvio D2. O cookie HttpOnly é o único caminho.
            expect(json).not.toHaveProperty('token');
            expect(JSON.stringify(json)).not.toContain('jwt.novo.com.tier');
            expect(json).toMatchObject({ activated: true, tier: 'Simula PRO' });
        });

        it('200 sem token não mexe no cookie', async () => {
            fetchMock.mockResolvedValue(
                respostaBff(200, { activated: true, status: 'paid', tier: 'Simula PRO' })
            );

            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO));

            expect(response.status).toBe(200);
            expect(response.cookies.get('user_data')).toBeUndefined();
        });

        it('202 não grava cookie — ainda não há tier novo', async () => {
            fetchMock.mockResolvedValue(
                respostaBff(202, { activated: false, status: 'pending', token: 'não-deveria' })
            );

            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO));

            expect(response.status).toBe(202);
            expect(response.cookies.get('user_data')).toBeUndefined();
        });
    });

    describe('repasse de status', () => {
        it('202 pendente chega ao cliente com o corpo — o polling do PIX depende disso', async () => {
            fetchMock.mockResolvedValue(respostaBff(202, { activated: false, status: 'pending' }));

            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO));

            expect(response.status).toBe(202);
            await expect(response.json()).resolves.toMatchObject({ status: 'pending' });
        });

        it.each([403, 404, 409])('%i do BFF chega ao cliente como %i', async (status) => {
            fetchMock.mockResolvedValue(respostaBff(status, { erroInterno: 'detalhe do java' }));

            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO));

            expect(response.status).toBe(status);
            expect(JSON.stringify(await response.json())).not.toContain('detalhe do java');
        });

        it('sem BACKEND_API_URL responde 503', async () => {
            vi.stubEnv('BACKEND_API_URL', '');

            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO));

            expect(response.status).toBe(503);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('BFF fora do ar responde 503 sem vazar o erro de rede', async () => {
            fetchMock.mockRejectedValue(new Error('ECONNREFUSED 10.0.0.7:8080'));

            const { POST } = await import('@/app/api/subscriptions/activate/route');
            const response = await POST(buildRequest(PEDIDO));

            expect(response.status).toBe(503);
            expect(JSON.stringify(await response.json())).not.toContain('ECONNREFUSED');
        });
    });
});
