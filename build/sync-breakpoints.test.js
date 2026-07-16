import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import {
  genererVariablesBp,
  syncBreakpoints,
  syncMediaBreakpoints,
  syncMediaDansCss,
  verifierSeuilsMedia,
} from './sync-breakpoints.cjs';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-breakpoints', () => {
  it('génère toutes les variables CSS depuis breakpoints.mjs', () => {
    const BP = require('./breakpoints.mjs');
    const bloc = genererVariablesBp();
    expect(bloc).toContain(`--bp-mobile-etroit: ${BP.MOBILE_ETROIT_MAX}px`);
    expect(bloc).toContain('BREAKPOINTS_SYNC_START');
  });

  it('met à jour tokens.css', () => {
    syncBreakpoints(rootDir);
    const tokens = fs.readFileSync(path.join(rootDir, 'styles', 'tokens.css'), 'utf8');
    expect(tokens).toContain('--bp-mobile-etroit: 320px');
  });

  it('tous les @media utilisent des seuils déclarés dans breakpoints.mjs', () => {
    syncBreakpoints(rootDir);
    const invalides = verifierSeuilsMedia(rootDir);
    expect(invalides).toEqual([]);
  });

  it('syncMediaDansCss remplace les seuils littéraux', () => {
    const css = '@media (min-width: 961px) { .x { color: red; } }';
    expect(syncMediaDansCss(css)).toContain('min-width: 961px');
  });

  it('syncMediaBreakpoints ignore un dossier styles absent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-sans-styles-'));
    expect(syncMediaBreakpoints(tmp)).toEqual([]);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
