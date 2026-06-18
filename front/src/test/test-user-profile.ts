import assert from 'assert';

// Configura as variáveis de ambiente necessárias para os testes
process.env.BACKEND_API_URL = 'http://localhost:8080';

import { decodeJWT } from '../app/service/jwtDecoder';
import { POST } from '../app/api/user/profile/route';

// 1. Testar decodificação do JWT com novos campos
function testJWTDecoding() {
  console.log('🔄 Iniciando teste de decodificação de JWT...');
  
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
  const signature = 'signature';
  const mockToken = `${header}.${payload}.${signature}`;

  const decoded = decodeJWT(mockToken);
  
  assert.ok(decoded, 'JWT deve ser decodificado com sucesso');
  assert.strictEqual(decoded.prova_alvo, 'FUVEST', 'Deve decodificar prova_alvo');
  assert.strictEqual(decoded.curso_alvo, 'Medicina', 'Deve decodificar curso_alvo');
  assert.strictEqual(decoded.instituicao, 'USP', 'Deve decodificar instituicao');
  assert.strictEqual(decoded.nome, 'Maria da Silva', 'Deve decodificar nome');

  console.log('✅ Teste de decodificação de JWT concluído com sucesso!');
}

// 2. Testar comportamento da rota POST sem Token de Autorização
async function testRouteWithoutToken() {
  console.log('🔄 Iniciando teste da rota BFF sem token...');
  
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
  assert.strictEqual(response.status, 401, 'Deve retornar 401 se não houver token');
  
  const data = await response.json();
  assert.ok(data.error.includes('Token não fornecido'), 'Deve conter mensagem de erro apropriada');
  
  console.log('✅ Teste de rota sem token concluído com sucesso!');
}

// Executar todos os testes
async function runTests() {
  try {
    testJWTDecoding();
    await testRouteWithoutToken();
    console.log('\n🎉 Todos os testes de unidade e integração mockada passaram com sucesso!');
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

runTests();
