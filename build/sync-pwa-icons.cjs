const path = require('path');
const { generatePwaIcons } = require('./images.cjs');

async function syncPwaIcons(root = path.join(__dirname, '..')) {
  await generatePwaIcons(root, root);
}

module.exports = { syncPwaIcons };

if (require.main === module) {
  syncPwaIcons().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
