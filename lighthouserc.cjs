module.exports = {
  ci: {
    collect: {
      staticDistDir: './.dist-staging',
      url: [
        'index.html',
        'projets.html',
        'competences.html',
        'parcours.html',
        'contact.html',
        'dojo.html',
        'mentions-legales.html',
      ],
      numberOfRuns: 2,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
