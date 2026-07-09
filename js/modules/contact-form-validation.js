/* Contact — lecture et validation des champs formulaire */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { nettoyerChamp, estEmailValide } from '../utils/validation.js';

export function lireChampsFormulaire() {
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

export function construireErreursValidation({ nom, email, message, champsDom }) {
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

export function champsFormulaireValides({ nom, email, message }) {
  return nom && email && message && estEmailValide(email, CONFIGURATION.CONTACT.LIMITES.email);
}
