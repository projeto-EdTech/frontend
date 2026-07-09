"use client";

import React from 'react';
import { Lock, Brain, FileText, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import DiscordIcon from '@/components/profile/DiscordIcon';

export type Tier = 'bloqueado' | 'bronze' | 'prata' | 'ouro' | 'diamante' | 'platina';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string | React.ReactNode;
  category: 'marco' | 'desempenho' | 'ranking' | 'social';
  currentTier: Tier;
  progress: number;
  nextTierRequirement: number | null;
}

const IconMap: Record<string, React.ElementType> = {
  Brain,
  FileText,
  Target,
  Trophy,
  Discord: DiscordIcon,
};

interface BadgeCardProps {
  badge: Badge;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  const isUnlocked = badge.currentTier !== 'bloqueado';
  const isSocial = badge.category === 'social';

  const getTierStyles = (tier: Tier) => {
    switch (tier) {
      case 'bronze':
        return 'bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl border-white/40 dark:border-white/[0.08] shadow-[0_8px_24px_rgba(180,83,9,0.05)]';
      case 'prata':
        return 'bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl border-white/40 dark:border-white/[0.08] shadow-[0_8px_24px_rgba(156,163,175,0.05)]';
      case 'ouro':
        return 'bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl border-white/40 dark:border-white/[0.08] shadow-[0_8px_24px_rgba(250,204,21,0.08)]';
      case 'diamante':
        return 'bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl border-white/40 dark:border-white/[0.08] shadow-[0_8px_24px_rgba(6,182,212,0.1)]';
      case 'platina':
        return 'bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl border-white/40 dark:border-white/[0.08] shadow-[0_8px_24px_rgba(168,85,247,0.1)]';
      default:
        return 'bg-white/30 dark:bg-white/[0.01] backdrop-blur-xl border-white/20 dark:border-white/[0.05] opacity-50 grayscale';
    }
  };

  const getIconColorClass = (tier: Tier) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 dark:text-amber-500';
      case 'prata': return 'text-gray-500 dark:text-gray-400';
      case 'ouro': return 'text-yellow-600 dark:text-yellow-500';
      case 'diamante': return 'text-cyan-500 dark:text-cyan-400';
      case 'platina': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getTierName = (tier: Tier) => {
    if (tier === 'bloqueado') return '';
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const renderIcon = () => {
    if (typeof badge.icon === 'string' && IconMap[badge.icon]) {
      return React.createElement(IconMap[badge.icon], { strokeWidth: 1.5 });
    }
    return badge.icon;
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      title={isUnlocked ? badge.description : `Bloqueado`}
      className={`relative flex flex-col items-center justify-between gap-3 p-5 rounded-[28px] border transition-colors duration-500 cursor-default h-full ${getTierStyles(badge.currentTier)}`}
    >
      {!isUnlocked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-3.5 h-3.5 text-gray-400/60" />
        </div>
      )}
      
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <span className={`flex items-center justify-center [&>svg]:w-10 [&>svg]:h-10 transition-all duration-500 ${isUnlocked ? 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] group-hover:scale-110' : ''} ${isSocial && isUnlocked ? 'text-[#5865F2]' : getIconColorClass(badge.currentTier)}`} role="img" aria-label={badge.name}>
          {renderIcon()}
        </span>
        
        <div className="text-center space-y-1">
          <p className="text-[13px] font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">{badge.name}</p>
          {isUnlocked && isSocial ? (
            <p className="text-[10px] font-bold text-[#5865F2] tracking-wider uppercase">Conquistado</p>
          ) : isUnlocked ? (
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase">{getTierName(badge.currentTier)}</p>
          ) : null}
        </div>
      </div>

      <div className="w-full mt-3">
        {isSocial ? null : isUnlocked && badge.nextTierRequirement !== null ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-gray-500 dark:text-gray-400 tracking-tight">
              <span>{badge.progress}</span>
              <span>{badge.nextTierRequirement}</span>
            </div>
            <div className="w-full h-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, (badge.progress / badge.nextTierRequirement) * 100))}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`h-full rounded-full ${
                  badge.currentTier === 'bronze' ? 'bg-amber-500' :
                  badge.currentTier === 'prata' ? 'bg-gray-400' :
                  badge.currentTier === 'ouro' ? 'bg-yellow-500' :
                  badge.currentTier === 'diamante' ? 'bg-cyan-500' : 'bg-purple-500'
                }`}
              />
            </div>
          </div>
        ) : isUnlocked && badge.nextTierRequirement === null ? (
          <div className="text-center text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-widest uppercase">
            MAX
          </div>
        ) : (
          <div className="text-center">
             <span className="text-[10px] font-medium text-gray-400">0 / {badge.nextTierRequirement}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
