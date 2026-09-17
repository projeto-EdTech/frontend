import { describe, it, expect, beforeEach } from 'vitest';
import { decodeJWT } from '../src/app/service/jwtDecoder';
import { POST } from '../src/app/api/user/profile/route';

// Configura as variáveis de ambiente necessárias para os testes
beforeEach(() => {
  process.env.BACKEND_API_URL = 'http://localhost:8080';
});

// 1. Decodificação do JWT com os campos de perfil
describe('decodeJWT — campos de perfil', () => {
  it('decodifica prova_alvo, curso_alvo, instituicao e nome', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: '1234567890',
      nome: 'Maria da Silva',
      email: 'maria@example.com',
      prova_alvo: 'FUVEST',
      curso_alvo: 'Medicina',
      instituicao: 'USP',
      tipo: 'FREE'
    })).toString('base64url');
    const mockToken = `${header}.${payload}.signature`;

    const decoded = decodeJWT(mockToken);

    expect(decoded).not.toBeNull();
    expect(decoded!.prova_alvo).toBe('FUVEST');
    expect(decoded!.curso_alvo).toBe('Medicina');
    expect(decoded!.instituicao).toBe('USP');
    expect(decoded!.nome).toBe('Maria da Silva');
  });
});

// 2. Rota POST /api/user/profile sem token de autorização
describe('POST /api/user/profile', () => {
  it('retorna 401 com mensagem apropriada quando não há token', async () => {
    const mockRequest = new Request('http://localhost:3000/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetExam: 'ENEM',
        targetCourse: 'Direito',
        institution: 'UFMG'
      })
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('Token não fornecido');
  });
});
