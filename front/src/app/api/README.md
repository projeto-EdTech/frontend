# Documentação da API do Frontend

Este diretório `app/api` contém as rotas de API do Next.js (App Router) que servem como backend-for-frontend (BFF) ou endpoints diretos para funcionalidades do sistema.

Abaixo está a explicação detalhada de cada rota, seu método HTTP suportado e o motivo de sua utilização no sistema.

---

## 🔐 Autenticação (`auth`)

### `/api/auth/[...nextauth]`

- **Método:** `GET`, `POST`
- **Descrição:** Configuração central do **NextAuth.js**. Gerencia todo o fluxo de autenticação (login, logout, sessões, callbacks).
- **📄 Origem dos Dados:** Configurações definidas em `src/lib/auth.ts`.
- **Por que é utilizada:** É o núcleo da segurança da aplicação, permitindo que usuários façam login com provedores (Google, GitHub, Credenciais, etc.) e mantendo a sessão do usuário segura.

---

## 👤 Usuário e Sincronização

### `/api/sync-user`

- **Método:** `POST`
- **Descrição:** Rota responsável por sincronizar os dados do usuário autenticado (via NextAuth) com o banco de dados/backend externo.
- **📥 Payload Esperado (JSON):**

  ```json
  {
    "profileIcon": "string (opcional)"
  }
  ```

  *(Nota: Os dados principais como nome e e-mail são extraídos automaticamente do token de sessão seguro)*.
- **📄 Origem dos Dados:** Repassa os dados para o Backend Externo (URL definida em variáveis de ambiente).
- **Por que é utilizada:** Garante que, ao logar no frontend, o usuário também exista e esteja atualizado no sistema principal (backend), enviando dados como nome, email e foto.

### `/api/user/stats`

- **Método:** `GET`
- **Descrição:** Retorna as estatísticas de desempenho do aluno (simulados feitos, questões respondidas, taxa de acerto, histórico recente).
- **📄 Origem dos Dados:** Dados mockados (fictícios) definidos estaticamente dentro da própria função da rota (`mockData` em `route.ts`).
- **Por que é utilizada:** Alimenta o **Dashboard do Aluno**, exibindo gráficos de progresso e métricas de estudo.

### `/api/subscribe`

- **Método:** `POST`
- **Descrição:** Inscreve o e-mail do usuário autenticado em uma lista de newsletter ou serviço de notificações no backend.
- **📥 Payload Esperado (JSON):**

  ```json
  {
    "newsletter": true // boolean
  }
  ```

- **📄 Origem dos Dados:** Envia para o Backend Externo.
- **Por que é utilizada:** Permite que o usuário opte por receber novidades ou atualizações do sistema.

---

## 📚 Conteúdo e Dados Acadêmicos

### `/api/universities`

- **Método:** `GET`
- **Descrição:** Retorna uma lista com todas as universidades cadastradas no sistema.
- **📄 Origem dos Dados:** Array estático `universities` exportado de `src/lib/dataUniversity.ts`.
- **Por que é utilizada:** Popula menus de seleção (dropdowns) e listas de filtros para que o usuário escolha a instituição desejada.

### `/api/universities/[university]`

- **Método:** `GET`
- **Descrição:** Retorna os detalhes de uma universidade específica com base no "slug" ou nome fornecido na URL.
- **📄 Origem dos Dados:** Filtrado do array estático em `src/lib/dataUniversity.ts`.
- **Por que é utilizada:** Exibe informações detalhadas de uma instituição específica selecionada pelo usuário.

### `/api/questions/[university]`

- **Método:** `GET`
- **Descrição:** Busca questões de vestibular de uma universidade específica. Aceita parâmetros de consulta (`query params`) como `year` (ano), `day` (dia) e `count` (quantidade).
- **📄 Origem dos Dados:** Array estático `allQuestions` exportado de `src/lib/dataUniversity.ts` (filtrado dinamicamente).
- **Por que é utilizada:** É o motor da área de **Simulados e Questões**. Permite filtrar e entregar as questões corretas para o usuário praticar.

### `/api/estatisticas/[subject]`

- **Método:** `GET`
- **Descrição:** Fornece estatísticas de desempenho (como nota de corte ou incidência) para uma matéria (`subject`) específica. Pode filtrar por vestibular.
- **📄 Origem dos Dados:** Objeto estático `dataStats` exportado de `src/lib/dataStats.ts`.
- **Por que é utilizada:** Ajuda o aluno a entender quais matérias são mais cobradas ou qual o desempenho esperado em tópicos específicos.

### `/api/Nota-corte`

- **Método:** `GET`, `POST`
- **Descrição:** **POST:** Calcula a aprovação baseada na nota do usuário e o curso. **GET:** Busca a lista de todos os cursos disponíveis.
- **📥 Payload Esperado (JSON):**

  ```json
  {
    "userScore": 750,       // number
    "targetCourse": "Medicina", // string
    "targetInstitution": "USP"  // string (opcional)
  }
  ```

- **📄 Origem dos Dados:** Consulta o Backend Externo (URL definida em variáveis de ambiente).
- **Por que é utilizada:** Integra com a base de dados real de notas de corte do backend para fornecer resultados precisos de aprovação e listar cursos para o perfil do usuário.

### `/api/blog`

- **Método:** `GET`
- **Descrição:** Retorna todos os posts do blog.
- **📄 Origem dos Dados:** Funções auxiliares `getAllPosts` em `src/lib/post.ts` (provavelmente lendo arquivos Markdown/MDX locais).
- **Por que é utilizada:** Alimenta a página principal do Blog com a lista de artigos disponíveis.

### `/api/blog/[slug]`

