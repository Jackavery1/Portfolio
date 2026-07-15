import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { FRAGMENTS, syncAccueilHero } = require('./sync-accueil-hero.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('accueil-hero sync', () => {
  /** @type {string[]} */
  let tmpDirs = [];

  afterEach(() => {
    tmpDirs.forEach((dir) => {
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    });
    tmpDirs = [];
  });

  function creerTmp(prefix) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    tmpDirs.push(dir);
    return dir;
  }

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

  it('accueil-hero.html — la grille enveloppe texte et illustration', () => {
    const assembled = fs.readFileSync(path.join(rootDir, 'partials', 'accueil-hero.html'), 'utf8');
    expect(assembled).toMatch(
      /<div class="accueil__grille">[\s\S]*class="accueil__texte"[\s\S]*class="accueil__illustration"[\s\S]*<\/div>\s*<!-- fin \.accueil__grille -->/
    );
    expect(assembled).not.toMatch(/<div class="accueil__grille"><\/div>/);
  });

  it('syncAccueilHero assemble les fragments dans un répertoire temporaire', () => {
    const base = creerTmp('portfolio-accueil-hero-');
    FRAGMENTS.forEach((rel) => {
      const cible = path.join(base, rel);
      fs.mkdirSync(path.dirname(cible), { recursive: true });
      fs.writeFileSync(cible, `<!-- ${rel} -->\n`, 'utf8');
    });

    syncAccueilHero(base);

    const assembled = fs.readFileSync(path.join(base, 'partials', 'accueil-hero.html'), 'utf8');
    FRAGMENTS.forEach((rel) => {
      expect(assembled).toContain(`<!-- ${rel} -->`);
    });
  });

  it('syncAccueilHero échoue si un fragment est absent', () => {
    const base = creerTmp('portfolio-accueil-hero-missing-');
    expect(() => syncAccueilHero(base)).toThrow(/Fragment manquant/);
  });
});
