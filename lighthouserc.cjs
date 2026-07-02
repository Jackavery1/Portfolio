const assertions = {
  'categories:performance': ['error', { minScore: 0.85 }],
  'categories:accessibility': ['error', { minScore: 0.9 }],
  'categories:best-practices': ['error', { minScore: 0.85 }],
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
];

module.exports = [
  {
    ci: {
      collect: {
        staticDistDir: './.dist-staging',
        url: urls,
        numberOfRuns: 2,
        settings: {
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
      assert: { assertions },
    },
  },
  {
    ci: {
      collect: {
        staticDistDir: './.dist-staging',
        url: urls,
        numberOfRuns: 1,
        settings: {
          emulatedFormFactor: 'desktop',
          screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
          },
        },
      },
      assert: { assertions },
    },
  },
];
