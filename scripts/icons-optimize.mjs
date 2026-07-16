#!/usr/bin/env node
/**
 * Re-compresse les icônes PWA existantes si le fichier diminue (sharp compressionLevel 9).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cibles = [
  'assets/apple-touch-icon.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/favicon.png',
];

async function optimiser(rel) {
  const abs = path.join(rootDir, rel);
  if (!fs.existsSync(abs)) {
    console.log(`⚠️  ${rel} — absent`);
    return { rel, avant: 0, apres: 0, delta: 0 };
  }

  const avant = fs.statSync(abs).size;
  const buffer = await sharp(abs)
    .png({
      compressionLevel: 9,
      quality: rel.includes('512') ? 65 : 72,
      palette: true,
    })
    .toBuffer();

  if (buffer.length < avant) {
    fs.writeFileSync(abs, buffer);
  }

  const apres = fs.statSync(abs).size;
  const delta = apres - avant;
  console.log(`${rel}: ${avant} → ${apres} octets (${delta <= 0 ? '' : '+'}${delta})`);
  return { rel, avant, apres, delta };
}

const resultats = await Promise.all(cibles.map(optimiser));
const gain = resultats.reduce((s, r) => s + Math.max(0, r.avant - r.apres), 0);
console.log(`✅ Gain total : ${gain} octet(s)`);
