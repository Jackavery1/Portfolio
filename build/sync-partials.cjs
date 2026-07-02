const fs = require('fs');
const path = require('path');
const { PARTIALS } = require('./partials-list.cjs');

function syncPartials() {
  const target = path.join(__dirname, '..', 'js', 'config', 'partials.js');
  const entries = PARTIALS.map(
    ({ id, fichier }) => `  { id: '${id}', fichier: '${fichier}' },`
  ).join('\n');
  const content = `/* Généré par build/sync-partials.cjs — ne pas éditer à la main. */
export const PARTIALS = [
${entries}
];
`;
  fs.writeFileSync(target, content, 'utf8');
}

module.exports = { syncPartials };

if (require.main === module) {
  syncPartials();
}
