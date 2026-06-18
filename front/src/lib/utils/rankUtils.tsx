import React, { ReactNode } from 'react';
import { Crown, Trophy, Medal, Award } from 'lucide-react';

export type RankType = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';

export interface UserRankingData {
  position: number;
  name: string;
  score: number;
  rank: RankType;
  isCurrentUser?: boolean;
}

const RANK_THRESHOLDS: { name: RankType; minScore: number }[] = [
  { name: 'Bronze', minScore: 0 },
  { name: 'Prata', minScore: 1000 },
  { name: 'Ouro', minScore: 2500 },
  { name: 'Diamante', minScore: 5000 },
];

export function getRankFromPosition(position: number): RankType {
  if (position <= 10) return 'Diamante';
  if (position <= 30) return 'Ouro';
  if (position <= 60) return 'Prata';
  return 'Bronze';
}

export function getRankFromScore(score: number): RankType {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= RANK_THRESHOLDS[i].minScore) return RANK_THRESHOLDS[i].name;
  }
  return 'Bronze';
}

export function getRankIcon(rank: RankType, size = 5): ReactNode {
  const cls = `w-${size} h-${size}`;
  switch (rank) {
    case 'Diamante': return <Crown className={`${cls} text-cyan-500`} />;
    case 'Ouro':     return <Trophy className={`${cls} text-yellow-500`} />;
    case 'Prata':    return <Medal className={`${cls} text-gray-400`} />;
    case 'Bronze':   return <Award className={`${cls} text-orange-600`} />;
  }
}

export function getRankBadgeColor(rank: RankType): string {
  switch (rank) {
    case 'Diamante': return 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200';
    case 'Ouro':     return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200';
    case 'Prata':    return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200';
    case 'Bronze':   return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-200';
  }
}

export function getRankFrameStyle(rank: RankType): string {
  switch (rank) {
    case 'Diamante': return 'rank-frame-diamante';
    case 'Ouro':     return 'rank-frame-ouro';
    case 'Prata':    return 'rank-frame-prata';
    case 'Bronze':   return 'rank-frame-bronze';
  }
}

export function getRankProgress(score: number): {
  percent: number;
  pointsToNext: number;
  nextRank: RankType | null;
  currentThreshold: number;
  nextThreshold: number;
} {
  const rank = getRankFromScore(score);
  const currentIndex = RANK_THRESHOLDS.findIndex(r => r.name === rank);
  const current = RANK_THRESHOLDS[currentIndex];
  const next = RANK_THRESHOLDS[currentIndex + 1];

  if (!next) {
    return { percent: 100, pointsToNext: 0, nextRank: null, currentThreshold: current.minScore, nextThreshold: current.minScore };
  }

  const inTier = score - current.minScore;
  const tierSize = next.minScore - current.minScore;
  const percent = Math.min(100, Math.round((inTier / tierSize) * 100));

  return {
    percent,
    pointsToNext: Math.max(0, next.minScore - score),
    nextRank: next.name,
    currentThreshold: current.minScore,
    nextThreshold: next.minScore,
  };
}

export function getRankEpithet(rank: RankType, questoes: number): string {
  if (rank === 'Diamante') return 'Mestre do Vestibular';
  if (rank === 'Ouro') return 'Estudante de Elite';
  if (rank === 'Prata') return 'Estudante Dedicado';
  if (questoes >= 100) return 'Estudante em Ascensão';
  return 'Aspirante ao ENEM';
}
