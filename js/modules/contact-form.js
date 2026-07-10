/* Contact — orchestration formulaire (validation, reCAPTCHA, envoi) */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import {
  afficherErreurZone,
  enregistrerSoumissionSession,
  effacerEtatsInvalides,
  potDeMielRempli,
  marquerChampsInvalides,
  peutSoumettreAvecSession,
  PARAMETRES_BIP_ERREUR_VALIDATION,
} from '../utils/contact-form-ui.js';
import { jouerBip } from './audio.js';
import { optionsRecaptchaContact, planifierRecaptchaAuFocus } from './contact-form-recaptcha.js';
import {
  champsFormulaireValides,
  construireErreursValidation,
  lireChampsFormulaire,
} from './contact-form-validation.js';
import {
  envoyerViaFormspree,
  envoyerViaMailto,
  finaliserEnvoiReussi,
  lireSujetUtile,
} from './contact-form-submit.js';
import { initialiserScrollChampClavier } from '../utils/visual-viewport.js';

export async function initialiserFormulaireContact() {
  const formulaire = parId(CONFIGURATION.SELECTEURS.FORMULAIRE);
  if (!formulaire) return;

  const endpoint = CONFIGURATION.CONTACT.FORMSPREE_ENDPOINT?.trim();
  const recaptchaKey = CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY?.trim();
  const mount = parId(CONFIGURATION.SELECTEURS.MONTE_RECAPTCHA);
  const zoneErreur = parId(CONFIGURATION.SELECTEURS.CONTACT_ERREUR);
  const afficherErreur = (texte) => afficherErreurZone(zoneErreur, texte);
  const paramsRecaptcha = {
    endpoint,
    recaptchaKey,
    mount,
    optionsRecaptcha: optionsRecaptchaContact(),
  };
  const assurerRecaptcha = planifierRecaptchaAuFocus(formulaire, paramsRecaptcha);

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
      !peutSoumettreAvecSession(
        CONFIGURATION.STOCKAGE.DERNIERE_SOUMISSION_CONTACT,
        CONFIGURATION.CONTACT.DELAI_LIMITATION_MS
      )
    ) {
      jouerBip(...PARAMETRES_BIP_ERREUR_VALIDATION);
      afficherErreur('Veuillez patienter avant un nouvel envoi.');
      return;
    }

    const { nom, email, message, champsDom: champsDomLus } = lireChampsFormulaire();
    if (!champsFormulaireValides({ nom, email, message })) {
      marquerChampsInvalides(
        construireErreursValidation({ nom, email, message, champsDom: champsDomLus }),
        jouerBip
      );
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
      await assurerRecaptcha();
      const result = await envoyerViaFormspree({
        configuration: CONFIGURATION,
        champs,
        sujetUtile,
        btnEnvoyer,
        mount,
        optionsRecaptcha: optionsRecaptchaContact(),
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
