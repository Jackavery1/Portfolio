import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['js/**/*.test.js', 'build/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'json-summary'],
      reportBase: './coverage',
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
      exclude: [
        '**/*.test.js',
        'js/config/defaults.js',
        'js/config/legal-data.js',
        'js/config/projects-data.js',
        'js/config/legal.json',
        'js/modules/score.js',
      ],
      thresholds: {
        lines: 85,
        functions: 90,
        statements: 85,
        branches: 80,
        'build/html.cjs': { lines: 40, functions: 35, statements: 40, branches: 20 },
        'build/sw.cjs': { lines: 45, functions: 40, statements: 45, branches: 20 },
        'build/manifest.cjs': { lines: 45, functions: 40, statements: 45, branches: 20 },
        'build/page-styles.cjs': { lines: 45, functions: 40, statements: 45, branches: 20 },
        'build/sync-source.cjs': { lines: 44, functions: 40, statements: 44, branches: 20 },
      },
    },
  },
});
