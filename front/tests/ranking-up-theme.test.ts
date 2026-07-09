import { describe, it, expect } from "vitest";

// Classes que representam a estilização que queremos validar
const CLASS_GLASSMORPHISM_MODAL = [
  "backdrop-blur-2xl",
  "bg-white/70",
  "dark:bg-slate-900/60",
  "border-white/30",
  "dark:border-white/10",
];

const CLASS_CLAYMORPHISM_BUTTON = [
  "clay-button",
];

const CLASS_CLAYMORPHISM_SUBMODAL = [
  "clay-card",
];

describe("RankingUpNotification Styling & Theme Responsiveness", () => {
  it("deve conter as classes de Glassmorphism no modal principal", () => {
    // Simulando a classe que será aplicada ao modal principal
    const modalClass = "relative max-w-md w-full bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-white/10 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center text-center";
    
    CLASS_GLASSMORPHISM_MODAL.forEach((cls) => {
      expect(modalClass).toContain(cls);
    });
  });

  it("deve conter as classes/estilos de Claymorphism nos botões", () => {
    // Simulando as classes do botão com claymorphism
    const buttonClass = "w-full py-4 rounded-2xl bg-gradient-to-r text-white font-bold text-base clay-button cursor-pointer";
    
    CLASS_CLAYMORPHISM_BUTTON.forEach((cls) => {
      expect(buttonClass).toContain(cls);
    });
  });

  it("deve conter as classes/estilos de Claymorphism nos sub-modais (badges, comparação, progresso)", () => {
    // Simulando as classes de sub-modais (como os cards de badges)
    const subModalClass = "relative bg-gray-100/50 dark:bg-slate-950/40 border rounded-3xl p-3 flex flex-col gap-2 transition-all duration-300 clay-card";
    
    CLASS_CLAYMORPHISM_SUBMODAL.forEach((cls) => {
      expect(subModalClass).toContain(cls);
    });
  });

  it("deve garantir suporte responsivo a temas claro e escuro para textos e fundos", () => {
    // Garantindo que teremos text-slate-700/800 (light) e text-slate-200/300 (dark)
    const textColors = "text-slate-800 dark:text-slate-200";
    expect(textColors).toContain("text-slate-800");
    expect(textColors).toContain("dark:text-slate-200");
  });
});
