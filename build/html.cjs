const fs = require('fs');
const path = require('path');
const { ensureDir, log } = require('./fs-utils.cjs');
const { CV_HREF_LOCAL, resolveBuildEnv } = require('./env.cjs');
const { HTML_FILES } = require('./html-files.cjs');
const { injectCspMeta } = require('./html-csp.cjs');
const { injectSeoMeta, injectPageMeta, injectJsonLd } = require('./html-seo.cjs');
const { injectHeadCommon, injectFontsAsync, injectPerfHead, liensStylesProd } = require('./html-head.cjs');
const { inlinePartials, placeholderRegex } = require('./html-partials-inline.cjs');
const { injectMentionsHtml } = require('./inject-mentions-html.cjs');

function injectCvLien(html) {
  const { cvHref } = resolveBuildEnv();
  if (!cvHref || cvHref === CV_HREF_LOCAL) return html;
  return html.replaceAll(`href="${CV_HREF_LOCAL}"`, `href="${cvHref}"`);
}

function copyHTML(root, distDir, siteBase, { htmlFiles = HTML_FILES } = {}) {
  let n = 0;

  htmlFiles.forEach((file) => {
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
    html = injectCvLien(html);
    if (file === 'mentions-legales.html') {
      html = injectMentionsHtml(html, root);
    }
    html = injectCspMeta(html);
    ensureDir(path.dirname(dst));
    fs.writeFileSync(dst, html);
    n += 1;
  });
  log(`${n} fichier(s) HTML (SEO + perf + partials inlinés)`, 'success');
}

module.exports = {
  HTML_FILES,
  copyHTML,
  injectCvLien,
  inlinePartials,
  placeholderRegex,
  injectSeoMeta,
  injectPageMeta,
  injectHeadCommon,
  injectFontsAsync,
  injectPerfHead,
  injectJsonLd,
  liensStylesProd,
  injectCspMeta,
};
