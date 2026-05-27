module.exports = {
  ci: {
    collect: {
      staticDistDir: './.dist-staging',
      url: ['index.html', 'projets.html', 'contact.html', 'dojo.html'],
      numberOfRuns: 1,
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
