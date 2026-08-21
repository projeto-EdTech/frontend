"use client";

import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { computeBadges } from "@/lib/badges/badgeUtils";
import type { ProfileStats } from "@/components/profile/GeneralStats";
import type { UserRankingData } from "@/lib/ranking/rankUtils";
import {
  Lock,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Brain,
  FileText,
  Target,
} from "lucide-react";
import type { Tier } from "@/components/profile/BadgeCard";
import DiscordIcon from "@/components/profile/DiscordIcon";

const IconMap: Record<string, React.ElementType> = {
  Brain,
  FileText,
  Target,
  Trophy,
  Discord: DiscordIcon,
};

// Cor da marca Discord (blurple) usada como text-[#5865F2]/bg-[#5865F2] nas
// badges sociais. Exceção pontual de cor de marca; não é tokenizada globalmente.

import useSWR from "swr";
import type { BadgeConfig } from "@/lib/badges/badgeUtils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AchievementCarouselProps {
  stats: ProfileStats;
  rankingData: UserRankingData | null;
}

export default function AchievementCarousel({
  stats,
  rankingData,
}: AchievementCarouselProps) {
  const { data: badgeConfig } = useSWR<BadgeConfig[]>("/api/badges", fetcher);

  const badges = useMemo(
    () => computeBadges(stats, rankingData, badgeConfig || undefined),
    [stats, rankingData, badgeConfig],
  );

  // Sort badges: unlocked first, then by id
  const sortedBadges = useMemo(() => {
    return [...badges].sort((a, b) => {
      const aUnlocked = a.currentTier !== "bloqueado";
      const bUnlocked = b.currentTier !== "bloqueado";
      if (aUnlocked === bUnlocked) return 0;
      return aUnlocked ? -1 : 1;
    });
  }, [badges]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth / 0.8
          : scrollLeft + clientWidth / 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const getTierStyles = (tier: Tier) => {
    const base =
      "bg-[var(--card-bg)] border-[var(--border-color)] transition-all duration-300";
    switch (tier) {
      case "bronze":
        return `${base} shadow-[0_4px_20px_rgba(180,83,9,0.03)]`;
      case "prata":
        return `${base} shadow-[0_4px_20px_rgba(156,163,175,0.03)]`;
      case "ouro":
        return `${base} shadow-[0_4px_20px_rgba(250,204,21,0.03)]`;
      case "diamante":
        return `${base} shadow-[0_4px_20px_rgba(6,182,212,0.03)]`;
      case "platina":
        return `${base} shadow-[0_4px_20px_rgba(168,85,247,0.03)]`;
      default:
        return `${base} opacity-60 grayscale`;
    }
  };

  const getIconContainerStyles = (tier: Tier) => {
    switch (tier) {
      case "bronze":
        return "bg-amber-500/[0.08]";
      case "prata":
        return "bg-gray-400/[0.08]";
      case "ouro":
        return "bg-yellow-400/[0.08]";
      case "diamante":
        return "bg-cyan-400/[0.08]";
      case "platina":
        return "bg-purple-500/[0.08]";
      default:
        return "bg-[var(--text-secondary)]/10";
    }
  };

  const getIconColorClass = (tier: Tier) => {
    switch (tier) {
      case "bronze":
        return "text-amber-500";
      case "prata":
        return "text-gray-400";
      case "ouro":
        return "text-yellow-500";
      case "diamante":
        return "text-cyan-500";
      case "platina":
        return "text-purple-500";
      default:
        return "text-[var(--text-secondary)] opacity-60";
    }
  };

  const getTierName = (tier: Tier) => {
    if (tier === "bloqueado") return "";
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const renderIcon = (icon: string | React.ReactNode) => {
    if (typeof icon === "string" && IconMap[icon]) {
      return React.createElement(IconMap[icon], { strokeWidth: 1.5 });
    }
    return icon;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center bg-transparent rounded-xl shadow-sm border border-[var(--border-color)]">
            <Trophy size={20} className="text-amber-500" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-tight leading-none mb-1">
              Jornada de Conquistas
            </h4>
            <p className="text-[12px] text-[var(--text-secondary)] font-medium tracking-tight">
              Você já destravou{" "}
              <span className="text-blue-600">
                {badges.filter((b) => b.currentTier !== "bloqueado").length}
              </span>{" "}
              de {badges.length} metas
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--card-bg)] border border-gray-200 shadow-sm hover:bg-[var(--bg-secondary)] active:scale-90 transition-all duration-300 cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft size={16} className="text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm hover:bg-[var(--bg-secondary)] active:scale-90 transition-all duration-300 cursor-pointer"
            aria-label="Próximo"
          >
            <ChevronRight size={16} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-2 px-4 scrollbar-hide scroll-smooth relative"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {sortedBadges.map((badge) => {
          const isUnlocked = badge.currentTier !== "bloqueado";
          const isSocialUnlocked = badge.category === "social" && isUnlocked;

          return (
            <motion.div
              key={badge.id}
              initial={false}
              whileHover={{
                y: -4,
                boxShadow: "0 12px 30px var(--shadow-hover)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`flex-shrink-0 w-[240px] min-h-[222px] p-5 rounded-3xl border transition-all duration-500 relative overflow-hidden group cursor-default ${getTierStyles(badge.currentTier)}`}
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="flex flex-col gap-7 relative z-10 h-full">
                <div className="flex flex-col items-center gap-2 w-full">
                  <h5 className="text-[16px] font-bold text-[var(--text-primary)] leading-tight tracking-tight truncate w-full text-center">
                    {badge.name}
                  </h5>

                  <div
                    className={`relative w-22 h-22 flex items-center justify-center rounded-xl flex-shrink-0 transition-all duration-500 ${isSocialUnlocked ? "bg-[#5865F2]/[0.08]" : getIconContainerStyles(badge.currentTier)}`}
                  >
                    {isUnlocked && (
                      <div
                        className={`absolute inset-0 rounded-xl blur-xl opacity-20 transition-opacity duration-700 group-hover:opacity-40 ${
                          isSocialUnlocked
                            ? "bg-[#5865F2]"
                            : badge.currentTier === "bronze"
                              ? "bg-amber-500"
                              : badge.currentTier === "prata"
                                ? "bg-gray-400"
                                : badge.currentTier === "ouro"
                                  ? "bg-yellow-500"
                                  : badge.currentTier === "diamante"
                                    ? "bg-cyan-500"
                                    : "bg-purple-500"
                        }`}
                      />
                    )}

                    <span
                      className={`flex items-center justify-center [&>svg]:w-12 [&>svg]:h-12 transition-all duration-500 relative z-10 ${
                        isUnlocked
                          ? `group-hover:scale-110 ${isSocialUnlocked ? "text-[#5865F2]" : getIconColorClass(badge.currentTier)}`
                          : "grayscale opacity-30 text-[var(--text-secondary)]"
                      }`}
                    >
                      {renderIcon(badge.icon)}
                    </span>

                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]/50 backdrop-blur-[2px] rounded-xl z-20">
                        <Lock
                          size={18}
                          className="text-[var(--text-secondary)]/60"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>

                  {isSocialUnlocked ? (
                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[9px] font-bold tracking-widest uppercase text-[#5865F2]">
                      Conquistado
                    </div>
                  ) : isUnlocked ? (
                    <div
                      className={`inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[9px] font-bold tracking-widest uppercase ${getIconColorClass(badge.currentTier)}`}
                    >
                      {getTierName(badge.currentTier)}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium tracking-tight">
                      Bloqueado
                    </p>
                  )}
                </div>

                <div className="w-full mt-auto">
                  {isSocialUnlocked ? (
                    <p className="text-[11px] text-[var(--text-secondary)] font-normal leading-snug text-left truncate w-full">
                      {badge.description}
                    </p>
                  ) : isUnlocked && badge.nextTierRequirement !== null ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end text-[10px] font-medium tracking-tight px-0.5">
                        <span className="text-[var(--text-secondary)]">
                          {badge.progress}
                        </span>
                        <span className="text-[var(--text-secondary)]">
                          {badge.nextTierRequirement}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(100, Math.max(0, (badge.progress / badge.nextTierRequirement) * 100))}%`,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 80,
                            damping: 15,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        />
                      </div>
                    </div>
                  ) : isUnlocked && badge.nextTierRequirement === null ? (
                    <div className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-widest text-left">
                      Nível Máximo
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--text-secondary)] font-normal leading-snug text-left truncate w-full">
                      {badge.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom shadow reflection */}
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[var(--text-primary)]/[0.02] to-transparent pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
