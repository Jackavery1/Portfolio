/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./audio.js', () => ({
  jouerFanfareVictoire: vi.fn(),
}));

vi.mock('../config/index.js', () => ({
  CONFIG: {
    STORAGE: { DOJO_BOSS_PREFIX: 'jm_dojo_boss_' },
    SCORE_BONUS: { DOJO_BOSS: 300, DOJO_BOSS_VAINCU: 450 },
  },
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

import { ajouterScore } from './score.js';
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
    expect(ajouterScore).toHaveBeenCalledWith(300);
    vi.mocked(ajouterScore).mockClear();
    carte.click();
    expect(ajouterScore).not.toHaveBeenCalled();
  });

  it('accorde plus de points pour un boss vaincu', () => {
    initialiserDojoBoss();
    document.querySelector('[data-boss="crud"]').click();
    expect(ajouterScore).toHaveBeenCalledWith(450);
  });
});
