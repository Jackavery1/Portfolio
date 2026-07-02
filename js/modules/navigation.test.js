/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    SELECTORS: { BURGER: 'js-burger', MENU: 'js-menu', MODAL: 'js-modal' },
    NAVIGATION: { ORDER: ['index.html', 'projets.html'] },
  },
}));

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

import { fermerMenuBurger, initNavigationArcade } from './navigation.js';

describe('navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <header class="nav">
        <button id="js-burger" type="button" aria-expanded="false" aria-label="Ouvrir le menu"></button>
        <nav id="js-menu"><a class="nav__bouton" href="index.html">HOME</a></nav>
      </header>
    `;
  });

  it('ouvre et ferme le menu burger', () => {
    initNavigationArcade();

    const burger = document.getElementById('js-burger');
    const menu = document.getElementById('js-menu');

    burger.click();
    expect(burger.getAttribute('aria-expanded')).toBe('true');
    expect(burger.getAttribute('aria-label')).toBe('Fermer le menu');
    expect(menu.classList.contains('ouvert')).toBe(true);
    expect(document.body.classList.contains('nav-scroll-lock')).toBe(true);
    expect(document.activeElement).toBe(menu.querySelector('.nav__bouton'));

    fermerMenuBurger();
    expect(burger.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList.contains('ouvert')).toBe(false);
    expect(document.body.classList.contains('nav-scroll-lock')).toBe(false);
  });
});
