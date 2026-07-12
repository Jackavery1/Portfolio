import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const BP = require('./breakpoints.mjs');
const root = path.join(import.meta.dirname, '..');

describe('breakpoints', () => {
  it('tokens.css déclare les mêmes seuils', () => {
    const tokens = fs.readFileSync(path.join(root, 'styles', 'tokens.css'), 'utf8');
    expect(tokens).toContain(`--bp-tablette-min: ${BP.TABLETTE_MIN}px`);
    expect(tokens).toContain(`--bp-mobile-max: ${BP.MOBILE_MAX}px`);
    expect(tokens).toContain(`--bp-desktop: ${BP.DESKTOP}px`);
    expect(tokens).toContain(`--bp-mobile-compact: ${BP.MOBILE_COMPACT_MAX}px`);
    expect(tokens).toContain(`--bp-mobile-etroit: ${BP.MOBILE_ETROIT_MAX}px`);
    expect(tokens).toContain(`--bp-projets-2col: ${BP.PROJETS_2COL_MIN}px`);
    expect(tokens).toContain(`--bp-accueil-landscape-h: ${BP.ACCUEIL_LANDSCAPE_MAX_HEIGHT}px`);
    expect(tokens).toContain(`--bp-accueil-short-h: ${BP.ACCUEIL_SHORT_MAX_HEIGHT}px`);
    expect(tokens).toContain('BREAKPOINTS_SYNC_START');
    expect(tokens).toContain('--espacement-md: 1rem');
    expect(tokens).toContain('--section-padding-y: 1.75rem');
    expect(tokens).toContain('--couleur-accent-texte:');
    expect(tokens).toContain('--taille-pixel-petit-max:');
    expect(tokens).toContain(`@media (max-width: ${BP.MOBILE_MAX}px)`);
  });

  it('styles @media alignés sur breakpoints.mjs', () => {
    const { verifierSeuilsMedia } = require('./sync-breakpoints.cjs');
    const invalides = verifierSeuilsMedia(root);
    expect(invalides).toEqual([]);
  });
});
