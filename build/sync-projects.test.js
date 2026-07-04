import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-projects', () => {
  it('génère projects-data.js depuis projects.json', () => {
    const { syncProjects } = require('./sync-projects.cjs');
    syncProjects();

    const target = path.join(rootDir, 'js', 'config', 'projects-data.js');
    expect(fs.existsSync(target)).toBe(true);

    const contenu = fs.readFileSync(target, 'utf8');
    expect(contenu).toContain('export const PROJETS_ORDER');
    expect(contenu).toContain('export const PROJETS');
    expect(contenu).toContain('PROJET LSF');
    expect(contenu).toContain('derniereligne');
  });

  it('rejette un projet sans champ requis', () => {
    const { validerProjectsJson } = require('./sync-projects.cjs');

    expect(() =>
      validerProjectsJson({
        order: ['demo'],
        projets: {
          demo: {
            titre: 'DEMO',
            desc: 'Desc',
            descCarte: 'Carte',
            num: 'PRJ-99',
            etoiles: 3,
            completion: 50,
            tech: ['JS'],
            apercu: 'assets/previews/demo.png',
            lien: 'https://example.com',
          },
        },
      })
    ).toThrow(/ariaLabel manquant/);
  });

  it('rejette un numéro de projet invalide', () => {
    const { validerProjet } = require('./sync-projects.cjs');

    expect(() =>
      validerProjet('demo', {
        titre: 'DEMO',
        desc: 'Desc',
        descCarte: 'Carte',
        num: 'INVALID',
        etoiles: 3,
        completion: 50,
        tech: ['JS'],
        apercu: 'assets/previews/demo.png',
        lien: 'https://example.com',
        ariaLabel: 'Demo',
      })
    ).toThrow(/num invalide/);
  });
});
