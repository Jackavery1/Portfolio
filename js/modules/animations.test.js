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

  it('ignore une section absente', () => {
    expect(() => animerBarresSection('absent')).not.toThrow();
  });

  it('utilise 0% par défaut sans variable --cible', () => {
    document.body.innerHTML = `
      <section id="sec2">
        <div class="barre-completion__fill"></div>
      </section>
    `;
    animerBarresSection('sec2');
    expect(document.querySelector('.barre-completion__fill').style.width).toBe('0%');
  });
});
