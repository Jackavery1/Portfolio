import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadBuild } from './cjs-bridge.mjs';

describe('cjs-bridge', () => {
  it('charge un module CJS du dossier build/', () => {
    const { IDS_PHASES_SYNC } = loadBuild('sync-source.cjs');
    expect(IDS_PHASES_SYNC.length).toBeGreaterThan(10);
  });

  it('expose la racine du dépôt', async () => {
    const { repoRoot } = await import('./cjs-bridge.mjs');
    expect(fs.existsSync(path.join(repoRoot, 'package.json'))).toBe(true);
  });
});
