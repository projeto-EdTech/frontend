import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * As rotas de pagamento como **proxy fino** do BFF Java.
 *
 * O que estes testes travam é o contrato do passo 1 do fluxo proposto
 * (`docs/Pauta_para_reuniao.md` §2): o navegador manda `planId` e dados de identificação, o
 * Next encaminha, e nada de preço, status ou consulta a gateway acontece aqui.
 *
 * Três invariantes:
 *
 * 1. Sem sessão não sai requisição — nem para o BFF.
 * 2. O corpo encaminhado não carrega valor, status nem e-mail. O e-mail sai da sessão, no Java
 *    (é o que faz o passo 8, titularidade, ser verificável).
 * 3. Nenhuma mensagem de erro do BFF chega ao navegador.
 */

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

const BFF = 'https://bff.example';
const COOKIE_SESSAO = 'user_data=jwt.do.aluno';

const IDENTIFICACAO = { type: 'CPF', number: '12345678909' };

const ENDERECO = {
    zip_code: '01001000',
    street_name: 'Praça da Sé',
    street_number: '1',
    neighborhood: 'Sé',
    city: 'São Paulo',
    federal_unit: 'SP',
};

/** Uma entrada por rota de criação de cobrança. O import fica literal para o Vite resolver. */
const ROTAS = [
    {
        nome: 'cartão',
        url: 'http://localhost:3000/api/process-subscription/credit-card',
        caminhoBff: '/subscriptions/checkout/card',
        carregar: () => import('@/app/api/process-subscription/credit-card/route'),
        corpo: {
            planId: 'anual',
            payer: {
                email: 'digitado@example.com',
                first_name: 'Maria',
                last_name: 'Silva',
                identification: IDENTIFICACAO,
            },
        },
    },
    {
        nome: 'PIX',
        url: 'http://localhost:3000/api/process-subscription/pix',
        caminhoBff: '/subscriptions/checkout/pix',
        carregar: () => import('@/app/api/process-subscription/pix/route'),
        corpo: {
            planId: 'anual',
            payer: {
                email: 'digitado@example.com',
                first_name: 'Maria',
                last_name: 'Silva',
                identification: IDENTIFICACAO,
            },
        },
    },
    {
        nome: 'boleto',
        url: 'http://localhost:3000/api/process-subscription/boleto',
        caminhoBff: '/subscriptions/checkout/boleto',
        carregar: () => import('@/app/api/process-subscription/boleto/route'),
        corpo: {
            planId: 'anual',
            payer: {
                email: 'digitado@example.com',
                first_name: 'Maria',
                last_name: 'Silva',
                identification: IDENTIFICACAO,
                address: ENDERECO,
            },
        },
    },
];

function buildRequest(url: string, corpo: unknown, cookie: string | null = COOKIE_SESSAO): Request {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (cookie !== null) headers['cookie'] = cookie;

    return new Request(url, { method: 'POST', headers, body: JSON.stringify(corpo) });
}

function respostaBff(status: number, data: unknown): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

