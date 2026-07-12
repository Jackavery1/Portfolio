import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONFIG_DEFAULTS, CV_HREF_LOCAL, applyBuildEnvToJs, loadEnvFile, resolveBuildEnv } from './env.cjs';

describe('resolveBuildEnv', () => {
  it('utilise les valeurs par défaut', () => {
    expect(resolveBuildEnv({})).toEqual({
      siteOrigin: CONFIG_DEFAULTS.siteOrigin,
      formspree: CONFIG_DEFAULTS.formspree,
      recaptcha: CONFIG_DEFAULTS.recaptcha,
      cvHref: CONFIG_DEFAULTS.cvHref,
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
      cvHref: CONFIG_DEFAULTS.cvHref,
    });
  });

  it('retire le slash final de SITE_URL', () => {
    expect(resolveBuildEnv({ PORTFOLIO_SITE_URL: 'https://preview.example.com/' }).siteOrigin).toBe(
      'https://preview.example.com'
    );
  });

  it('accepte PORTFOLIO_SITE_ORIGIN en repli', () => {
    expect(
      resolveBuildEnv({ PORTFOLIO_SITE_ORIGIN: 'https://origin.example.com/' }).siteOrigin
    ).toBe('https://origin.example.com');
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

  it('remplace formspree et recaptcha quand ils diffèrent des défauts', () => {
    const src = `const f = "${CONFIG_DEFAULTS.formspree}"; const r = "${CONFIG_DEFAULTS.recaptcha}";`;
    const env = resolveBuildEnv({
      PORTFOLIO_FORMSPREE_ENDPOINT: 'https://formspree.io/f/custom',
      PORTFOLIO_RECAPTCHA_SITE_KEY: 'cle-custom',
    });
    const out = applyBuildEnvToJs(src, env);
    expect(out).toContain('https://formspree.io/f/custom');
    expect(out).toContain('cle-custom');
  });

  it('remplace le lien CV local par l’URL prod au build', () => {
    const src = `href: '${CV_HREF_LOCAL}',`;
    const out = applyBuildEnvToJs(src, resolveBuildEnv({}));
    expect(out).toBe(`href: '${CONFIG_DEFAULTS.cvHref}',`);
  });

  it('surcharge cvHref via PORTFOLIO_CV_URL', () => {
    expect(
      resolveBuildEnv({ PORTFOLIO_CV_URL: 'https://cdn.example/cv.pdf' }).cvHref
    ).toBe('https://cdn.example/cv.pdf');
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

  it('accepte les valeurs entre apostrophes', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-env-'));
    const cle = `TEST_APOS_${Date.now()}`;
    try {
      fs.writeFileSync(path.join(tmp, '.env.local'), `${cle}='apostrophe'`, 'utf8');
      loadEnvFile(tmp);
      expect(process.env[cle]).toBe('apostrophe');
    } finally {
      delete process.env[cle];
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
