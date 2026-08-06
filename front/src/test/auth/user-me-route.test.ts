import { describe, it, expect, vi } from 'vitest';
import { jwtFalso, emSegundos } from './jwtFalso';

/**
 * `GET /api/user/me` — o substituto de decodificar o JWT no navegador.
 *
 * O JWT do aluno vive **só** no cookie `user_data` HttpOnly, que o JavaScript não consegue ler.
 * Quando a tela precisa do tier (ou da preferência de newsletter), quem lê o cookie, decodifica e
 * devolve é o servidor — e devolve **apenas os claims de exibição**.
 *
 * A invariante que estes testes travam: **o token nunca volta ao navegador**. Se ele voltasse,
 * a correção do desvio D2 seria só de aparência — bastaria o cliente guardar de novo.
 */

const URL_ROTA = 'http://localhost:3000/api/user/me';

const CLAIMS = {
    id: 'uuid-do-aluno',
    nome: 'Maria Silva',
    email: 'maria@example.com',
    tipo: 'Simula PRO',
    newsletter: true,
    exp: emSegundos(60 * 60 * 1000),
    iat: emSegundos(-1000),
};

function buildRequest(cookie: string | null): Request {
    const headers: Record<string, string> = {};
    if (cookie !== null) headers['cookie'] = cookie;

    return new Request(URL_ROTA, { method: 'GET', headers });
}

function comToken(payload: Record<string, unknown>): Request {
    return buildRequest(`user_data=${jwtFalso(payload)}`);
}

describe('GET /api/user/me — porteiro', () => {
    it('401 sem cookie', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        expect((await GET(buildRequest(null))).status).toBe(401);
    });

    it('401 com cookie vazio', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        expect((await GET(buildRequest('user_data='))).status).toBe(401);
    });

    it('401 com token ilegível', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        expect((await GET(buildRequest('user_data=isso-nao-e-um-jwt'))).status).toBe(401);
    });

    it('401 com token expirado', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        const response = await GET(comToken({ ...CLAIMS, exp: emSegundos(-60 * 1000) }));

        expect(response.status).toBe(401);
    });

    it('token sem `exp` continua valendo — quem julga validade é o BFF', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        const { exp: _exp, ...semExp } = CLAIMS;
        const response = await GET(comToken(semExp));

        expect(response.status).toBe(200);
    });

    it('`Authorization: Bearer` também vale, como nas rotas de pagamento', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        const request = new Request(URL_ROTA, {
            method: 'GET',
            headers: { authorization: `Bearer ${jwtFalso(CLAIMS)}` },
        });

        expect((await GET(request)).status).toBe(200);
    });
});

describe('GET /api/user/me — corpo da resposta', () => {
    it('devolve os claims de exibição', async () => {
        const { GET } = await import('@/app/api/user/me/route');
        const json = await (await GET(comToken(CLAIMS))).json();

        expect(json).toMatchObject({
            id: 'uuid-do-aluno',
            nome: 'Maria Silva',
            email: 'maria@example.com',
            tier: 'SIMULAPRO',
            newsletter: true,
        });
    });

    it('**nunca devolve o token nem os claims de assinatura**', async () => {
        const { GET } = await import('@/app/api/user/me/route');
        const response = await GET(comToken(CLAIMS));
        const json = await response.json();

        expect(json).not.toHaveProperty('token');
        expect(json).not.toHaveProperty('exp');
        expect(json).not.toHaveProperty('iat');
        expect(json).not.toHaveProperty('tipo');
        expect(JSON.stringify(json)).not.toContain('assinatura-de-mentira');
    });

    it('normaliza a grafia do tier: quem decide não é mais o cliente', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        for (const tipo of ['Simula PRO', 'simula_pro', 'SIMULAPRO', 'simula-pro']) {
            const json = await (await GET(comToken({ ...CLAIMS, tipo }))).json();
            expect(json.tier).toBe('SIMULAPRO');
        }
    });

    it('tipo desconhecido cai para FREE — errar para menos é o lado seguro', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        const json = await (await GET(comToken({ ...CLAIMS, tipo: 'SIMULAPROX' }))).json();

        expect(json.tier).toBe('FREE');
    });

    it('aceita as duas grafias de newsletter que existem no código', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        const { newsletter: _n, ...semNewsletter } = CLAIMS;

        const comL = await (await GET(comToken({ ...semNewsletter, newsLetter: true }))).json();
        const semL = await (await GET(comToken({ ...semNewsletter, newsletter: true }))).json();

        expect(comL.newsletter).toBe(true);
        expect(semL.newsletter).toBe(true);
    });

    it('sem nenhuma das grafias, newsletter é false', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        const { newsletter: _n, ...semNewsletter } = CLAIMS;
        const json = await (await GET(comToken(semNewsletter))).json();

        expect(json.newsletter).toBe(false);
    });

    it('não responde nada além dos claims previstos', async () => {
        const { GET } = await import('@/app/api/user/me/route');

        const json = await (
            await GET(comToken({ ...CLAIMS, senhaHash: 'não-deveria-vazar', cpf: '12345678909' }))
        ).json();

        expect(Object.keys(json).sort()).toEqual(['email', 'id', 'newsletter', 'nome', 'tier']);
    });

    it('não vai ao BFF: a informação já está no token', async () => {
        const fetchSpy = vi.fn();
        vi.stubGlobal('fetch', fetchSpy);

        const { GET } = await import('@/app/api/user/me/route');
        await GET(comToken(CLAIMS));

        expect(fetchSpy).not.toHaveBeenCalled();

        vi.unstubAllGlobals();
    });
});
