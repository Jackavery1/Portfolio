import {
  construireDonneesFormspree,
  libellerSujetSelect,
  messageErreurCapture,
  messageErreurFormspree,
} from '../utils/contact-form-helpers.js';
import { decoderBase64Utf8 } from '../utils/pii.js';
import { obtenirTokenRecaptcha } from './recaptcha.js';

export function lireSujetUtile(sujetSelect) {
  return libellerSujetSelect(sujetSelect?.options[sujetSelect.selectedIndex]?.text);
}

export async function envoyerViaFormspree({ configuration, champs, sujetUtile, optionsRecaptcha }) {
  const { nom, email, message } = champs;
  const recaptchaKey = configuration.CONTACT.RECAPTCHA_SITE_KEY?.trim();
  const endpoint = configuration.CONTACT.FORMSPREE_ENDPOINT?.trim();

  if (!recaptchaKey) {
    return { ok: false, code: 'sans-cle' };
  }

  let recaptchaToken = null;

  try {
    recaptchaToken = await obtenirTokenRecaptcha(optionsRecaptcha);
  } catch (err) {
    return { ok: false, msg: messageErreurCapture(err) };
  }

  if (!recaptchaToken) {
    return {
      ok: false,
      msg:
        configuration.CONTACT.RECAPTCHA_VERSION === 3
          ? 'Vérification anti-spam en cours… réessayez.'
          : 'Cochez la case « Je ne suis pas un robot ».',
    };
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

    return {
      ok: false,
      msg: messageErreurFormspree(corpsReponse, res),
      reinitialiserRecaptcha: true,
    };
  } catch (err) {
    return {
      ok: false,
      msg: messageErreurCapture(err),
      reinitialiserRecaptcha: true,
    };
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
