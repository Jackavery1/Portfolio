const fs = require('fs');
const path = require('path');
const { ensureDir, log } = require('./fs-utils.cjs');
const { PAGE_META } = require('./page-meta.cjs');
const {
  BASE_STYLE_FILE,
  PAGE_STYLE_BY_HTML,
} = require('./page-styles.cjs');

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
      content="default-src 'self'; script-src 'self' https://www.google.com https://www.gstatic.com; style-src 'self' https://fonts.googleapis.com; style-src-attr 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://www.gstatic.com; frame-src https://www.google.com https://recaptcha.google.com; connect-src 'self' https://formspree.io https://www.google.com https://www.gstatic.com https://recaptcha.google.com; form-action 'self' https://formspree.io; base-uri 'self'; object-src 'none';"
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
  /<!-- HEAD_DEV_MIN[^>]*-->[\s\S]*?<!-- \/HEAD_DEV_MIN -->\s*/i;

function urlPageProd(htmlFile, siteBase) {
  if (htmlFile === 'index.html') return `${siteBase}/`;
  return `${siteBase}/${htmlFile}`;
}

function injectSeoMeta(html, htmlFile, siteBase) {
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
  if (meta.ogTitle) {
    out = out.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${meta.ogTitle}" />`,
    );
  }
  if (meta.twitterTitle) {
    out = out.replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${meta.twitterTitle}" />`,
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
  const preloads = fichiers
    .map((href) => `    <link rel="preload" href="${href}" as="style" />`)
    .join('\n');
  const stylesheets = fichiers
    .map((href) => `    <link rel="stylesheet" href="${href}" />`)
    .join('\n');
  return `    <link rel="modulepreload" href="js/main.js" />\n${preloads}\n${stylesheets}`;
}

function injectJsonLd(html, htmlFile, siteBase) {
  const meta = PAGE_META[htmlFile];
  if (!meta?.ogTitle) return html;

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.ogTitle,
    url: urlPageProd(htmlFile, siteBase),
    description: meta.description,
    inLanguage: 'fr-FR',
  };

  const bloc = `<script type="application/ld+json">\n${JSON.stringify(payload, null, 2)}\n    </script>`;
  return html.replace('</head>', `    ${bloc}\n  </head>`);
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

  const remplacement = balisesStylesProd(htmlFile);
  return out.replace(needle, remplacement);
}

// Chaîne appliquée à chaque page : SEO absolu → meta page → head prod → perf → partials → CSP
function copyHTML(root, distDir, siteBase) {
  let n = 0;
  const viewportNeedle =
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />';

  HTML_FILES.forEach((file) => {
    const src = path.join(root, file);
    const dst = path.join(distDir, file);
    if (!fs.existsSync(src)) return;

    let html = fs.readFileSync(src, 'utf8');
    html = injectPageMeta(html, file);
    html = injectHeadCommon(html, root);
    html = injectSeoMeta(html, file, siteBase);
    html = injectJsonLd(html, file, siteBase);
    html = injectPerfHead(html, file, root);
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
