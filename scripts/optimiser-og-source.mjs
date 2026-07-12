/**
 * Réduit assets/og.png (largeur max 1200, palette, qualité 62) — aligné sur build/images.cjs.
 * Usage : node scripts/optimiser-og-source.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ogPath = path.join(rootDir, 'assets', 'og.png');
const LARGEUR_MAX = 1200;
const QUALITE = 62;

if (!fs.existsSync(ogPath)) {
  console.error('❌ assets/og.png absent');
  process.exit(1);
}

const avant = fs.statSync(ogPath).size;
const buffer = await sharp(ogPath, { failOn: 'none' })
  .rotate()
  .resize({ width: LARGEUR_MAX, withoutEnlargement: true })
  .png({ quality: QUALITE, compressionLevel: 9, palette: true })
  .toBuffer();

fs.writeFileSync(ogPath, buffer);
const apres = buffer.length;
const gain = avant - apres;
console.log(
  `✅ og.png : ${avant} → ${apres} octets (${gain >= 0 ? '-' : '+'}${Math.abs(gain)} octets)`
);
