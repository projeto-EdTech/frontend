import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

describe("Questoes_Gemini — customização de fundo/cor dos ícones de matéria", () => {
  const src = readFileSync(
    resolve(__dirname, "../src/components/Simula_PRO/Questoes_Gemini.tsx"),
    "utf-8",
  );

  it("usa getMateriaVisual no componente", () => {
    expect(src).toMatch(/getMateriaVisual/);
  });

  it("aplica !bg-white nos ícones de matéria", () => {
    expect(src).toMatch(/!bg-white/);
  });

  it("aplica cor inline via colorHex", () => {
    expect(src).toMatch(/colorHex/);
  });

  it("integra o seletor Matéria→Conteúdo (helpers + modal)", () => {
    expect(src).toMatch(/buildSubjectTree/);
    expect(src).toMatch(/parseSubjectKey/);
    expect(src).toMatch(/handleSelectMateria/);
  });
});
