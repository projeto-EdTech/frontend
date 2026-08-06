import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { jwtFalso } from './jwtFalso';

/**
 * As rotas autenticadas aceitam o **cookie** `user_data`, não só o header `Authorization`.
 *
 * Este arquivo é o pré-requisito da correção do desvio D2. O cookie HttpOnly já acompanha
 * automaticamente todo `fetch` same-origin — o `Authorization: Bearer` que o cliente montava a
 * partir do `localStorage` era redundante. Mas estas rotas liam **só** o header: tirar o Bearer
 * do cliente antes delas aceitarem o cookie derrubaria autenticação em tela que hoje funciona.
 *
 * Todas usam `readUserToken` (`src/app/service/sessionToken.ts`), que já fazia header → cookie
 * nas rotas de pagamento. Nenhuma inventa parser próprio.
 *
 * O header continua valendo: a troca é aditiva, para nada quebrar entre um passo e outro.
 */

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

const BFF = 'https://bff.example';
const TOKEN = jwtFalso({ id: 'uuid-do-aluno', email: 'maria@example.com', tipo: 'FREE' });
const COOKIE = `user_data=${TOKEN}`;

interface CasoDeRota {
    nome: string;
    url: string;
    metodo: 'GET' | 'POST';
    carregar: () => Promise<{
        GET?: (req: Request) => Promise<Response>;
        POST?: (req: Request) => Promise<Response>;
    }>;
    corpo?: unknown;
    /** Resposta que o BFF devolveria no caminho feliz. */
    respostaBff: unknown;
}

const ROTAS: CasoDeRota[] = [
    {
        nome: 'GET /api/universities',
        url: 'http://localhost:3000/api/universities',
        metodo: 'GET',
        carregar: () => import('@/app/api/universities/route'),
        respostaBff: [{ sigla: 'USP' }],
    },
    {
        nome: 'GET /api/games/flash-cards',
        url: 'http://localhost:3000/api/games/flash-cards',
        metodo: 'GET',
        carregar: () => import('@/app/api/games/flash-cards/route'),
        respostaBff: { cards: [] },
    },
    {
        nome: 'GET /api/user/stats',
        url: 'http://localhost:3000/api/user/stats',
        metodo: 'GET',
        carregar: () => import('@/app/api/user/stats/route'),
        respostaBff: { totalSimulados: 0 },
    },
    {
        nome: 'GET /api/Nota-corte',
        url: 'http://localhost:3000/api/Nota-corte',
        metodo: 'GET',
        carregar: () => import('@/app/api/Nota-corte/route'),
        respostaBff: { cursos: [] },
    },
    {
        nome: 'POST /api/Nota-corte',
        url: 'http://localhost:3000/api/Nota-corte',
        metodo: 'POST',
        carregar: () => import('@/app/api/Nota-corte/route'),
        corpo: { userScore: 700, targetCourse: 'Medicina' },
        respostaBff: { media: 800 },
    },
    {
        nome: 'POST /api/subscribe',
        url: 'http://localhost:3000/api/subscribe',
        metodo: 'POST',
        carregar: () => import('@/app/api/subscribe/route'),
        corpo: { email: 'maria@example.com' },
        respostaBff: { ok: true },
    },
];

function buildRequest(caso: CasoDeRota, headers: Record<string, string>): Request {
    return new Request(caso.url, {
        method: caso.metodo,
        headers: { 'Content-Type': 'application/json', ...headers },
        ...(caso.corpo === undefined ? {} : { body: JSON.stringify(caso.corpo) }),
    });
}

async function chamar(caso: CasoDeRota, headers: Record<string, string>): Promise<Response> {
    const modulo = await caso.carregar();
    const handler = caso.metodo === 'GET' ? modulo.GET : modulo.POST;

    if (!handler) throw new Error(`${caso.nome} não exporta ${caso.metodo}`);

    return handler(buildRequest(caso, headers));
}

/** Todos os `Authorization` que saíram desta rota rumo ao BFF. */
function bearersEnviadosAoBff(): (string | null)[] {
    return fetchMock.mock.calls.map((call) =>
        new Headers((call[1] as RequestInit | undefined)?.headers).get('authorization')
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('BACKEND_API_URL', BFF);
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe.each(ROTAS)('$nome', (caso) => {
    beforeEach(() => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify(caso.respostaBff), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );
    });

    it('o cookie sozinho autentica — sem header nenhum', async () => {
        const response = await chamar(caso, { cookie: COOKIE });

        expect(response.status).not.toBe(401);
        expect(fetchMock).toHaveBeenCalled();
    });

    it('o JWT do cookie chega ao BFF como Bearer', async () => {
        await chamar(caso, { cookie: COOKIE });

        expect(bearersEnviadosAoBff()[0]).toBe(`Bearer ${TOKEN}`);
    });

    it('`Authorization: Bearer` continua valendo — a troca é aditiva', async () => {
        const response = await chamar(caso, { authorization: `Bearer ${TOKEN}` });

        expect(response.status).not.toBe(401);
        expect(fetchMock).toHaveBeenCalled();
    });

    it('401 sem cookie e sem header, sem chamar o BFF', async () => {
        const response = await chamar(caso, {});

        expect(response.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('cookie vazio não vale como sessão', async () => {
        const response = await chamar(caso, { cookie: 'user_data=' });

        expect(response.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('não vaza pedaço do JWT no log do servidor', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await chamar(caso, { cookie: COOKIE });

        const impresso = [...logSpy.mock.calls, ...warnSpy.mock.calls].flat().join(' ');

        expect(impresso).not.toContain(TOKEN.slice(0, 20));

        logSpy.mockRestore();
        warnSpy.mockRestore();
    });
});

describe('POST /api/subscribe — o JWT deixa de viajar no corpo', () => {
    beforeEach(() => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );
    });

    it('ignora o campo `token` do corpo e usa o da sessão', async () => {
        const { POST } = await import('@/app/api/subscribe/route');

        await POST(
            new Request('http://localhost:3000/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', cookie: COOKIE },
                body: JSON.stringify({ email: 'maria@example.com', token: 'jwt.de.outro.aluno' }),
            })
        );

        expect(bearersEnviadosAoBff()[0]).toBe(`Bearer ${TOKEN}`);
    });

    it('`token` no corpo, sozinho, não autentica mais', async () => {
        const { POST } = await import('@/app/api/subscribe/route');

        const response = await POST(
            new Request('http://localhost:3000/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'maria@example.com', token: 'jwt.de.outro.aluno' }),
            })
        );

        expect(response.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
