// =============================================================================
// Helpers puros para a árvore Matéria → Conteúdo do recurso
// "Questões resolvidas com IA". Sem React/hooks — apenas transformação de dados.
//
// A chave de `groupedQuestions` é a composta `displaySubject` montada no BFF proxy
// (`/api/user/stats`) como `"${materia} — ${conteudo}"`, usando o em dash U+2014.
// Estes helpers separam essa chave de volta nas duas dimensões e montam a árvore
// de 2 níveis para a UI, preservando a `fullKey` original para casar com o Map.
// =============================================================================

/** Separador composto usado em `displaySubject` (em dash U+2014, com espaços). */
export const SUBJECT_SEPARATOR = " — ";

export interface ParsedSubject {
  materia: string;
  conteudo: string;
}

export interface ConteudoNode {
  conteudo: string;
  /** Chave composta original, casa diretamente com `groupedQuestions`. */
  fullKey: string;
  count: number;
}

export interface MateriaNode {
  conteudos: ConteudoNode[];
  totalCount: number;
}

/**
 * Divide uma chave composta `"Matéria — Conteúdo"` nas duas dimensões.
 * - Quebra apenas no **primeiro** separador (conteúdo com travessão interno é preservado).
 * - Sem separador → `conteudo: "Geral"`.
 */
export function parseSubjectKey(key: string): ParsedSubject {
  const idx = key.indexOf(SUBJECT_SEPARATOR);
  if (idx === -1) {
    return { materia: key.trim(), conteudo: "Geral" };
  }
  const materia = key.slice(0, idx).trim();
  const conteudo = key.slice(idx + SUBJECT_SEPARATOR.length).trim();
  return { materia, conteudo: conteudo || "Geral" };
}

/**
 * Monta a árvore de 2 níveis a partir do Map de questões agrupadas por chave composta.
 * Preserva a ordem de inserção das chaves (matérias e conteúdos na ordem do Map).
 *
 * O parâmetro é tipado de forma estrutural (`{ length }`) para não acoplar este
 * helper puro ao tipo `ReviewableQuestion` do componente.
 */
export function buildSubjectTree(
  grouped: Map<string, { length: number }>,
): Map<string, MateriaNode> {
  const tree = new Map<string, MateriaNode>();

  for (const [fullKey, questions] of grouped) {
    const { materia, conteudo } = parseSubjectKey(fullKey);
    const count = questions?.length ?? 0;

    let node = tree.get(materia);
    if (!node) {
      node = { conteudos: [], totalCount: 0 };
      tree.set(materia, node);
    }
    node.conteudos.push({ conteudo, fullKey, count });
    node.totalCount += count;
  }

  return tree;
}
