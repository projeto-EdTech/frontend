import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Os testes unitários vivem em `src/test/`, ao lado dos scripts de carga k6 (`src/test/K6`).
 * O padrão `*.test.ts` separa os testes unitários dos scripts k6, que não usam esse sufixo.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.ts'],
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
