const fs = require('fs');
const path = require('path');
const { log } = require('./fs-utils.cjs');
const { BASE_STYLE_FILE, PAGE_STYLE_BY_HTML } = require('./page-styles.mjs');

const HEAD_COMMON_MARKER = '<!-- HEAD_COMMON -->';
const HEAD_DEV_MIN_RE = /<!-- HEAD_DEV_MIN[^>]*-->[\s\S]*?<!-- \/HEAD_DEV_MIN -->\s*/i;

function stripDevHead(html) {
  return html.replace(HEAD_DEV_MIN_RE, '');
}

function injectHeadCommon(html, root) {
  let out = stripDevHead(html);
  if (!out.includes(HEAD_COMMON_MARKER)) return out;
  const headPath = path.join(root, 'partials/head-common.html');
  if (!fs.existsSync(headPath)) {
    log('partials/head-common.html manquant — HEAD_COMMON ignoré', 'warning');
    return out;
  }
  const block = fs.readFileSync(headPath, 'utf8').trim();
  return out.replace(HEAD_COMMON_MARKER, block);
}

function injectFontsAsync(html, root) {
  if (!html.includes('<!-- FONTS_ASYNC -->')) return html;
  const fontsPath = path.join(root, 'partials/fonts-async.html');
  if (!fs.existsSync(fontsPath)) {
    log('partials/fonts-async.html manquant — FONTS_ASYNC ignoré', 'warning');
    return html;
  }
  const block = fs.readFileSync(fontsPath, 'utf8').trim();
  return html.replace('<!-- FONTS_ASYNC -->', block);
}

function liensStylesProd(htmlFile) {
  const page = PAGE_STYLE_BY_HTML[htmlFile];
  if (!page) return [];
  return [BASE_STYLE_FILE, page.outfile];
}

function balisesStylesProd(htmlFile) {
  const fichiers = liensStylesProd(htmlFile);
  return fichiers.map((href) => `    <link rel="stylesheet" href="${href}" />`).join('\n');
}

function injectPerfHead(html, htmlFile, root) {
  let out = injectFontsAsync(html, root);
  if (out.includes('<!-- STYLES_PROD -->')) {
    out = out.replace('<!-- STYLES_PROD -->', balisesStylesProd(htmlFile));
    return out;
  }

  const fichiers = liensStylesProd(htmlFile);
  if (!fichiers.length) return out;

  const needle = '<link rel="stylesheet" href="style.css" />';
  if (!out.includes(needle)) return out;

  return out.replace(needle, balisesStylesProd(htmlFile));
}

module.exports = {
  injectHeadCommon,
  injectFontsAsync,
  injectPerfHead,
  liensStylesProd,
  stripDevHead,
};
