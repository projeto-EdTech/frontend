/**
 * Números "aleatórios" determinísticos.
 *
 * Por quê existe: `Math.random()` chamado durante o render quebra a hidratação.
 * O App Router renderiza os client components no servidor também, então cada
 * chamada produz um valor no HTML do servidor e outro na árvore do cliente —
 * React acusa "Hydration failed ... server rendered HTML didn't match".
 *
 * A saída aqui depende só do seed: mesmo texto entra, mesmo número sai, nos
 * dois lados. Serve para valores decorativos que precisam variar por item
 * (largura de barra, estatística fictícia) sem serem realmente aleatórios.
 */

/** Hash FNV-1a de 32 bits. Estável entre runtimes — sem estado global. */
export function hashString(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    // Multiplicação pelo primo FNV (16777619) via somas de shifts para
    // manter o resultado dentro de 32 bits sem estourar para float.
    hash = Math.imul(hash, 0x01000193);
  }
  // >>> 0 devolve o valor como inteiro sem sinal.
  return hash >>> 0;
}

/** Inteiro determinístico em [min, max], derivado do seed. */
export function seededInt(seed: string, min: number, max: number): number {
  if (max < min) {
    throw new Error(`seededInt: max (${max}) menor que min (${min})`);
  }
  const span = max - min + 1;
  return min + (hashString(seed) % span);
}
