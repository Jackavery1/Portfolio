const fs = require('fs');
const path = require('path');
const { HTML_FILES } = require('./html-files.cjs');

const HEADER_INNER_RE = /(<header\b[^>]*\bid=["']partial-nav["'][^>]*>)([\s\S]*?)(<\/header>)/i;

function syncNavSquelette(root = path.join(__dirname, '..')) {
  const partialPath = path.join(root, 'partials', 'nav-squelette.html');
  if (!fs.existsSync(partialPath)) {
    throw new Error('partials/nav-squelette.html manquant');
  }
  const contenu = fs.readFileSync(partialPath, 'utf8').trimEnd();

  HTML_FILES.forEach((file) => {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) return;
    const html = fs.readFileSync(filePath, 'utf8');
    if (!HEADER_INNER_RE.test(html)) {
      throw new Error(`${file} : squelette partial-nav introuvable`);
    }
    const next = html.replace(HEADER_INNER_RE, `$1\n${contenu}\n      $3`);
    fs.writeFileSync(filePath, next, 'utf8');
  });
}

const { executerSiEntreeDirecte } = require('./cli-entry.cjs');

module.exports = { syncNavSquelette, HTML_FILES, HEADER_INNER_RE };

executerSiEntreeDirecte(require.main, module, syncNavSquelette);
