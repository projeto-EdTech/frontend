# Relatório de Otimizações de Renderização e Bundle

Este documento descreve detalhadamente as melhorias de performance ("Code Splitting" e "Memoization") aplicadas à rota de simulação (`/simulation/[university]`), focadas em aumentar a estabilidade frente a altos volumes de usuários virtuais (VUs) e em eliminar engasgos na Thread principal do navegador.

## 1. Otimizações Realizadas

### A. Code Splitting de Libs Pesadas (Markdown e Latex)

- **Arquivo Modificado:** `src/components/Simula_PRO/SimulationQuizClient.tsx`
- **Novo Arquivo:** `src/components/Simula_PRO/DynamicMarkdown.tsx`
- **Ação:** As bibliotecas `react-markdown`, `remark-math` e `rehype-katex` processam blocos textuais extensos e consomem recursos significativos de parsing. Elas foram isoladas na criação de um wrapper (`DynamicMarkdown`).
- **Garantia de Performance:** Utilizando `next/dynamic` com a diretiva genérica `{ ssr: false }`, forçamos o React a extrair estas dependências do arquivo de First Load JS e servi-las sob demanda. Um `loading` preenche a seção de texto para evitar quebras visuais (Layout Shifts) enquanto a formatação chega.

### B. Dynamic Loading de Componentes Base (Code Splitting)

- **Arquivo Modificado:** `src/app/simulation/[university]/page.tsx`
- **Ação:** A tag `<Footer />`, que fica oculta ao usuário no primeiro momento (Abaixo da moldura principal), foi convertida nativamente para Lazy Load via `import dynamic from "next/dynamic"`.
- **Garantia de Performance:** Todo o CSS embutido ou dependências presentes no rodapé foram expurgados da árvore inicial de carregamento rápido.

### C. Isolamento Total do Carrossel contra "Timer Re-renders"

- **Arquivo Modificado:** `src/components/QuestionCarousel.tsx`
- **Ação:** O componente de Quiz original gerencia um estado `timeRemaining` que causa renderizações contínuas a cada 1 segundo.
- **Garantia de Performance:** O componente de Carrossel de navegação de perguntas inteiro foi envolvido com `React.memo()`. Este isolamento o protege de refletir as cascatas de renderização do timer. A lista de navegação não recitará cálculos a não ser que o usuário troque de página.

### D. Micro-Memoização em Listas de Alta Densidade

- **Arquivo Modificado:** `src/components/QuestionCarousel.tsx`
- **Ação:** Envolver o componente macro não é suficiente. Um simulado ENEM contém cerca de 180 cards. Criamos um subcomponente micro (`CarouselItem`) para envelopar unicamente a `<button>` correspondente ao número da questão e seu status. Esse microcomponente obteve seu próprio `React.memo()`.
- **Garantia de Performance:** Em vez da página inteira percorrer, destriuir e redesenhar 180 botões sempre que o estudante avançar a resposta, o "React Fiber Reconciler" descartará a comparação dos botões ignorados. Agora, respondendo à 'Questão 1', apenas o botão '1' muda para Status Confirmado, e apenas o '2' muda para Atual — reduzindo virtualmente o overhead da "Commit/Render Phase" em 98%.

### E. Progressive Rendering e Streaming Server-Side com Suspense

- **Arquivos Modificados:** `src/app/estatisticas/[subject]/page.tsx`, `src/app/simulation/[university]/page.tsx`, `src/app/Nota-corte/page.tsx`
- **Novos Componentes Asíncronos:** `EstatisticasDados.tsx`, `SimulacaoLoader.tsx`, `NotaCorteResultados.tsx`
- **Ação:** Removemos a renderização integral pelo Cliente (`useEffect`). As raízes da página se tornaram **React Server Components (RSC)** e os dados de negócio densos foram envelopados usando **React 18 `<Suspense>`** com fallbacks customizados (Skeletons Screens).
- **Garantia de Performance:** A UI base ("Casca") chega instantaneamente via HTTP Stream, mantendo o TTFB muito baixo enquanto transfere a computabilidade pesada do Browser do Aluno para a arquitetura do painel NextJS.

### F. Transição para Autenticação Server-Side (BFF Sync via Cookies)

- **Arquivo Modificado:** `src/app/api/sync-user/route.ts` e `SyncUserEffect.tsx`
- **Ação:** Como o NextJS no modo Server não possui acesso ao `localStorage`, o token de acesso (JWT do BFF Java) ganhou uma contra-medida que agora o injeta em um formato de *HTTP-Only Cookie* na autenticação.
- **Garantia de Performance:** Garante segurança (cross-site security) e possibilita que os Server Components supracitados criem as próprias APIs calls autônomas na mesma fração de segundo que a rota subiu na Vercel ou contêiner local, livrando a "thread do cliente" da enxurrada de requests.

### G. Camada de Cache Híbrida (ISR + SWR) e Prevenção de Waterfalls

