const path = require('path');
const { syncDefaults } = require('./sync-defaults.cjs');
const { syncStyleCss } = require('./sync-style-css.cjs');
const { syncPartials } = require('./sync-partials.cjs');
const { syncParcoursArbre } = require('./sync-parcours-arbre.cjs');
const { syncDojoBoss } = require('./sync-dojo-boss.cjs');
const { syncCompetencesStats } = require('./sync-competences-stats.cjs');
const { syncAccueilHero } = require('./sync-accueil-hero.cjs');
const { syncBreakpoints } = require('./sync-breakpoints.cjs');
const { syncPageMeta } = require('./sync-page-meta.cjs');
const { syncManifestDev } = require('./sync-manifest-dev.cjs');
const { syncLegal } = require('./sync-legal.cjs');
const { syncProjects } = require('./sync-projects.cjs');
const { syncNavSquelette } = require('./sync-nav-squelette.cjs');

const ROOT = path.join(__dirname, '..');

function syncSource({ pageMeta = false } = {}) {
  syncDefaults();
  syncStyleCss();
  syncPartials();
  syncNavSquelette(ROOT);
  syncParcoursArbre();
  syncDojoBoss();
  syncCompetencesStats();
  syncAccueilHero();
  syncBreakpoints();
  syncLegal();
  syncProjects();
  syncManifestDev(ROOT);
  if (pageMeta) syncPageMeta(ROOT);
}

module.exports = { syncSource };

if (require.main === module) {
  syncSource({ pageMeta: process.argv.includes('--page-meta') });
}
