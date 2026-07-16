import { PAGE_META } from './page-meta.mjs';
import { remplacerBlocPageMeta } from './page-meta-tags.mjs';
import { urlPageProd } from './url-page.mjs';
import { buildJsonLd, jsonLdScriptTag } from './json-ld.mjs';

export function injectSeoMeta(html, htmlFile, siteBase) {
  const pageUrl = urlPageProd(htmlFile, siteBase);
  const ogImage = `${siteBase}/assets/og.webp`;

  let out = html
    .replace(/content="assets\/og\.png"/g, `content="${ogImage}"`)
    .replace(/content="assets\/og\.webp"/g, `content="${ogImage}"`);

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

export function injectPageMeta(html, htmlFile) {
  const meta = PAGE_META[htmlFile];
  if (!meta) return html;
  return remplacerBlocPageMeta(html, meta);
}

export function injectJsonLd(html, htmlFile, siteBase) {
  const meta = PAGE_META[htmlFile];
  const pageUrl = urlPageProd(htmlFile, siteBase);
  const payload = buildJsonLd(htmlFile, siteBase, meta, pageUrl);
  if (!payload) return html;

  let out = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/i, '');

  const bloc = jsonLdScriptTag(payload);
  return out.replace('</body>', `    ${bloc}\n  </body>`);
}