- **Método:** `GET`
- **Descrição:** Retorna o conteúdo completo de um post específico do blog.
- **📄 Origem dos Dados:** `getPostBySlug` em `src/lib/post.ts`.
- **Por que é utilizada:** Renderiza a página de leitura de um artigo individual.

---

## 💳 Pagamentos e Assinaturas (`process-subscription`)

Estas rotas integram com o gateway de pagamento **Mercado Pago** para processar assinaturas do plano "Simula Pro".

### `/api/process-subscription/credit-card`

- **Método:** `POST`
- **Descrição:** Processa pagamentos via **Cartão de Crédito**. Recebe o token do cartão e dados do pagador.
- **📥 Payload Esperado (JSON):**

  ```json
  {
    "transaction_amount": 100,
    "token": "token_do_cartao",
    "planId": "plano_anual",
    "installments": 1,
    "payment_method_id": "master",
    "issuer_id": "...",
    "payer": {
      "email": "user@example.com",
      "identification": { "number": "CPF" }
      // ...outros dados do pagador
    }
  }
  ```

- **📄 Origem dos Dados:** Envia requisição para a API do Mercado Pago.
- **Por que é utilizada:** Permite a assinatura recorrente ou pagamento único via cartão de forma transparente.

### `/api/process-subscription/pix`

- **Método:** `POST`
- **Descrição:** Gera um pagamento via **Pix**. Retorna o código "Copia e Cola" e o QR Code em Base64.
- **📥 Payload Esperado (JSON):**

  ```json
  {
    "transaction_amount": 100,
    "payer": {
      "email": "user@example.com",
      "first_name": "Nome",
      "last_name": "Sobrenome",
      "identification": { "type": "CPF", "number": "12345678900" }
    }
  }
  ```

- **📄 Origem dos Dados:** Envia requisição para a API do Mercado Pago.
- **Por que é utilizada:** Oferece o método de pagamento instantâneo Pix para os usuários.

### `/api/process-subscription/boleto`

- **Método:** `POST`
- **Descrição:** Gera um **Boleto Bancário**.
- **📥 Payload Esperado (JSON):**

  ```json
  {
    "transaction_amount": 100,
    "payer": {
      "email": "...",
      "firstName": "...",
      "lastName": "...",
      "docType": "CPF",
      "docNumber": "...",
      "address": { "zip_code": "...", "street_name": "...", ... }
    }
  }
  ```

- **📄 Origem dos Dados:** Envia requisição para a API do Mercado Pago.
- **Por que é utilizada:** Oferece a opção de pagamento via boleto para quem não usa cartão ou Pix.

### `/api/webhooks/mercadopago`

- **Método:** `POST`
- **Descrição:** Endpoint público que recebe notificações automáticas do Mercado Pago (Webhooks).
- **📥 Payload Esperado (JSON):**

  ```json
  {
    "action": "payment.created", // ou type
    "data": { "id": "123456" }
  }
  ```

- **Por que é utilizada:** Permite que o sistema reaja a mudanças de status de pagamento (ex: assinatura cancelada, pagamento aprovado) sem ação do usuário, atualizando o banco de dados automaticamente.

---

## 🎨 Utilitários

### `/api/get-logo`

- **Método:** `GET`
- **Descrição:** Localiza e retorna o caminho da imagem do logo de uma universidade, lidando com variações de nomes e slugs.
- **📄 Origem dos Dados:** Sistema de arquivos local (lê a pasta `public/Logo_Universidades`).
- **Por que é utilizada:** Garante que o frontend consiga exibir o logo correto mesmo se o nome da universidade estiver formatado de maneira ligeiramente diferente (ex: "PUC-SP" vs "pucsp").

---

## 🗺️ Mapeamento de Uso no Frontend

Abaixo listamos onde cada rota está sendo consumida nos componentes e páginas do frontend:

| Check | Rota | Arquivos Consumidores |
| :--- | :--- | :--- |
| ✅ | **`/api/auth/[...nextauth]`** | `src/app/api/auth/[...nextauth]/route.ts` |
| ✅ | **`/api/sync-user`** | `src/components/SyncUserEffect.tsx` |
| ✅ | **`/api/user/stats`** | `src/app/profile/page.tsx` |
| ✅ | **`/api/subscribe`** | `src/components/blog/SubscribeButton.tsx` |
| ✅ | **`/api/universities`** | `src/components/Sidebar.tsx`<br>`src/components/Simula_PRO/NotaCorteConsulta.tsx`<br>`src/components/profile/UserConfig.tsx`<br>`src/app/library/page.tsx`<br>`src/app/page.tsx` |
| ✅ | **`/api/questions/[university]`** | `src/app/simulation/[university]/page.tsx` |
| ✅ | **`/api/estatisticas/[subject]`** | `src/app/estatisticas/[subject]/page.tsx` |
| ✅ | **`/api/Nota-corte`** | `src/components/Simula_PRO/NotaCorteConsulta.tsx`<br>`src/components/profile/UserConfig.tsx`<br>`src/app/profile/page.tsx` |
| ✅ | **`/api/games/flash-cards`** | `src/components/games/flash-card_game/Flash-card.tsx` |
| ✅ | **`/api/blog`** | `src/app/blog/page.tsx` |
| ✅ | **`/api/blog/[slug]`** | `src/app/blog/[slug]/page.tsx` |
| ✅ | **`/api/webhooks/mercadopago`** | `` |
| ✅ | **`/api/process-subscription/credit-card`** | `src/app/paidPlan/page.tsx` |
| ✅ | **`/api/process-subscription/pix`** | `src/app/paidPlan/page.tsx` |
| ✅ | **`/api/process-subscription/boleto`** | *(Não identificado uso explícito no frontend atual)* |
| ✅ | **`/api/get-logo`** | `src/components/Simula_PRO/NotaCorteConsulta.tsx` |
