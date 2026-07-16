const fs = require('fs');
const path = require('path');
const { genererStyleCss } = require('./page-styles.mjs');

function syncStyleCss() {
  const target = path.join(__dirname, '..', 'style.css');
  fs.writeFileSync(target, genererStyleCss(), 'utf8');
}

const { executerSiEntreeDirecte } = require('./cli-entry.mjs');

module.exports = { syncStyleCss };

executerSiEntreeDirecte(require.main, module, syncStyleCss);
