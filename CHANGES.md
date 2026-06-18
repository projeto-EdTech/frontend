# Modificações Realizadas - Pop-up de Subida de Ranking

Implementada a funcionalidade global de exibição de pop-up comemorativo quando o usuário sobe de ranking, respeitando as regras visuais premium Apple-like HIG e com suporte a animações ricas (Framer Motion + Anime.js). A notificação é suspensa durante a realização de simulados de prova ativos.

## 📁 Arquivos Modificados/Criados

1. **[NEW]** [`front/src/lib/utils/rankUpUtils.ts`](file:///d:/GitHub/frontend/front/src/lib/utils/rankUpUtils.ts)
   - Utilitários puros para comparar a subida de nível de ranking e validar se a rota atual permite ou não a exibição do popup de notificação.

2. **[NEW]** [`front/src/components/ranking/RankingUpNotification.tsx`](file:///d:/GitHub/frontend/front/src/components/ranking/RankingUpNotification.tsx)
   - Componente React cliente global que detecta a subida de ranking por meio de polling à rota `/api/ranking` e exibe o modal premium com glassmorphism.
   - Utiliza Framer Motion para a entrada e saída suave do modal com física de mola (`type: "spring"`), escala elástica no clique de fechar, e Anime.js para disparar uma explosão radial de partículas comemorativas e brilho pulsante no ícone.

3. **[MODIFY]** [`front/src/app/layout.tsx`](file:///d:/GitHub/frontend/front/src/app/layout.tsx)
   - Importação e montagem do componente `<RankingUpNotification />` de forma global, aninhado abaixo dos provedores principais.

4. **[MODIFY]** [`front/src/package.json`](file:///d:/GitHub/frontend/front/package.json)
   - Adicionados pacotes `animejs` e `@types/animejs` para suporte a animações de partículas avançadas no cliente.

5. **[NEW]** [`front/src/test/test-ranking-up.ts`](file:///d:/GitHub/frontend/front/src/test/test-ranking-up.ts)
   - Script de testes unitários automatizados para garantir a exatidão das comparações de ranking (Bronze ➔ Prata ➔ Ouro ➔ Diamante) e a regra de supressão nas rotas de simulação ativa.

6. [RankingUpNotification.tsx](file:///d:/GitHub/frontend/front/src/components/ranking/RankingUpNotification.tsx)

- **Design Glassmorphism**: Redesenhado o contêiner do modal para usar `bg-white/80 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/40 backdrop-blur-xl rounded-[32px]` em total sintonia com o Apple HIG.
- **Máquina de Estados FPS**: Criada a máquina de estados baseada nas fases:
  - `progress-start`: Barra de progresso linear avança de 80% para 100% (ou 20% para 0% no rebaixamento).
  - `shattering`: Tremor leve do modal e estilhaço/desintegração do elo antigo com dispersão de partículas via Anime.js. Adicionado suporte a rachaduras visuais em rebaixamentos.
  - `reveal`: Flash de luz na tela, tremor forte (heavy shake) de impacto, anel expansivo de onda de choque e surgimento do novo elo com mola elástica responsiva (`stiffness: 280, damping: 14`).
  - `completed`: Estabilização final, revelação gradual e animada (altura e opacidade) dos textos, do mascote e do botão de prosseguir.
- **Compatibilidade com Anime.js v4**: Corrigido o erro `Uncaught TypeError: anime is not a function` no navegador e erros de compilação TypeScript:
  - Removido o pacote obsoleto `@types/animejs` (v3) em prol das definições de tipo nativas inclusas no `animejs` v4.
  - Corrigida a assinatura da função `animate` no [RankingUpNotification.tsx](file:///d:/GitHub/frontend/front/src/components/ranking/RankingUpNotification.tsx) para o padrão `animate(targets, parameters)` exigido pela v4.
- **Mascote Flutuante**: Substituída a animação de pulo (`animate-bounce`) do camaleão por um efeito de flutuação vertical contínua sutil usando o `<motion.div>` do Framer Motion.
- **Exibição de Badges no Modal**:
  - Implementada chamada à API `/api/user/stats` ao abrir o modal para obter as estatísticas do usuário.
  - Integrada a função `computeBadges` para calcular as badges e seus respectivos elos/ranks com base nas conquistas do estudante.
  - Exibido um grid responsivo de badges no final do fluxo (`grid-cols-2`), mostrando o ícone correspondente e a liga em que cada uma se encontra.

---

# Modificações Realizadas - Sincronização e Atualização do Perfil

Foi desenvolvido o fluxo completo para integrar e sincronizar as configurações de destino do usuário (`PROVA_ALVO`, `CURSO_ALVO` e `Instituição`) com o backend.

## 📁 Arquivos Modificados/Criados

1. **[NEW]** [`front/src/app/api/user/profile/route.ts`](file:///d:/GitHub/frontend/front/src/app/api/user/profile/route.ts)
   - Criação da rota BFF que recebe as atualizações de configurações do usuário (`targetExam`, `targetCourse`, `institution`) e as envia via requisição `POST` com autenticação JWT (Bearer) para o backend (`${process.env.BACKEND_API_URL}/user/profile`).

2. **[MODIFY]** [`front/src/app/service/jwtDecoder.ts`](file:///d:/GitHub/frontend/front/src/app/service/jwtDecoder.ts)
   - Atualização da interface `JWTPayload` para conter os novos campos das preferências do usuário (`prova_alvo`, `curso_alvo`, `instituicao`, `targetExam`, `targetCourse`, `institution`).

3. **[MODIFY]** [`front/src/components/SyncUserEffect.tsx`](file:///d:/GitHub/frontend/front/src/components/SyncUserEffect.tsx)
   - Alteração para obter os dados do backend pós-login na rota `/api/sync-user`, decodificá-los do token (ou resposta JSON direta) e salvar no `sessionStorage` (chaves `"userProfileSettings"` e `"user_profile_data"`), permitindo que os campos já venham preenchidos.

4. **[MODIFY]** [`front/src/components/profile/ProfileClient.tsx`](file:///d:/GitHub/frontend/front/src/components/profile/ProfileClient.tsx)
   - Atualização do método `handleSaveProfile` para realizar a chamada assíncrona para `/api/user/profile` enviando os dados do perfil ao backend (em ambiente de produção/real).
   - Ajuste no carregamento inicial (`useEffect` de montagem) para, caso o `sessionStorage` esteja limpo, obter as configurações a partir do JWT decodificado do `localStorage`.

5. **[MODIFY]** [`front/src/app/api/README.md`](file:///d:/GitHub/frontend/front/src/app/api/README.md)
   - Adicionada documentação para a nova rota BFF `/api/user/profile` e mapeamento de uso.

6. **[NEW]** [`front/src/test/test-user-profile.ts`](file:///d:/GitHub/frontend/front/src/test/test-user-profile.ts)
   - Criação de scripts de teste para verificar a decodificação do JWT e o fluxo BFF da rota `/api/user/profile`.

7. **[MODIFY]** [`front/src/components/blog/BlogDataServer.tsx`](file:///d:/GitHub/frontend/front/src/components/blog/BlogDataServer.tsx), [`front/src/components/blog/BlogPostDataServer.tsx`](file:///d:/GitHub/frontend/front/src/components/blog/BlogPostDataServer.tsx), [`front/src/components/profile/ProfileDataServer.tsx`](file:///d:/GitHub/frontend/front/src/components/profile/ProfileDataServer.tsx), [`front/src/components/UniversitiesCountBadge.tsx`](file:///d:/GitHub/frontend/front/src/components/UniversitiesCountBadge.tsx)
   - Remoção do fallback "http://localhost:8080" hardcoded, garantindo que a URL do backend venha exclusivamente de `process.env.BACKEND_API_URL` sem valores embutidos diretamente no código.

---

## ⚠️ Atenção sobre o Formato do JSON do Backend

Como o formato exato das chaves retornadas pelo backend pode variar, o frontend foi estruturado para ser resiliente a ambas as convenções (**snake_case** e **camelCase**).

Se for necessário realizar ajustes no futuro:

### 1. Se o Backend retornar chaves diferentes no JWT decodificado ou no JSON de Sincronização:

Abra o arquivo [`SyncUserEffect.tsx`](file:///d:/GitHub/frontend/front/src/components/SyncUserEffect.tsx) e localize as linhas de definição de constantes:

```typescript
const targetExam = decoded?.prova_alvo || decoded?.targetExam || data?.prova_alvo || data?.targetExam || "";
const targetCourse = decoded?.curso_alvo || decoded?.targetCourse || data?.curso_alvo || data?.targetCourse || "";
const institution = decoded?.instituicao || decoded?.institution || data?.instituicao || data?.institution || "";
```

E o arquivo [`ProfileClient.tsx`](file:///d:/GitHub/frontend/front/src/components/profile/ProfileClient.tsx):

```typescript
institution: decoded.instituicao || decoded.institution || "",
targetExam: decoded.prova_alvo || decoded.targetExam || "",
targetCourse: decoded.curso_alvo || decoded.targetCourse || "",
```

Basta adicionar a nova chave retornada pelo backend usando o operador lógico `||` para manter a compatibilidade.

### 2. Se o Backend esperar chaves diferentes ao salvar o perfil:

Abra o arquivo [`route.ts`](file:///d:/GitHub/frontend/front/src/app/api/user/profile/route.ts) e ajuste o objeto `payload` encaminhado ao backend:

```typescript
const payload = {
  prova_alvo: targetExam,
  curso_alvo: targetCourse,
  instituicao: institution,
  targetExam,
  targetCourse,
  institution
};
```

Mapeie as chaves do objeto para o padrão exato exigido pela sua API do backend.

---

# Modificações Realizadas - Sincronização do Card de Posição do Usuário (Sua Posição Atual) com DEV_CONFIG

Foi implementada a sincronização imediata no primeiro carregamento e nas requisições de polling do elo e score do usuário com as configurações estáticas definidas em `profile.ts` (`DEV_CONFIG`).

## 📁 Arquivos Modificados/Criados

1. **[MODIFY]** [`front/src/components/ranking/RankingClient.tsx`](file:///d:/GitHub/frontend/front/src/components/ranking/RankingClient.tsx)
   - Implementada a função auxiliar `getProcessedInitialData` que intercepta o `initialRankingData` pré-renderizado no servidor durante o desenvolvimento (`DEV_CONFIG.enabled: true`).
   - Sobrescreve o score do usuário atual para `DEV_CONFIG.devScore`, recalcula a liga correspondente e reordena/recalcula as posições da lista de ranking no primeiro carregamento do cliente.
   - Corrige o problema onde o card "Sua Posição Atual" piscava ou exibia a pontuação real do banco (50.000 pts) em vez da pontuação mockada (1.500 pts).

2. **[MODIFY]** [`front/src/components/ranking/RankingUpNotification.tsx`](file:///d:/GitHub/frontend/front/src/components/ranking/RankingUpNotification.tsx)
   - Adicionada a importação do helper `getRankFromScore` de `rankUtils`.
   - Interceptado o resultado do fetch de polling periódico (`checkRanking`) para que, caso o modo de desenvolvimento esteja ativado, a liga do usuário também seja atualizada de acordo com o `devScore`. Isso evita falsas detecções de subida/queda de liga por disparidade de pontuação entre API real e mocks.

3. **[MODIFY]** [`front/src/test/test-ranking-up.ts`](file:///d:/GitHub/frontend/front/src/test/test-ranking-up.ts)
   - Inclusão do caso de teste `testDevConfigMocking()` que valida a lógica de substituição de score, recálculo de liga e re-ordenação/posicionamento correto da lista de ranking.

---

# Modificações Realizadas - Alinhamento Visual das Badges (Coesão)

Foi realizado o refactoring dos componentes de conquistas para garantir a coesão visual e funcional entre o carrossel do perfil e o modal de subida de ranking.

## 📁 Arquivos Modificados/Criados

1. **[MODIFY]** [`front/src/components/ranking/RankingUpNotification.tsx`](file:///d:/GitHub/frontend/front/src/components/ranking/RankingUpNotification.tsx)
   - Adicionado o ícone `Lock` ao import de `"lucide-react"`.
   - **Tópico 2 (Cores & Tons):** Sincronizada a paleta de cores `BADGE_TIER_STYLES` com os tons metálicos refinados (como `amber-500` para bronze, `gray-400` para prata, `yellow-500` para ouro) e as opacidades corretas (`/[0.08]`) de `AchievementCarousel.tsx`.
   - **Tópico 3 (Estado de Bloqueio):** Implementado o overlay de bloqueio com `backdrop-blur-[2px]` e o ícone `Lock` cobrindo o ícone original da badge quando bloqueada, além de opacidade reduzida e escala de cinzas (`opacity-60 grayscale`) no card.
   - **Tópico 4 (Geometria):** Curvatura dos cards de conquistas alterada de `rounded-2xl` para `rounded-3xl` (Squircle Apple HIG).
   - **Tópico 5 (Progresso):** Substituído o gradiente colorido por elo na mini barra de progresso ativa pelo gradiente azul-indigo unificado `from-blue-500 to-indigo-500`.

2. **[NEW]** [`front/src/test/test-badge-cohesion.ts`](file:///d:/GitHub/frontend/front/src/test/test-badge-cohesion.ts)
   - Criação de testes unitários para validar a correspondência das propriedades de cores, fundos e bordas de cada elo/tier das conquistas com o carrossel de perfil.


