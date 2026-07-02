const fs = require('fs');
const path = require('path');

const FRAGMENTS = [
  'partials/parcours-arbre/_head.html',
  'partials/parcours-arbre/agro.html',
  'partials/parcours-arbre/reconversion.html',
  'partials/parcours-arbre/formation.html',
  'partials/parcours-arbre/couronne.html',
  'partials/parcours-arbre/_foot.html',
];

function syncParcoursArbre(root = path.join(__dirname, '..')) {
  const target = path.join(root, 'partials', 'parcours-arbre.html');
  const parts = FRAGMENTS.map((rel) => {
    const filePath = path.join(root, rel);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fragment manquant : ${rel}`);
    }
    return fs.readFileSync(filePath, 'utf8').trimEnd();
  });
  fs.writeFileSync(target, `${parts.join('\n')}\n`, 'utf8');
}

module.exports = { syncParcoursArbre, FRAGMENTS };

if (require.main === module) {
  syncParcoursArbre();
}
