const fs = require('fs');
const path = require('path');

const FRAGMENTS = [
  'partials/accueil/_head.html',
  'partials/accueil/texte.html',
  'partials/accueil/illustration.html',
  'partials/accueil/_foot.html',
];

function syncAccueilHero(root = path.join(__dirname, '..')) {
  const target = path.join(root, 'partials', 'accueil-hero.html');
  const parts = FRAGMENTS.map((rel) => {
    const filePath = path.join(root, rel);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fragment manquant : ${rel}`);
    }
    return fs.readFileSync(filePath, 'utf8').trimEnd();
  });
  fs.writeFileSync(target, `${parts.join('\n')}\n`, 'utf8');
}

const { executerSiEntreeDirecte } = require('./cli-entry.cjs');

module.exports = { syncAccueilHero, FRAGMENTS };

executerSiEntreeDirecte(require.main, module, syncAccueilHero);
