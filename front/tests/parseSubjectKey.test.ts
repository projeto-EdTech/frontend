import { describe, it, expect } from "vitest";
import {
  parseSubjectKey,
  buildSubjectTree,
} from "../src/components/Simula_PRO/subjectKey";

// Tipo mínimo só para montar o Map de teste (espelha ReviewableQuestion[])
type Q = { id: string };
const q = (id: string): Q => ({ id });

describe("parseSubjectKey", () => {
  it("divide no primeiro em dash U+2014 ' — '", () => {
    expect(parseSubjectKey("Matemática — Funções")).toEqual({
      materia: "Matemática",
      conteudo: "Funções",
    });
  });

  it("sem separador → conteudo 'Geral'", () => {
    expect(parseSubjectKey("História")).toEqual({
      materia: "História",
      conteudo: "Geral",
    });
  });

  it("preserva travessão/hífen interno no conteúdo (split só no 1º)", () => {
    expect(parseSubjectKey("Português — Crase — casos especiais")).toEqual({
      materia: "Português",
      conteudo: "Crase — casos especiais",
    });
  });

  it("faz trim de espaços nas pontas", () => {
    expect(parseSubjectKey("  Física  —  Cinemática  ")).toEqual({
      materia: "Física",
      conteudo: "Cinemática",
    });
  });

  it("chave vazia → materia vazia, conteudo 'Geral'", () => {
    expect(parseSubjectKey("")).toEqual({ materia: "", conteudo: "Geral" });
  });
});

describe("buildSubjectTree", () => {
  it("agrupa conteúdos por matéria com count/fullKey/totalCount", () => {
    const grouped = new Map<string, Q[]>([
      ["Matemática — Funções", [q("a"), q("b")]],
      ["Matemática — Geometria", [q("c")]],
      ["Física — Cinemática", [q("d"), q("e"), q("f")]],
    ]);

    const tree = buildSubjectTree(grouped as never);

    expect([...tree.keys()]).toEqual(["Matemática", "Física"]);

    const mat = tree.get("Matemática")!;
    expect(mat.totalCount).toBe(3);
    expect(mat.conteudos).toEqual([
      { conteudo: "Funções", fullKey: "Matemática — Funções", count: 2 },
      { conteudo: "Geometria", fullKey: "Matemática — Geometria", count: 1 },
    ]);

    const fis = tree.get("Física")!;
    expect(fis.totalCount).toBe(3);
    expect(fis.conteudos).toEqual([
      { conteudo: "Cinemática", fullKey: "Física — Cinemática", count: 3 },
    ]);
  });

  it("Map vazio → árvore vazia", () => {
    const tree = buildSubjectTree(new Map() as never);
    expect(tree.size).toBe(0);
  });

  it("chave sem separador vira matéria com conteúdo 'Geral'", () => {
    const grouped = new Map<string, Q[]>([["História", [q("x")]]]);
    const tree = buildSubjectTree(grouped as never);
    expect(tree.get("História")!.conteudos[0]).toEqual({
      conteudo: "Geral",
      fullKey: "História",
      count: 1,
    });
  });
});
