import { describe, it, expect } from "vitest";
import badgesConfig from "@/lib/badges/badges.json";
import { computeBadges, type BadgeConfig } from "@/lib/badges/badgeUtils";
import type { ProfileStats } from "@/components/profile/GeneralStats";

const config = badgesConfig as unknown as BadgeConfig[];

// Stats base mínimo para alimentar computeBadges sem desbloquear outras badges
function makeStats(discordLinked: number | undefined): ProfileStats {
  return {
    simulados: 0,
    questoes: 0,
    acertos: 0,
    percentagem: 0,
    trend_simulados: { value: 0, type: "up" },
    trend_questoes: { value: 0, type: "up" },
    trend_acertos: { value: 0, type: "up" },
    trend_percentagem: { value: 0, type: "up" },
    ...(discordLinked === undefined ? {} : { discordLinked }),
  } as ProfileStats;
}

describe("Badge Guerreiro do Discord — configuração", () => {
  const badge = config.find((b) => b.id === "guerreiro_discord");

  it("existe em badges.json", () => {
    expect(badge).toBeDefined();
  });

  it("tem exatamente 1 tier", () => {
    expect(badge?.tiers).toHaveLength(1);
  });

  it("usa o ícone Discord, categoria social e métrica discordLinked", () => {
    expect(badge?.icon).toBe("Discord");
    expect(badge?.category).toBe("social");
    expect(badge?.metric).toBe("discordLinked");
  });
});

describe("Badge Guerreiro do Discord — desbloqueio", () => {
  it("desbloqueia quando discordLinked = 1", () => {
    const badges = computeBadges(makeStats(1), null, config);
    const discord = badges.find((b) => b.id === "guerreiro_discord");
    expect(discord?.currentTier).not.toBe("bloqueado");
  });

  it("permanece bloqueada quando discordLinked = 0", () => {
    const badges = computeBadges(makeStats(0), null, config);
    const discord = badges.find((b) => b.id === "guerreiro_discord");
    expect(discord?.currentTier).toBe("bloqueado");
  });

  it("permanece bloqueada quando discordLinked ausente", () => {
    const badges = computeBadges(makeStats(undefined), null, config);
    const discord = badges.find((b) => b.id === "guerreiro_discord");
    expect(discord?.currentTier).toBe("bloqueado");
  });

  it("não interfere nas demais badges (sem regressão)", () => {
    const badges = computeBadges(makeStats(1), null, config);
    // total = badges antigas + a nova; nenhuma das antigas desbloqueada com stats zerados
    expect(badges).toHaveLength(config.length);
    const others = badges.filter((b) => b.id !== "guerreiro_discord");
    others.forEach((b) => expect(b.currentTier).toBe("bloqueado"));
  });
});
