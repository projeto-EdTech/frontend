// =============================================================================
// Resolver puro: deriva a logo da universidade a partir do `displayLabel`
// de uma questão revisável (ex.: "FUVEST 2025" → "/Logo_Universidades/fuvest.jpg").
//
// A 1ª palavra do displayLabel é o identificador da prova/universidade. Casamos
// contra a lista de universidades (vinda de UniversityStorage / fallback local)
// por `slug` e, secundariamente, por `name` — ambos case-insensitive.
// Sem React/hooks — apenas transformação de dados, para ser testável.
// =============================================================================

export interface UniversityLike {
  name?: string;
  slug?: string;
  logo?: string;
}

/**
 * Retorna o caminho da logo da universidade do `displayLabel`, ou `null`
 * quando não há correspondência (a UI deve então ocultar a logo).
 */
export function resolveUniversityLogo(
  displayLabel: string,
  universities: readonly UniversityLike[],
): string | null {
  if (!displayLabel || universities.length === 0) return null;

  const token = displayLabel.trim().split(/\s+/)[0]?.toLowerCase();
  if (!token) return null;

  const match = universities.find(
    (u) =>
      u.slug?.toLowerCase() === token || u.name?.toLowerCase() === token,
  );

  return match?.logo ?? null;
}
