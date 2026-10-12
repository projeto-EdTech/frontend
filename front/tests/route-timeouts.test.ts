/**
 * Timeout em toda rota que chama o BFF Java.
 *
 * Até esta entrega só `/api/sync-user` tinha teto próprio. As demais esperavam o connect
 * timeout de 10s do undici — e, se o Java aceitasse a conexão sem responder, esperavam para
 * sempre, prendendo a função serverless e o aluno numa tela de carregamento.
 *
 * Cada rota abaixo é verificada em dois pontos:
 *
 * 1. todo `fetch` ao BFF sai com um `AbortSignal` — é isso que impõe o teto;
 * 2. quando o teto estoura, a resposta é **504** e o corpo não carrega host, stack nem nome de
 *    classe (regra do `CLAUDE.md`: erro do BFF nunca chega cru ao navegador).
 *
 * A exceção documentada é `GET /api/Nota-corte`, que por contrato já degradava para lista vazia
 * em qualquer falha — a tela de configurações depende disso para abrir mesmo com o BFF fora.
 *
 * Vitest, ambiente node, `fetch` global dublado.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as NotaCorte from '../src/app/api/Nota-corte/route';
import * as UserStats from '../src/app/api/user/stats/route';
import * as UserProfile from '../src/app/api/user/profile/route';
import * as Universities from '../src/app/api/universities/route';
import * as Subscribe from '../src/app/api/subscribe/route';
import * as FlashCards from '../src/app/api/games/flash-cards/route';
import * as Blog from '../src/app/api/blog/route';
import * as BlogSlug from '../src/app/api/blog/[slug]/route';
import * as Estatisticas from '../src/app/api/estatisticas/[subject]/route';
import * as Questions from '../src/app/api/questions/[university]/route';
import * as SaveResult from '../src/app/api/simulations/save-result/route';

const BFF = 'http://bff.local:8081';

function makeJwt(payload: Record<string, unknown>): string {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`;
}

const JWT = makeJwt({ id: 'aluno-123', tipo: 'FREE', exp: Math.floor(Date.now() / 1000) + 3600 });

function req(method: 'GET' | 'POST', path: string, body?: unknown): Request {
    return new Request(`http://localhost${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${JWT}`,
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
}

const params = <T,>(p: T) => ({ params: Promise.resolve(p) });

interface Caso {
    nome: string;
    chamar: () => Promise<Response>;
    /** Status quando o BFF estoura o teto. */
    statusNoTimeout: number;
}

const CASOS: Caso[] = [
    { nome: 'GET /api/Nota-corte', chamar: () => NotaCorte.GET(req('GET', '/api/Nota-corte')), statusNoTimeout: 200 },
    {
        nome: 'POST /api/Nota-corte',
        chamar: () => NotaCorte.POST(req('POST', '/api/Nota-corte', { userScore: 700, targetCourse: 'Medicina' })),
        statusNoTimeout: 504,
    },
    { nome: 'GET /api/user/stats', chamar: () => UserStats.GET(req('GET', '/api/user/stats')), statusNoTimeout: 504 },
    {
        nome: 'POST /api/user/profile',
        chamar: () => UserProfile.POST(req('POST', '/api/user/profile', { targetExam: 'ENEM', targetCourse: 'Direito', institution: 'USP' })),
        statusNoTimeout: 504,
    },
    { nome: 'GET /api/universities', chamar: () => Universities.GET(req('GET', '/api/universities')), statusNoTimeout: 504 },
    {
        nome: 'POST /api/subscribe',
        chamar: () => Subscribe.POST(req('POST', '/api/subscribe', { email: 'fulano@exemplo.com' })),
        statusNoTimeout: 504,
    },
    { nome: 'GET /api/games/flash-cards', chamar: () => FlashCards.GET(req('GET', '/api/games/flash-cards')), statusNoTimeout: 504 },
    { nome: 'GET /api/blog', chamar: () => Blog.GET(req('GET', '/api/blog')), statusNoTimeout: 504 },
    {
        nome: 'GET /api/blog/[slug]',
        chamar: () => BlogSlug.GET(req('GET', '/api/blog/um-post'), params({ slug: 'um-post' })),
        statusNoTimeout: 504,
    },
    {
        nome: 'GET /api/estatisticas/[subject]',
        chamar: () => Estatisticas.GET(req('GET', '/api/estatisticas/matematica'), params({ subject: 'matematica' })),
        statusNoTimeout: 504,
    },
    {
        nome: 'POST /api/questions/[university]',
        chamar: () => Questions.POST(req('POST', '/api/questions/fuvest', { year: 2024 }), params({ university: 'fuvest' })),
        statusNoTimeout: 504,
    },
    {
        nome: 'POST /api/simulations/save-result',
        chamar: () => SaveResult.POST(req('POST', '/api/simulations/save-result', { acertos: 10 })),
        statusNoTimeout: 504,
    },
];

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
    process.env.BACKEND_API_URL = BFF;
    process.env.BACKEND_API_KEY = 'chave-de-teste';

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    // As rotas são falantes; o ruído não interessa a estes testes.
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe.each(CASOS)('$nome — timeout do BFF', ({ chamar, statusNoTimeout }) => {
    it('1. toda chamada ao BFF sai com AbortSignal', async () => {
        fetchMock.mockResolvedValue(
            new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }),
        );

        await chamar();

        expect(fetchMock).toHaveBeenCalled();
        for (const [, init] of fetchMock.mock.calls) {
            expect((init as RequestInit | undefined)?.signal).toBeInstanceOf(AbortSignal);
        }
    });

    it(`2. BFF que estoura o teto vira ${statusNoTimeout}, sem vazar host`, async () => {
        fetchMock.mockRejectedValue(new DOMException('The operation was aborted due to timeout', 'TimeoutError'));

        const res = await chamar();
        const corpo = await res.text();

        expect(res.status).toBe(statusNoTimeout);
        expect(corpo).not.toContain('bff.local');
        expect(corpo).not.toContain('TimeoutError');
        expect(corpo).not.toContain('DOMException');
    });
});
