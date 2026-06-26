/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    SELECTORS: {
      FORMULAIRE: 'js-formulaire',
      CONTACT_NOM: 'contact-nom',
      CONTACT_EMAIL: 'contact-email',
      CONTACT_MESSAGE: 'contact-message',
      CONTACT_SUJET: 'contact-sujet',
      CONTACT_HONEYPOT: 'contact-website',
      BTN_ENVOYER: 'js-btn-envoyer',
      CONFIRMATION: 'js-confirmation',
      CONTACT_ERREUR: 'js-formulaire-erreur',
      RECAPTCHA_MOUNT: 'js-recaptcha-mount',
    },
    CONTACT: {
      FORMSPREE_ENDPOINT: 'https://formspree.io/f/test',
      RECAPTCHA_SITE_KEY: 'test-key',
      RECAPTCHA_VERSION: 3,
      HONEYPOT_NAME: 'website',
      RATE_LIMIT_MS: 60_000,
      LIMITS: { nom: 80, email: 120, message: 5000 },
    },
    STORAGE: { CONTACT_LAST_SUBMIT: 'portfolio-contact-last' },
  },
}));

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

vi.mock('./recaptcha.js', () => ({
  initRecaptcha: vi.fn().mockResolvedValue(true),
  obtenirTokenRecaptcha: vi.fn().mockResolvedValue('token'),
  resetRecaptcha: vi.fn(),
}));

import { initContactForm } from './contact-form.js';

describe('contact-form', () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = `
      <form id="js-formulaire">
        <input id="contact-website" name="website" value="" />
        <input id="contact-nom" value="Test" />
        <input id="contact-email" value="test@example.com" />
        <textarea id="contact-message">Message</textarea>
        <select id="contact-sujet"><option>Projet</option></select>
        <button type="submit" id="js-btn-envoyer">Envoyer</button>
      </form>
      <p id="js-formulaire-erreur" hidden></p>
      <p id="js-confirmation" hidden>OK</p>
      <div id="js-recaptcha-mount" hidden></div>
    `;
    vi.stubGlobal('fetch', vi.fn());
  });

  it('ignore la soumission si le honeypot est rempli', async () => {
    await initContactForm();

    document.getElementById('contact-website').value = 'spam';
    document.getElementById('js-formulaire').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  it('affiche le rate limit si envoi trop rapide', async () => {
    sessionStorage.setItem('portfolio-contact-last', String(Date.now()));
    await initContactForm();

    document.getElementById('js-formulaire').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    const erreur = document.getElementById('js-formulaire-erreur');
    expect(erreur.hidden).toBe(false);
    expect(erreur.textContent).toContain('patienter');
    expect(fetch).not.toHaveBeenCalled();
  });
});
