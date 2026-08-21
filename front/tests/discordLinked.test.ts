import { describe, it, expect } from "vitest";
import { getDiscordLinked } from "@/lib/core/discordLinked";

describe("getDiscordLinked", () => {
  it("retorna 1 para Discord_sync = true (nome provável do BFF)", () => {
    expect(getDiscordLinked({ Discord_sync: true })).toBe(1);
  });

  it("aceita chaves alternativas (nome do campo ainda TBD)", () => {
    expect(getDiscordLinked({ discord_sync: true })).toBe(1);
    expect(getDiscordLinked({ discordSync: true })).toBe(1);
    expect(getDiscordLinked({ discordLinked: true })).toBe(1);
  });

  it("aceita 1 numérico além de boolean", () => {
    expect(getDiscordLinked({ Discord_sync: 1 })).toBe(1);
  });

  it("retorna 0 quando flag é false", () => {
    expect(getDiscordLinked({ Discord_sync: false })).toBe(0);
  });

  it("retorna 0 quando claim ausente", () => {
    expect(getDiscordLinked({ outraCoisa: true })).toBe(0);
  });

  it("retorna 0 para null/undefined", () => {
    expect(getDiscordLinked(null)).toBe(0);
    expect(getDiscordLinked(undefined)).toBe(0);
  });
});
