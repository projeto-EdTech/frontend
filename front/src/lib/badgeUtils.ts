import type { ProfileStats } from '@/components/profile/GeneralStats';
import type { UserRankingData } from '@/lib/rankUtils';
import type { Badge, Tier } from '@/components/profile/BadgeCard';
import badgesConfigRaw from './badges.json';

export interface BadgeConfigTier {
  tier: string;
  requirement: number;
  rankNames?: string[];
}

export interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  metric: string;
  tiers: BadgeConfigTier[];
}

const badgesConfig = badgesConfigRaw as unknown as BadgeConfig[];

function getRankProgress(rank: string | null, config: BadgeConfig[]): number {
  if (!rank) return 0;
  for (const badgeConfig of config) {
    if (badgeConfig.id === 'gloria_ranking') {
      for (const tier of badgeConfig.tiers) {
        if (tier.rankNames?.includes(rank)) {
          return tier.requirement;
        }
      }
    }
  }
  return 0;
}

export function computeBadges(
  stats: ProfileStats, 
  rankingData: UserRankingData | null, 
  config: BadgeConfig[] = badgesConfig
): Badge[] {
  const rank = rankingData?.rank ?? null;
  const computedBadges: Badge[] = [];

  for (const badgeConfig of config) {
    let progress = 0;
    
    if (badgeConfig.metric === 'rank') {
      progress = getRankProgress(rank, config);
    } else {
      progress = stats[badgeConfig.metric as keyof ProfileStats] as number || 0;
    }

    let currentTier: Tier = 'bloqueado';
    let nextTierRequirement: number | null = null;

    let unlockedIndex = -1;
    for (let i = 0; i < badgeConfig.tiers.length; i++) {
      if (progress >= badgeConfig.tiers[i].requirement) {
        unlockedIndex = i;
      } else {
        break;
      }
    }

    if (unlockedIndex !== -1) {
      currentTier = badgeConfig.tiers[unlockedIndex].tier as Tier;
    }

    const nextIndex = unlockedIndex + 1;
    if (nextIndex < badgeConfig.tiers.length) {
      nextTierRequirement = badgeConfig.tiers[nextIndex].requirement;
    }

    computedBadges.push({
      id: badgeConfig.id,
      name: badgeConfig.name,
      description: badgeConfig.description,
      icon: badgeConfig.icon,
      category: badgeConfig.category as 'marco' | 'desempenho' | 'ranking',
      currentTier,
      progress,
      nextTierRequirement, 
    });
  }

  return computedBadges;
}
