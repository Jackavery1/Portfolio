import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['js/**/*.test.js', 'build/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['js/utils/**/*.js', 'js/config/**/*.js'],
      exclude: ['**/*.test.js', 'js/config/defaults.js'],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 60,
      },
    },
  },
});
