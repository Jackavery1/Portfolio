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
const { syncMusiqueDonnees } = require('./sync-musique-donnees.cjs');

const ROOT = path.join(__dirname, '..');

/** Phases ordonnées — l’ordre compte (partials avant nav, legal avant manifest, etc.). */
function getSyncPhases(root = ROOT) {
  return [
    { id: 'defaults', executer: () => syncDefaults() },
    { id: 'style-css', executer: () => syncStyleCss() },
    { id: 'partials', executer: () => syncPartials() },
    { id: 'nav-squelette', executer: () => syncNavSquelette(root) },
    { id: 'parcours-arbre', executer: () => syncParcoursArbre() },
    { id: 'dojo-boss', executer: () => syncDojoBoss() },
    { id: 'competences-stats', executer: () => syncCompetencesStats() },
    { id: 'accueil-hero', executer: () => syncAccueilHero() },
    { id: 'breakpoints', executer: () => syncBreakpoints() },
    { id: 'legal', executer: () => syncLegal() },
    { id: 'projects', executer: () => syncProjects() },
    { id: 'musique-donnees', executer: () => syncMusiqueDonnees(root) },
    { id: 'manifest-dev', executer: () => syncManifestDev(root) },
  ];
}

const IDS_PHASES_SYNC = getSyncPhases().map((phase) => phase.id);

function syncSource({ pageMeta = false, root = ROOT, phases } = {}) {
  const liste = phases ?? getSyncPhases(root);
  for (const phase of liste) {
    phase.executer();
  }
  if (pageMeta) syncPageMeta(root);
}

/** Point d’entrée CLI testable (`node build/sync-source.cjs [--page-meta]`). */
function executerDepuisArgv(argv = process.argv) {
  syncSource({ pageMeta: argv.includes('--page-meta') });
}

function estEntreeDirecte(requireMain, moduleRef) {
  return requireMain === moduleRef;
}

function executerSiEntreeDirecte(requireMain, moduleRef, argv = process.argv) {
  if (!estEntreeDirecte(requireMain, moduleRef)) return;
  executerDepuisArgv(argv);
}

module.exports = {
  syncSource,
  getSyncPhases,
  IDS_PHASES_SYNC,
  executerDepuisArgv,
  estEntreeDirecte,
  executerSiEntreeDirecte,
};

executerSiEntreeDirecte(require.main, module);
