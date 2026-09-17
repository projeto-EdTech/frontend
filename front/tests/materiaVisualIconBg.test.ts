import { describe, it, expect } from "vitest";
import {
  getMateriaVisual,
} from "../src/components/games/Enigma/lib/enigma-data";

describe("getMateriaVisual", () => {
  it("retorna icon/colorHex/bgColor corretos para Matemática", () => {
    const v = getMateriaVisual("Matemática");
    expect(v).not.toBeNull();
    expect(v!.icon).toBe("∑");
    expect(v!.bgColor).toBe("bg-blue-50");
    expect(v!.colorHex).toBe("#1e40af");
  });

  it("é insensível a acento e caixa", () => {
    expect(getMateriaVisual("matematica")).toEqual(getMateriaVisual("Matemática"));
    expect(getMateriaVisual("FÍSICA")!.icon).toBe("⚛");
  });

  it("retorna colorHex distinto por matéria (Química)", () => {
    const v = getMateriaVisual("Química");
    expect(v!.bgColor).toBe("bg-emerald-50");
    expect(v!.colorHex).toBe("#065f46");
  });

  it("matéria desconhecida → null", () => {
    expect(getMateriaVisual("Astrologia")).toBeNull();
    expect(getMateriaVisual("")).toBeNull();
  });
});
