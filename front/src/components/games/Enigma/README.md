# Enigma – Mini Game

Este diretório contém o mini game "Enigma", um jogo de adivinhação de entidades (autores, cientistas, filósofos etc.) por matéria. O jogador escolhe uma matéria e tenta adivinhar a entidade do dia, recebendo feedback detalhado por atributo (correto, incorreto, parcial, maior/menor).

## Estrutura de Arquivos

- `Enigma.tsx` (client component)
  - Componente principal que renderiza o Lobby (seleção de matéria) e o modo de jogo (playing).
  - Define e usa componentes internos de UI (SearchBar, GuessesTable, AttributeRow, AttributeCell, VictoryModal) e componentes do Lobby (SubjectCard, SubjectGrid).
  - Gerencia estados do jogo (matéria selecionada, entidade alvo, palpites, solução, modal de vitória) e a roleta de seleção aleatória.
- `lib/enigma-data.ts`
  - Define tipos (interfaces) para UI e lógica.
  - Mapeamentos de cores para UI (Tailwind-like) e lista de matérias (`subjects`).
  - Labels de atributos (`attributeLabels`) e base de dados das entidades por matéria (`entitiesBySubject`).
- `functions/enigma-logic.ts`
  - Funções puras de lógica do jogo:
    - `getTargetEntityForDay(subjectId)` – escolhe, de forma determinística por dia, a entidade alvo para a matéria.
    - `getEntitiesForSubject(subjectId)` – retorna todas as entidades de uma matéria.
    - `compareGuess(guess, target)` – compara um palpite contra o alvo e gera `GuessFeedback` atributo a atributo.

## Principais Tipos e Dados

### UI

- `Subject`: representa uma matéria (id, nome, ícone e estilos).
- `ColorMap` / `ColorMappings`: mapa de tonalidades usado para animações e bordas.
- `SubjectCardProps`, `SubjectGridProps`: props para cartões e grade de matérias.

### Lógica

- `Entity`: entidade com `id`, `name` e `attributes`.
- `EntityAttributes`: valores por chave (string | number | string[]).
- `FeedbackStatus`: "correct" | "incorrect" | "partial" | "higher" | "lower".
- `AttributeFeedback`: feedback por atributo (chave, valor, status).
- `GuessFeedback`: feedback completo (entidade, lista de `AttributeFeedback`, flag `isCorrect`).

### Base de Dados

- `subjects`: lista das matérias disponíveis (Matemática, Física, Química, Biologia, História, Geografia, Português, Literatura, Filosofia, Sociologia).
- `attributeLabels`: labels amigáveis para exibição (ex.: "Nacionalidade", "Século").
- `entitiesBySubject`: entidades por matéria com atributos como nacionalidade (string), século (number), área (string) e contribuição (string[]).

## Fluxo de Execução

### Lobby

1. Renderização de cabeçalho e grade de matérias via `SubjectGrid`.
2. Cada `SubjectCard` usa `colorMappings` para animar hover/realce e exibir o nome e ícone da matéria.
3. Há suporte a uma "roleta" aleatória:

- `handleRandomSubject` simula uma rotação com desaceleração (easing) destacando matérias em sequência.
- Garante ao menos duas voltas completas e para exatamente no índice sorteado.

1. Ao selecionar uma matéria (`handleSelectSubject`):

- Determina a entidade alvo do dia com `getTargetEntityForDay`.
- Limpa estado de tentativas e entra no modo "playing".

### Playing (Jogo)

1. Carrega entidades disponíveis da matéria (`getEntitiesForSubject`) e sugere apenas as não tentadas.
2. O jogador pesquisa na `SearchBar` e seleciona uma entidade.
3. Ao enviar um palpite (`handleGuess`):

- Compara com o alvo usando `compareGuess`.
- Adiciona `GuessFeedback` à lista.
- Se `isCorrect`, marca o jogo como resolvido e exibe `VictoryModal`.

1. `GuessesTable` renderiza cada tentativa como uma `AttributeRow`, que contém várias `AttributeCell`:

- `AttributeCell` formata visualmente o valor do atributo e o status:
  - `correct`: verde.
  - `incorrect`: vermelho.
  - `partial`: amarelo (para arrays com interseção parcial).
  - `higher`/`lower`: amarelo com setas (⬆️/⬇️) para atributos numéricos (ex.: "Século").

### Voltar ao Lobby

