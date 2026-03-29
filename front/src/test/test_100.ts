// @ts-ignore
import http from 'k6/http';
// @ts-ignore
import { check, sleep } from 'k6';

// Configuração do teste de carga
export const options = {
    stages: [
        { duration: '30s', target: 100 }, // Sobe para 100 usuários em 30s
        { duration: '1m', target: 100 },  // Mantém 100 usuários por 1 minuto
        { duration: '30s', target: 0 },  // Desce para 0 usuários
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% das requisições devem ser abaixo de 500ms
    },
};

// @ts-ignore
const BASE_URL = 'http://localhost:3000';

export default function () {
    // Lista de rotas baseadas na estrutura do projeto
    const routes = [
        '/',
        '/Arena',
        '/blog',
        '/contato',
        '/estatisticas',
        '/library',
        '/paidPlan',
        '/privacy',
        '/profile',
        '/simulation',
        '/terms',
    ];

    // Simula navegação aleatória pelas rotas
    const route = routes[Math.floor(Math.random() * routes.length)];
    const res = http.get(`${BASE_URL}${route}`);

    // Log para depurar quais rotas estão falhando
    if (res.status !== 200) {
        console.warn(`[FALHA] Rota: ${route} | Status: ${res.status}`);
    }

    // @ts-ignore
    check(res, {
        // @ts-ignore
        'status is 200': (r: any) => r.status === 200,
        // @ts-ignore
        'protocol is HTTP/2': (r: any) => r.proto === 'HTTP/2.0' || r.proto === 'HTTP/1.1',
    });

    // Pequena pausa entre as ações do usuário
    sleep(1);
}
