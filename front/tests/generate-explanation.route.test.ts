/**
 * Specs para POST /api/generate-explanation — explicação de gabarito por IA (Gemini).
 *
 * Três falhas que esta rota tinha e estes testes fecham:
 *
 * 1. **Sem sessão.** Qualquer requisição com `enunciado` e `gabarito` gerava explicação — a
 *    chave do Gemini ficava à disposição de quem achasse a URL.
 * 2. **Gate FREE/PRO só no cliente, e quebrado.** A tela lia `isFree` de `useUserTier()`, que
 *    não existe; o FREE nunca batia no limite. Agora o servidor decide pelo tier da sessão
 *    (`normalizeTier` + `isPaidTier`) e conta a cota do FREE num cookie HttpOnly.
 * 3. **Sem teto de tempo.** Um Gemini lento prendia a função até o limite da plataforma.
 *
 * O Gemini é dublado: o que se testa aqui é o contrato da rota, não o modelo.
 *
 * Vitest, ambiente node.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../src/app/api/generate-explanation/route';
import {
    AI_QUOTA_COOKIE,
    FREE_DAILY_EXPLANATIONS,
    diaDeHoje,
    serializarCota,
} from '../src/app/service/aiExplanationQuota';

const mocks = vi.hoisted(() => ({
    generateContentStream: vi.fn(),
    getGenerativeModel: vi.fn(),
}));

vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel(...args: unknown[]) {
            mocks.getGenerativeModel(...args);
            return { generateContentStream: mocks.generateContentStream };
        }
    },
}));

function makeJwt(payload: Record<string, unknown>): string {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`;
}

const exp = () => Math.floor(Date.now() / 1000) + 3600;
const JWT_FREE = makeJwt({ id: 'aluno-free', tipo: 'FREE', exp: exp() });
const JWT_PRO = makeJwt({ id: 'aluno-pro', tipo: 'Simula PRO', exp: exp() });

const QUESTAO = { enunciado: 'Quanto é 2 + 2?', gabarito: 'B) 4' };

function req({ jwt, body = QUESTAO, cookie }: { jwt?: string; body?: unknown; cookie?: string } = {}): Request {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (jwt) headers.Authorization = `Bearer ${jwt}`;
    if (cookie) headers.Cookie = cookie;

    return new Request('http://localhost/api/generate-explanation', {
        method: 'POST',
        headers,
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });
}

/** Resultado de `generateContentStream` com os pedaços de texto dados. */
function streamDe(...pedacos: string[]) {
    return {
        stream: (async function* () {
            for (const p of pedacos) yield { text: () => p };
        })(),
    };
}

beforeEach(() => {
    process.env.GEMINI_API_KEY = 'chave-gemini-de-teste';
    mocks.generateContentStream.mockReset();
    mocks.getGenerativeModel.mockReset();
    mocks.generateContentStream.mockResolvedValue(streamDe('Para chegar ', 'à alternativa correta...'));

    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('POST /api/generate-explanation — sessão e entrada', () => {
    it('1. sem sessão devolve 401 e não chama o Gemini', async () => {
        const res = await POST(req());

        expect(res.status).toBe(401);
        expect(mocks.generateContentStream).not.toHaveBeenCalled();
    });

    it('2. sem enunciado ou gabarito devolve 400', async () => {
        const res = await POST(req({ jwt: JWT_PRO, body: { enunciado: 'só o enunciado' } }));

        expect(res.status).toBe(400);
        expect(mocks.generateContentStream).not.toHaveBeenCalled();
    });

    it('3. corpo que não é JSON devolve 400, não 500', async () => {
        const res = await POST(req({ jwt: JWT_PRO, body: '{isto não é json' }));

        expect(res.status).toBe(400);
    });

    it('4. sem GEMINI_API_KEY devolve 503 sem citar a variável', async () => {
        delete process.env.GEMINI_API_KEY;

        const res = await POST(req({ jwt: JWT_PRO }));

        expect(res.status).toBe(503);
        expect(await res.text()).not.toContain('GEMINI_API_KEY');
        expect(mocks.generateContentStream).not.toHaveBeenCalled();
    });
});

describe('POST /api/generate-explanation — PRO', () => {
    it('5. PRO recebe a explicação em streaming, sem cota', async () => {
        const res = await POST(req({ jwt: JWT_PRO }));

        expect(res.status).toBe(200);
        expect(await res.text()).toBe('Para chegar à alternativa correta...');
        expect(res.headers.get('X-AI-Quota-Remaining')).toBe('unlimited');
        expect(res.headers.get('set-cookie') ?? '').not.toContain(AI_QUOTA_COOKIE);
    });
});

describe('POST /api/generate-explanation — FREE', () => {
    it('6. primeiro uso do dia passa e grava a cota em cookie HttpOnly', async () => {
        const res = await POST(req({ jwt: JWT_FREE }));
        const setCookie = res.headers.get('set-cookie') ?? '';

        expect(res.status).toBe(200);
        expect(res.headers.get('X-AI-Quota-Remaining')).toBe(String(FREE_DAILY_EXPLANATIONS - 1));
        expect(setCookie).toContain(`${AI_QUOTA_COOKIE}=`);
        expect(setCookie.toLowerCase()).toContain('httponly');
    });

    it('7. cota esgotada devolve 429 e não chama o Gemini', async () => {
        const cheia = serializarCota({ dia: diaDeHoje(), usados: FREE_DAILY_EXPLANATIONS }, 'aluno-free');

        const res = await POST(req({ jwt: JWT_FREE, cookie: `${AI_QUOTA_COOKIE}=${cheia}` }));
        const corpo = await res.json();

        expect(res.status).toBe(429);
        expect(corpo.limite).toBe(FREE_DAILY_EXPLANATIONS);
        expect(res.headers.get('X-AI-Quota-Remaining')).toBe('0');
        expect(mocks.generateContentStream).not.toHaveBeenCalled();
    });

    it('8. cota esgotada ontem não bloqueia hoje', async () => {
        const ontem = serializarCota({ dia: '2000-01-01', usados: FREE_DAILY_EXPLANATIONS }, 'aluno-free');

        const res = await POST(req({ jwt: JWT_FREE, cookie: `${AI_QUOTA_COOKIE}=${ontem}` }));

        expect(res.status).toBe(200);
    });

    it('9. falha do Gemini antes de começar não gasta cota do aluno', async () => {
        mocks.generateContentStream.mockRejectedValue(new Error('[GoogleGenerativeAI Error]: 503 overloaded at https://generativelanguage.googleapis.com'));

        const res = await POST(req({ jwt: JWT_FREE }));
        const corpo = await res.text();

        expect(res.status).toBe(502);
        expect(corpo).not.toContain('googleapis');
        expect(corpo).not.toContain('GoogleGenerativeAI');
        expect(res.headers.get('set-cookie') ?? '').not.toContain(AI_QUOTA_COOKIE);
    });
});

describe('POST /api/generate-explanation — teto de tempo', () => {
    it('10. o modelo é criado com timeout de requisição', async () => {
        await POST(req({ jwt: JWT_PRO }));

        const [, requestOptions] = mocks.getGenerativeModel.mock.calls[0] as [unknown, { timeout?: number }];
        expect(requestOptions?.timeout).toBeGreaterThan(0);
    });

    it('11. timeout do Gemini vira 504, não 500', async () => {
        const erro = new Error('Request aborted after timeout');
        erro.name = 'AbortError';
        mocks.generateContentStream.mockRejectedValue(erro);

        const res = await POST(req({ jwt: JWT_PRO }));

        expect(res.status).toBe(504);
    });
});
