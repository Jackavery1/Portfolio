const path = require('path');
const images = require('./images.cjs');

async function syncPwaIcons(root = path.join(__dirname, '..')) {
  await images.generatePwaIcons(root, root);
}

async function runCli(root = path.join(__dirname, '..')) {
  await syncPwaIcons(root);
}

module.exports = { syncPwaIcons, runCli };

if (require.main === module) {
  runCli().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
