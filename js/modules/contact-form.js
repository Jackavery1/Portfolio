import { CONFIG } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { nettoyerChamp, estEmailValide } from '../utils/validation.js';
import {
  afficherErreurZone,
  enregistrerSoumissionSession,
  effacerEtatsInvalides,
  potDeMielRempli,
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
import { initialiserScrollChampClavier } from '../utils/visual-viewport.js';

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
    nom: nettoyerChamp(parId(CONFIG.SELECTORS.CONTACT_NOM)?.value, LIMITS.nom),
    email: nettoyerChamp(parId(CONFIG.SELECTORS.CONTACT_EMAIL)?.value, LIMITS.email),
    message: nettoyerChamp(parId(CONFIG.SELECTORS.CONTACT_MESSAGE)?.value, LIMITS.message),
    champsDom: [
      parId(CONFIG.SELECTORS.CONTACT_NOM),
      parId(CONFIG.SELECTORS.CONTACT_EMAIL),
      parId(CONFIG.SELECTORS.CONTACT_MESSAGE),
    ],
  };
}

function construireErreursValidation({ nom, email, message, champsDom }) {
  const [nomEl, emailEl, messageEl] = champsDom;
  const erreurs = [];

  if (!nom) {
    erreurs.push({ el: nomEl, message: 'Veuillez renseigner votre nom.' });
  }
  if (!email) {
    erreurs.push({ el: emailEl, message: 'Veuillez saisir votre adresse e-mail.' });
  } else if (!estEmailValide(email, CONFIG.CONTACT.LIMITS.email)) {
    erreurs.push({ el: emailEl, message: 'Adresse e-mail invalide.' });
  }
  if (!message) {
    erreurs.push({ el: messageEl, message: 'Veuillez rédiger votre message.' });
  }

  return erreurs;
}

function champsValides({ nom, email, message }) {
  return nom && email && message && estEmailValide(email, CONFIG.CONTACT.LIMITS.email);
}

export async function initialiserFormulaireContact() {
  const formulaire = parId(CONFIG.SELECTORS.FORMULAIRE);
  if (!formulaire) return;

  const endpoint = CONFIG.CONTACT.FORMSPREE_ENDPOINT?.trim();
  const recaptchaKey = CONFIG.CONTACT.RECAPTCHA_SITE_KEY?.trim();
  const mount = parId(CONFIG.SELECTORS.RECAPTCHA_MOUNT);
  const zoneErreur = parId(CONFIG.SELECTORS.CONTACT_ERREUR);
  const afficherErreur = (texte) => afficherErreurZone(zoneErreur, texte);

  await initialiserRecaptchaContact({
    endpoint,
    recaptchaKey,
    mount,
    optionsRecaptcha: optionsRecaptcha(),
  });

  initialiserScrollChampClavier(formulaire);

  formulaire.addEventListener('input', (evt) => {
    if (evt.target.matches('.champ-input')) {
      effacerEtatsInvalides([evt.target]);
    }
  });

  formulaire.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    afficherErreur('');

    const { champsDom } = lireChampsFormulaire();
    effacerEtatsInvalides(champsDom);

    if (
      potDeMielRempli(
        formulaire,
        parId(CONFIG.SELECTORS.CONTACT_HONEYPOT),
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

    const { nom, email, message, champsDom: champsDomLus } = lireChampsFormulaire();
    if (!champsValides({ nom, email, message })) {
      marquerChampsInvalides(construireErreursValidation({ nom, email, message, champsDom: champsDomLus }), jouerBip);
      formulaire.reportValidity();
      return;
    }

    const btnEnvoyer = parId(CONFIG.SELECTORS.BTN_ENVOYER);
    const confirmation = parId(CONFIG.SELECTORS.CONFIRMATION);
    if (!btnEnvoyer) return;

    if (formulaire.dataset.envoiEnCours === '1') return;
    formulaire.dataset.envoiEnCours = '1';

    const sujetUtile = lireSujetUtile(parId(CONFIG.SELECTORS.CONTACT_SUJET));
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
      } else {
        delete formulaire.dataset.envoiEnCours;
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
    } else {
      delete formulaire.dataset.envoiEnCours;
    }
  });

  formulaire.dataset.ready = '1';
}
