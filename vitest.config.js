import { defineConfig } from 'vitest/config';

const coverage = {
  provider: 'v8',
  reporter: ['text', 'html', 'json', 'json-summary'],
  reportBase: './coverage',
  include: [
    'js/utils/**/*.js',
    'js/config/**/*.js',
    'js/modules/**/*.js',
    'js/main.js',
    'build/**/*.cjs',
  ],
  exclude: [
    '**/*.test.js',
    'js/config/defaults.js',
    'js/config/legal-data.js',
    'js/config/projects-data.js',
    'js/config/musique-themes.json',
    'js/config/musique-donnees.json',
    'js/config/legal.json',
    'build/config-defaults.cjs',
  ],
  thresholds: {
    lines: 85,
    functions: 90,
    statements: 85,
    branches: 84,
  },
};

export default defineConfig({
  test: {
    coverage,
    projects: [
      {
        test: {
          name: 'js',
          environment: 'node',
          include: ['js/**/*.test.js'],
        },
      },
      {
        test: {
          name: 'build',
          environment: 'node',
          include: ['build/**/*.test.js'],
          fileParallelism: false,
        },
      },
    ],
  },
});
