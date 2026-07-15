const path = require('path');
const { spawnSync } = require('child_process');
const { executerSiEntreeDirecte } = require('./cli-entry.cjs');
const { resolveServeDir } = require('./resolve-serve-dir.cjs');

function runServeStaging({ root = path.join(__dirname, '..'), port = '3000', spawn = spawnSync } = {}) {
  const dir = resolveServeDir(root);
  if (!dir) {
    return { ok: false, code: 1, dir: null };
  }

  const result = spawn('npx', ['serve', dir, '-l', port], {
    stdio: 'inherit',
    shell: true,
    cwd: root,
  });

  return { ok: true, code: result.status ?? 1, dir };
}

function executerRunServeStagingCli({
  root = path.join(__dirname, '..'),
  port = process.argv[2] || '3000',
  spawn = spawnSync,
  exit = process.exit,
} = {}) {
  const outcome = runServeStaging({ root, port, spawn });
  if (!outcome.ok) {
    console.error('Répertoire de serve introuvable (.dist-staging-build/ ou .dist-staging/)');
    exit(1);
    return outcome;
  }
  exit(outcome.code);
  return outcome;
}

module.exports = { runServeStaging, executerRunServeStagingCli };

executerSiEntreeDirecte(require.main, module, executerRunServeStagingCli);
