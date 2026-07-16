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
    'build/**/*.mjs',
  ],
  exclude: [
    '**/*.test.js',
    'js/config/defaults.js',
    'js/config/legal-data.js',
    'js/config/projects-data.js',
    'js/config/musique-themes.json',
    'js/config/musique-donnees.json',
    'js/config/legal.json',
    'build/config-defaults.mjs',
    'build/fonts-data.mjs',
  ],
  thresholds: {
    lines: 85,
    functions: 90,
    statements: 85,
    branches: 84,
  },
};

/** Tests sans DOM — reste en environnement node. */
const JS_NODE_TESTS = [
  'js/config/**/*.test.js',
  'js/utils/contact-form-helpers.test.js',
  'js/utils/navigation-helpers.test.js',
  'js/utils/page.test.js',
  'js/utils/page.node.test.js',
  'js/utils/pii.test.js',
  'js/utils/score-helpers.test.js',
  'js/utils/validation.test.js',
  'js/modules/audio-context-store.test.js',
  'js/modules/musique-sequencuer-store.test.js',
  'js/modules/score.test.js',
];

export default defineConfig({
  test: {
    coverage,
    projects: [
      {
        test: {
          name: 'js-dom',
          environment: 'jsdom',
          include: ['js/**/*.test.js'],
          exclude: JS_NODE_TESTS,
        },
      },
      {
        test: {
          name: 'js-node',
          environment: 'node',
          include: JS_NODE_TESTS,
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
