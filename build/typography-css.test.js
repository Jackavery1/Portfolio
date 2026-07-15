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

  it('tokens clamp pixel — le maximum est cohérent avec --taille-pixel-min', () => {
    const tokens = fs.readFileSync(path.join(rootDir, 'styles/tokens.css'), 'utf8');
    const clampPixel = /--taille-(?:petit-pixel|bouton-pixel|titre-pixel):\s*clamp\([^)]+\)/g;
    const matches = tokens.match(clampPixel) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
    matches.forEach((decl) => {
      expect(decl).toContain('var(--taille-pixel-min)');
      expect(decl).not.toMatch(/,\s*0\.(?:[3-6]\d)rem\s*\)/);
    });
  });

  it('tokens.css expose une échelle typo centralisée', () => {
    const tokens = fs.readFileSync(path.join(rootDir, 'styles/tokens.css'), 'utf8');
    const attendus = [
      '--taille-petit-pixel',
      '--taille-bouton-pixel',
      '--taille-titre-pixel',
      '--taille-pixel-decoratif',
      '--taille-corps-lisible',
      '--taille-corps-crt',
    ];
    attendus.forEach((token) => {
      expect(tokens, token).toContain(token);
    });
  });

  it('clamp pixel — le maximum est ≥ --taille-pixel-min quand utilisé', () => {
    const stylesDir = path.join(rootDir, 'styles');
    const fichiers = listerCss(stylesDir);
    const clampMin =
      /font-size:\s*clamp\(\s*var\(--taille-pixel-min\)\s*,\s*[^,]+,\s*(0\.\d+rem)\s*\)/g;

    fichiers.forEach((absolu) => {
      const rel = path.relative(rootDir, absolu).replace(/\\/g, '/');
      const contenu = fs.readFileSync(absolu, 'utf8');
      let match;
      while ((match = clampMin.exec(contenu)) !== null) {
        const maxRem = parseFloat(match[1]);
        expect(maxRem, `${rel} — max ${match[1]} < min 0.75rem`).toBeGreaterThanOrEqual(0.75);
      }
    });
  });

  it('libellés décoratifs — minimum ≥ 12px (0,75rem)', () => {
    const tokens = fs.readFileSync(path.join(rootDir, 'styles/tokens.css'), 'utf8');
    expect(tokens).toMatch(/--taille-pixel-decoratif-min:\s*0\.75rem/);
    expect(tokens).toMatch(/--taille-pixel-decoratif:\s*clamp\(var\(--taille-pixel-min\)[^)]+\)/);
  });

  it('corps secondaires des cartes — lisible ou CRT, pas pixel', () => {
    const card = fs.readFileSync(path.join(rootDir, 'styles/components/card.css'), 'utf8');
    expect(card).toMatch(/\.carte-projet__desc[\s\S]*?font-family:\s*var\(--police-lisible\)/);
    expect(card).toMatch(/\.carte-projet__clic-hint[\s\S]*?font-family:\s*var\(--police-crt\)/);
    expect(card).toMatch(/\.barre-completion__val[\s\S]*?font-family:\s*var\(--police-crt\)/);
  });

  it('tokens focus — échelle outline centralisée, pas de px en dur dans les composants', () => {
    const tokens = fs.readFileSync(path.join(rootDir, 'styles/tokens.css'), 'utf8');
    expect(tokens).toContain('--outline-focus-largeur:');
    expect(tokens).toContain('--outline-focus-decalage-compact:');

    const composants = listerCss(path.join(rootDir, 'styles/components'))
      .concat(listerCss(path.join(rootDir, 'styles/pages')))
      .concat(listerCss(path.join(rootDir, 'styles/layout')));
    composants.forEach((absolu) => {
      const rel = path.relative(rootDir, absolu).replace(/\\/g, '/');
      const contenu = fs.readFileSync(absolu, 'utf8');
      expect(contenu, rel).not.toMatch(/outline-offset:\s*\d+px/);
    });
  });
});
