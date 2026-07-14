import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-fonts', () => {
  it('délègue syncFontsRoot avec la racine du dépôt', async () => {
    const fonts = require('./fonts.cjs');
    const spy = vi.spyOn(fonts, 'syncFontsRoot').mockImplementation(() => {});
    const { syncFonts } = await import('./sync-fonts.mjs');
    syncFonts(rootDir);
    expect(spy).toHaveBeenCalledWith(rootDir);
    spy.mockRestore();
  });

  it('génère les polices locales via le point d’entrée CLI', () => {
    expect(() =>
      execSync('node build/sync-fonts.mjs', { cwd: rootDir, stdio: 'pipe' })
    ).not.toThrow();
    expect(fs.existsSync(path.join(rootDir, 'styles', 'fonts-local.css'))).toBe(true);
  });
});
