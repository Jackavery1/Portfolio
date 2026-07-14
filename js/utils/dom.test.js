import { describe, expect, it, beforeEach } from 'vitest';
import { parId, tousParSelecteur } from './dom.js';

describe('dom', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="a"></div>
      <span class="x"></span>
      <span class="x"></span>
    `;
  });

  it('parId retourne l’élément ou null', () => {
    expect(parId('a')?.id).toBe('a');
    expect(parId('absent')).toBeNull();
  });

  it('tousParSelecteur retourne un tableau d’éléments', () => {
    expect(tousParSelecteur('.x')).toHaveLength(2);
    expect(tousParSelecteur('.y')).toHaveLength(0);
  });
});
