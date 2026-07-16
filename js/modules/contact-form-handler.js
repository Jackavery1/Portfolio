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

export function initialiserEcouteurSoumission(
  formulaire,
  { endpoint, assurerRecaptcha, optionsRecaptcha }
) {
  const zoneErreur = parId(CONFIGURATION.SELECTEURS.CONTACT_ERREUR);
  const afficherErreur = (texte) => afficherErreurZone(zoneErreur, texte);

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
        mount: parId(CONFIGURATION.SELECTEURS.MONTE_RECAPTCHA),
        optionsRecaptcha,
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
}
