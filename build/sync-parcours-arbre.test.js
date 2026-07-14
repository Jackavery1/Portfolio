import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { syncParcoursArbre, FRAGMENTS } = require('./sync-parcours-arbre.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(rootDir, 'build', 'sync-parcours-arbre.cjs');

describe('parcours-arbre sync', () => {
  it('syncParcoursArbre assemble tous les fragments', () => {
    syncParcoursArbre(rootDir);

    const assembled = fs.readFileSync(
      path.join(rootDir, 'partials', 'parcours-arbre.html'),
      'utf8'
    );
    FRAGMENTS.forEach((rel) => {
      const fragment = fs.readFileSync(path.join(rootDir, rel), 'utf8').trim();
      expect(assembled).toContain(fragment.slice(0, 40));
    });
    expect(assembled).toContain('class="svg-arbre"');
  });

  it('rejette un fragment manquant', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'parcours-arbre-'));
    try {
      expect(() => syncParcoursArbre(tmp)).toThrow(/Fragment manquant/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('CLI exécute syncParcoursArbre sans erreur', () => {
    const resultat = spawnSync(process.execPath, [scriptPath], {
      cwd: rootDir,
      encoding: 'utf8',
    });
    expect(resultat.status).toBe(0);
  });
});
