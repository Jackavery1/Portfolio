const fs = require('fs');
const path = require('path');
const { ensureDir, log } = require('./fs-utils.cjs');
const { HTML_FILES } = require('./html.cjs');

function urlPageProd(htmlFile, siteBase) {
  if (htmlFile === 'index.html') return `${siteBase}/`;
  return `${siteBase}/${htmlFile}`;
}

function writeSeoFiles(distDir, siteBase) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = HTML_FILES.map((file) => urlPageProd(file, siteBase));
  const urlset = urls
    .map(
      (loc) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    )
    .join('\n');

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
  log('sitemap.xml + robots.txt générés', 'success');
}

module.exports = { writeSeoFiles, urlPageProd };
