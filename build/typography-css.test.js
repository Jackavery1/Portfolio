import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function listerCss(dir, acc = []) {
  for (const entree of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolu = path.join(dir, entree.name);
    if (entree.isDirectory()) listerCss(absolu, acc);
    else if (entree.name.endsWith('.css')) acc.push(absolu);
  }
  return acc;
}

describe('typography CSS', () => {
  it('police pixel — pas de clamp avec minimum < --taille-pixel-min', () => {
    const stylesDir = path.join(rootDir, 'styles');
    const fichiers = listerCss(stylesDir);
    const interdit = /font-size:\s*clamp\(\s*0\.(?:3[0-9]|4[0-9]|5[0-5])rem/;

    fichiers.forEach((absolu) => {
      const rel = path.relative(rootDir, absolu).replace(/\\/g, '/');
      const lignes = fs.readFileSync(absolu, 'utf8').split('\n');
      let contextePixel = false;

      lignes.forEach((ligne, index) => {
        if (ligne.includes('--police-pixel')) contextePixel = true;
        if (contextePixel && interdit.test(ligne)) {
          throw new Error(`${rel}:${index + 1} — minimum pixel trop petit : ${ligne.trim()}`);
        }
        if (ligne.includes('}') || ligne.trim() === '') contextePixel = false;
      });
    });

    expect(true).toBe(true);
  });
});
