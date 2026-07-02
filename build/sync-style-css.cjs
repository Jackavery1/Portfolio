const fs = require('fs');
const path = require('path');
const { genererStyleCss } = require('./page-styles.cjs');

function syncStyleCss() {
  const target = path.join(__dirname, '..', 'style.css');
  fs.writeFileSync(target, genererStyleCss(), 'utf8');
}

module.exports = { syncStyleCss };

if (require.main === module) {
  syncStyleCss();
}
