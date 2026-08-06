# Testes de Performance com k6 🚀

Este diretório contém os scripts de teste de carga e performance utilizando o **k6** (Grafana). O objetivo é simular usuários simultâneos navegando no frontend para validar estabilidade e tempo de resposta.

> **Estes não são os testes unitários.** Os unitários usam **Vitest**, moram em
> `src/test/auth/` e `src/test/payment/`, e rodam com `npm test`. A separação é o sufixo
> `.test.ts`: o `include` do [`vitest.config.mts`](../../../vitest.config.mts) é
> `src/test/**/*.test.ts`, e os scripts k6 não usam esse sufixo — por isso nunca são coletados
> pelo Vitest, mesmo vivendo debaixo de `src/test/`.

Arquivos aqui: `test_25.ts`, `test_50.ts`, `test_75.ts` e `test_100.ts` — a rampa de usuários
virtuais está no nome.

---

## 📋 Pré-requisitos

Para executar os testes, você precisa ter o **k6** instalado no seu sistema:

### Windows (Powershell - Admin)

```powershell
winget install k6
```

### macOS (Homebrew)

```bash
brew install k6
```

### Linux (Debian/Ubuntu)

```bash
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

---

## 🔥 Como Executar

Certifique-se de estar na raiz do diretório `front` e que o servidor local (Next.js) esteja rodando.

### Teste Padrão (Localhost)

```powershell
k6 run src/test/K6/test_25.ts
```

### O que os scripts medem

Navegação anônima pelas **páginas do Next**, não pelos endpoints do BFF. Cada usuário virtual
sorteia uma rota da lista (`/`, `/Arena`, `/blog`, `/contato`, `/estatisticas/*`, `/library`,
`/paidPlan`, `/privacy`, `/terms`) e faz um `GET`. `/profile` está comentado por exigir sessão.

Rampa: sobe até o alvo em 30s, mantém por 4min, desce em 30s. Threshold: `p(95) < 500ms`.

> ⚠️ **`BASE_URL` está fixo em `http://localhost:3000` dentro de cada script.** Não há variável
> de ambiente: para apontar a outro alvo, edite a constante no topo do arquivo.
>
> As páginas medidas dependem do BFF Java. Com ele fora do ar, o teste mede a página de erro —
> **confirme que `BACKEND_API_URL` responde antes de tirar conclusão de performance.**

---

## 🛠️ Como o k6 Funciona?

O k6 é uma ferramenta de teste de carga de código aberto que utiliza scripts em JavaScript (ou TypeScript compilado) para simular o comportamento do usuário.

### 1. Ciclo de Vida do Script

- **Init context:** Carregamento de módulos, leitura de arquivos e definição de opções (`export const options`).
- **Setup context:** Lógica de configuração (ex: autenticação) - opcional.
- **VU context (Default function):** Onde a mágica acontece. O k6 executa esta função repetidamente conforme definido nos `stages`.
- **Teardown context:** Limpeza final de dados - opcional.

### 2. Modelagem dos Scripts (Options)

O objeto `options` define como o teste se comporta:

- **Stages:** Controla a rampa de usuários.
  - `duration`: Quanto tempo o estágio dura.
  - `target`: Número de usuários virtuais (VUs) simultâneos.
- **Thresholds:** Critérios de sucesso/falha (Pass/Fail).
  - Ex: `http_req_duration: ['p(95)<500']` (95% das requisições devem levar menos de 500ms).

### 3. Métricas e Resultados

- **Checks:** Validações lógicas (ex: status 200). Eles não interrompem o teste se falharem, apenas aparecem no relatório.
- **VUs:** Virtual Users (simulações de usuários reais).
- **Iteration Duration:** Tempo que o script levou para executar a `default function` uma vez.

---

## 🔍 Depuração

Se o resumo final mostrar falhas (`X`), verifique os logs no terminal:

- Verificamos se o status é `200`.
- Verificamos se o protocolo é `HTTP/2` ou `HTTP/1.1`.
- O log `[FALHA]` impresso no terminal indica qual rota específica não respondeu corretamente.

---

## 📝 Documentação Oficial

Para se aprofundar em métricas personalizadas, cenários complexos ou testes de API:
[Documentação Oficial do k6](https://k6.io/docs/)
