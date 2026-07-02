import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { FRAGMENTS } = require('./sync-dojo-boss.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('dojo-boss sync', () => {
  it('dojo-boss-rush.html assemble tous les fragments', () => {
    const assembled = fs.readFileSync(
      path.join(rootDir, 'partials', 'dojo-boss-rush.html'),
      'utf8',
    );
    FRAGMENTS.forEach((rel) => {
      const fragment = fs.readFileSync(path.join(rootDir, rel), 'utf8').trim();
      expect(assembled).toContain(fragment.slice(0, 40));
    });
    expect(assembled).toContain('class="boss-rush"');
    expect(assembled).toContain('data-boss="domslayer"');
    expect(assembled).toContain('data-boss="react"');
    expect(assembled).toContain('DOM-SLAYER');
  });
});
