/**
 * Lê o flag de "conta Discord vinculada" a partir das claims do JWT user_data.
 *
 * O nome do campo no BFF ainda é TBD (provável `Discord_sync`). Por isso a
 * leitura é tolerante a variações de nome. Assim que o backend confirmar o
 * nome oficial, manter SOMENTE ele em KEYS.
 *
 * Retorna 1 (vinculado) ou 0 (não vinculado) para alinhar com a métrica
 * numérica usada por computeBadges (badge single-tier, requirement 1).
 */
const KEYS = ["Discord_sync", "discord_sync", "discordSync", "discordLinked"] as const;

export function getDiscordLinked(
  claims: Record<string, unknown> | null | undefined,
): number {
  if (!claims) return 0;
  for (const k of KEYS) {
    if (claims[k] === true || claims[k] === 1) return 1;
  }
  return 0;
}
