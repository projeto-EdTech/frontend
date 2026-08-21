import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Tests live in front/tests so the project keeps a single node_modules (front/).
// k6 load scripts under tests/escalabilidade_K6 are NOT vitest specs — excluded.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/escalabilidade_K6/**", "node_modules/**"],
  },
});
