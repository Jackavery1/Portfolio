const assertionsCommunes = {
  'categories:accessibility': ['error', { minScore: 0.9 }],
  'categories:best-practices': ['error', { minScore: 0.9 }],
  'categories:seo': ['error', { minScore: 0.9 }],
  'categories:performance': ['error', { minScore: 0.9 }],
};

/** Smoke desktop — complète l’audit mobile de lighthouserc.cjs (961px, seuil nav horizontale). */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './.dist-staging',
      url: ['index.html', 'projets.html'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        emulatedFormFactor: 'desktop',
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
      assertions: assertionsCommunes,
      includePassedAssertions: false,
    },
  },
};
