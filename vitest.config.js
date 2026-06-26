import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['js/**/*.test.js', 'build/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: [
        'js/utils/**/*.js',
        'js/config/**/*.js',
        'js/modules/**/*.js',
        'js/main.js',
      ],
      exclude: ['**/*.test.js', 'js/config/defaults.js'],
      thresholds: {
        lines: 60,
        functions: 60,
        statements: 60,
        branches: 55,
      },
    },
  },
});
