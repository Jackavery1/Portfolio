const fs = require('fs');
const path = require('path');
const { log } = require('./fs-utils.cjs');
const { HTML_FILES } = require('./html.cjs');

function patchOgImageWebp(distDir, siteBase) {
  const webpPath = path.join(distDir, 'assets', 'og.webp');
  if (!fs.existsSync(webpPath)) {
    log('assets/og.webp absent — og:image PNG conservé', 'warning');
    return;
  }

  const absPng = `${siteBase}/assets/og.png`;
  const absWebp = `${siteBase}/assets/og.webp`;
  let n = 0;

  HTML_FILES.forEach((file) => {
    const htmlPath = path.join(distDir, file);
    if (!fs.existsSync(htmlPath)) return;

    let html = fs.readFileSync(htmlPath, 'utf8');
    if (!html.includes(absPng) && !html.includes('assets/og.png')) return;

    html = html
      .replaceAll(absPng, absWebp)
      .replaceAll('content="assets/og.png"', 'content="assets/og.webp"');
    fs.writeFileSync(htmlPath, html);
    n += 1;
  });

  if (n > 0) log(`og:image / twitter:image → WebP sur ${n} page(s)`, 'success');

  const pngPath = path.join(distDir, 'assets', 'og.png');
  if (fs.existsSync(pngPath)) {
    fs.unlinkSync(pngPath);
    log('assets/og.png retiré (og.webp servi)', 'success');
  }
}

module.exports = { patchOgImageWebp };
