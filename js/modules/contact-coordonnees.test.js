/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

const configMock = vi.hoisted(() => ({
  CONFIGURATION: {
    CONTACT: {
      EMAIL_B64: btoa('test@example.com'),
      PHONE_PARTS: [6, 74, 52, 24, 96],
    },
    SELECTEURS: {
      CONTACT_EMAIL_DISPLAY: 'js-contact-email',
      CONTACT_PHONE_DISPLAY: 'js-contact-phone',
    },
  },
}));

vi.mock('../config/index.js', () => configMock);

import { initialiserCoordonneesContact } from './contact-coordonnees.js';

describe('contact-coordonnees', () => {
  it('hydrate email et téléphone sur la page contact', () => {
    document.body.innerHTML =
      '<span id="js-contact-email"></span><span id="js-contact-phone"></span>';

    initialiserCoordonneesContact();

    const emailLien = document.querySelector('#js-contact-email a');
    expect(emailLien?.getAttribute('href')).toBe('mailto:test@example.com');

    const phoneLien = document.querySelector('#js-contact-phone a');
    expect(phoneLien?.getAttribute('href')).toMatch(/^tel:\+33/);
  });

  it('ignore un email vide ou sans domaine', () => {
    configMock.CONFIGURATION.CONTACT.EMAIL_B64 = '';
    configMock.CONFIGURATION.CONTACT.PHONE_PARTS = null;
    document.body.innerHTML =
      '<span id="js-contact-email">placeholder</span><span id="js-contact-phone"></span>';

    initialiserCoordonneesContact();

    expect(document.querySelector('#js-contact-email a')).toBeNull();
    expect(document.querySelector('#js-contact-phone a')).toBeNull();
  });

  it('affiche un email sans domaine en texte brut', () => {
    configMock.CONFIGURATION.CONTACT.EMAIL_B64 = btoa('contact-seul');
    configMock.CONFIGURATION.CONTACT.PHONE_PARTS = null;
    document.body.innerHTML = '<span id="js-contact-email"></span>';

    initialiserCoordonneesContact();

    const lien = document.querySelector('#js-contact-email a');
    expect(lien?.textContent).toBe('contact-seul');
    expect(lien?.querySelector('wbr')).toBeNull();
  });
});
