const assertionsCommunes = {
  'categories:accessibility': ['error', { minScore: 0.9 }],
  'categories:best-practices': ['error', { minScore: 0.9 }],
  'categories:seo': ['error', { minScore: 0.9 }],
};

const urls = [
  'index.html',
  'projets.html',
  'competences.html',
  'parcours.html',
  'contact.html',
  'dojo.html',
  'mentions-legales.html',
  'offline.html',
];

module.exports = {
  ci: {
    collect: {
      staticDistDir: './.dist-staging',
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
      assertions: assertionsCommunes,
      includePassedAssertions: false,
      assertMatrix: [
        {
          matchingUrlPattern: '.*index\\.html',
          assertions: {
            'categories:performance': ['error', { minScore: 0.9 }],
          },
        },
        {
          matchingUrlPattern: '.*projets\\.html',
          assertions: {
            'categories:performance': ['error', { minScore: 0.88 }],
          },
        },
        {
          matchingUrlPattern: '.*contact\\.html',
          assertions: {
            'categories:performance': ['error', { minScore: 0.88 }],
          },
        },
        {
          matchingUrlPattern: '.*(competences|parcours|dojo)\\.html',
          assertions: {
            'categories:performance': ['error', { minScore: 0.78 }],
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
