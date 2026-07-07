/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const configMock = vi.hoisted(() => ({
  CONFIGURATION: {
    SELECTEURS: {
      FORMULAIRE: 'js-formulaire',
      CONTACT_NOM: 'contact-nom',
      CONTACT_EMAIL: 'contact-email',
      CONTACT_MESSAGE: 'contact-message',
      CONTACT_SUJET: 'contact-sujet',
      CONTACT_HONEYPOT: 'contact-website',
      BTN_ENVOYER: 'js-btn-envoyer',
      CONFIRMATION: 'js-confirmation',
      CONTACT_ERREUR: 'js-formulaire-erreur',
      MONTE_RECAPTCHA: 'js-recaptcha-mount',
    },
    CONTACT: {
      FORMSPREE_ENDPOINT: 'https://formspree.io/f/test',
      RECAPTCHA_SITE_KEY: 'test-key',
      RECAPTCHA_VERSION: 3,
      EMAIL_B64: btoa('dest@example.com'),
      NOM_POT_MIEL: 'website',
      DELAI_LIMITATION_MS: 60_000,
      LIMITES: { nom: 80, email: 120, message: 5000 },
    },
    STOCKAGE: { DERNIERE_SOUMISSION_CONTACT: 'portfolio-contact-last' },
    BONUS_SCORE: { CONTACT: 500 },
  },
}));

vi.mock('../config/index.js', () => configMock);

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

vi.mock('./recaptcha.js', () => ({
  initialiserRecaptcha: vi.fn().mockResolvedValue(true),
  obtenirTokenRecaptcha: vi.fn().mockResolvedValue('token'),
  reinitialiserWidgetRecaptcha: vi.fn(),
}));

vi.mock('../utils/visual-viewport.js', () => ({
  initialiserScrollChampClavier: vi.fn(),
}));

import { initialiserRecaptcha } from './recaptcha.js';
import { initialiserFormulaireContact } from './contact-form.js';

function monterFormulaire() {
  document.body.innerHTML = `
    <form id="js-formulaire">
      <input id="contact-website" name="website" value="" />
      <input id="contact-nom" class="champ-input" value="Test" />
      <input id="contact-email" class="champ-input" value="test@example.com" />
      <textarea id="contact-message" class="champ-input">Message</textarea>
      <select id="contact-sujet"><option>Projet</option></select>
      <button type="submit" id="js-btn-envoyer">Envoyer</button>
    </form>
    <p id="js-formulaire-erreur" hidden></p>
    <p id="js-confirmation" hidden>OK</p>
    <div id="js-recaptcha-mount" hidden></div>
  `;
}

describe('contact-form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    configMock.CONFIGURATION.CONTACT.FORMSPREE_ENDPOINT = 'https://formspree.io/f/test';
    configMock.CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY = 'test-key';
    configMock.CONFIGURATION.CONTACT.RECAPTCHA_VERSION = 3;
    monterFormulaire();
    vi.stubGlobal('fetch', vi.fn());
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { href: 'http://localhost:3000/' },
    });
  });

  it('ignore la soumission si le honeypot est rempli', async () => {
    await initialiserFormulaireContact();

    document.getElementById('contact-website').value = 'spam';
    document
      .getElementById('js-formulaire')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(fetch).not.toHaveBeenCalled();
  });

  it('affiche le rate limit si envoi trop rapide', async () => {
    sessionStorage.setItem('portfolio-contact-last', String(Date.now()));
    await initialiserFormulaireContact();

    document
      .getElementById('js-formulaire')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const erreur = document.getElementById('js-formulaire-erreur');
    expect(erreur.hidden).toBe(false);
    expect(erreur.textContent).toContain('patienter');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('envoie le formulaire quand la validation et reCAPTCHA passent', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });

    await initialiserFormulaireContact();
    document
      .getElementById('js-formulaire')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(document.getElementById('js-confirmation').hidden).toBe(false);
  });

  it('initialise reCAPTCHA au premier focus quand endpoint et clé sont présents', async () => {
    await initialiserFormulaireContact();
    expect(initialiserRecaptcha).not.toHaveBeenCalled();
    document.getElementById('contact-nom').dispatchEvent(new Event('focusin', { bubbles: true }));
    await vi.waitFor(() => {
      expect(initialiserRecaptcha).toHaveBeenCalled();
    });
  });

  it('affiche une alerte si initialiserRecaptcha échoue', async () => {
    initialiserRecaptcha.mockRejectedValueOnce(new Error('network'));
    const mount = document.getElementById('js-recaptcha-mount');

    await initialiserFormulaireContact();
    document.getElementById('contact-nom').dispatchEvent(new Event('focusin', { bubbles: true }));
    await vi.waitFor(() => {
      expect(mount.className).toContain('recaptcha-zone--erreur');
    });
    expect(mount.textContent).toMatch(/indisponible/i);
  });

  it('affiche une alerte si reCAPTCHA n’est pas configuré', async () => {
    configMock.CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY = '';
    const mount = document.getElementById('js-recaptcha-mount');

    await initialiserFormulaireContact();

    expect(mount.hidden).toBe(false);
    expect(mount.className).toContain('recaptcha-zone--config');
    expect(mount.textContent).toMatch(/non configuré/i);
  });

  it('marque les champs invalides et bloque l’envoi', async () => {
    await initialiserFormulaireContact();
    document.getElementById('contact-nom').value = '';
    document.getElementById('contact-email').value = 'invalide';

    document
      .getElementById('js-formulaire')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(document.getElementById('contact-nom').getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById('contact-email').getAttribute('aria-invalid')).toBe('true');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('efface aria-invalid sur input utilisateur', async () => {
    await initialiserFormulaireContact();
    const champ = document.getElementById('contact-nom');
    champ.setAttribute('aria-invalid', 'true');
    champ.dispatchEvent(new Event('input', { bubbles: true }));
    expect(champ.getAttribute('aria-invalid')).toBeNull();
  });

  it('ignore un second envoi pendant le premier', async () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    await initialiserFormulaireContact();
    const form = document.getElementById('js-formulaire');
    form.dataset.envoiEnCours = '1';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('relâche envoiEnCours si Formspree échoue', async () => {
    fetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'fail' }) });
    await initialiserFormulaireContact();
    document
      .getElementById('js-formulaire')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      expect(document.getElementById('js-formulaire').dataset.envoiEnCours).toBeUndefined();
    });
  });

  it('utilise mailto quand aucun endpoint Formspree', async () => {
    configMock.CONFIGURATION.CONTACT.FORMSPREE_ENDPOINT = '';
    await initialiserFormulaireContact();
    document
      .getElementById('js-formulaire')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      expect(window.location.href).toMatch(/^mailto:dest@example.com/);
    });
    expect(document.getElementById('js-confirmation').hidden).toBe(false);
  });
});
