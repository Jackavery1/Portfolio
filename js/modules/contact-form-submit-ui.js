import { PARAMETRES_BIP_ERREUR_VALIDATION } from '../utils/contact-form-ui.js';
import { CONFIGURATION } from '../config/index.js';
import { jouerBip } from './audio.js';
import { ajouterScore } from './score.js';
import { reinitialiserWidgetRecaptcha } from './recaptcha.js';

const LABEL_ENVOI_EN_COURS = 'ENVOI…';

export function marquerEnvoiEnCours(btnEnvoyer) {
  btnEnvoyer.disabled = true;
  btnEnvoyer.setAttribute('aria-busy', 'true');
  btnEnvoyer.classList.add('bouton-envoyer--chargement');
  btnEnvoyer.textContent = LABEL_ENVOI_EN_COURS;
  btnEnvoyer.form?.setAttribute('aria-busy', 'true');
}

export function restaurerBoutonEnvoi(btnEnvoyer, labelEnvoyer) {
  btnEnvoyer.disabled = false;
  btnEnvoyer.removeAttribute('aria-busy');
  btnEnvoyer.classList.remove('bouton-envoyer--chargement');
  btnEnvoyer.textContent = labelEnvoyer;
  btnEnvoyer.form?.removeAttribute('aria-busy');
  delete btnEnvoyer.form?.dataset.envoiEnCours;
}

export function signalerEchecEnvoi({
  btnEnvoyer,
  labelEnvoyer,
  msg,
  afficherErreur,
  reinitialiserRecaptcha = false,
}) {
  jouerBip(...PARAMETRES_BIP_ERREUR_VALIDATION);
  restaurerBoutonEnvoi(btnEnvoyer, labelEnvoyer);
  if (reinitialiserRecaptcha) reinitialiserWidgetRecaptcha();
  btnEnvoyer.setAttribute('title', msg);
  afficherErreur(msg);
}

function confirmerEnvoiReussi({ btnEnvoyer, confirmation }) {
  reinitialiserWidgetRecaptcha();
  if (confirmation) confirmation.hidden = false;
  jouerBip(660, 80, 'sine');
  ajouterScore(CONFIGURATION.BONUS_SCORE.CONTACT);
  btnEnvoyer.removeAttribute('aria-busy');
  btnEnvoyer.form?.removeAttribute('aria-busy');
  btnEnvoyer.textContent = '✓ ENVOYÉ';
}

export function finaliserEnvoiReussi({ btnEnvoyer, confirmation, desactiver = true }) {
  confirmerEnvoiReussi({ btnEnvoyer, confirmation });
  if (desactiver) btnEnvoyer.disabled = true;
}
