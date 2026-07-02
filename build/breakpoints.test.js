import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const BP = require('./breakpoints.cjs');
const root = path.join(import.meta.dirname, '..');

describe('breakpoints', () => {
  it('tokens.css déclare les mêmes seuils', () => {
    const tokens = fs.readFileSync(path.join(root, 'styles', 'tokens.css'), 'utf8');
    expect(tokens).toContain(`--bp-tablette-min: ${BP.TABLETTE_MIN}px`);
    expect(tokens).toContain(`--bp-mobile-max: ${BP.MOBILE_MAX}px`);
    expect(tokens).toContain(`--bp-desktop: ${BP.DESKTOP}px`);
  });

  it('styles utilisent les seuils principaux', () => {
    const stylesRoot = path.join(root, 'styles');
    const fichiers = [];
    const parcourir = (dir) => {
      for (const entree of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, entree.name);
        if (entree.isDirectory()) parcourir(abs);
        else if (entree.name.endsWith('.css')) fichiers.push(abs);
      }
    };
    parcourir(stylesRoot);
    const css = fichiers.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    expect(css).toContain(`${BP.MOBILE_MAX}px`);
    expect(css).toContain(`${BP.DESKTOP}px`);
    expect(css).toContain(`${BP.TABLETTE_MIN}px`);
    expect(css).toContain(`${BP.MOBILE_COMPACT_MAX}px`);
    expect(css).toContain(`${BP.PROJETS_2COL_MIN}px`);
    expect(css).toContain(`${BP.ACCUEIL_LANDSCAPE_MAX_HEIGHT}px`);
    expect(css).toContain(`${BP.ACCUEIL_SHORT_MAX_HEIGHT}px`);
  });
});
