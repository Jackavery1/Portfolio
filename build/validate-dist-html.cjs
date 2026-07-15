const path = require('path');
const { spawnSync } = require('child_process');
const { executerSiEntreeDirecte } = require('./cli-entry.cjs');
const { resolveServeDir } = require('./resolve-serve-dir.cjs');

function validerDistHtml({ root = path.join(__dirname, '..'), spawn = spawnSync } = {}) {
  const dir = resolveServeDir(root);
  if (!dir) {
    return { ok: false, code: 1, dir: null };
  }

  const rel = path.relative(root, dir).split(path.sep).join('/');
  const result = spawn('npx', ['html-validate', `${rel}/*.html`, `${rel}/offline.html`], {
    stdio: 'inherit',
    shell: true,
    cwd: root,
  });

  return { ok: true, code: result.status ?? 1, dir };
}

function executerValiderDistHtmlCli({
  root = path.join(__dirname, '..'),
  spawn = spawnSync,
  exit = process.exit,
} = {}) {
  const outcome = validerDistHtml({ root, spawn });
  if (!outcome.ok) {
    console.error('Aucun artefact HTML (.dist-staging-build/ ou .dist-staging/)');
    exit(1);
    return outcome;
  }
  exit(outcome.code);
  return outcome;
}

module.exports = { validerDistHtml, executerValiderDistHtmlCli };

executerSiEntreeDirecte(require.main, module, executerValiderDistHtmlCli);
