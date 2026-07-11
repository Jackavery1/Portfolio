import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONFIG_DEFAULTS, applyBuildEnvToJs, loadEnvFile, resolveBuildEnv } from './env.cjs';

describe('resolveBuildEnv', () => {
  it('utilise les valeurs par défaut', () => {
    expect(resolveBuildEnv({})).toEqual({
      siteOrigin: CONFIG_DEFAULTS.siteOrigin,
      formspree: CONFIG_DEFAULTS.formspree,
      recaptcha: CONFIG_DEFAULTS.recaptcha,
    });
  });

  it('surcharge via variables PORTFOLIO_*', () => {
    expect(
      resolveBuildEnv({
        PORTFOLIO_SITE_URL: 'https://preview.example.com',
        PORTFOLIO_FORMSPREE_ENDPOINT: 'https://formspree.io/f/test',
        PORTFOLIO_RECAPTCHA_SITE_KEY: 'test-key',
      })
    ).toEqual({
      siteOrigin: 'https://preview.example.com',
      formspree: 'https://formspree.io/f/test',
      recaptcha: 'test-key',
    });
  });

  it('retire le slash final de SITE_URL', () => {
    expect(resolveBuildEnv({ PORTFOLIO_SITE_URL: 'https://preview.example.com/' }).siteOrigin).toBe(
      'https://preview.example.com'
    );
  });
});

describe('applyBuildEnvToJs', () => {
  it('remplace les constantes dans le source JS', () => {
    const src = `const u = "${CONFIG_DEFAULTS.siteOrigin}";`;
    const env = resolveBuildEnv({
      PORTFOLIO_SITE_URL: 'https://staging.example.com',
    });
    expect(applyBuildEnvToJs(src, env)).toBe('const u = "https://staging.example.com";');
  });

  it('laisse le source inchangé si les valeurs correspondent aux défauts', () => {
    const src = `const u = "${CONFIG_DEFAULTS.siteOrigin}";`;
    expect(applyBuildEnvToJs(src, resolveBuildEnv({}))).toBe(src);
  });
});

describe('loadEnvFile', () => {
  it('ignore un fichier .env.local absent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-env-'));
    const cle = `TEST_ABSENT_${Date.now()}`;
    delete process.env[cle];
    try {
      loadEnvFile(tmp);
      expect(process.env[cle]).toBeUndefined();
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('charge les paires clé=valeur sans écraser process.env existant', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-env-'));
    const cle = `TEST_ENV_${Date.now()}`;
    const cleExistante = `TEST_EXISTANT_${Date.now()}`;
    process.env[cleExistante] = 'deja-la';
    try {
      fs.writeFileSync(
        path.join(tmp, '.env.local'),
        [
          '# commentaire',
          '',
          `${cle}=valeur-fichier`,
          `${cleExistante}=fichier`,
          'INVALIDE_SANS_EGAL',
          'QUOTED="entre guillemets"',
        ].join('\n'),
        'utf8'
      );
      loadEnvFile(tmp);
      expect(process.env[cle]).toBe('valeur-fichier');
      expect(process.env[cleExistante]).toBe('deja-la');
      expect(process.env.QUOTED).toBe('entre guillemets');
    } finally {
      delete process.env[cle];
      delete process.env[cleExistante];
      delete process.env.QUOTED;
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
