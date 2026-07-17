#!/usr/bin/env node
/**
 * Mesure la taille du build prod — baseline optimisation.
 * Usage : npm run build && npm run measure
 * CI     : npm run build && npm run measure:check
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { resolveServeDir } = require('../build/resolve-serve-dir.cjs');

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolveServeDir(rootDir);
const MODE_CHECK = process.argv.includes('--check');
const CLEFS_PLAFOND = ['distKo', 'cssKo', 'jsKo', 'appJsGzipKo', 'iconsKo'];

function tailleKo(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

function gzipKo(buffer) {
  return tailleKo(zlib.gzipSync(buffer, { level: 9 }).length);
}

function parcourirFichiers(dir, fichiers = []) {
  if (!fs.existsSync(dir)) return fichiers;
  for (const entree of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entree.name);
    if (entree.isDirectory()) parcourirFichiers(abs, fichiers);
    else fichiers.push(abs);
  }
  return fichiers;
}

export function verifierPlafonds(rapport, plafonds) {
  const depassements = [];
  for (const cle of CLEFS_PLAFOND) {
    const valeur = rapport[cle];
    const plafond = plafonds[cle];
    if (typeof valeur !== 'number' || typeof plafond !== 'number') continue;
    if (valeur > plafond) {
      depassements.push(`${cle}: ${valeur} > ${plafond}`);
    }
  }
  return depassements;
}

function mesurer() {
  if (!distDir) {
    console.error(
      '❌ Aucun artefact build (.dist-staging-build/ ou .dist-staging/) — exécutez npm run build'
    );
    process.exit(1);
  }

  const tous = parcourirFichiers(distDir);
  const distOctets = tous.reduce((s, f) => s + fs.statSync(f).size, 0);

  const jsAssets = tous
    .filter((f) => f.includes(`${path.sep}js${path.sep}`) && f.endsWith('.js'))
    .map((f) => {
      const buf = fs.readFileSync(f);
      return {
        name: path.relative(distDir, f).replace(/\\/g, '/'),
        ko: tailleKo(buf.length),
        gzipKo: gzipKo(buf),
      };
    })
    .sort((a, b) => b.ko - a.ko);

  const appJsGzipKo = jsAssets.reduce((s, j) => s + j.gzipKo, 0);

  const iconPatterns = ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
  const iconsOctets = iconPatterns.reduce((s, nom) => {
    const p = path.join(distDir, 'assets', nom);
    return fs.existsSync(p) ? s + fs.statSync(p).size : s;
  }, 0);

  const cssOctets = tous
    .filter((f) => f.endsWith('.css'))
    .reduce((s, f) => s + fs.statSync(f).size, 0);

  const rapport = {
    date: new Date().toISOString(),
    distKo: tailleKo(distOctets),
    cssKo: tailleKo(cssOctets),
    jsKo: Math.round(jsAssets.reduce((s, j) => s + j.ko, 0) * 10) / 10,
    appJsGzipKo: Math.round(appJsGzipKo * 10) / 10,
    iconsKo: tailleKo(iconsOctets),
    jsAssets,
  };

  console.log(JSON.stringify(rapport, null, 2));

  const baselinePath = path.join(rootDir, 'scripts', 'bundle-baseline.json');
  fs.writeFileSync(
    baselinePath,
    `${JSON.stringify(
      {
        date: rapport.date.slice(0, 10),
        note: 'Généré par npm run measure — non versionné (.gitignore)',
        distKo: rapport.distKo,
        cssKo: rapport.cssKo,
        jsKo: rapport.jsKo,
        appJsGzipKo: rapport.appJsGzipKo,
        iconsKo: rapport.iconsKo,
      },
      null,
      2
    )}\n`
  );

  if (MODE_CHECK) {
    const ceilingsPath = path.join(rootDir, 'scripts', 'bundle-ceilings.json');
    const plafonds = JSON.parse(fs.readFileSync(ceilingsPath, 'utf8'));
    const depassements = verifierPlafonds(rapport, plafonds);
    if (depassements.length) {
      console.error('❌ Bundle au-delà des plafonds CI :');
      for (const ligne of depassements) console.error(`  - ${ligne}`);
      process.exit(1);
    }
    console.error('✅ Bundle sous les plafonds CI');
  }

  return rapport;
}

const estEntreeDirecte = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (estEntreeDirecte) {
  mesurer();
}
