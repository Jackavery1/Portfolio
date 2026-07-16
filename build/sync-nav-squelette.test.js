import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(rootDir, 'build', 'sync-nav-squelette.cjs');
const { HTML_FILES, syncNavSquelette, deriverNavSquelette } = require('./sync-nav-squelette.cjs');

const tmpDirs = [];

function creerRacineTest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-nav-squelette-'));
  tmpDirs.push(tmp);
  return tmp;
}

afterEach(() => {
  tmpDirs.splice(0).forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

const NAV_MINIMALE = `<header class="nav" role="banner">
  <a href="index.html" class="nav__logo"><span class="pixel-accent">▶</span> J.MARTINEZ</a>
  <div class="nav__arcade-info" role="status" aria-live="polite" aria-atomic="true">
    <span class="arcade-label">SCORE</span>
    <span class="arcade-valeur" id="js-score">000000</span>
  </div>
  <button type="button" class="nav__burger" id="js-burger" aria-expanded="false" aria-controls="js-menu">
    <span class="nav__burger-trait"></span>
  </button>
  <nav class="nav__liens" id="js-menu" role="navigation" aria-label="Navigation principale">
    <a class="nav__bouton" href="index.html" lang="en">HOME</a>
  </nav>
  <p class="sr-only" id="js-annonce-navigation" aria-live="polite" aria-atomic="true"></p>
</header>
`;

describe('nav-squelette sync', () => {
  it('dérive le squelette depuis nav.html sans annonce SR', () => {
    const squelette = deriverNavSquelette(NAV_MINIMALE);
    expect(squelette).toContain('nav__liens--squelette');
    expect(squelette).toContain('id="js-score"');
    expect(squelette).toContain('aria-hidden="true"');
    expect(squelette).not.toContain('js-annonce-navigation');
    expect(squelette).not.toContain('<header');
  });

  it('injecte le score arcade et le burger dans chaque page HTML', () => {
    const partial = fs.readFileSync(path.join(rootDir, 'partials', 'nav-squelette.html'), 'utf8');
    HTML_FILES.forEach((file) => {
      const html = fs.readFileSync(path.join(rootDir, file), 'utf8');
      expect(html).toContain('id="js-score"');
      expect(html).toContain('id="js-burger"');
      expect(html).toContain('id="js-menu"');
      expect(html).toContain(partial.trim().slice(0, 40));
    });
  });

  it('syncNavSquelette génère le squelette puis remplace partial-nav', () => {
    const tmp = creerRacineTest();
    fs.mkdirSync(path.join(tmp, 'partials'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'partials', 'nav.html'), NAV_MINIMALE, 'utf8');

    const htmlInitial = `<!doctype html>
<html lang="fr">
  <body>
    <header id="partial-nav" class="nav">
      <span>ancien</span>
    </header>
  </body>
</html>`;
    fs.writeFileSync(path.join(tmp, 'index.html'), htmlInitial, 'utf8');

    syncNavSquelette(tmp);

    const squelette = fs.readFileSync(path.join(tmp, 'partials', 'nav-squelette.html'), 'utf8');
    expect(squelette).toContain('nav__liens--squelette');
    expect(squelette).not.toContain('js-annonce-navigation');

    const html = fs.readFileSync(path.join(tmp, 'index.html'), 'utf8');
    expect(html).toContain('id="js-score"');
    expect(html).not.toContain('<span>ancien</span>');
  });

  it('syncNavSquelette ignore les fichiers HTML absents', () => {
    const tmp = creerRacineTest();
    fs.mkdirSync(path.join(tmp, 'partials'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'partials', 'nav.html'), NAV_MINIMALE, 'utf8');
    expect(() => syncNavSquelette(tmp)).not.toThrow();
  });

  it('syncNavSquelette échoue si nav.html est absent', () => {
    const tmp = creerRacineTest();
    expect(() => syncNavSquelette(tmp)).toThrow(/nav\.html manquant/);
  });

  it('syncNavSquelette échoue si le header partial-nav est absent', () => {
    const tmp = creerRacineTest();
    fs.mkdirSync(path.join(tmp, 'partials'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'partials', 'nav.html'), NAV_MINIMALE, 'utf8');
    fs.writeFileSync(
      path.join(tmp, 'index.html'),
      '<!doctype html><html><body><header class="nav">sans id</header></body></html>',
      'utf8'
    );

    expect(() => syncNavSquelette(tmp)).toThrow(/squelette partial-nav introuvable/);
  });

  it('CLI exécute syncNavSquelette sans erreur sur le dépôt', () => {
    const resultat = spawnSync(process.execPath, [scriptPath], {
      cwd: rootDir,
      encoding: 'utf8',
    });
    expect(resultat.status).toBe(0);
  });
});
