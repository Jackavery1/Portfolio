/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./audio.js', () => ({
  jouerFanfareVictoire: vi.fn(),
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

import { ajouterScore } from './score.js';
import { initDojoBoss } from './dojo-boss.js';

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

  it('ajoute une citation et nettoie les intervalles au pagehide', () => {
    initDojoBoss();

    const carte = document.querySelector('[data-boss="domslayer"]');
    expect(carte.querySelector('.boss-citation')).not.toBeNull();

    carte.dispatchEvent(new MouseEvent('mouseenter'));
    expect(carte.querySelector('.boss-citation').classList.contains('boss-citation--visible')).toBe(
      true,
    );

    window.dispatchEvent(new Event('pagehide'));
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('ajoute un bonus score au clic sur une carte boss', () => {
    initDojoBoss();
    document.querySelector('.boss-carte').click();
    expect(ajouterScore).toHaveBeenCalledWith(150);
  });
});
