import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { syncAccueilHero } = require('./sync-accueil-hero.cjs');
const { syncCompetencesStats } = require('./sync-competences-stats.cjs');
const { syncDojoBoss } = require('./sync-dojo-boss.cjs');
const { syncParcoursArbre } = require('./sync-parcours-arbre.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const WRAPPERS_OUVRANTS = [
  {
    id: 'accueil-hero',
    assembled: 'partials/accueil-hero.html',
    head: 'partials/accueil/_head.html',
    foot: 'partials/accueil/_foot.html',
    wrapperClass: 'accueil__grille',
    innerMarkers: ['class="accueil__texte"', 'class="accueil__illustration"'],
  },
  {
    id: 'competences-stats',
    assembled: 'partials/competences-stats.html',
    head: 'partials/competences/_head.html',
    foot: 'partials/competences/_foot.html',
    wrapperClass: 'stats-grille',
    innerMarkers: ['class="scores-tableau"', 'class="stats-lateral"'],
  },
  {
    id: 'dojo-boss-rush',
    assembled: 'partials/dojo-boss-rush.html',
    head: 'partials/dojo-boss/_head.html',
    foot: 'partials/dojo-boss/_foot.html',
    wrapperClass: 'boss-rush',
    innerMarkers: ['data-boss="domslayer"', 'data-boss="react"'],
  },
];

const HEADS_OUVRANTS = [
  'partials/accueil/_head.html',
  'partials/competences/_head.html',
  'partials/dojo-boss/_head.html',
];

function lire(rel) {
  return fs.readFileSync(path.join(rootDir, rel), 'utf8');
}

function listerFragmentsHead() {
  const partialsDir = path.join(rootDir, 'partials');
  const fichiers = [];

  for (const entree of fs.readdirSync(partialsDir, { withFileTypes: true })) {
    if (!entree.isDirectory()) continue;
    const headPath = path.join(partialsDir, entree.name, '_head.html');
    if (fs.existsSync(headPath)) {
      fichiers.push(path.relative(rootDir, headPath).replace(/\\/g, '/'));
    }
  }

  return fichiers;
}

describe('sync partials — wrappers _head / _foot', () => {
  beforeAll(() => {
    syncAccueilHero(rootDir);
    syncCompetencesStats(rootDir);
    syncDojoBoss(rootDir);
    syncParcoursArbre(rootDir);
  });

  it('chaque _head.html évite les conteneurs vides auto-fermés', () => {
    listerFragmentsHead().forEach((rel) => {
      const contenu = lire(rel).trim();
      expect(contenu, rel).not.toMatch(/^<div[^>]*><\/div>$/);
    });
  });

  it('wrappers ouvrants — _head.html = une seule balise ouvrante', () => {
    HEADS_OUVRANTS.forEach((rel) => {
      const contenu = lire(rel).trim();
      expect(contenu, rel).toMatch(/^<div[^>]+>$/);
    });
  });

  WRAPPERS_OUVRANTS.forEach((cfg) => {
    it(`${cfg.id} — le wrapper enveloppe le contenu assemblé`, () => {
      const assembled = lire(cfg.assembled);
      const head = lire(cfg.head).trim();
      const foot = lire(cfg.foot).trim();

      expect(assembled).toContain(head);
      expect(assembled).toContain(foot);
      expect(assembled).not.toMatch(new RegExp(`<div class="${cfg.wrapperClass}"><\\/div>`));

      const motif = new RegExp(
        `<div class="${cfg.wrapperClass}"[^>]*>[\\s\\S]*${cfg.innerMarkers[0]}[\\s\\S]*${cfg.innerMarkers[1]}[\\s\\S]*<\\/div>`
      );
      expect(assembled).toMatch(motif);
    });
  });

  it('parcours-arbre.html — fragment _head intact (structure SVG fermée)', () => {
    const assembled = lire('partials/parcours-arbre.html');
    const head = lire('partials/parcours-arbre/_head.html').trim();

    expect(assembled.startsWith(head)).toBe(true);
    expect(assembled).toContain('SCIENCES VÉGÉTALES');
    expect(assembled).toContain('class="svg-arbre"');
  });
});
