import {
  construireDonneesFormspree,
  libellerSujetSelect,
  messageErreurCapture,
  messageErreurFormspree,
} from '../utils/contact-form-helpers.js';
import { PARAMETRES_BIP_ERREUR_VALIDATION } from '../utils/contact-form-ui.js';
import { decoderBase64Utf8 } from '../utils/pii.js';
import { jouerBip } from './audio.js';
import { obtenirTokenRecaptcha } from './recaptcha.js';
import {
  marquerEnvoiEnCours,
  signalerEchecEnvoi,
} from './contact-form-submit-ui.js';

export { finaliserEnvoiReussi } from './contact-form-submit-ui.js';

export function lireSujetUtile(sujetSelect) {
  return libellerSujetSelect(sujetSelect?.options[sujetSelect.selectedIndex]?.text);
}

export async function envoyerViaFormspree({
  configuration,
  champs,
  sujetUtile,
  btnEnvoyer,
  mount,
  optionsRecaptcha,
  afficherErreur,
}) {
  const { nom, email, message } = champs;
  const recaptchaKey = configuration.CONTACT.RECAPTCHA_SITE_KEY?.trim();
  const endpoint = configuration.CONTACT.FORMSPREE_ENDPOINT?.trim();
  const labelEnvoyer = btnEnvoyer.textContent;

  if (!recaptchaKey) {
    jouerBip(...PARAMETRES_BIP_ERREUR_VALIDATION);
    btnEnvoyer.setAttribute(
      'title',
      'Renseignez PORTFOLIO_RECAPTCHA_SITE_KEY dans .env.local puis relancez npm test pour envoyer via Formspree.'
    );
    if (mount) mount.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  btnEnvoyer.removeAttribute('title');
  marquerEnvoiEnCours(btnEnvoyer);
  let recaptchaToken = null;

  try {
    recaptchaToken = await obtenirTokenRecaptcha(optionsRecaptcha);
  } catch (err) {
    signalerEchecEnvoi({
      btnEnvoyer,
      labelEnvoyer,
      msg: messageErreurCapture(err),
      afficherErreur,
    });
    return;
  }

  if (!recaptchaToken) {
    signalerEchecEnvoi({
      btnEnvoyer,
      labelEnvoyer,
      msg:
        configuration.CONTACT.RECAPTCHA_VERSION === 3
          ? 'Vérification anti-spam en cours… réessayez.'
          : 'Cochez la case « Je ne suis pas un robot ».',
      afficherErreur,
    });
    return;
  }

  const fd = construireDonneesFormspree({
    nom,
    email,
    message,
    sujetLabel: sujetUtile,
    recaptchaToken,
  });

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: fd,
      headers: { Accept: 'application/json' },
    });
    let corpsReponse = null;
    try {
      corpsReponse = await res.json();
    } catch {
      /* corps non JSON */
    }

    if (res.ok) {
      return { ok: true };
    }

    signalerEchecEnvoi({
      btnEnvoyer,
      labelEnvoyer,
      msg: messageErreurFormspree(corpsReponse, res),
      afficherErreur,
      reinitialiserRecaptcha: true,
    });
  } catch (err) {
    signalerEchecEnvoi({
      btnEnvoyer,
      labelEnvoyer,
      msg: messageErreurCapture(err),
      afficherErreur,
      reinitialiserRecaptcha: true,
    });
  }
}

export function envoyerViaMailto({ configuration, champs, sujetUtile }) {
  const { nom, email, message } = champs;
  const emailDest = decoderBase64Utf8(configuration.CONTACT.EMAIL_B64);
  if (!emailDest) return false;

  const subject = `[Portfolio] ${sujetUtile ? `${sujetUtile} — ` : ''}${nom}`;
  const body = `De : ${nom} <${email}>\n\n${message}`;
  window.location.href = `mailto:${emailDest}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return true;
}
