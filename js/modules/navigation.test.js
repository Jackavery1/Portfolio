/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: { BURGER: 'js-burger', MENU: 'js-menu', MODALE: 'js-modal' },
    NAVIGATION: { ORDRE: ['index.html', 'projets.html'] },
    STOCKAGE: { ANNONCE_NAV_CLAVIER: 'jm_nav_clavier_annonce' },
  },
}));

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

import { fermerMenuBurger, initialiserNavigationArcade, initialiserNavigationClavier, annoncerNavigationClavier } from './navigation.js';
import { jouerBip } from './audio.js';

describe('navigation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = `
      <header class="nav">
        <button id="js-burger" type="button" aria-expanded="false" aria-label="Ouvrir le menu"></button>
        <nav id="js-menu"><a class="nav__bouton" href="index.html">HOME</a></nav>
      </header>
    `;
    vi.mocked(jouerBip).mockClear();
  });

  it('ouvre et ferme le menu burger', () => {
    initialiserNavigationArcade();

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

  it('ferme le menu au clic extérieur', () => {
    initialiserNavigationArcade();
    document.getElementById('js-burger').click();
    document.body.click();
    expect(document.getElementById('js-burger').getAttribute('aria-expanded')).toBe('false');
  });

  it('ferme le menu avec Escape', () => {
    initialiserNavigationArcade();
    const burger = document.getElementById('js-burger');
    const menu = document.getElementById('js-menu');
    burger.click();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true })
    );
    expect(burger.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList.contains('ouvert')).toBe(false);
  });

  it('navigue vers la page suivante avec flèche droite', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/index.html', href: 'index.html' },
      writable: true,
    });
    initialiserNavigationClavier();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(window.location.href).toBe('projets.html');
    expect(sessionStorage.getItem('jm_nav_clavier_annonce')).toBe('Projets');
    expect(jouerBip).toHaveBeenCalled();
  });

  it('annonce la page après navigation clavier', () => {
    document.body.innerHTML += `
      <p id="js-annonce-navigation" aria-live="polite"></p>
    `;
    sessionStorage.setItem('jm_nav_clavier_annonce', 'Compétences');

    annoncerNavigationClavier();

    expect(document.getElementById('js-annonce-navigation').textContent).toBe('Page Compétences');
    expect(sessionStorage.getItem('jm_nav_clavier_annonce')).toBeNull();
  });

  it('navigue vers la page précédente avec flèche gauche', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/projets.html', href: 'projets.html' },
      writable: true,
    });
    initialiserNavigationClavier();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(window.location.href).toBe('index.html');
    expect(jouerBip).toHaveBeenCalled();
  });
});