/** Corpo efetivamente enviado ao BFF na primeira chamada. */
function corpoEncaminhado(): Record<string, unknown> {
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    return JSON.parse(String(init.body));
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('BACKEND_API_URL', BFF);
    fetchMock.mockResolvedValue(respostaBff(201, { payment_id: '123', status: 'pending' }));
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe.each(ROTAS)('POST rota de cobrança — $nome', (rota) => {
    it('sem sessão responde 401 e não chama o BFF', async () => {
        const { POST } = await rota.carregar();

        const response = await POST(buildRequest(rota.url, rota.corpo, null));

        expect(response.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('cookie user_data vazio não vale como sessão', async () => {
        const { POST } = await rota.carregar();

        const response = await POST(buildRequest(rota.url, rota.corpo, 'user_data='));

        expect(response.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('Authorization: Bearer também vale como sessão', async () => {
        const { POST } = await rota.carregar();

        const request = new Request(rota.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', authorization: 'Bearer jwt.do.aluno' },
            body: JSON.stringify(rota.corpo),
        });

        await POST(request);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('encaminha para o endpoint do BFF com o JWT do aluno e sem cache', async () => {
        const { POST } = await rota.carregar();

        await POST(buildRequest(rota.url, rota.corpo));

        expect(fetchMock).toHaveBeenCalledTimes(1);

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

        expect(url).toBe(`${BFF}${rota.caminhoBff}`);
        expect(init.method).toBe('POST');
        expect(init.cache).toBe('no-store');
        expect(new Headers(init.headers).get('authorization')).toBe('Bearer jwt.do.aluno');
    });

    it('encaminha o planId', async () => {
        const { POST } = await rota.carregar();

        await POST(buildRequest(rota.url, rota.corpo));

        expect(corpoEncaminhado().planId).toBe('anual');
    });

    it('não encaminha e-mail: a titularidade sai da sessão no Java', async () => {
        const { POST } = await rota.carregar();

        await POST(buildRequest(rota.url, rota.corpo));

        expect(JSON.stringify(corpoEncaminhado())).not.toContain('digitado@example.com');
        expect((corpoEncaminhado().payer as Record<string, unknown>)).not.toHaveProperty('email');
    });

    it('não encaminha valor nem status, mesmo se o cliente insistir', async () => {
        const { POST } = await rota.carregar();

        await POST(
            buildRequest(rota.url, {
                ...rota.corpo,
                transaction_amount: 0.01,
                amount: 1,
                amountCents: 1,
                status: 'approved',
            })
        );

        const encaminhado = corpoEncaminhado();

        expect(encaminhado).not.toHaveProperty('transaction_amount');
        expect(encaminhado).not.toHaveProperty('amount');
        expect(encaminhado).not.toHaveProperty('amountCents');
        expect(encaminhado).not.toHaveProperty('status');
    });

    it('descarta campo de dinheiro com nome que ninguém previu', async () => {
        const { POST } = await rota.carregar();

        await POST(
            buildRequest(rota.url, {
                ...rota.corpo,
                valor: 0.01,
                preco: 1,
                desconto: 99,
                price: 1,
                tier: 'ADMIN',
            })
        );

        const encaminhado = corpoEncaminhado();

        expect(encaminhado).not.toHaveProperty('valor');
        expect(encaminhado).not.toHaveProperty('preco');
        expect(encaminhado).not.toHaveProperty('desconto');
        expect(encaminhado).not.toHaveProperty('price');
        expect(encaminhado).not.toHaveProperty('tier');
    });

    it('o corpo encaminhado é exatamente o contrato — nada mais', async () => {
        const { POST } = await rota.carregar();

        await POST(buildRequest(rota.url, { ...rota.corpo, campoInventado: 'x' }));

        const encaminhado = corpoEncaminhado();
        const payer = encaminhado.payer as Record<string, unknown>;

        expect(Object.keys(encaminhado).sort()).toEqual(['planId', 'payer'].sort());
        expect(Object.keys(payer).sort()).toEqual(
            Object.keys(rota.corpo.payer)
                .filter((chave) => chave !== 'email')
                .sort()
        );
    });

    it('payer com campo estranho não passa', async () => {
        const { POST } = await rota.carregar();

        await POST(
            buildRequest(rota.url, {
                ...rota.corpo,
                payer: { ...rota.corpo.payer, cpfDeOutro: '00000000000', saldo: 999 },
            })
        );

        const payer = corpoEncaminhado().payer as Record<string, unknown>;

        expect(payer).not.toHaveProperty('cpfDeOutro');
        expect(payer).not.toHaveProperty('saldo');
    });

    it('repassa status e corpo de sucesso do BFF sem traduzir', async () => {
        fetchMock.mockResolvedValue(
            respostaBff(201, { payment_id: '999', status: 'pending', qr_code: 'abc' })
        );

        const { POST } = await rota.carregar();
        const response = await POST(buildRequest(rota.url, rota.corpo));

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({ payment_id: '999' });
    });

    it('erro do BFF vira mensagem genérica — nada interno chega ao navegador', async () => {
        fetchMock.mockResolvedValue(
            respostaBff(500, {
                message: 'java.lang.NullPointerException em 10.0.0.7',
                stack: 'com.vestibuline...',
            })
        );

        const { POST } = await rota.carregar();
        const response = await POST(buildRequest(rota.url, rota.corpo));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(JSON.stringify(json)).not.toContain('NullPointerException');
        expect(JSON.stringify(json)).not.toContain('10.0.0.7');
        expect(json).not.toHaveProperty('stack');
    });

    it('sem BACKEND_API_URL responde 503 e não chama ninguém', async () => {
        vi.stubEnv('BACKEND_API_URL', '');

        const { POST } = await rota.carregar();
        const response = await POST(buildRequest(rota.url, rota.corpo));

        expect(response.status).toBe(503);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('BFF fora do ar responde 503 sem vazar o erro de rede', async () => {
        fetchMock.mockRejectedValue(new Error('ECONNREFUSED 10.0.0.7:8080'));

        const { POST } = await rota.carregar();
        const response = await POST(buildRequest(rota.url, rota.corpo));

        expect(response.status).toBe(503);
        expect(JSON.stringify(await response.json())).not.toContain('ECONNREFUSED');
    });

    it('corpo ilegível responde 400 sem chamar o BFF', async () => {
        const { POST } = await rota.carregar();

        const request = new Request(rota.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', cookie: COOKIE_SESSAO },
            body: 'não é json',
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('GET /api/plans — vitrine', () => {
    const PLANOS = {
        plans: [
            {
                id: 'anual',
                nome: 'Simula Pro Anual',
                descricao: 'O melhor custo-benefício',
                amountCents: 50000,
                currency: 'brl',
                billingMode: 'subscription',
                interval: 'year',
                monthlyEquivalentCents: 4167,
            },
        ],
    };

    it('encaminha para o catálogo do BFF, sem Authorization', async () => {
        fetchMock.mockResolvedValue(respostaBff(200, PLANOS));

        const { GET } = await import('@/app/api/plans/route');
        const response = await GET();

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

        expect(url).toBe(`${BFF}/plans`);
        expect(new Headers(init.headers).get('authorization')).toBeNull();
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual(PLANOS);
    });

    it('não resolve preço localmente: o corpo vem inteiro do BFF', async () => {
        fetchMock.mockResolvedValue(respostaBff(200, { plans: [] }));

        const { GET } = await import('@/app/api/plans/route');

        await expect((await GET()).json()).resolves.toEqual({ plans: [] });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('sem BACKEND_API_URL responde 503', async () => {
        vi.stubEnv('BACKEND_API_URL', '');

        const { GET } = await import('@/app/api/plans/route');

        expect((await GET()).status).toBe(503);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
