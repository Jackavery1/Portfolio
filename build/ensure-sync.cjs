const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FICHIERS_GENERES = [
  'js/config/defaults.js',
  'js/config/partials.js',
  'style.css',
  'partials/parcours-arbre.html',
  'partials/dojo-boss-rush-lot-a.html',
  'partials/dojo-boss-rush-lot-b.html',
  'partials/dojo-boss-rush-lot-c.html',
];

function ensureSyncSource() {
  const manquant = FICHIERS_GENERES.some((rel) => !fs.existsSync(path.join(ROOT, rel)));
  if (manquant) {
    const { syncSource } = require('./sync-source.cjs');
    syncSource();
  }
}

module.exports = { ensureSyncSource };
