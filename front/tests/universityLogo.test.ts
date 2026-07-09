import { describe, it, expect } from "vitest";
import { resolveUniversityLogo } from "../src/components/profile/universityLogo";

type U = { name: string; slug: string; logo: string };

const universities: U[] = [
  { name: "FUVEST", slug: "fuvest", logo: "/Logo_Universidades/fuvest.jpg" },
  { name: "UNICAMP", slug: "unicamp", logo: "/Logo_Universidades/unicamp.png" },
  { name: "ENEM", slug: "enem", logo: "/Logo_Universidades/enem.png" },
];

describe("resolveUniversityLogo", () => {
  it("resolve logo a partir do displayLabel 'FUVEST 2025' (1ª palavra → slug)", () => {
    expect(resolveUniversityLogo("FUVEST 2025", universities)).toBe(
      "/Logo_Universidades/fuvest.jpg",
    );
  });

  it("é insensível a caixa", () => {
    expect(resolveUniversityLogo("unicamp 2024", universities)).toBe(
      "/Logo_Universidades/unicamp.png",
    );
  });

  it("casa também por name quando slug não bate", () => {
    const only = [{ name: "ENEM", slug: "exame-nacional", logo: "/x/enem.png" }];
    expect(resolveUniversityLogo("ENEM 2024", only)).toBe("/x/enem.png");
  });

  it("universidade desconhecida → null", () => {
    expect(resolveUniversityLogo("HARVARD 2025", universities)).toBeNull();
  });

  it("displayLabel vazio ou lista vazia → null", () => {
    expect(resolveUniversityLogo("", universities)).toBeNull();
    expect(resolveUniversityLogo("FUVEST 2025", [])).toBeNull();
  });

  it("ignora entradas sem slug/name sem quebrar", () => {
    const messy = [
      { name: undefined, slug: undefined, logo: "/x.png" } as unknown as U,
      { name: "FUVEST", slug: "fuvest", logo: "/ok.jpg" },
    ];
    expect(resolveUniversityLogo("FUVEST 2025", messy)).toBe("/ok.jpg");
  });
});
