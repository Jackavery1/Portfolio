import { beforeEach, describe, expect, it, vi } from 'vitest';

const configMock = vi.hoisted(() => ({
  CONFIGURATION: {
    SELECTEURS: {
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
      NOM_POT_MIEL: 'website',
      DELAI_LIMITATION_MS: 60_000,
      EMAIL_B64: btoa('dest@example.com'),
      LIMITES: { nom: 80, email: 120, message: 5000 },
    },
    STOCKAGE: { DERNIERE_SOUMISSION_CONTACT: 'portfolio-contact-last' },
  },
}));

const submitMocks = vi.hoisted(() => ({
  envoyerViaFormspree: vi.fn(),
  envoyerViaMailto: vi.fn(),
  lireSujetUtile: () => 'Projet',
}));

const submitUiMocks = vi.hoisted(() => ({
  marquerEnvoiEnCours: vi.fn(),
  finaliserEnvoiReussi: vi.fn(),
  signalerEchecEnvoi: vi.fn(),
}));

vi.mock('../config/index.js', () => configMock);

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

vi.mock('./contact-form-submit.js', () => submitMocks);

vi.mock('./contact-form-submit-ui.js', () => submitUiMocks);

import { initialiserEcouteurSoumission } from './contact-form-handler.js';
import { jouerBip } from './audio.js';

const { envoyerViaFormspree, envoyerViaMailto } = submitMocks;
const { marquerEnvoiEnCours, finaliserEnvoiReussi, signalerEchecEnvoi } = submitUiMocks;

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
    <div id="js-recaptcha-mount"></div>
  `;
  return document.getElementById('js-formulaire');
}

async function soumettre(formulaire) {
  formulaire.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await vi.waitFor(() => true);
  await Promise.resolve();
  await Promise.resolve();
}

describe('contact-form-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    configMock.CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY = 'test-key';
    envoyerViaFormspree.mockResolvedValue({ ok: true });
    envoyerViaMailto.mockReturnValue(true);
  });

  it('ignore la soumission si le honeypot est rempli', async () => {
    const formulaire = monterFormulaire();
    initialiserEcouteurSoumission(formulaire, {
      endpoint: 'https://formspree.io/f/test',
      assurerRecaptcha: vi.fn(),
      optionsRecaptcha: {},
    });
    document.getElementById('contact-website').value = 'bot';
    await soumettre(formulaire);
    expect(envoyerViaFormspree).not.toHaveBeenCalled();
    expect(envoyerViaMailto).not.toHaveBeenCalled();
  });

  it('bloque le rate-limit session', async () => {
    sessionStorage.setItem('portfolio-contact-last', String(Date.now()));
    const formulaire = monterFormulaire();
    initialiserEcouteurSoumission(formulaire, {
      endpoint: 'https://formspree.io/f/test',
      assurerRecaptcha: vi.fn(),
      optionsRecaptcha: {},
    });
    await soumettre(formulaire);
    const erreur = document.getElementById('js-formulaire-erreur');
    expect(erreur.hidden).toBe(false);
    expect(erreur.textContent).toContain('patienter');
    expect(jouerBip).toHaveBeenCalled();
    expect(envoyerViaFormspree).not.toHaveBeenCalled();
  });

  it('refuse les champs invalides', async () => {
    const formulaire = monterFormulaire();
    document.getElementById('contact-email').value = 'pas-un-email';
    initialiserEcouteurSoumission(formulaire, {
      endpoint: 'https://formspree.io/f/test',
      assurerRecaptcha: vi.fn(),
      optionsRecaptcha: {},
    });
    await soumettre(formulaire);
    expect(envoyerViaFormspree).not.toHaveBeenCalled();
    expect(document.getElementById('contact-email').getAttribute('aria-invalid')).toBe('true');
  });

  it('ignore un second submit pendant envoiEnCours', async () => {
    let liberer;
    envoyerViaFormspree.mockImplementation(
      () =>
        new Promise((resolve) => {
          liberer = () => resolve({ ok: true });
        })
    );
    const formulaire = monterFormulaire();
    const assurerRecaptcha = vi.fn().mockResolvedValue(undefined);
    initialiserEcouteurSoumission(formulaire, {
      endpoint: 'https://formspree.io/f/test',
      assurerRecaptcha,
      optionsRecaptcha: {},
    });
    const p1 = soumettre(formulaire);
    await Promise.resolve();
    await soumettre(formulaire);
    expect(envoyerViaFormspree).toHaveBeenCalledTimes(1);
    liberer();
    await p1;
  });

  it('signale l’échec Formspree', async () => {
    envoyerViaFormspree.mockResolvedValue({
      ok: false,
      msg: 'captcha',
      reinitialiserRecaptcha: true,
    });
    const formulaire = monterFormulaire();
    initialiserEcouteurSoumission(formulaire, {
      endpoint: 'https://formspree.io/f/test',
      assurerRecaptcha: vi.fn().mockResolvedValue(undefined),
      optionsRecaptcha: {},
    });
    await soumettre(formulaire);
    expect(signalerEchecEnvoi).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'captcha',
        reinitialiserRecaptcha: true,
      })
    );
    expect(finaliserEnvoiReussi).not.toHaveBeenCalled();
  });

  it('finalise un envoi Formspree réussi', async () => {
    const formulaire = monterFormulaire();
    initialiserEcouteurSoumission(formulaire, {
      endpoint: 'https://formspree.io/f/test',
      assurerRecaptcha: vi.fn().mockResolvedValue(undefined),
      optionsRecaptcha: {},
    });
    await soumettre(formulaire);
    expect(marquerEnvoiEnCours).toHaveBeenCalled();
    expect(finaliserEnvoiReussi).toHaveBeenCalled();
    expect(sessionStorage.getItem('portfolio-contact-last')).toBeTruthy();
  });

  it('arrête sans Formspree si clé reCAPTCHA absente', async () => {
    configMock.CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY = '';
    const formulaire = monterFormulaire();
    const mount = document.getElementById('js-recaptcha-mount');
    mount.scrollIntoView = vi.fn();
    const assurerRecaptcha = vi.fn().mockResolvedValue(undefined);
    initialiserEcouteurSoumission(formulaire, {
      endpoint: 'https://formspree.io/f/test',
      assurerRecaptcha,
      optionsRecaptcha: {},
    });
    await soumettre(formulaire);
    expect(assurerRecaptcha).toHaveBeenCalled();
    expect(envoyerViaFormspree).not.toHaveBeenCalled();
    expect(formulaire.dataset.envoiEnCours).toBeUndefined();
    expect(document.getElementById('js-btn-envoyer').getAttribute('title')).toContain(
      'PORTFOLIO_RECAPTCHA_SITE_KEY'
    );
    expect(mount.scrollIntoView).toHaveBeenCalled();
  });

  it('utilise mailto sans endpoint', async () => {
    const formulaire = monterFormulaire();
    initialiserEcouteurSoumission(formulaire, {
      endpoint: '',
      assurerRecaptcha: vi.fn(),
      optionsRecaptcha: {},
    });
    await soumettre(formulaire);
    expect(envoyerViaMailto).toHaveBeenCalled();
    expect(envoyerViaFormspree).not.toHaveBeenCalled();
    expect(finaliserEnvoiReussi).toHaveBeenCalled();
  });
});
