"use client";

import React, { useEffect } from 'react';
import { Edit } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import {
  getRankIcon,
  getRankBadgeColor,
  getRankProgress,
  getRankEpithet,
  type UserRankingData,
} from '@/lib/utils/rankUtils';

interface ProfileHeroCardProps {
  name: string;
  email: string;
  profileIcon: string;
  useInitialAvatar: boolean;
  rankingData: UserRankingData | null;
  onEditClick: () => void;
}

export default function ProfileHeroCard({
  name,
  email,
  profileIcon,
  useInitialAvatar,
  rankingData,
  onEditClick,
}: ProfileHeroCardProps) {
  const rank = rankingData?.rank ?? null;
  const progress = rankingData ? getRankProgress(rankingData.score) : null;
  const epithet = rank ? getRankEpithet(rank, 0) : null;

  useEffect(() => {
    if (rank) {
      sessionStorage.setItem('userRank', rank);
      window.dispatchEvent(new Event('rankUpdated'));
    }
  }, [rank]);

  return (
    <div className="relative overflow-hidden bg-white backdrop-blur-2xl border border-gray-200 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center w-full justify-start gap-6 mb-6">
          <div className="relative group shrink-0">
            <UserAvatar
              name={name}
              className="w-28 h-28 text-4xl ring-4 ring-white shadow-lg group-hover:scale-105 transition-all duration-300"
              customIcon={useInitialAvatar ? undefined : profileIcon}
            />
          </div>

          <div className="flex flex-col items-center text-center flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">{name || 'Usuário'}</h2>
            <p className="text-gray-500 font-medium mb-3 text-sm">{email || 'email@exemplo.com'}</p>

            {rank && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRankBadgeColor(rank)}`}>
                {getRankIcon(rank, 4)}
                <span>{rank}</span>
              </div>
            )}
          </div>
        </div>

        {rank && (
          <div className="flex flex-col items-center gap-3 w-full mb-4">
            {/* XP progress bar */}
            {progress && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-gray-500 font-medium">{progress.percent}% completo</span>
                  {progress.nextRank ? (
                    <span className="text-gray-600 font-semibold">→ {progress.nextRank}</span>
                  ) : (
                    <span className="text-cyan-600 font-semibold">🎉 Rank máximo!</span>
                  )}
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                {progress.pointsToNext > 0 && (
                  <p className="text-xs text-gray-400 text-right mt-0.5">
                    {progress.pointsToNext.toLocaleString()} pts restantes
                  </p>
                )}
              </div>
            )}

            {/* Epithet */}
            {epithet && (
              <p className="text-xs text-gray-400 italic">&quot;{epithet}&quot;</p>
            )}
          </div>
        )}

        <button
          onClick={onEditClick}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-blue-700 hover:shadow-xl shadow-blue-500/30 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <Edit size={14} />
          <span>Editar Perfil</span>
        </button>
      </div>
    </div>
  );
}
