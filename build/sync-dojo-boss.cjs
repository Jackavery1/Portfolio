const fs = require('fs');
const path = require('path');

const FRAGMENTS = [
  'partials/dojo-boss/_head.html',
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
  'partials/dojo-boss/_foot.html',
];

function syncDojoBoss(root = path.join(__dirname, '..')) {
  const target = path.join(root, 'partials', 'dojo-boss-rush.html');
  const parts = FRAGMENTS.map((rel) => {
    const filePath = path.join(root, rel);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fragment manquant : ${rel}`);
    }
    return fs.readFileSync(filePath, 'utf8').trimEnd();
  });
  fs.writeFileSync(target, `${parts.join('\n')}\n`, 'utf8');
}

module.exports = { syncDojoBoss, FRAGMENTS };

if (require.main === module) {
  syncDojoBoss();
}
