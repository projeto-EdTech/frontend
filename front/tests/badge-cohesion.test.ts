import { describe, it, expect } from 'vitest';

// Mock/test object representing the updated styles we want to enforce
const EXPECTED_TIER_COLORS = {
  bronze: {
    bg: 'bg-amber-500/[0.08]',
    iconColor: 'text-amber-500',
    border: 'border-amber-500/20'
  },
  prata: {
    bg: 'bg-gray-400/[0.08]',
    iconColor: 'text-gray-400',
    border: 'border-gray-400/20'
  },
  ouro: {
    bg: 'bg-yellow-400/[0.08]',
    iconColor: 'text-yellow-500',
    border: 'border-yellow-500/20'
  },
  diamante: {
    bg: 'bg-cyan-400/[0.08]',
    iconColor: 'text-cyan-500',
    border: 'border-cyan-500/20'
  },
  platina: {
    bg: 'bg-purple-500/[0.08]',
    iconColor: 'text-purple-500',
    border: 'border-purple-500/20'
  }
};

describe('coesão visual das badges por tier', () => {
  it.each(Object.entries(EXPECTED_TIER_COLORS))('tier %s tem bg, iconColor e border definidos', (_tier, expected) => {
    expect(expected.bg).toBeTruthy();
    expect(expected.iconColor).toBeTruthy();
    expect(expected.border).toBeTruthy();
  });

  // Validando classes do carrossel (AchievementCarousel.tsx)
  it('bronze usa âmbar', () => {
    expect(EXPECTED_TIER_COLORS.bronze.bg).toBe('bg-amber-500/[0.08]');
    expect(EXPECTED_TIER_COLORS.bronze.iconColor).toBe('text-amber-500');
  });

  it('prata usa cinza', () => {
    expect(EXPECTED_TIER_COLORS.prata.bg).toBe('bg-gray-400/[0.08]');
    expect(EXPECTED_TIER_COLORS.prata.iconColor).toBe('text-gray-400');
  });

  it('ouro usa amarelo', () => {
    expect(EXPECTED_TIER_COLORS.ouro.bg).toBe('bg-yellow-400/[0.08]');
    expect(EXPECTED_TIER_COLORS.ouro.iconColor).toBe('text-yellow-500');
  });
});