- `handleBackToLobby` redefine todo o estado e retorna ao modo Lobby.

## Lógica de Feedback

`compareGuess(guess, target)` percorre as chaves de `target.attributes` e compara com `guess.attributes`:
- Arrays: calcula interseção; se iguais e completos → `correct`, se parcial → `partial`, senão → `incorrect`.
- Números: se igual → `correct`, se menor que alvo → `higher` (indica que o século do palpite é menor e deve ser MAIS ALTO), se maior → `lower`.
- Strings: igualdade estrita para `correct`; caso contrário, `incorrect`.

O `isCorrect` final considera igualdade por `id` da entidade.

## UI e Acessibilidade

- Estilização baseada em Tailwind classes pré-mapeadas via `colorMappings` (cores hex e sombras personalizadas).
- Animações com framer-motion (`motion.div`, `AnimatePresence`) para entradas, hover, realce e modal.
- `SubjectCard` e `SearchBar` suportam interação por teclado:
  - `Enter`/`Space` para seleção de matéria.
  - `ArrowUp/ArrowDown` e `Enter` para navegar e confirmar sugestão na busca.
- `aria-label` apropriado nos botões das matérias.

## Como Integrar

1. Importar o componente no fluxo desejado (página ou seção):

   
  ```tsx
   import dynamic from 'next/dynamic';
   const EnigmaLobby = dynamic(() => import('./Enigma'), { ssr: false });

   export default function Page() {
     return (
       <div className="p-6">
         <EnigmaLobby />
       </div>
     );
   }
  ```

`Enigma.tsx` é um client component (usa "use client" e estados), então a importação dinâmica sem SSR evita problemas em ambientes server-side.
   - `Enigma.tsx` é um client component (usa `"use client"` e estados), então a importação dinâmica sem SSR evita problemas em ambientes server-side.

1. Garantir dependências:

- React/Next.js.
- framer-motion (animações).
- Tailwind CSS (opcional, mas o projeto já usa classes e mapas de cor compatíveis).

## Extensibilidade

- Adicionar novas matérias: inclua um objeto em `subjects` e um conjunto de entidades em `entitiesBySubject[novoId]`.
- Adicionar/remover atributos:
  - Atualize `attributeLabels` para exibição.
  - Ajuste entidades para incluir as novas chaves em `attributes`.
  - `compareGuess` já suporta strings, números e arrays; para novos tipos/semânticas, estenda a função.
- Customização de cores: acrescente entradas em `colorMappings` de acordo com classes/temas.
- Sugestões da busca: o filtro atual usa `entity.name.toLowerCase().includes(query.toLowerCase())`; pode ser trocado por fuzzy search.

## Regras de Jogo

- Um jogo por matéria: a entidade alvo é determinística por dia (dependendo do dia do ano), garantindo previsibilidade e reprodutibilidade.
- O jogador pode tentar várias entidades e recebe feedback atributo a atributo.
- Ao acertar, um modal de vitória mostra o resultado e o número de tentativas.

## Considerações Técnicas

- Determinismo diário: `getTargetEntityForDay` calcula o índice pelo dia do ano (mod tamanho da lista). Em uma base maior, considere usar seed diária por matéria.
- Performance: listas pequenas, renderização com key estável (`entity.id + index`). Para bases grandes, prefira memoização e virtualização.
- Acessibilidade/UX: há setas e cores para orientar tentativas numéricas; mantenha labels em `attributeLabels` sincronizados com as chaves reais.

## Limitadores e Próximos Passos

- `VictoryModal` e header/footer do Lobby têm trechos a completar (conteúdo do modal, textos informativos). Preencha conforme a identidade visual do produto.
- Persistência diária de "matérias jogadas" ainda não implementada (apenas estado local). Pode-se salvar em storage ou backend.
- Adicionar sons (já existem no `public/`) para feedback de acerto/erro.
- Internacionalização: textos em PT-BR; extraia para i18n se necessário.

## Glossário Rápido

- Matéria: tema do jogo (ex.: Matemática, História).
- Entidade: alvo a ser adivinhado (ex.: Newton, Cleópatra).
- Atributo: característica usada para dar pistas (ex.: Século, Nacionalidade, Área, Contribuição).
- Feedback: status por atributo do palpite (correto, incorreto, parcial, maior/menor).

---

Qualquer dúvida ou sugestão de melhoria, abra uma issue ou comente no PR correspondente.
