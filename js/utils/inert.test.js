/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import { basculerInertFond } from './inert.js';

describe('inert', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="fond-a"></div>
      <div class="ecran"></div>
      <div id="modal"></div>
    `;
  });

  it('active et retire inert sur les enfants directs du body', () => {
    const modal = document.getElementById('modal');
    basculerInertFond(true, modal);
    expect(document.getElementById('fond-a').hasAttribute('inert')).toBe(true);
    expect(document.querySelector('.ecran').hasAttribute('inert')).toBe(true);
    expect(modal.hasAttribute('inert')).toBe(false);

    basculerInertFond(false);
    expect(document.getElementById('fond-a').hasAttribute('inert')).toBe(false);
    expect(modal.hasAttribute('inert')).toBe(false);
  });
});
