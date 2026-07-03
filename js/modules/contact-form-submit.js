import {
  construireFormDataFormspree,
  libellerSujetSelect,
  messageErreurCatch,
  messageErreurFormspree,
} from '../utils/contact-form-helpers.js';
import { decodeBase64Utf8 } from '../utils/pii.js';
import { jouerBip } from './audio.js';
import { ajouterScore } from './score.js';
import { obtenirTokenRecaptcha, resetRecaptcha } from './recaptcha.js';

export const LABEL_ENVOI_EN_COURS = 'ENVOI…';

function marquerEnvoiEnCours(btnEnvoyer) {
  btnEnvoyer.disabled = true;
  btnEnvoyer.setAttribute('aria-busy', 'true');
  btnEnvoyer.textContent = LABEL_ENVOI_EN_COURS;
  btnEnvoyer.form?.setAttribute('aria-busy', 'true');
}

function restaurerBoutonEnvoi(btnEnvoyer, labelEnvoyer) {
  btnEnvoyer.disabled = false;
  btnEnvoyer.removeAttribute('aria-busy');
  btnEnvoyer.textContent = labelEnvoyer;
  btnEnvoyer.form?.removeAttribute('aria-busy');
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
    jouerBip(150, 120, 'sawtooth');
    restaurerBoutonEnvoi(btnEnvoyer, labelEnvoyer);
    const msg = messageErreurCatch(err);
    btnEnvoyer.setAttribute('title', msg);
    afficherErreur(msg);
    return;
  }

  if (!recaptchaToken) {
    jouerBip(150, 120, 'sawtooth');
    restaurerBoutonEnvoi(btnEnvoyer, labelEnvoyer);
    const msg =
      config.CONTACT.RECAPTCHA_VERSION === 3
        ? 'Vérification anti-spam en cours… réessayez.'
        : 'Cochez la case « Je ne suis pas un robot ».';
    btnEnvoyer.setAttribute('title', msg);
    afficherErreur(msg);
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
      return { ok: true, labelEnvoyer };
    }

    jouerBip(150, 120, 'sawtooth');
    restaurerBoutonEnvoi(btnEnvoyer, labelEnvoyer);
    resetRecaptcha();
    const msg = messageErreurFormspree(payload, res);
    btnEnvoyer.setAttribute('title', msg);
    afficherErreur(msg);
  } catch (err) {
    jouerBip(150, 120, 'sawtooth');
    restaurerBoutonEnvoi(btnEnvoyer, labelEnvoyer);
    resetRecaptcha();
    const msg = messageErreurCatch(err);
    btnEnvoyer.setAttribute('title', msg);
    afficherErreur(msg);
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
  resetRecaptcha();
  if (confirmation) confirmation.hidden = false;
  jouerBip(660, 80, 'sine');
  ajouterScore(500);
  btnEnvoyer.removeAttribute('aria-busy');
  btnEnvoyer.form?.removeAttribute('aria-busy');
  btnEnvoyer.textContent = '✓ ENVOYÉ';
}

export function finaliserEnvoiReussi({ btnEnvoyer, confirmation, desactiver = true }) {
  confirmerEnvoiReussi({ btnEnvoyer, confirmation });
  if (desactiver) btnEnvoyer.disabled = true;
}
