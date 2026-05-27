import { describe, expect, it } from 'vitest';
import {
  CONFIG_DEFAULTS,
  applyBuildEnvToJs,
  resolveBuildEnv,
} from './env.cjs';

describe('resolveBuildEnv', () => {
  it('utilise les valeurs par défaut', () => {
    expect(resolveBuildEnv({})).toEqual(CONFIG_DEFAULTS);
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
    expect(
      resolveBuildEnv({ PORTFOLIO_SITE_URL: 'https://preview.example.com/' }).siteOrigin
    ).toBe('https://preview.example.com');
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
});
