/* @vitest-environment jsdom */
import { describe, expect, it, beforeEach } from 'vitest';
import { byId, byQsAll } from './dom.js';

describe('dom', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="a"></div>
      <span class="x"></span>
      <span class="x"></span>
    `;
  });

  it('byId retourne l’élément ou null', () => {
    expect(byId('a')?.id).toBe('a');
    expect(byId('absent')).toBeNull();
  });

  it('byQsAll retourne un tableau d’éléments', () => {
    expect(byQsAll('.x')).toHaveLength(2);
    expect(byQsAll('.y')).toHaveLength(0);
  });
});
