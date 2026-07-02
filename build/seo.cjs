const fs = require('fs');
const path = require('path');
const { ensureDir, log } = require('./fs-utils.cjs');
const { HTML_FILES } = require('./html.cjs');
const { urlPageProd } = require('./url-page.cjs');
const { writeManifest } = require('./manifest.cjs');

const SITEMAP_PRIORITY = {
  'index.html': '1.0',
  'projets.html': '0.9',
  'contact.html': '0.9',
  'competences.html': '0.8',
  'parcours.html': '0.8',
  'dojo.html': '0.7',
  'mentions-legales.html': '0.4',
};

function writeSeoFiles(distDir, siteBase) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urlset = HTML_FILES.map((file) => {
    const loc = urlPageProd(file, siteBase);
    const priority = SITEMAP_PRIORITY[file] || '0.8';
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteBase}/sitemap.xml
`;

  ensureDir(distDir);
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);
  writeManifest(distDir, siteBase);
  log('sitemap.xml + robots.txt générés', 'success');
}

module.exports = { writeSeoFiles };
