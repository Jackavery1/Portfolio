import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokensPath = path.join(rootDir, 'styles', 'tokens.css');

function parseHex(couleur) {
  const hex = couleur.trim().replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function luminanceRelative({ r, g, b }) {
  const canal = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function ratioContraste(fgHex, bgHex) {
  const l1 = luminanceRelative(parseHex(fgHex));
  const l2 = luminanceRelative(parseHex(bgHex));
  const clair = Math.max(l1, l2);
  const fonce = Math.min(l1, l2);
  return (clair + 0.05) / (fonce + 0.05);
}

function lireTokensCss() {
  const contenu = fs.readFileSync(tokensPath, 'utf8');
  const blocRoot = contenu.match(/:root\s*\{([^}]+)\}/s)?.[1] ?? '';
  const blocMobile = contenu.match(/@media \(max-width: 960px\)\s*\{\s*:root\s*\{([^}]+)\}/s)?.[1] ?? '';

  const lirePaires = (bloc) => {
    const tokens = {};
    const regex = /--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g;
    let match = regex.exec(bloc);
    while (match) {
      tokens[`--${match[1]}`] = match[2];
      match = regex.exec(bloc);
    }
    return tokens;
  };

  return { ...lirePaires(blocRoot), ...lirePaires(blocMobile) };
}

const PAIRES_AA = [
  { fg: '--couleur-texte-fort', bg: '--couleur-fond', min: 4.5 },
  { fg: '--couleur-texte-normal', bg: '--couleur-fond', min: 4.5 },
  { fg: '--couleur-texte-discret', bg: '--couleur-fond', min: 4.5 },
  { fg: '--couleur-accent-vif', bg: '--couleur-fond', min: 3 },
  { fg: '--couleur-valide', bg: '--couleur-fond', min: 3 },
  { fg: '--couleur-erreur', bg: '--couleur-fond', min: 3 },
  { fg: '--couleur-actif', bg: '--couleur-fond', min: 3 },
  { fg: '--couleur-texte-normal', bg: '--couleur-fond-champ', min: 4.5 },
];

describe('contrast tokens', () => {
  it('respecte les ratios WCAG AA sur les paires critiques', () => {
    const tokens = lireTokensCss();
    const echecs = PAIRES_AA.flatMap(({ fg, bg, min }) => {
      const fgHex = tokens[fg];
      const bgHex = tokens[bg];
      if (!fgHex || !bgHex) {
        return [{ fg, bg, min, ratio: null, message: 'token manquant' }];
      }
      const ratio = ratioContraste(fgHex, bgHex);
      if (ratio < min) {
        return [{ fg, bg, min, ratio: Number(ratio.toFixed(2)) }];
      }
      return [];
    });

    expect(echecs).toEqual([]);
  });
});
