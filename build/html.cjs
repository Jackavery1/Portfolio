const fs = require('fs');
const path = require('path');
const { ensureDir, log } = require('./fs-utils.cjs');
const { PAGE_META } = require('./page-meta.cjs');

const PARTIAL_PLACEHOLDERS = [
  { id: 'partial-crt', fichier: 'partials/crt.html' },
  { id: 'partial-marquee', fichier: 'partials/marquee.html' },
  { id: 'partial-nav', fichier: 'partials/nav.html' },
  { id: 'partial-footer', fichier: 'partials/footer.html' },
  { id: 'partial-popup-hs', fichier: 'partials/popup-highscore.html' },
];

const HEAD_COMMON_MARKER = '<!-- HEAD_COMMON -->';

const CSP_META = `<meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://www.gstatic.com; frame-src https://www.google.com https://recaptcha.google.com; connect-src 'self' https://formspree.io https://www.google.com https://www.gstatic.com https://recaptcha.google.com; form-action 'self' https://formspree.io; base-uri 'self'; object-src 'none';"
    />`;

const HTML_FILES = [
  'index.html',
  'projets.html',
  'competences.html',
  'parcours.html',
  'contact.html',
  'dojo.html',
  'mentions-legales.html',
];

const HEAD_DEV_MIN_RE =
  /<!-- HEAD_DEV_MIN -->[\s\S]*?<!-- \/HEAD_DEV_MIN -->\s*/i;

function urlPageProd(htmlFile, siteBase) {
  if (htmlFile === 'index.html') return `${siteBase}/`;
  return `${siteBase}/${htmlFile}`;
}

function injectSeoMeta(html, htmlFile, siteBase) {
  // Harmonise canonical/OG avec l'URL de production.
  const pageUrl = urlPageProd(htmlFile, siteBase);
  const ogImage = `${siteBase}/assets/og.png`;

  let out = html.replace(/content="assets\/og\.png"/g, `content="${ogImage}"`);

  out = out.replace(
    '<link rel="canonical" href="" id="link-canonical" />',
    `<link rel="canonical" href="${pageUrl}" id="link-canonical" />`,
  );

  const ogUrlTag = `<meta property="og:url" content="${pageUrl}" id="meta-og-url" />`;
  if (out.includes('id="meta-og-url"')) {
    out = out.replace(
      /<meta property="og:url" content="[^"]*" id="meta-og-url" \/>/,
      ogUrlTag,
    );
  } else {
    out = out.replace(
      '<meta property="og:locale" content="fr_FR" />',
      `<meta property="og:locale" content="fr_FR" />\n    ${ogUrlTag}`,
    );
  }

  return out;
}

function injectPageMeta(html, htmlFile) {
  // Applique la description SEO spécifique à chaque page.
  const meta = PAGE_META[htmlFile];
  if (!meta) return html;

  let out = html;
  if (meta.description) {
    out = out.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${meta.description}" />`,
    );
  }
  if (meta.ogDescription) {
    out = out.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${meta.ogDescription}" />`,
    );
  }
  if (meta.twitterDescription) {
    out = out.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${meta.twitterDescription}" />`,
    );
  }
  return out;
}

function inlinePartials(html, root) {
  // Remplace les placeholders par le HTML des partials.
  let out = html;
  PARTIAL_PLACEHOLDERS.forEach(({ id, fichier }) => {
    const src = path.join(root, fichier);
    if (!fs.existsSync(src)) return;
    const contenu = fs.readFileSync(src, 'utf8').trim();
    const re = new RegExp(`<div id="${id}"[^>]*>\\s*</div>`, 'i');
    out = out.replace(re, contenu);
  });
  return out;
}

function stripDevHead(html) {
  return html.replace(HEAD_DEV_MIN_RE, '');
}

function injectHeadCommon(html, root) {
  // Injecte le bloc head commun de production.
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

function injectPerfHead(html) {
  // Ajoute preload CSS et limite les fontes chargées.
  let out = html.replace(
    /Rajdhani:wght@400;600;700&display=swap/g,
    'Rajdhani:wght@400;600&display=swap',
  );
  const preload = '<link rel="preload" href="style.css" as="style" />';
  if (!out.includes('rel="preload" href="style.css"')) {
    out = out.replace(
      '<link rel="stylesheet" href="style.css" />',
      `${preload}\n    <link rel="stylesheet" href="style.css" />`,
    );
  }
  return out;
}

function copyHTML(root, distDir, siteBase) {
  // Génère les 7 pages HTML finales dans le dossier de build.
  let n = 0;
  const viewportNeedle =
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />';

  HTML_FILES.forEach((file) => {
    const src = path.join(root, file);
    const dst = path.join(distDir, file);
    if (!fs.existsSync(src)) return;

    let html = fs.readFileSync(src, 'utf8');
    html = injectSeoMeta(html, file, siteBase);
    html = injectPageMeta(html, file);
    html = injectHeadCommon(html, root);
    html = injectPerfHead(html);
    html = inlinePartials(html, root);
    if (html.includes(viewportNeedle) && !html.includes('Content-Security-Policy')) {
      html = html.replace(viewportNeedle, `${viewportNeedle}\n    ${CSP_META}`);
    }
    ensureDir(path.dirname(dst));
    fs.writeFileSync(dst, html);
    n += 1;
  });
  log(`${n} fichier(s) HTML (SEO + perf + partials inlinés)`, 'success');
}

module.exports = {
  HTML_FILES,
  copyHTML,
};
