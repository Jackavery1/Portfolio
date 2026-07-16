import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(rootDir, 'build', 'sync-page-meta.cjs');
const {
  verifierPageMeta,
  fichiersPageMetaDerives,
  syncPageMeta,
  resoudreRacine,
  runCli,
} = require('./sync-page-meta.cjs');
const { PAGE_META } = require('./page-meta.mjs');
const { remplacerBlocPageMeta } = require('./page-meta-tags.mjs');

const tmpDirs = [];

function creerRacineTest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-page-meta-'));
  tmpDirs.push(tmp);
  return tmp;
}

function lancerCli(argv, cwd = rootDir) {
  return spawnSync(process.execPath, [scriptPath, ...argv], {
    cwd,
    encoding: 'utf8',
  });
}

afterEach(() => {
  tmpDirs.splice(0).forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('sync-page-meta', () => {
  it('les HTML sources reflètent build/page-meta.mjs', () => {
    expect(verifierPageMeta(rootDir)).toEqual([]);
  });

  it('fichiersPageMetaDerives signale un HTML désynchronisé', () => {
    const tmp = creerRacineTest();
    const desynchronise = `<!doctype html>
<html lang="fr">
  <head>
    <!-- PAGE_META_START -->
    <meta name="description" content="ancienne valeur" />
    <!-- PAGE_META_END -->
    <title>Test</title>
  </head>
  <body></body>
</html>`;

    fs.writeFileSync(path.join(tmp, 'index.html'), desynchronise, 'utf8');

    expect(fichiersPageMetaDerives(tmp)).toEqual(['index.html']);
    expect(verifierPageMeta(tmp)).toEqual(['index.html']);
  });

  it('fichiersPageMetaDerives vide quand le HTML est déjà synchronisé', () => {
    const tmp = creerRacineTest();
    const meta = PAGE_META['index.html'];
    const source = `<!doctype html>
<html lang="fr">
  <head>
    <!-- PAGE_META_START -->
    <meta name="description" content="stale" />
    <!-- PAGE_META_END -->
    <title>Test</title>
  </head>
  <body></body>
</html>`;
    const synchronise = remplacerBlocPageMeta(source, meta);

    fs.writeFileSync(path.join(tmp, 'index.html'), synchronise, 'utf8');

    expect(fichiersPageMetaDerives(tmp)).toEqual([]);
  });

  it('syncPageMeta réécrit le bloc PAGE_META', () => {
    const tmp = creerRacineTest();
    const meta = PAGE_META['projets.html'];
    const source = `<!doctype html>
<html lang="fr">
  <head>
    <!-- PAGE_META_START -->
    <meta name="description" content="stale" />
    <!-- PAGE_META_END -->
    <title>Projets</title>
  </head>
  <body></body>
</html>`;
    const fichier = path.join(tmp, 'projets.html');

    fs.writeFileSync(fichier, source, 'utf8');
    syncPageMeta(tmp);

    const resultat = fs.readFileSync(fichier, 'utf8');
    expect(resultat).toContain(meta.ogTitle);
    expect(resultat).not.toContain('content="stale"');
    expect(verifierPageMeta(tmp)).toEqual([]);
  });

  it('ignore les fichiers HTML absents ou sans entrée PAGE_META', () => {
    const tmp = creerRacineTest();
    expect(fichiersPageMetaDerives(tmp)).toEqual([]);
    fs.writeFileSync(
      path.join(tmp, 'orphelin.html'),
      '<html><head></head><body></body></html>',
      'utf8'
    );
    expect(fichiersPageMetaDerives(tmp)).toEqual([]);
  });

  it('CLI --check sort 0 sans fichier dérivé', () => {
    const tmp = creerRacineTest();
    const resultat = lancerCli(['--check', '--root', tmp]);
    expect(resultat.status).toBe(0);
  });

  it('resoudreRacine — défaut et option --root', () => {
    const tmp = creerRacineTest();
    expect(resoudreRacine(['node', scriptPath])).toBe(rootDir);
    expect(resoudreRacine(['node', scriptPath, '--root', tmp])).toBe(tmp);
    expect(resoudreRacine(['node', scriptPath, '--root'])).toBe(rootDir);
  });

  it('runCli synchronise sans --check', () => {
    const tmp = creerRacineTest();
    const meta = PAGE_META['projets.html'];
    const source = `<!doctype html>
<html lang="fr">
  <head>
    <!-- PAGE_META_START -->
    <meta name="description" content="stale" />
    <!-- PAGE_META_END -->
    <title>Projets</title>
  </head>
  <body></body>
</html>`;
    const fichier = path.join(tmp, 'projets.html');
    fs.writeFileSync(fichier, source, 'utf8');

    runCli(['node', scriptPath, '--root', tmp]);

    expect(fs.readFileSync(fichier, 'utf8')).toContain(meta.ogTitle);
  });

  it('runCli --check appelle exit 1 quand PAGE_META est désynchronisé', () => {
    const tmp = creerRacineTest();
    const desynchronise = `<!doctype html>
<html lang="fr">
  <head>
    <!-- PAGE_META_START -->
    <meta name="description" content="ancienne valeur" />
    <!-- PAGE_META_END -->
    <title>Test</title>
  </head>
  <body></body>
</html>`;
    fs.writeFileSync(path.join(tmp, 'index.html'), desynchronise, 'utf8');

    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    runCli(['node', scriptPath, '--check', '--root', tmp]);

    expect(error).toHaveBeenCalled();
    expect(exit).toHaveBeenCalledWith(1);
    exit.mockRestore();
    error.mockRestore();
  });

  it('CLI --check sort 0 quand les sources sont synchronisées', () => {
    const resultat = lancerCli(['--check']);
    expect(resultat.status).toBe(0);
    expect(resultat.stderr).toBe('');
  });

  it('CLI --check sort 1 quand PAGE_META est désynchronisé', () => {
    const tmp = creerRacineTest();
    const desynchronise = `<!doctype html>
<html lang="fr">
  <head>
    <!-- PAGE_META_START -->
    <meta name="description" content="ancienne valeur" />
    <!-- PAGE_META_END -->
    <title>Test</title>
  </head>
  <body></body>
</html>`;

    fs.writeFileSync(path.join(tmp, 'index.html'), desynchronise, 'utf8');

    const resultat = lancerCli(['--check', '--root', tmp]);
    expect(resultat.status).toBe(1);
    expect(resultat.stderr).toContain('index.html');
  });

  it('CLI sans --check synchronise les fichiers dérivés', () => {
    const tmp = creerRacineTest();
    const meta = PAGE_META['contact.html'];
    const source = `<!doctype html>
<html lang="fr">
  <head>
    <!-- PAGE_META_START -->
    <meta name="description" content="stale" />
    <!-- PAGE_META_END -->
    <title>Contact</title>
  </head>
  <body></body>
</html>`;
    const fichier = path.join(tmp, 'contact.html');

    fs.writeFileSync(fichier, source, 'utf8');

    const resultat = lancerCli(['--root', tmp]);
    expect(resultat.status).toBe(0);
    expect(fs.readFileSync(fichier, 'utf8')).toContain(meta.ogTitle);
  });
});
