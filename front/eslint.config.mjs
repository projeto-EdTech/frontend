import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Dívida conhecida: 29 ocorrências de setState síncrono em useEffect, boa parte
    // padrão de hidratação (mounted, tema, tier). Refatorar exige teste visual por
    // tela — fica como aviso até lá. Ver [Chore/ci] no CHANGES.md.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "tests/escalabilidade_K6/**",
  ]),
]);

export default eslintConfig;
