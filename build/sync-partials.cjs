const fs = require('fs');
const path = require('path');
const { PARTIELS } = require('./partials-list.mjs');

function syncPartials() {
  const target = path.join(__dirname, '..', 'js', 'config', 'partials.js');
  const entries = PARTIELS.map(
    ({ id, fichier }) => `  { id: '${id}', fichier: '${fichier}' },`
  ).join('\n');
  const content = `/* Généré par build/sync-partials.cjs — ne pas éditer à la main. */
export const PARTIELS = [
${entries}
];
`;
  fs.writeFileSync(target, content, 'utf8');
}

module.exports = { syncPartials };

if (require.main === module) {
  syncPartials();
}
