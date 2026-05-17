import badgesConfig from '@/lib/badges.json';
import { computeBadges } from '@/lib/badgeUtils';
import type { ProfileStats } from '@/components/profile/GeneralStats';
import type { UserRankingData } from '@/lib/rankUtils';

/**
 * CACHE STRATEGY: ISR - revalidate 3600s
 * Motivo: As definições de badges mudam raramente.
 */
export async function getBadgesConfig() {
  // Simula um delay de rede para manter consistência com os outros serviços
  await new Promise(resolve => setTimeout(resolve, 300));
  return badgesConfig;
}

/**
 * Calcula as badges conquistadas por um usuário com base em suas estatísticas.
 * Pode ser usado tanto no Server quanto no Client (via API).
 */
export async function calculateUserBadges(stats: ProfileStats, rankingData: UserRankingData | null) {
  return computeBadges(stats, rankingData);
}
