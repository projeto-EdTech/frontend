/**
 * Specs para o route handler POST /api/users/generate-token (proxy fino → BFF).
 *
 * NOTA: Sem test runner configurado (Vitest/Jest no roadmap). Scaffolding em estilo
 * Vitest. Validação real por ora via `npm run build`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../front/src/app/api/users/generate-token/route';
import * as service from '../front/src/app/service/discordToken.service';

// JWT helper: monta um token com payload arbitrário (assinatura irrelevante p/ decode).
function makeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`;
}

function makeReq(headers: Record<string, string>): Request {
  return new Request('http://localhost/api/users/generate-token', {
    method: 'POST',
    headers,
  });
}

beforeEach(() => {
  process.env.BACKEND_API_URL = 'http://bff.local';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/users/generate-token', () => {
  it('retorna 401 quando não há JWT (header nem cookie)', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(401);
  });

  it('extrai userId de sub/id/email e devolve { token } do service', async () => {
    const spy = vi
      .spyOn(service, 'generateDiscordToken')
      .mockResolvedValue({ token: 'VEST-AB12C' });

    const jwt = makeJwt({ sub: 'user-xyz' });
    const res = await POST(makeReq({ Authorization: `Bearer ${jwt}` }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith('user-xyz', jwt);
    expect(body).toEqual({ token: 'VEST-AB12C' });
  });

  it('não vaza detalhe interno quando o service lança', async () => {
    vi.spyOn(service, 'generateDiscordToken').mockRejectedValue(
      new Error('Backend 500: stacktrace secreto /opt/app x.x.x.x'),
    );

    const jwt = makeJwt({ sub: 'user-xyz' });
    const res = await POST(makeReq({ Authorization: `Bearer ${jwt}` }));
    const body = await res.json();

    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(JSON.stringify(body)).not.toContain('stacktrace');
    expect(JSON.stringify(body)).not.toContain('x.x.x.x');
  });
});
