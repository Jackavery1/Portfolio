const path = require('path');
const { estEntreeDirecte, executerSiEntreeDirecte } = require('./cli-entry.mjs');
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

/** Phases ordonnées — l’ordre compte ; voir `dependDe` et ARCHITECTURE.md § Pipeline sync-source. */
function getSyncPhases(root = ROOT) {
  return [
    { id: 'defaults', dependDe: [], executer: () => syncDefaults() },
    { id: 'style-css', dependDe: ['defaults'], executer: () => syncStyleCss() },
    {
      id: 'partials',
      dependDe: ['style-css'],
      executer: () => syncPartials(),
    },
    {
      id: 'nav-squelette',
      dependDe: ['partials'],
      executer: () => syncNavSquelette(root),
    },
    { id: 'parcours-arbre', dependDe: ['partials'], executer: () => syncParcoursArbre() },
    { id: 'dojo-boss', dependDe: ['partials'], executer: () => syncDojoBoss() },
    { id: 'competences-stats', dependDe: ['partials'], executer: () => syncCompetencesStats() },
    { id: 'accueil-hero', dependDe: ['partials'], executer: () => syncAccueilHero() },
    { id: 'breakpoints', dependDe: ['style-css'], executer: () => syncBreakpoints() },
    { id: 'legal', dependDe: [], executer: () => syncLegal() },
    { id: 'projects', dependDe: [], executer: () => syncProjects() },
    { id: 'musique-donnees', dependDe: [], executer: () => syncMusiqueDonnees(root) },
    {
      id: 'manifest-dev',
      dependDe: ['legal'],
      executer: () => syncManifestDev(root),
    },
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

module.exports = {
  syncSource,
  getSyncPhases,
  IDS_PHASES_SYNC,
  executerDepuisArgv,
  estEntreeDirecte,
  executerSiEntreeDirecte,
};

executerSiEntreeDirecte(require.main, module, () => executerDepuisArgv());
