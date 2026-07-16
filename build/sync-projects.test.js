import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(rootDir, 'build', 'sync-projects.cjs');

const projetValide = {
  titre: 'DEMO',
  desc: 'Desc',
  descCarte: 'Carte',
  num: 'PRJ-99',
  etoiles: 3,
  completion: 50,
  tech: ['JS'],
  apercu: 'assets/previews/demo.png',
  lien: 'https://example.com',
  ariaLabel: 'Demo',
};

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

  it('CLI exécute syncProjects sans erreur', () => {
    const resultat = spawnSync(process.execPath, [scriptPath], {
      cwd: rootDir,
      encoding: 'utf8',
    });
    expect(resultat.status).toBe(0);
  });

  it('rejette un projet sans champ requis', () => {
    const { validerProjectsJson } = require('./sync-projects.cjs');

    expect(() =>
      validerProjectsJson({
        order: ['demo'],
        projets: {
          demo: { ...projetValide, ariaLabel: '' },
        },
      })
    ).toThrow(/ariaLabel manquant/);
  });

  it('rejette un order vide ou projets manquant', () => {
    const { validerProjectsJson } = require('./sync-projects.cjs');

    expect(() => validerProjectsJson({ order: [], projets: {} })).toThrow(/order doit être/);
    expect(() => validerProjectsJson({ order: ['demo'] })).toThrow(/projets manquant/);
  });

  it('rejette un projet absent de la map projets', () => {
    const { validerProjectsJson } = require('./sync-projects.cjs');

    expect(() =>
      validerProjectsJson({
        order: ['absent'],
        projets: { demo: projetValide },
      })
    ).toThrow(/absent de projets/);
  });

  it('rejette order et clés projets incohérents', () => {
    const { validerProjectsJson } = require('./sync-projects.cjs');

    expect(() =>
      validerProjectsJson({
        order: ['demo'],
        projets: { demo: projetValide, autre: { ...projetValide, num: 'PRJ-98' } },
      })
    ).toThrow(/incohérents/);
  });

  it('rejette un numéro de projet invalide', () => {
    const { validerProjet } = require('./sync-projects.cjs');

    expect(() => validerProjet('demo', { ...projetValide, num: 'INVALID' })).toThrow(
      /num invalide/
    );
  });

  it('rejette etoiles, completion, tech, apercu et lien invalides', () => {
    const { validerProjet } = require('./sync-projects.cjs');

    expect(() => validerProjet('demo', { ...projetValide, etoiles: 0 })).toThrow(/etoiles/);
    expect(() => validerProjet('demo', { ...projetValide, completion: 101 })).toThrow(/completion/);
    expect(() => validerProjet('demo', { ...projetValide, tech: [] })).toThrow(/tech/);
    expect(() => validerProjet('demo', { ...projetValide, apercu: 'img/demo.png' })).toThrow(
      /apercu/
    );
    expect(() => validerProjet('demo', { ...projetValide, lien: 'http://insecure.com' })).toThrow(
      /lien/
    );
  });
});