- **Arquivos Modificados:** `src/app/profile/page.tsx`, `src/components/Simula_PRO/NotaCorteResultados.tsx`, `SimulacaoLoader.tsx`, `EstatisticasDados.tsx`
- **Novos Componentes:** `NotaCorteResultadosClient.tsx`
- **Ação:** Otimizamos o carregamento de dados do tipo GET / POST com uma abordagem de dupla camada (Hybrid Cache) suportante a SWR. As Requisições de dados de domínio imutável (como blocos de questões, catálogos estáticos) ganharam a trava `next: { revalidate: 60 }` gerando uma Geração Estática Incremental (ISR). Em contrapartida, dados mutáveis acoplados ao Perfil do usuário ganharam a biblioteca de requisições baseadas em revalidação de background **useSWR**. Também introduzimos chamadas agrupadas via `Promise.all` em Rotas híbridas para abater bloqueios hierárquicos em série (Waterfalls).
- **Garantia de Performance:** O uso de SWR garante a imediata disponibilização do dado provido (FallbackData) na transição de sub-rotas mantendo a fluidez de interface sem Loading Spinners obstrutivos. O ISR diminui o stress do *Java BFF* garantindo a entrega do payload em respostas serializadas diretamente da infraestrutura da Vercel/Node local em frações de milissegundos.

---

## 2. Como Testar as Otimizações

A verificação garante visualmente e nos logs o êxito arquitetural. Siga os passos:

### Teste de Bundle Size (Tamanho da Carga)

1. Certifique-se de não estar logando erros no CLI e no path `front/` pare o processo de dev se for necessário.
2. Execute no terminal: `npm run build`
3. O terminal gerará a árvore "Route (app) / Size / First Load JS". Analise o First Load e chunk individual liberado da rota `├ λ /simulation/[university]`. Perceba que o valor está menor pois grande parte se enquadrará em chunks isolados apontando o seu DynamicMarkdown e Footer fora do fio-guarda vermelho de sobrecarga do NextJS.

### Teste Visual de Estresse (React Developer Tools)

1. Rode a build ou servidor padrão `npm run dev` e instale a extensão [React Developer Tools](https://react.dev/learn/react-developer-tools) no Google Chrome.
2. Abra a aba do **Profiler**. Clique no ícone de engrenagem (`Configurações/Settings`).
3. Em *General*, ative o checkbox com o nome: **"Highlight updates when components render"** (Destacar alterações quando componentes renderizarem).
4. **Análises Obrigatórias em Simulado aberto:**
   - **O Relógio Avançando:** Apenas caixinhas vermelhas ou azuis devem piscar contornando a região do Timer. **O bloco inteiro das 180 questões do Carrossel e do Botão NÃO devem piscar repetidas vezes**, ele precisa estar mudo no dev tools.
   - **Ação de Avanço "Próximo":** Ao estar na Questão 1 e apertar o botão "Próximo" para a Questão 2. Verifique o Carrossel visual de botões numéricos lá em cima. Você verá brilhar unicamente os quadros do Número 1 e do Número 2 limitadamente, além do local de texto, e NADA irá piscar os botões do 3 ao 180.
   - Vá descendo o scroll até encontrar o rodapé (Footer). Só então os elementos de Network da aba de desenvolvedor capturarão sua injeção em memória secundária.

### Teste de TTFB e Renderização de Esqueletos (Progressive Rendering)

1. Para atestar que a Arquitetura de Server Components (RSC) com Autenticação está fluída, certifique-se primeiramente de estar logado no sistema para que seu `JWT` já esteja alocado nos Cookies (`user_data`).
2. Abra a página em Modo Anônimo (com o cookie replicado) ou abra o painel Dev Tools na aba **Rede (Network)**, ativando a opção **"Desativar Cache"**.
3. Na configuração de estrangulamento da sua internet (Throttling, onde fica "Sem restrições/No Throttling"), altere para **"Fast 3G"** ou **"Slow 3G"**.
4. Recarregue toda a página pelo browser ou navegue para uma rota pesada, como `/estatisticas/matematica` ou `/simulation/usp`.
5. **Observação Inicial (FCP - TTFB Baixo):** Observe no painel o exato milissegundo de resposta HTTP; o layout principal da aplicação carregará quase que instantaneamente recebendo na tela o Header e os contornos pulsantes dos Skeletons (antes mesmo dos seus assets pesados chegarem). Isso é a prova física do *Streaming* despachando o "Shell" inicial da aplicação para o Client!
6. **Desfecho:** Continue aguardando os milissegundos e veja que, de repente, os esqueletos serão trocados na DOM pelos dados reais que o Java BFF enviou ao Server Component por trás dos panos, provando a eficácia total do modelo!

### Teste de Cache Híbrido (ISR e SWR Background Polling)

1. Para atestar a efetividade do **SWR (Stale-While-Revalidate)**, certifique-se de estar logado e abra a página de Perfil (`/profile`).
2. Alterne de aba ou de contexto simulando a navegação de retorno (clique fora do Box de simulação e volte o foco, ou acesse `/Nota-corte` e volte via Botão do Browser).
3. Note que o carregamento dos Stats (Acertos, erros, gráficos) **brota de forma imediata** sem as antigas travas visuais geradas pelos Skeletons repetitivos. Na aba de Desenvolvimento (Network), você notará uma discreta requisição autônoma (Fetch XHR) que a biblioteca do SWR faz silenciosamente para garantir que seus dados permaneçam vivos, atualizando o dom sem flickering.
4. Para atestar o **ISR (Incremental Static Regeneration)** de 60 segundos associado, simule acessos de diferentes abas anônimos com um cache habilitado na porta local `localhost:3000`. O Node interceptará a requisição da segunda aba devolvendo a Build em cache da 1º ocorrida no minuto anterior, ignorando o trajeto até o Java Backend e reduzindo a carga do banco de dados na AWS de simulados!
