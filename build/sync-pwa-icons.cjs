const path = require('path');
const images = require('./images.cjs');

async function syncPwaIcons(root = path.join(__dirname, '..')) {
  await images.generatePwaIcons(root, root);
}

async function runCli(root = path.join(__dirname, '..')) {
  await syncPwaIcons(root);
}

async function executerSyncPwaIconsCli(root = path.join(__dirname, '..'), { exit = process.exit } = {}) {
  try {
    await runCli(root);
  } catch (err) {
    console.error(err);
    exit(1);
  }
}

module.exports = { syncPwaIcons, runCli, executerSyncPwaIconsCli };

if (require.main === module) {
  executerSyncPwaIconsCli();
}
