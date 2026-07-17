const { resolveStaticDistDir } = require('./build/resolve-static-dist.cjs');
const { HTML_FILES } = require('./build/html-files.mjs');

const staticDistDir = resolveStaticDistDir();

const assertionsCommunes = {
  'categories:accessibility': ['error', { minScore: 0.9 }],
  'categories:best-practices': ['error', { minScore: 0.9 }],
  'categories:seo': ['error', { minScore: 0.9 }],
};

const urls = [...HTML_FILES, 'offline.html'];

module.exports = {
  ci: {
    collect: {
      staticDistDir,
      url: urls,
      numberOfRuns: 5,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        emulatedFormFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 2.625,
          disabled: false,
        },
      },
    },
    assert: {
      includePassedAssertions: false,
      assertMatrix: [
        {
          matchingUrlPattern: '.*',
          assertions: assertionsCommunes,
        },
        {
          matchingUrlPattern: '.*index\\.html',
          assertions: {
            'categories:performance': ['error', { minScore: 0.9 }],
          },
        },
        {
          matchingUrlPattern: '.*projets\\.html',
          assertions: {
            'categories:performance': ['error', { minScore: 0.85 }],
          },
        },
        {
          matchingUrlPattern: '.*contact\\.html',
          assertions: {
            'categories:performance': ['error', { minScore: 0.85 }],
          },
        },
        {
          matchingUrlPattern: '.*(competences|parcours|dojo)\\.html',
          assertions: {
            'categories:performance': ['error', { minScore: 0.85 }],
          },
        },
        {
          matchingUrlPattern: '.*(mentions-legales|offline)\\.html',
          assertions: {
            'categories:performance': ['error', { minScore: 0.85 }],
          },
        },
      ],
    },
  },
};
