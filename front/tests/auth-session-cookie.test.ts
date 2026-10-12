/**
 * Tamanho da sessão do NextAuth — a causa do cookie fragmentado.
 *
 * O NextAuth fatia `next-auth.session-token` em `.0`, `.1`, … quando o valor cifrado passa de
 * 3933 bytes (4096 do teto do navegador menos ~163 dos atributos do cookie). O callback `jwt`
 * de `src/lib/core/auth.ts` guardava o objeto `account` **inteiro** do Google — `id_token`,
 * `access_token`, `refresh_token`, `scope`, `token_type`, … — e ainda repetia o `access_token`
 * em mais dois campos. Com tokens de tamanho real, a sessão estourava o teto já no login.
 *
 * `readNextAuthSessionToken` remonta os pedaços, mas isso é mitigação: a correção é o callback
 * guardar só o que alguém lê. Estes testes cifram de verdade com o `encode` do NextAuth, porque
 * o que importa é o tamanho do valor que vai para o cookie, não o do objeto em memória.
 *
 * Também cobre a normalização do tier: a sessão só pode carregar os valores do tipo `Tier`
 * (`FREE` | `SIMULAPRO` | `TEACHER` | `ADMIN`). Uma grafia livre como `"Simula PRO"` fazia um
 * componente comparar com `'SIMULAPRO'` e outro com `"Simula PRO"` — o mesmo aluno era PRO numa
 * tela e FREE na seguinte.
 *
 * Vitest, ambiente node.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Account, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { encode } from 'next-auth/jwt';
import { authOptions } from '../src/lib/core/auth';

/** Teto por cookie do NextAuth v4 antes de fatiar (`ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE`). */
const CHUNK_SIZE = 3933;
const SEGREDO = 'segredo-de-teste-para-o-nextauth-1234567890';

/** Tamanhos típicos de uma conta Google: id_token ~1.2KB, access_token ~250, refresh_token ~100. */
const ID_TOKEN = 'e'.repeat(1200);
const ACCESS_TOKEN = 'ya29.' + 'a'.repeat(250);
const REFRESH_TOKEN = '1//' + 'r'.repeat(100);

function contaGoogle(): Account {
    return {
        provider: 'google',
        type: 'oauth',
        providerAccountId: '123456789012345678901',
        access_token: ACCESS_TOKEN,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: REFRESH_TOKEN,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        token_type: 'Bearer',
        id_token: ID_TOKEN,
    };
}

const USUARIO: User = {
    id: '123456789012345678901',
    name: 'Fulano de Tal da Silva',
    email: 'fulano.de.tal@exemplo.com',
    image: 'https://lh3.googleusercontent.com/a/' + 'p'.repeat(80) + '=s96-c',
};

async function primeiroLogin(account: Account = contaGoogle(), user: User = USUARIO): Promise<JWT> {
    const jwt = authOptions.callbacks!.jwt!;
    return jwt({
        token: { name: user.name, email: user.email, picture: user.image, sub: user.id },
        account,
        user,
        trigger: 'signIn',
    } as Parameters<typeof jwt>[0]);
}

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('callback jwt — o que entra na sessão', () => {
    it('1. não guarda o objeto `account` do Google', async () => {
        const token = await primeiroLogin();

        expect(token).not.toHaveProperty('googleAccount');
    });

    it('2. guarda o `id_token` — é o que o /api/sync-user troca pelo JWT do Java', async () => {
        const token = await primeiroLogin();

        expect(token.googleIdToken).toBe(ID_TOKEN);
    });

    it('3. o `access_token` aparece uma vez só', async () => {
        const token = await primeiroLogin();
        const serializado = JSON.stringify(token);

        expect(token.accessToken).toBe(ACCESS_TOKEN);
        expect(serializado.split(ACCESS_TOKEN).length - 1).toBe(1);
        expect(token).not.toHaveProperty('token');
    });

    it('4. o `refresh_token` aparece uma vez só', async () => {
        const token = await primeiroLogin();

        expect(token.refreshToken).toBe(REFRESH_TOKEN);
        expect(JSON.stringify(token).split(REFRESH_TOKEN).length - 1).toBe(1);
    });

    it('5. login por provedor sem `id_token` (Discord, Facebook) não inventa o campo', async () => {
        const { id_token: _descartado, ...semIdToken } = contaGoogle();
        void _descartado;

        const token = await primeiroLogin({ ...semIdToken, provider: 'discord' });

        expect(token.googleIdToken).toBeUndefined();
    });
});

describe('callback jwt — tamanho do cookie', () => {
    it('6. a sessão cifrada cabe num cookie só, sem fragmentar', async () => {
        const token = await primeiroLogin();
        const cifrado = await encode({ token, secret: SEGREDO });

        expect(cifrado.length).toBeLessThanOrEqual(CHUNK_SIZE);
    });
});

describe('tier — só valores do tipo `Tier` circulam', () => {
    it('7. o tier gravado no primeiro login já é normalizado', async () => {
        const token = await primeiroLogin();

        expect(['FREE', 'SIMULAPRO', 'TEACHER', 'ADMIN']).toContain(token.tier);
    });

    it('8. o callback `session` normaliza tier legado ("Simula PRO") vindo de sessões antigas', async () => {
        const sessionCb = authOptions.callbacks!.session!;
        const session = (await sessionCb({
            session: { expires: new Date(Date.now() + 3600_000).toISOString() } as Session,
            token: { user: USUARIO, tier: 'Simula PRO' as unknown as JWT['tier'] } as JWT,
        } as Parameters<typeof sessionCb>[0])) as Session;

        expect(session.user?.tier).toBe('SIMULAPRO');
    });

    it('9. tier desconhecido cai para FREE (fail safe)', async () => {
        const sessionCb = authOptions.callbacks!.session!;
        const session = (await sessionCb({
            session: { expires: new Date(Date.now() + 3600_000).toISOString() } as Session,
            token: { user: USUARIO, tier: 'VIP_DE_MENTIRA' as unknown as JWT['tier'] } as JWT,
        } as Parameters<typeof sessionCb>[0])) as Session;

        expect(session.user?.tier).toBe('FREE');
    });
});
