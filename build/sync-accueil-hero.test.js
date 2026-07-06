import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { FRAGMENTS } = require('./sync-accueil-hero.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('accueil-hero sync', () => {
  it('accueil-hero.html assemble tous les fragments', () => {
    const assembled = fs.readFileSync(path.join(rootDir, 'partials', 'accueil-hero.html'), 'utf8');
    FRAGMENTS.forEach((rel) => {
      const fragment = fs.readFileSync(path.join(rootDir, rel), 'utf8').trim();
      expect(assembled).toContain(fragment.slice(0, 40));
    });
    expect(assembled).toContain('class="accueil__grille"');
    expect(assembled).toContain('class="titre-arcade"');
    expect(assembled).toContain('class="svg-bonhomme"');
    expect(assembled).toContain('PRESS START');
  });
});
