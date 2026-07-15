import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: { BURGER: 'js-burger', MENU: 'js-menu', MODALE: 'js-modal' },
    NAVIGATION: { ORDRE: ['index.html', 'projets.html'] },
    STOCKAGE: { ANNONCE_NAV_CLAVIER: 'jm_nav_clavier_annonce' },
    KONAMI: {
      SEQUENCE: [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
      ],
    },
  },
}));

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

vi.mock('../utils/focus.js', () => ({
  piegerTabulationModale: vi.fn(),
}));

import {
  initialiserNavigationArcade,
  initialiserNavigationClavier,
  annoncerNavigationClavier,
} from './navigation.js';
import { jouerBip } from './audio.js';
import { piegerTabulationModale } from '../utils/focus.js';
import { enregistrerToucheKonami, reinitialiserSaisieKonami } from '../utils/konami-buffer.js';

describe('navigation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    delete document.documentElement.dataset.navClavier;
    reinitialiserSaisieKonami();
    document.body.innerHTML = `
      <header class="nav">
        <button id="js-burger" type="button" aria-expanded="false" aria-label="Ouvrir le menu"></button>
        <nav id="js-menu"><a class="nav__bouton" href="index.html">HOME</a></nav>
      </header>
    `;
    vi.mocked(jouerBip).mockClear();
    initialiserNavigationArcade();
    initialiserNavigationClavier();
  });

  it('ouvre et ferme le menu burger', () => {
    const burger = document.getElementById('js-burger');
    const menu = document.getElementById('js-menu');

    burger.click();
    expect(burger.getAttribute('aria-expanded')).toBe('true');
    expect(burger.getAttribute('aria-label')).toBe('Fermer le menu');
    expect(menu.classList.contains('ouvert')).toBe(true);
    expect(document.body.classList.contains('nav-scroll-lock')).toBe(true);
    expect(document.activeElement).toBe(menu.querySelector('.nav__bouton'));

    burger.click();
    expect(burger.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList.contains('ouvert')).toBe(false);
    expect(document.body.classList.contains('nav-scroll-lock')).toBe(false);
  });

  it('ferme le menu au clic extérieur', () => {
    document.getElementById('js-burger').click();
    document.body.click();
    expect(document.getElementById('js-burger').getAttribute('aria-expanded')).toBe('false');
  });

  it('ferme le menu avec Escape', () => {
    const burger = document.getElementById('js-burger');
    const menu = document.getElementById('js-menu');
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    burger.click();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true })
    );
    expect(burger.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList.contains('ouvert')).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  it('navigue vers la page suivante avec flèche droite', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/index.html', href: 'index.html' },
      writable: true,
    });
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
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(window.location.href).toBe('index.html');
    expect(jouerBip).toHaveBeenCalled();
  });

  it('n’avance pas au-delà de la dernière page', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/projets.html', href: 'projets.html' },
      writable: true,
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(window.location.href).toBe('projets.html');
  });

  it('ignore les flèches quand la modale est ouverte', () => {
    document.body.innerHTML += '<div id="js-modal"></div>';
    const modal = document.getElementById('js-modal');
    modal.hidden = false;
    Object.defineProperty(window, 'location', {
      value: { pathname: '/index.html', href: 'index.html' },
      writable: true,
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(window.location.href).toBe('index.html');
  });

  it('ignore les flèches depuis un champ de formulaire', () => {
    document.body.innerHTML += '<input id="champ" />';
    document.getElementById('champ').focus();
    Object.defineProperty(window, 'location', {
      value: { pathname: '/index.html', href: 'index.html' },
      writable: true,
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(window.location.href).toBe('index.html');
  });

  it('ignore les flèches pendant la saisie Konami', () => {
    reinitialiserSaisieKonami();
    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft'].forEach((key) => {
      enregistrerToucheKonami(key);
    });
    Object.defineProperty(window, 'location', {
      value: { pathname: '/index.html', href: 'index.html' },
      writable: true,
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(window.location.href).toBe('index.html');
  });

  it('ignore les flèches quand le menu burger est ouvert', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/index.html', href: 'index.html' },
      writable: true,
    });
    const menu = document.getElementById('js-menu');
    menu.classList.add('ouvert');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(window.location.href).toBe('index.html');
  });

  it('ignore les flèches sur une page hors ordre de navigation', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/inconnue.html', href: 'inconnue.html' },
      writable: true,
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(window.location.href).toBe('inconnue.html');
  });

  it('annoncerNavigationClavier ignore l’absence de libellé', () => {
    expect(() => annoncerNavigationClavier()).not.toThrow();
  });

  it('annoncerNavigationClavier efface le libellé même sans zone DOM', () => {
    sessionStorage.setItem('jm_nav_clavier_annonce', 'Projets');
    annoncerNavigationClavier();
    expect(sessionStorage.getItem('jm_nav_clavier_annonce')).toBeNull();
  });

  it('annoncerNavigationClavier tolère sessionStorage indisponible', () => {
    vi.spyOn(window.sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    expect(() => annoncerNavigationClavier()).not.toThrow();
  });

  it('enregistre l’annonce même si sessionStorage.setItem échoue', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/index.html', href: 'index.html' },
      writable: true,
    });
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(window.location.href).toBe('projets.html');
  });

  it('annoncerNavigationClavier tolère removeItem indisponible', () => {
    sessionStorage.setItem('jm_nav_clavier_annonce', 'Projets');
    vi.spyOn(window.sessionStorage, 'removeItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    expect(() => annoncerNavigationClavier()).not.toThrow();
  });

  it('ne recule pas avant la première page', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/index.html', href: 'index.html' },
      writable: true,
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(window.location.href).toBe('index.html');
  });

  it('ignore une seconde initialisation arcade', () => {
    const burger = document.getElementById('js-burger');
    expect(burger.dataset.navArcade).toBe('1');
    expect(() => initialiserNavigationArcade()).not.toThrow();
    expect(burger.dataset.navArcade).toBe('1');
  });

  it('ne plante pas sans burger ni menu', () => {
    document.body.innerHTML = '';
    expect(() => initialiserNavigationArcade()).not.toThrow();
  });

  it('piege la tabulation dans le menu ouvert', () => {
    document.getElementById('js-burger').click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(piegerTabulationModale).toHaveBeenCalled();
  });
});
