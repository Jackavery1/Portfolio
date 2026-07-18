const fs = require('fs');
const path = require('path');
const { ensureDir, log } = require('./fs-utils.cjs');
const { encoderIcoDepuisPng } = require('./favicon-ico.cjs');

/** Part du canvas occupée par le visuel — marge pour masques iOS / Android */
const ZONE_UTILE_PWA = 0.5;
const FOND_PWA = { r: 3, g: 4, b: 15, alpha: 1 };
const TAILLE_FAVICON_ICO = 32;

function attacherApiPwa(api, sharpLib) {
  api.genererIconeCarreePwa = async function genererIconeCarreePwa(src, size) {
    const zone = Math.round(size * ZONE_UTILE_PWA);
    const redimensionnee = await sharpLib(src)
      .resize(zone, zone, { fit: 'inside', background: FOND_PWA })
      .png()
      .toBuffer();

    const { width, height } = await sharpLib(redimensionnee).metadata();
    const left = Math.floor((size - width) / 2);
    const top = Math.floor((size - height) / 2);

    return sharpLib({
      create: { width: size, height: size, channels: 4, background: FOND_PWA },
    })
      .composite([{ input: redimensionnee, left, top }])
      .png({ compressionLevel: 9, quality: size >= 512 ? 65 : 72, palette: true })
      .toBuffer();
  };

  api.genererFaviconIco = async function genererFaviconIco(src, destinations) {
    const png32 = await sharpLib(src)
      .resize(TAILLE_FAVICON_ICO, TAILLE_FAVICON_ICO, {
        fit: 'contain',
        background: FOND_PWA,
      })
      .png()
      .toBuffer();
    const ico = encoderIcoDepuisPng(png32, TAILLE_FAVICON_ICO, TAILLE_FAVICON_ICO);
    for (const dst of destinations) {
      ensureDir(path.dirname(dst));
      fs.writeFileSync(dst, ico);
    }
  };

  api.genererIconesPwa = async function genererIconesPwa(root, distDir) {
    const src = path.join(root, 'assets', 'favicon.png');
    if (!fs.existsSync(src)) {
      log('favicon.png absent — icônes PWA ignorées', 'warning');
      return;
    }

    const sizes = [
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'icon-192.png', size: 192 },
      { name: 'icon-512.png', size: 512 },
    ];

    for (const { name, size } of sizes) {
      const pngBuffer = await api.genererIconeCarreePwa(src, size);

      for (const base of [root, distDir]) {
        const dst = path.join(base, 'assets', name);
        ensureDir(path.dirname(dst));
        fs.writeFileSync(dst, pngBuffer);
      }
    }

    const destinationsIco = [path.join(root, 'favicon.ico')];
    if (distDir && distDir !== root) {
      destinationsIco.push(path.join(distDir, 'favicon.ico'));
    }
    await api.genererFaviconIco(src, destinationsIco);

    log('icônes PWA générées (180 / 192 / 512) + favicon.ico', 'success');
  };
}

module.exports = { ZONE_UTILE_PWA, FOND_PWA, TAILLE_FAVICON_ICO, attacherApiPwa };
