import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { ensureSyncSource } from './ensure-sync.cjs';

const require = createRequire(import.meta.url);
const { PARTIALS } = require('./partials-list.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('partials sync', () => {
  beforeAll(() => {
    ensureSyncSource();
  });

  it('partials.js reflète build/partials-list.cjs', () => {
    const partialsJs = fs.readFileSync(path.join(rootDir, 'js', 'config', 'partials.js'), 'utf8');
    PARTIALS.forEach(({ id, fichier }) => {
      expect(partialsJs).toContain(`id: '${id}'`);
      expect(partialsJs).toContain(`fichier: '${fichier}'`);
    });
    expect(partialsJs).toContain('Généré par build/sync-partials.cjs');
  });
});
