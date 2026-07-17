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

  it('syncMediaBreakpoints écrit les CSS dont les media changent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-media-write-'));
    const styles = path.join(tmp, 'styles');
    fs.mkdirSync(styles, { recursive: true });
    const cible = path.join(styles, 'demo.css');
    // Sans espace après « : » → le remplacement normalise et déclenche l’écriture.
    fs.writeFileSync(cible, '@media (min-width:961px) { .x { color: red; } }\n', 'utf8');
    const modifies = syncMediaBreakpoints(tmp);
    expect(modifies.map((f) => f.replace(/\\/g, '/'))).toEqual(['styles/demo.css']);
    expect(fs.readFileSync(cible, 'utf8')).toContain(
      `min-width: ${require('./breakpoints.mjs').DESKTOP}px`
    );
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('verifierSeuilsMedia signale un seuil hors breakpoints.mjs', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-seuil-'));
    const styles = path.join(tmp, 'styles');
    fs.mkdirSync(styles, { recursive: true });
    fs.writeFileSync(
      path.join(styles, 'invalide.css'),
      '@media (max-width: 999px) { .x { color: red; } }\n',
      'utf8'
    );
    const invalides = verifierSeuilsMedia(tmp);
    expect(invalides).toHaveLength(1);
    expect(invalides[0].seuil).toBe(999);
    expect(invalides[0].fichier.replace(/\\/g, '/')).toBe('styles/invalide.css');
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('syncBreakpoints injecte le bloc si les marqueurs sont absents', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-sans-marqueurs-'));
    const styles = path.join(tmp, 'styles');
    fs.mkdirSync(styles, { recursive: true });
    fs.writeFileSync(
      path.join(styles, 'tokens.css'),
      `:root {\n  /** Seuils principaux — placeholder */\n  --bp-accueil-short-h: 780px;\n}\n`,
      'utf8'
    );
    syncBreakpoints(tmp);
    const tokens = fs.readFileSync(path.join(styles, 'tokens.css'), 'utf8');
    expect(tokens).toContain('BREAKPOINTS_SYNC_START');
    expect(tokens).toContain('--bp-mobile-etroit:');
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
