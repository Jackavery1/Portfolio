import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-pwa-icons', () => {
  it('délègue la génération des icônes PWA', async () => {
    const images = require('./images.cjs');
    const spy = vi.spyOn(images, 'generatePwaIcons').mockResolvedValue(undefined);
    const { syncPwaIcons } = require('./sync-pwa-icons.cjs');
    await syncPwaIcons(rootDir);
    expect(spy).toHaveBeenCalledWith(rootDir, rootDir);
    spy.mockRestore();
  });
});
