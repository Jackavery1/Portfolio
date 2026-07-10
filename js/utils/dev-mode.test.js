/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/storage.js', () => ({
  STOCKAGE: { BANDEAU_DEV_MASQUE: 'jm_dev_banner_dismiss' },
}));

import { afficherBandeauDev, estBuildProd, estEnvironnementDevLocal } from './dev-mode.js';

describe('dev-mode', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    sessionStorage.clear();
  });

  it('detecte le build prod via la CSP', () => {
    expect(estBuildProd()).toBe(false);
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    document.head.appendChild(meta);
    expect(estBuildProd()).toBe(true);
  });

  it('detecte localhost et le paramètre dev', () => {
    vi.stubGlobal('location', { hostname: 'localhost', search: '' });
    expect(estEnvironnementDevLocal()).toBe(true);
    vi.stubGlobal('location', { hostname: 'portfolio.example', search: '?dev=1' });
    expect(estEnvironnementDevLocal()).toBe(true);
    vi.stubGlobal('location', { hostname: 'portfolio.example', search: '' });
    expect(estEnvironnementDevLocal()).toBe(false);
  });

  it('affiche le bandeau dev avec bouton fermer', () => {
    vi.stubGlobal('location', { hostname: 'localhost', search: '' });
    afficherBandeauDev();
    const bandeau = document.getElementById('js-dev-banner');
    expect(bandeau).not.toBeNull();
    bandeau.querySelector('.dev-banner__fermer').click();
    expect(document.getElementById('js-dev-banner')).toBeNull();
    expect(sessionStorage.getItem('jm_dev_banner_dismiss')).toBe('1');
  });

  it('respecte le masquage session', () => {
    vi.stubGlobal('location', { hostname: 'localhost', search: '' });
    sessionStorage.setItem('jm_dev_banner_dismiss', '1');
    afficherBandeauDev();
    expect(document.getElementById('js-dev-banner')).toBeNull();
  });

  it('n’affiche pas le bandeau en build prod', () => {
    vi.stubGlobal('location', { hostname: 'localhost', search: '' });
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    document.head.appendChild(meta);
    afficherBandeauDev();
    expect(document.getElementById('js-dev-banner')).toBeNull();
  });

  it('tolère sessionStorage indisponible à la lecture', () => {
    vi.stubGlobal('location', { hostname: 'localhost', search: '' });
    vi.spyOn(window.sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    afficherBandeauDev();
    expect(document.getElementById('js-dev-banner')).not.toBeNull();
  });

  it('masque le bandeau même si sessionStorage.setItem échoue', () => {
    vi.stubGlobal('location', { hostname: 'localhost', search: '' });
    afficherBandeauDev();
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    document.querySelector('.dev-banner__fermer').click();
    expect(document.getElementById('js-dev-banner')).toBeNull();
  });
});
