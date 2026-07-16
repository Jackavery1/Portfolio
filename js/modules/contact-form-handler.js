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
import { comportementScroll } from '../utils/scroll-comportement.js';
import { jouerBip } from './audio.js';
import {
  champsFormulaireValides,
  construireErreursValidation,
  lireChampsFormulaire,
} from './contact-form-validation.js';
import { envoyerViaFormspree, envoyerViaMailto, lireSujetUtile } from './contact-form-submit.js';
import {
  finaliserEnvoiReussi,
  marquerEnvoiEnCours,
  signalerEchecEnvoi,
} from './contact-form-submit-ui.js';

const MSG_CLE_RECAPTCHA_MANQUANTE =
  'Renseignez PORTFOLIO_RECAPTCHA_SITE_KEY dans .env.local puis relancez npm test pour envoyer via Formspree.';

async function traiterEnvoiFormspree({
  formulaire,
  champs,
  sujetUtile,
  btnEnvoyer,
  confirmation,
  labelEnvoyer,
  optionsRecaptcha,
  afficherErreur,
  assurerRecaptcha,
}) {
  await assurerRecaptcha();

  if (!CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY?.trim()) {
    jouerBip(...PARAMETRES_BIP_ERREUR_VALIDATION);
    btnEnvoyer.setAttribute('title', MSG_CLE_RECAPTCHA_MANQUANTE);
    const mount = parId(CONFIGURATION.SELECTEURS.MONTE_RECAPTCHA);
    if (mount) mount.scrollIntoView({ behavior: comportementScroll(), block: 'nearest' });
    delete formulaire.dataset.envoiEnCours;
    return;
  }

  marquerEnvoiEnCours(btnEnvoyer);
  const resultat = await envoyerViaFormspree({
    configuration: CONFIGURATION,
    champs,
    sujetUtile,
    optionsRecaptcha,
  });

  if (resultat?.ok) {
    enregistrerSoumissionSession(CONFIGURATION.STOCKAGE.DERNIERE_SOUMISSION_CONTACT);
    finaliserEnvoiReussi({ btnEnvoyer, confirmation });
    return;
  }

  signalerEchecEnvoi({
    btnEnvoyer,
    labelEnvoyer,
    msg: resultat?.msg || 'Erreur d’envoi.',
    afficherErreur,
    reinitialiserRecaptcha: Boolean(resultat?.reinitialiserRecaptcha),
  });
}

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
    const labelEnvoyer = btnEnvoyer.textContent;

    if (endpoint) {
      await traiterEnvoiFormspree({
        formulaire,
        champs,
        sujetUtile,
        btnEnvoyer,
        confirmation,
        labelEnvoyer,
        optionsRecaptcha,
        afficherErreur,
        assurerRecaptcha,
      });
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
