"use client";

import React, { ReactNode } from 'react';
import { getRankFrameStyle, getRankIcon, type RankType } from '@/lib/utils/rankUtils';
import { cn } from '@/lib/utils';

interface RankAvatarFrameProps {
  rank: RankType | null;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  children: ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
};

const badgeSizeClasses = {
  sm: 'w-4 h-4 -bottom-0.5 -right-0.5',
  md: 'w-5 h-5 bottom-0 right-0',
  lg: 'w-6 h-6 bottom-1 right-1',
};

export default function RankAvatarFrame({ rank, size = 'md', showBadge = false, children, className }: RankAvatarFrameProps) {
  if (!rank) return <>{children}</>;

  const frameStyle = getRankFrameStyle(rank);
  const badgeSize = size === 'lg' ? 5 : size === 'md' ? 4 : 3;

  return (
    <div className={cn('relative inline-block', className)}>
      <div className={cn('rounded-full overflow-hidden', sizeClasses[size], frameStyle)}>
        {children}
      </div>
      {showBadge && (
        <div className={cn(
          'absolute flex items-center justify-center rounded-full bg-white shadow-md border border-gray-100',
          badgeSizeClasses[size]
        )}>
          {getRankIcon(rank, badgeSize)}
        </div>
      )}
    </div>
  );
}
