const fs = require('fs');
const path = require('path');
const { HTML_FILES } = require('./html-files.mjs');
const { executerSiEntreeDirecte } = require('./cli-entry.mjs');

const HEADER_INNER_RE = /(<header\b[^>]*\bid=["']partial-nav["'][^>]*>)([\s\S]*?)(<\/header>)/i;

function deriverNavSquelette(navHtml) {
  let inner = String(navHtml)
    .replace(/^\s*<header\b[^>]*>/i, '')
    .replace(/<\/header>\s*$/i, '')
    .trim();

  inner = inner.replace(/<p\b[^>]*\bid=["']js-annonce-navigation["'][^>]*>[\s\S]*?<\/p>\s*/i, '');

  if (!/class="nav__liens[^"]*nav__liens--squelette/.test(inner)) {
    inner = inner.replace(/class="nav__liens"/, 'class="nav__liens nav__liens--squelette"');
  }

  inner = inner.replace(
    /<span class="pixel-accent"(?![^>]*aria-hidden)/,
    '<span class="pixel-accent" aria-hidden="true"'
  );

  return `${inner.trim()}\n`;
}

function syncNavSquelette(root = path.join(__dirname, '..')) {
  const navPath = path.join(root, 'partials', 'nav.html');
  if (!fs.existsSync(navPath)) {
    throw new Error('partials/nav.html manquant');
  }

  const squelette = deriverNavSquelette(fs.readFileSync(navPath, 'utf8'));
  const partialPath = path.join(root, 'partials', 'nav-squelette.html');
  fs.mkdirSync(path.dirname(partialPath), { recursive: true });
  fs.writeFileSync(partialPath, squelette, 'utf8');

  HTML_FILES.forEach((file) => {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) return;
    const html = fs.readFileSync(filePath, 'utf8');
    if (!HEADER_INNER_RE.test(html)) {
      throw new Error(`${file} : squelette partial-nav introuvable`);
    }
    const next = html.replace(HEADER_INNER_RE, `$1\n${squelette.trimEnd()}\n      $3`);
    fs.writeFileSync(filePath, next, 'utf8');
  });
}

module.exports = { syncNavSquelette, deriverNavSquelette, HTML_FILES, HEADER_INNER_RE };

executerSiEntreeDirecte(require.main, module, syncNavSquelette);
