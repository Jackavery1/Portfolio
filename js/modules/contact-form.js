import { CONFIG } from '../config/index.js';
import { byId } from '../utils/dom.js';
import { nettoyerChamp, estEmailValide } from '../utils/validation.js';
import {
  afficherErreurZone,
  enregistrerSoumissionSession,
  honeypotRempli,
  marquerChampsInvalides,
  peutSoumettreAvecSession,
} from '../utils/contact-form-ui.js';
import { jouerBip } from './audio.js';
import { initialiserRecaptchaContact } from './contact-form-recaptcha.js';
import {
  envoyerViaFormspree,
  envoyerViaMailto,
  finaliserEnvoiReussi,
  lireSujetUtile,
} from './contact-form-submit.js';
import { initScrollChampClavier } from '../utils/visual-viewport.js';

function optionsRecaptcha() {
  return {
    siteKey: CONFIG.CONTACT.RECAPTCHA_SITE_KEY,
    version: CONFIG.CONTACT.RECAPTCHA_VERSION === 3 ? 3 : 2,
    mountId: CONFIG.SELECTORS.RECAPTCHA_MOUNT,
    action: 'submit',
  };
}

function lireChampsFormulaire() {
  const { LIMITS } = CONFIG.CONTACT;
  return {
    nom: nettoyerChamp(byId(CONFIG.SELECTORS.CONTACT_NOM)?.value, LIMITS.nom),
    email: nettoyerChamp(byId(CONFIG.SELECTORS.CONTACT_EMAIL)?.value, LIMITS.email),
    message: nettoyerChamp(byId(CONFIG.SELECTORS.CONTACT_MESSAGE)?.value, LIMITS.message),
    champsDom: [
      byId(CONFIG.SELECTORS.CONTACT_NOM),
      byId(CONFIG.SELECTORS.CONTACT_EMAIL),
      byId(CONFIG.SELECTORS.CONTACT_MESSAGE),
    ],
  };
}

function champsValides({ nom, email, message }) {
  return nom && email && message && estEmailValide(email, CONFIG.CONTACT.LIMITS.email);
}

export async function initContactForm() {
  const formulaire = byId(CONFIG.SELECTORS.FORMULAIRE);
  if (!formulaire) return;

  const endpoint = CONFIG.CONTACT.FORMSPREE_ENDPOINT?.trim();
  const recaptchaKey = CONFIG.CONTACT.RECAPTCHA_SITE_KEY?.trim();
  const mount = byId(CONFIG.SELECTORS.RECAPTCHA_MOUNT);
  const zoneErreur = byId(CONFIG.SELECTORS.CONTACT_ERREUR);
  const afficherErreur = (texte) => afficherErreurZone(zoneErreur, texte);

  await initialiserRecaptchaContact({
    endpoint,
    recaptchaKey,
    mount,
    optionsRecaptcha: optionsRecaptcha(),
  });

  initScrollChampClavier(formulaire);

  formulaire.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    afficherErreur('');

    if (
      honeypotRempli(
        formulaire,
        byId(CONFIG.SELECTORS.CONTACT_HONEYPOT),
        CONFIG.CONTACT.HONEYPOT_NAME
      )
    ) {
      return;
    }

    if (
      !peutSoumettreAvecSession(CONFIG.STORAGE.CONTACT_LAST_SUBMIT, CONFIG.CONTACT.RATE_LIMIT_MS)
    ) {
      jouerBip(150, 120, 'sawtooth');
      afficherErreur('Veuillez patienter avant un nouvel envoi.');
      return;
    }

    const { nom, email, message, champsDom } = lireChampsFormulaire();
    if (!champsValides({ nom, email, message })) {
      marquerChampsInvalides(champsDom, jouerBip);
      formulaire.reportValidity();
      return;
    }

    const btnEnvoyer = byId(CONFIG.SELECTORS.BTN_ENVOYER);
    const confirmation = byId(CONFIG.SELECTORS.CONFIRMATION);
    if (!btnEnvoyer) return;

    const sujetUtile = lireSujetUtile(byId(CONFIG.SELECTORS.CONTACT_SUJET));
    const champs = { nom, email, message };

    if (endpoint) {
      const result = await envoyerViaFormspree({
        config: CONFIG,
        champs,
        sujetUtile,
        btnEnvoyer,
        mount,
        optionsRecaptcha: optionsRecaptcha(),
        afficherErreur,
      });
      if (result?.ok) {
        enregistrerSoumissionSession(CONFIG.STORAGE.CONTACT_LAST_SUBMIT);
        finaliserEnvoiReussi({
          btnEnvoyer,
          confirmation,
        });
      }
      return;
    }

    if (
      envoyerViaMailto({
        config: CONFIG,
        champs,
        sujetUtile,
      })
    ) {
      enregistrerSoumissionSession(CONFIG.STORAGE.CONTACT_LAST_SUBMIT);
      finaliserEnvoiReussi({ btnEnvoyer, confirmation });
    }
  });

  formulaire.dataset.ready = '1';
}
