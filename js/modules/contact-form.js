import { CONFIGURATION } from '../config/index.js';
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
import { initialiserRecaptcha } from './recaptcha.js';
import {
  envoyerViaFormspree,
  envoyerViaMailto,
  finaliserEnvoiReussi,
  lireSujetUtile,
} from './contact-form-submit.js';
import { initialiserScrollChampClavier } from '../utils/visual-viewport.js';

async function initialiserRecaptchaContact({
  endpoint,
  recaptchaKey,
  mount,
  optionsRecaptcha,
}) {
  if (endpoint && recaptchaKey) {
    try {
      await initialiserRecaptcha(optionsRecaptcha);
    } catch {
      if (mount) {
        mount.hidden = false;
        mount.className = 'recaptcha-zone recaptcha-zone--erreur';
        mount.textContent =
          'Vérification anti-spam indisponible. Rechargez la page ou vérifiez localhost dans Google reCAPTCHA.';
      }
    }
    return;
  }

  if (endpoint && mount) {
    mount.hidden = false;
    mount.className = 'recaptcha-zone recaptcha-zone--config';
    mount.setAttribute('role', 'alert');
    mount.textContent =
      'reCAPTCHA non configuré : renseignez PORTFOLIO_RECAPTCHA_SITE_KEY dans .env puis relancez le build.';
  }
}

function optionsRecaptcha() {
  return {
    siteKey: CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY,
    version: CONFIGURATION.CONTACT.RECAPTCHA_VERSION === 3 ? 3 : 2,
    mountId: CONFIGURATION.SELECTEURS.MONTE_RECAPTCHA,
    action: 'submit',
  };
}

function lireChampsFormulaire() {
  const { LIMITES } = CONFIGURATION.CONTACT;
  return {
    nom: nettoyerChamp(parId(CONFIGURATION.SELECTEURS.CONTACT_NOM)?.value, LIMITES.nom),
    email: nettoyerChamp(parId(CONFIGURATION.SELECTEURS.CONTACT_EMAIL)?.value, LIMITES.email),
    message: nettoyerChamp(parId(CONFIGURATION.SELECTEURS.CONTACT_MESSAGE)?.value, LIMITES.message),
    champsDom: [
      parId(CONFIGURATION.SELECTEURS.CONTACT_NOM),
      parId(CONFIGURATION.SELECTEURS.CONTACT_EMAIL),
      parId(CONFIGURATION.SELECTEURS.CONTACT_MESSAGE),
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
  } else if (!estEmailValide(email, CONFIGURATION.CONTACT.LIMITES.email)) {
    erreurs.push({ el: emailEl, message: 'Adresse e-mail invalide.' });
  }
  if (!message) {
    erreurs.push({ el: messageEl, message: 'Veuillez rédiger votre message.' });
  }

  return erreurs;
}

function champsValides({ nom, email, message }) {
  return nom && email && message && estEmailValide(email, CONFIGURATION.CONTACT.LIMITES.email);
}

export async function initialiserFormulaireContact() {
  const formulaire = parId(CONFIGURATION.SELECTEURS.FORMULAIRE);
  if (!formulaire) return;

  const endpoint = CONFIGURATION.CONTACT.FORMSPREE_ENDPOINT?.trim();
  const recaptchaKey = CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY?.trim();
  const mount = parId(CONFIGURATION.SELECTEURS.MONTE_RECAPTCHA);
  const zoneErreur = parId(CONFIGURATION.SELECTEURS.CONTACT_ERREUR);
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
        parId(CONFIGURATION.SELECTEURS.CONTACT_HONEYPOT),
        CONFIGURATION.CONTACT.NOM_POT_MIEL
      )
    ) {
      return;
    }

    if (
      !peutSoumettreAvecSession(CONFIGURATION.STOCKAGE.DERNIERE_SOUMISSION_CONTACT, CONFIGURATION.CONTACT.DELAI_LIMITATION_MS)
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

    const btnEnvoyer = parId(CONFIGURATION.SELECTEURS.BTN_ENVOYER);
    const confirmation = parId(CONFIGURATION.SELECTEURS.CONFIRMATION);
    if (!btnEnvoyer) return;

    if (formulaire.dataset.envoiEnCours === '1') return;
    formulaire.dataset.envoiEnCours = '1';

    const sujetUtile = lireSujetUtile(parId(CONFIGURATION.SELECTEURS.CONTACT_SUJET));
    const champs = { nom, email, message };

    if (endpoint) {
      const result = await envoyerViaFormspree({
        configuration: CONFIGURATION,
        champs,
        sujetUtile,
        btnEnvoyer,
        mount,
        optionsRecaptcha: optionsRecaptcha(),
        afficherErreur,
      });
      if (result?.ok) {
        enregistrerSoumissionSession(CONFIGURATION.STOCKAGE.DERNIERE_SOUMISSION_CONTACT);
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
        configuration: CONFIGURATION,
        champs,
        sujetUtile,
      })
    ) {
      enregistrerSoumissionSession(CONFIGURATION.STOCKAGE.DERNIERE_SOUMISSION_CONTACT);
      finaliserEnvoiReussi({ btnEnvoyer, confirmation });
    } else {
      delete formulaire.dataset.envoiEnCours;
    }
  });

  formulaire.dataset.ready = '1';
}
