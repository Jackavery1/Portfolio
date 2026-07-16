const fs = require('fs');
const path = require('path');

function syncLegal() {
  const source = path.join(__dirname, '..', 'js', 'config', 'legal.json');
  const target = path.join(__dirname, '..', 'js', 'config', 'legal-data.js');
  const data = JSON.parse(fs.readFileSync(source, 'utf8'));
  const content = `/* Généré par build/sync-legal.cjs — ne pas éditer à la main. */
export const MENTIONS_LEGALES = ${JSON.stringify(data, null, 2)};
`;
  fs.writeFileSync(target, content, 'utf8');
}

const { executerSiEntreeDirecte } = require('./cli-entry.mjs');

module.exports = { syncLegal };

executerSiEntreeDirecte(require.main, module, syncLegal);
