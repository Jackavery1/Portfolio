import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./audio.js', () => ({
  jouerFanfareVictoire: vi.fn(),
}));

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    STOCKAGE: { PREFIXE_DOJO_BOSS: 'jm_dojo_boss_' },
    BONUS_SCORE: { BOSS_DOJO: 300, BOSS_DOJO_VAINCU: 450 },
  },
}));

vi.mock('./score.js', () => ({
  accorderBonusDojoBoss: vi.fn(),
}));

import { accorderBonusDojoBoss } from './score.js';
import { jouerFanfareVictoire } from './audio.js';
import { initialiserDojoBoss } from './dojo-boss.js';

describe('dojo-boss', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    document.body.innerHTML = `
      <main id="dojo">
        <article class="boss-carte" data-boss="domslayer">
          <span class="boss-carte__nom">DOM Slayer</span>
        </article>
        <article class="boss-carte boss-carte--vaincu" data-boss="crud">
          <span class="boss-carte__nom">CRUD</span>
          <span class="boss-carte__statut">VAINCU</span>
        </article>
        <article class="boss-carte boss-carte--en-cours">
          <div class="boss-carte__vie-fill" style="--cible: 40%"></div>
        </article>
      </main>
    `;
  });

  afterEach(() => {
    window.dispatchEvent(new Event('pagehide'));
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('ajoute une citation et nettoie les intervalles au pagehide', () => {
    initialiserDojoBoss();

    const carte = document.querySelector('[data-boss="domslayer"]');
    expect(carte.querySelector('.boss-citation')).not.toBeNull();
    expect(carte.getAttribute('aria-describedby')).toBe('boss-citation-domslayer');

    carte.dispatchEvent(new MouseEvent('mouseenter'));
    expect(carte.querySelector('.boss-citation').classList.contains('boss-citation--visible')).toBe(
      true
    );

    window.dispatchEvent(new Event('pagehide'));
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('ajoute un bonus score au premier clic sur une carte boss', () => {
    initialiserDojoBoss();
    const carte = document.querySelector('[data-boss="domslayer"]');
    carte.click();
    expect(accorderBonusDojoBoss).toHaveBeenCalledWith('domslayer', false);
    vi.mocked(accorderBonusDojoBoss).mockClear();
    carte.click();
    expect(accorderBonusDojoBoss).toHaveBeenCalledWith('domslayer', false);
  });

  it('accorde plus de points pour un boss vaincu', () => {
    initialiserDojoBoss();
    document.querySelector('[data-boss="crud"]').click();
    expect(accorderBonusDojoBoss).toHaveBeenCalledWith('crud', true);
  });

  it('affiche les citations au touch sur pointeur grossier', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('pointer: coarse'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    initialiserDojoBoss();
    const carte = document.querySelector('[data-boss="domslayer"]');
    const bulle = carte.querySelector('.boss-citation');

    carte.click();
    expect(bulle.classList.contains('boss-citation--visible')).toBe(true);
    carte.click();
    expect(bulle.classList.contains('boss-citation--visible')).toBe(false);
  });

  it('célèbre un boss vaincu au clavier', () => {
    initialiserDojoBoss();
    const carte = document.querySelector('[data-boss="crud"]');
    carte.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(jouerFanfareVictoire).toHaveBeenCalled();
  });

  it('ne fait rien si la section dojo est absente', () => {
    document.body.innerHTML = '';
    expect(() => initialiserDojoBoss()).not.toThrow();
  });

  it('ignore un boss sans citation connue', () => {
    document.body.innerHTML = `
      <main id="dojo">
        <article class="boss-carte" data-boss="inconnu"></article>
      </main>
    `;
    initialiserDojoBoss();
    expect(document.querySelector('.boss-citation')).toBeNull();
  });

  it('masque la citation au focusout', () => {
    initialiserDojoBoss();
    const carte = document.querySelector('[data-boss="domslayer"]');
    const bulle = carte.querySelector('.boss-citation');
    carte.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(bulle.classList.contains('boss-citation--visible')).toBe(true);
    carte.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(bulle.classList.contains('boss-citation--visible')).toBe(false);
  });

  it('célèbre un boss vaincu avec la barre espace', () => {
    initialiserDojoBoss();
    const carte = document.querySelector('[data-boss="crud"]');
    carte.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(jouerFanfareVictoire).toHaveBeenCalled();
  });

  it('ignore un second flash de célébration consécutif', () => {
    initialiserDojoBoss();
    const carte = document.querySelector('[data-boss="crud"]');
    carte.click();
    vi.mocked(jouerFanfareVictoire).mockClear();
    carte.click();
    expect(jouerFanfareVictoire).not.toHaveBeenCalled();
  });

  it('fait osciller la barre de PV des boss en cours', () => {
    initialiserDojoBoss();
    const fill = document.querySelector('.boss-carte--en-cours .boss-carte__vie-fill');
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('40%');

    vi.advanceTimersByTime(800);
    const largeur1 = fill.style.width;
    expect(largeur1).toMatch(/%$/);

    vi.advanceTimersByTime(800);
    expect(fill.style.width).toMatch(/%$/);

    window.dispatchEvent(new Event('pagehide'));
    const apresStop = fill.style.width;
    vi.advanceTimersByTime(1600);
    expect(fill.style.width).toBe(apresStop);
  });
});
