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
        'build/html.cjs',
        'build/sw.cjs',
        'build/manifest.cjs',
        'build/page-styles.cjs',
        'build/sync-source.cjs',
      ],
      exclude: ['**/*.test.js', 'js/config/defaults.js', 'js/config/legal-data.js', 'js/config/legal.json'],
      thresholds: {
        lines: 65,
        functions: 65,
        statements: 65,
        branches: 58,
        'build/html.cjs': { lines: 50, functions: 45, statements: 50, branches: 40 },
        'build/sw.cjs': { lines: 50, functions: 45, statements: 50, branches: 40 },
        'build/manifest.cjs': { lines: 60, functions: 50, statements: 60, branches: 45 },
        'build/page-styles.cjs': { lines: 80, functions: 70, statements: 80, branches: 50 },
        'build/sync-source.cjs': { lines: 80, functions: 50, statements: 80, branches: 30 },
      },
    },
  },
});
