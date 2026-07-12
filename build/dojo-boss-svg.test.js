import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const bossDir = path.join(rootDir, 'partials', 'dojo-boss');
const partialsDir = path.join(rootDir, 'partials');
const tokensPath = path.join(rootDir, 'styles', 'tokens.css');

const FICHIERS_BOSS = () =>
  fs
    .readdirSync(bossDir)
    .filter((nom) => nom.endsWith('.html') && !nom.startsWith('_'))
    .map((nom) => path.join(bossDir, nom));

const FICHIERS_BOSS_LOTS = () =>
  fs
    .readdirSync(partialsDir)
    .filter((nom) => /^dojo-boss-rush-lot-[abc]\.html$/.test(nom))
    .map((nom) => path.join(partialsDir, nom));

const TOUS_FICHIERS_SPRITES = () => [...FICHIERS_BOSS(), ...FICHIERS_BOSS_LOTS()];

function lireContenuBoss() {
  return TOUS_FICHIERS_SPRITES()
    .map((fichier) => fs.readFileSync(fichier, 'utf8'))
    .join('\n');
}

function extraireTokensBossReferences(contenu) {
  const tokens = new Set();
  const regex = /var\(--(couleur-boss-[a-z0-9-]+)\)/g;
  let match = regex.exec(contenu);
  while (match) {
    tokens.add(`--${match[1]}`);
    match = regex.exec(contenu);
  }
  return [...tokens].sort();
}

function extraireTokensBossDeclares() {
  const contenu = fs.readFileSync(tokensPath, 'utf8');
  const tokens = new Set();
  const regex = /--(couleur-boss-[a-z0-9-]+):\s*#[0-9a-fA-F]{6}/g;
  let match = regex.exec(contenu);
  while (match) {
    tokens.add(`--${match[1]}`);
    match = regex.exec(contenu);
  }
  return [...tokens].sort();
}

describe('dojo-boss SVG', () => {
  it('n’utilise pas de couleurs hex en dur dans les sprites', () => {
    const hexTrouves = [];

    TOUS_FICHIERS_SPRITES().forEach((fichier) => {
      const contenu = fs.readFileSync(fichier, 'utf8');
      const nom = path.relative(rootDir, fichier).replace(/\\/g, '/');
      const matches = contenu.match(/#[0-9a-fA-F]{3,8}\b/g);
      if (matches) {
        hexTrouves.push({ nom, matches: [...new Set(matches)] });
      }
    });

    expect(hexTrouves).toEqual([]);
  });

  it('référence les tokens CSS pour les remplissages SVG', () => {
    const contenu = lireContenuBoss();

    expect(contenu).toMatch(/fill="var\(--couleur-/);
    expect(contenu).toMatch(/stroke="var\(--couleur-/);
  });

  it('déclare dans tokens.css chaque token boss référencé par les sprites', () => {
    const references = extraireTokensBossReferences(lireContenuBoss());
    const declares = extraireTokensBossDeclares();

    expect(references.length).toBeGreaterThan(0);
    references.forEach((token) => {
      expect(declares, `token manquant : ${token}`).toContain(token);
    });
  });

  it('n’oriente pas de token boss orphelin (déclaré mais jamais référencé)', () => {
    const references = new Set(extraireTokensBossReferences(lireContenuBoss()));
    const orphelins = extraireTokensBossDeclares().filter((token) => !references.has(token));

    expect(orphelins).toEqual([]);
  });
});
