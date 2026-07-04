import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { FRAGMENTS } = require('./sync-competences-stats.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('competences-stats sync', () => {
  it('competences-stats.html assemble tous les fragments', () => {
    const assembled = fs.readFileSync(
      path.join(rootDir, 'partials', 'competences-stats.html'),
      'utf8'
    );
    FRAGMENTS.forEach((rel) => {
      const fragment = fs.readFileSync(path.join(rootDir, rel), 'utf8').trim();
      expect(assembled).toContain(fragment.slice(0, 40));
    });
    expect(assembled).toContain('class="stats-grille"');
    expect(assembled).toContain('class="scores-tableau"');
    expect(assembled).toContain('class="stats-lateral"');
    expect(assembled).toContain('HTML / CSS');
  });
});
