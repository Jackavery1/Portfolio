import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import breakpoints from './breakpoints.cjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = path.join(rootDir, 'styles');

const SEUILS_AUTORISES = new Set(Object.values(breakpoints));

function listerFichiersCss(dir) {
  const entrees = fs.readdirSync(dir, { withFileTypes: true });
  return entrees.flatMap((entree) => {
    const absolu = path.join(dir, entree.name);
    if (entree.isDirectory()) return listerFichiersCss(absolu);
    return entree.name.endsWith('.css') ? [absolu] : [];
  });
}

function extraireValeursMedia(contenu) {
  const valeurs = [];
  const regex = /@media[^{]*\((?:min|max)-(?:width|height):\s*(\d+)px/g;
  let match = regex.exec(contenu);
  while (match) {
    valeurs.push(Number(match[1]));
    match = regex.exec(contenu);
  }
  return valeurs;
}

describe('breakpoints @media', () => {
  it('utilise uniquement des seuils définis dans breakpoints.cjs', () => {
    const fichiers = listerFichiersCss(stylesDir);
    const invalides = [];

    fichiers.forEach((fichier) => {
      const contenu = fs.readFileSync(fichier, 'utf8');
      extraireValeursMedia(contenu).forEach((valeur) => {
        if (!SEUILS_AUTORISES.has(valeur)) {
          invalides.push({ fichier: path.relative(rootDir, fichier), valeur });
        }
      });
    });

    expect(invalides).toEqual([]);
  });
});
