const { PAGE_META } = require('./page-meta.mjs');
const { remplacerBlocPageMeta } = require('./page-meta-tags.mjs');
const { urlPageProd } = require('./url-page.mjs');
const { buildJsonLd, jsonLdScriptTag } = require('./json-ld.mjs');

function injectSeoMeta(html, htmlFile, siteBase) {
  const pageUrl = urlPageProd(htmlFile, siteBase);
  const ogImage = `${siteBase}/assets/og.png`;

  let out = html.replace(/content="assets\/og\.png"/g, `content="${ogImage}"`);

  out = out.replace(
    '<link rel="canonical" href="" id="link-canonical" />',
    `<link rel="canonical" href="${pageUrl}" id="link-canonical" />`
  );

  const ogUrlTag = `<meta property="og:url" content="${pageUrl}" id="meta-og-url" />`;
  if (out.includes('id="meta-og-url"')) {
    out = out.replace(/<meta property="og:url" content="[^"]*" id="meta-og-url" \/>/, ogUrlTag);
  } else {
    out = out.replace(
      '<meta property="og:locale" content="fr_FR" />',
      `<meta property="og:locale" content="fr_FR" />\n    ${ogUrlTag}`
    );
  }

  return out;
}

function injectPageMeta(html, htmlFile) {
  const meta = PAGE_META[htmlFile];
  if (!meta) return html;
  return remplacerBlocPageMeta(html, meta);
}

function injectJsonLd(html, htmlFile, siteBase) {
  const meta = PAGE_META[htmlFile];
  const pageUrl = urlPageProd(htmlFile, siteBase);
  const payload = buildJsonLd(htmlFile, siteBase, meta, pageUrl);
  if (!payload) return html;

  let out = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/i, '');

  const bloc = jsonLdScriptTag(payload);
  return out.replace('</body>', `    ${bloc}\n  </body>`);
}

module.exports = {
  injectSeoMeta,
  injectPageMeta,
  injectJsonLd,
};
