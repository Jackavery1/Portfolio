import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(rootDir, 'build', 'sync-pwa-icons.cjs');

describe('sync-pwa-icons', () => {
  it('délègue la génération des icônes PWA', async () => {
    const images = require('./images.cjs');
    const spy = vi.spyOn(images, 'genererIconesPwa').mockResolvedValue(undefined);
    const { syncPwaIcons } = require('./sync-pwa-icons.cjs');
    await syncPwaIcons(rootDir);
    expect(spy).toHaveBeenCalledWith(rootDir, rootDir);
    spy.mockRestore();
  });

  it('runCli propage les erreurs genererIconesPwa', async () => {
    vi.resetModules();
    const images = require('./images.cjs');
    const spy = vi
      .spyOn(images, 'genererIconesPwa')
      .mockRejectedValue(new Error('sharp indisponible'));
    const { runCli } = require('./sync-pwa-icons.cjs');
    await expect(runCli(rootDir)).rejects.toThrow('sharp indisponible');
    spy.mockRestore();
  });

  it('CLI exécute syncPwaIcons sans erreur sur le dépôt', () => {
    const resultat = spawnSync(process.execPath, [scriptPath], {
      cwd: rootDir,
      encoding: 'utf8',
    });
    expect(resultat.status).toBe(0);
  });

  it('runCli réussit sur le dépôt', async () => {
    const { runCli } = require('./sync-pwa-icons.cjs');
    await expect(runCli(rootDir)).resolves.toBeUndefined();
  });

  it('runCli propage erreur vers exit 1 (logique CLI)', async () => {
    vi.resetModules();
    const images = require('./images.cjs');
    vi.spyOn(images, 'genererIconesPwa').mockRejectedValue(new Error('sharp indisponible'));
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { executerSyncPwaIconsCli } = require('./sync-pwa-icons.cjs');

    await executerSyncPwaIconsCli(rootDir);

    expect(error).toHaveBeenCalled();
    expect(exit).toHaveBeenCalledWith(1);
    exit.mockRestore();
    error.mockRestore();
  });

  it('executerSyncPwaIconsCli réussit sans exit', async () => {
    vi.resetModules();
    const images = require('./images.cjs');
    vi.spyOn(images, 'genererIconesPwa').mockResolvedValue(undefined);
    const exit = vi.fn();
    const { executerSyncPwaIconsCli } = require('./sync-pwa-icons.cjs');

    await expect(executerSyncPwaIconsCli(rootDir, { exit })).resolves.toBeUndefined();
    expect(exit).not.toHaveBeenCalled();
  });

  it('syncPwaIcons utilise la racine par défaut', async () => {
    vi.resetModules();
    const images = require('./images.cjs');
    const spy = vi.spyOn(images, 'genererIconesPwa').mockResolvedValue(undefined);
    const { syncPwaIcons } = require('./sync-pwa-icons.cjs');

    await syncPwaIcons();

    expect(spy).toHaveBeenCalledWith(rootDir, rootDir);
    spy.mockRestore();
  });
});
