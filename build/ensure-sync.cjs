const fs = require('fs');
const path = require('path');
const { syncSource } = require('./sync-source.cjs');

const ROOT = path.join(__dirname, '..');

const FICHIERS_GENERES = [
  'js/config/defaults.js',
  'js/config/partials.js',
  'style.css',
  'partials/parcours-arbre.html',
];

function ensureSyncSource() {
  const manquant = FICHIERS_GENERES.some((rel) => !fs.existsSync(path.join(ROOT, rel)));
  if (manquant) {
    syncSource();
  }
}

module.exports = { ensureSyncSource };
