/**
 * Specs para o service de geração de token Discord (OTP).
 *
 * NOTA: Não há test runner configurado no projeto ainda (Vitest/Jest no roadmap).
 * Estes specs estão escritos em estilo Vitest como scaffolding e documentação do
 * comportamento esperado. Validação real, por ora, é via `npm run build`.
 *
 * Quando o Vitest for adicionado:
 *   import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateDiscordToken } from '../front/src/app/service/discordToken.service';

const BFF = 'http://bff.local';

beforeEach(() => {
  process.env.BACKEND_API_URL = BFF;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateDiscordToken', () => {
  it('faz POST para /api/users/generate-token com Bearer e body { userId }', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'VEST-AB12C' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await generateDiscordToken('user-123', 'jwt-abc');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BFF}/api/users/generate-token`);
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer jwt-abc');
    expect(JSON.parse(init.body)).toEqual({ userId: 'user-123' });
    expect(res.token).toBe('VEST-AB12C');
  });

  it('lança erro descritivo quando response.ok é false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' }),
    );

    await expect(generateDiscordToken('user-123', 'jwt-abc')).rejects.toThrow();
  });

  it('lança erro quando BACKEND_API_URL não está configurado', async () => {
    delete process.env.BACKEND_API_URL;
    await expect(generateDiscordToken('user-123', 'jwt-abc')).rejects.toThrow();
  });
});
