import {
  construireFormDataFormspree,
  libellerSujetSelect,
  messageErreurCatch,
  messageErreurFormspree,
} from '../utils/contact-form-helpers.js';
import { decodeBase64Utf8 } from '../utils/pii.js';
import { jouerBip } from './audio.js';
import { SCORE_BONUS } from '../config/score-bonus.js';
import { ajouterScore } from './score.js';
import { obtenirTokenRecaptcha, reinitialiserWidgetRecaptcha } from './recaptcha.js';

export const LABEL_ENVOI_EN_COURS = 'ENVOI…';

function marquerEnvoiEnCours(btnEnvoyer) {
  btnEnvoyer.disabled = true;
  btnEnvoyer.setAttribute('aria-busy', 'true');
  btnEnvoyer.classList.add('bouton-envoyer--chargement');
  btnEnvoyer.textContent = LABEL_ENVOI_EN_COURS;
  btnEnvoyer.form?.setAttribute('aria-busy', 'true');
}

function restaurerBoutonEnvoi(btnEnvoyer, labelEnvoyer) {
  btnEnvoyer.disabled = false;
  btnEnvoyer.removeAttribute('aria-busy');
  btnEnvoyer.classList.remove('bouton-envoyer--chargement');
  btnEnvoyer.textContent = labelEnvoyer;
  btnEnvoyer.form?.removeAttribute('aria-busy');
  delete btnEnvoyer.form?.dataset.envoiEnCours;
}

function signalerEchecEnvoi({ btnEnvoyer, labelEnvoyer, msg, afficherErreur, reinitialiserRecaptcha = false }) {
  jouerBip(150, 120, 'sawtooth');
  restaurerBoutonEnvoi(btnEnvoyer, labelEnvoyer);
  if (reinitialiserRecaptcha) reinitialiserWidgetRecaptcha();
  btnEnvoyer.setAttribute('title', msg);
  afficherErreur(msg);
}

export function lireSujetUtile(sujetSelect) {
  return libellerSujetSelect(sujetSelect?.options[sujetSelect.selectedIndex]?.text);
}

export async function envoyerViaFormspree({
  config,
  champs,
  sujetUtile,
  btnEnvoyer,
  mount,
  optionsRecaptcha,
  afficherErreur,
}) {
  const { nom, email, message } = champs;
  const recaptchaKey = config.CONTACT.RECAPTCHA_SITE_KEY?.trim();
  const endpoint = config.CONTACT.FORMSPREE_ENDPOINT?.trim();
  const labelEnvoyer = btnEnvoyer.textContent;

  if (!recaptchaKey) {
    jouerBip(150, 120, 'sawtooth');
    btnEnvoyer.setAttribute(
      'title',
      'Renseignez PORTFOLIO_RECAPTCHA_SITE_KEY dans .env puis relancez le build pour envoyer via Formspree.'
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
      msg: messageErreurCatch(err),
      afficherErreur,
    });
    return;
  }

  if (!recaptchaToken) {
    signalerEchecEnvoi({
      btnEnvoyer,
      labelEnvoyer,
      msg:
        config.CONTACT.RECAPTCHA_VERSION === 3
          ? 'Vérification anti-spam en cours… réessayez.'
          : 'Cochez la case « Je ne suis pas un robot ».',
      afficherErreur,
    });
    return;
  }

  const fd = construireFormDataFormspree({
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
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      /* corps non JSON */
    }

    if (res.ok) {
      return { ok: true };
    }

    signalerEchecEnvoi({
      btnEnvoyer,
      labelEnvoyer,
      msg: messageErreurFormspree(payload, res),
      afficherErreur,
      reinitialiserRecaptcha: true,
    });
  } catch (err) {
    signalerEchecEnvoi({
      btnEnvoyer,
      labelEnvoyer,
      msg: messageErreurCatch(err),
      afficherErreur,
      reinitialiserRecaptcha: true,
    });
  }
}

export function envoyerViaMailto({ config, champs, sujetUtile }) {
  const { nom, email, message } = champs;
  const emailDest = decodeBase64Utf8(config.CONTACT.EMAIL_B64);
  if (!emailDest) return false;

  const subject = `[Portfolio] ${sujetUtile ? `${sujetUtile} — ` : ''}${nom}`;
  const body = `De : ${nom} <${email}>\n\n${message}`;
  window.location.href = `mailto:${emailDest}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return true;
}

function confirmerEnvoiReussi({ btnEnvoyer, confirmation }) {
  reinitialiserWidgetRecaptcha();
  if (confirmation) confirmation.hidden = false;
  jouerBip(660, 80, 'sine');
  ajouterScore(SCORE_BONUS.CONTACT);
  btnEnvoyer.removeAttribute('aria-busy');
  btnEnvoyer.form?.removeAttribute('aria-busy');
  btnEnvoyer.textContent = '✓ ENVOYÉ';
}

export function finaliserEnvoiReussi({ btnEnvoyer, confirmation, desactiver = true }) {
  confirmerEnvoiReussi({ btnEnvoyer, confirmation });
  if (desactiver) btnEnvoyer.disabled = true;
}
