/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    PERSON_NAME: 'Joris Martinez',
    CONTACT: {
      EMAIL_B64: btoa('test@example.com'),
    },
    SELECTEURS: {
      MENTIONS_EMAIL_LINK: 'js-mentions-email',
    },
  },
}));

import { initialiserMentionsLegales } from './mentions-legales.js';

describe('mentions-legales', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <p id="js-mentions-intro"></p>
      <div id="js-mentions-sommaire"></div>
      <div id="js-mentions-sections"></div>
    `;
  });

  it('génère sommaire, sections et email éditeur', () => {
    initialiserMentionsLegales();

    expect(document.getElementById('js-mentions-intro')?.textContent).toBeTruthy();
    expect(document.querySelectorAll('.mentions-sommaire__liste a')).toHaveLength(5);
    expect(document.getElementById('donnees-personnelles')).toBeTruthy();
    expect(document.querySelectorAll('.mentions-sous-bloc h3').length).toBeGreaterThanOrEqual(5);

    const email = document.getElementById('js-mentions-email');
    expect(email?.getAttribute('href')).toBe('mailto:test@example.com');
    expect(email?.textContent).toBe('test@example.com');
    expect(email?.hasAttribute('hidden')).toBe(false);
  });

  it('ne régénère pas le contenu déjà injecté au build', () => {
    document.body.innerHTML = `
      <div id="js-mentions-sections">
        <article class="mentions-bloc" id="editeur">
          <p>Contact : <a id="js-mentions-email" href="#" hidden></a></p>
        </article>
      </div>
    `;
    initialiserMentionsLegales();
    expect(document.querySelectorAll('.mentions-bloc')).toHaveLength(1);
    const email = document.getElementById('js-mentions-email');
    expect(email?.getAttribute('href')).toBe('mailto:test@example.com');
    expect(email?.hasAttribute('hidden')).toBe(false);
  });
});
