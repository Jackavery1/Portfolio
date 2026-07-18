const { resolveStaticDistDir } = require('./build/resolve-static-dist.cjs');

const staticDistDir = resolveStaticDistDir();

const assertionsCommunes = {
  'categories:accessibility': ['error', { minScore: 0.9 }],
  'categories:best-practices': ['error', { minScore: 0.9 }],
  'categories:seo': ['error', { minScore: 0.9 }],
};

/** Smoke desktop — complète l’audit mobile de lighthouserc.cjs (961px, seuil nav horizontale). */
module.exports = {
  ci: {
    collect: {
      staticDistDir,
      url: ['index.html', 'projets.html'],
      numberOfRuns: 5,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 961,
          height: 800,
          deviceScaleFactor: 1,
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
      ],
    },
  },
};
