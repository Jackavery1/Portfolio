const fs = require('fs');
const path = require('path');

const FRAGMENTS_BOSS = [
  'partials/dojo-boss/domslayer.html',
  'partials/dojo-boss/crud.html',
  'partials/dojo-boss/ejs.html',
  'partials/dojo-boss/poo.html',
  'partials/dojo-boss/selenium.html',
  'partials/dojo-boss/rentercar.html',
  'partials/dojo-boss/oracle.html',
  'partials/dojo-boss/stack.html',
  'partials/dojo-boss/angular.html',
  'partials/dojo-boss/java.html',
  'partials/dojo-boss/react.html',
];

/** Lots générés — évite un partial monolithique ~380 L. */
const LOTS = [
  {
    id: 'partial-dojo-boss-rush-lot-a',
    fichier: 'partials/dojo-boss-rush-lot-a.html',
    fragments: FRAGMENTS_BOSS.slice(0, 4),
  },
  {
    id: 'partial-dojo-boss-rush-lot-b',
    fichier: 'partials/dojo-boss-rush-lot-b.html',
    fragments: FRAGMENTS_BOSS.slice(4, 8),
  },
  {
    id: 'partial-dojo-boss-rush-lot-c',
    fichier: 'partials/dojo-boss-rush-lot-c.html',
    fragments: FRAGMENTS_BOSS.slice(8),
  },
];

const FICHIER_LEGACY = 'partials/dojo-boss-rush.html';

function lireFragments(root, relPaths) {
  return relPaths.map((rel) => {
    const filePath = path.join(root, rel);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fragment manquant : ${rel}`);
    }
    return fs.readFileSync(filePath, 'utf8').trimEnd();
  });
}

function ecrireLot(root, { id, fichier, fragments }) {
  const contenu = lireFragments(root, fragments).join('\n');
  const html = `<div id="${id}" class="boss-rush__lot">\n${contenu}\n</div>\n`;
  fs.writeFileSync(path.join(root, fichier), html, 'utf8');
}

function retirerLegacy(root) {
  const legacy = path.join(root, FICHIER_LEGACY);
  if (fs.existsSync(legacy)) {
    fs.unlinkSync(legacy);
  }
}

function syncDojoBoss(root = path.join(__dirname, '..')) {
  LOTS.forEach((lot) => ecrireLot(root, lot));
  retirerLegacy(root);
}

module.exports = {
  syncDojoBoss,
  FRAGMENTS_BOSS,
  LOTS,
  FICHIER_LEGACY,
};

const { executerSiEntreeDirecte } = require('./cli-entry.mjs');
executerSiEntreeDirecte(require.main, module, syncDojoBoss);
