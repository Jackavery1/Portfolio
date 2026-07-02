/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { animerBarresSection } from './animations.js';

describe('animations', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb) => {
        cb();
        return 1;
      })
    );
    document.body.innerHTML = `
      <section id="sec">
        <div class="score-barre" style="--cible: 80%"></div>
      </section>
    `;
  });

  it('anime les barres une seule fois par section', () => {
    animerBarresSection('sec');
    animerBarresSection('sec');

    const barre = document.querySelector('.score-barre');
    expect(barre.style.width).toBe('80%');
    expect(requestAnimationFrame).toHaveBeenCalled();
  });
});
