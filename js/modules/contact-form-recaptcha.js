/* Contact — chargement reCAPTCHA au focus */

import { CONFIGURATION } from '../config/index.js';
import { initialiserRecaptcha } from './recaptcha.js';

export function optionsRecaptchaContact() {
  return {
    siteKey: CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY,
    version: CONFIGURATION.CONTACT.RECAPTCHA_VERSION === 3 ? 3 : 2,
    mountId: CONFIGURATION.SELECTEURS.MONTE_RECAPTCHA,
    action: 'submit',
  };
}

export async function initialiserRecaptchaContact({ endpoint, recaptchaKey, mount, optionsRecaptcha }) {
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
      'reCAPTCHA non configuré : renseignez PORTFOLIO_RECAPTCHA_SITE_KEY dans .env.local puis relancez npm test.';
  }
}

export function planifierRecaptchaAuFocus(formulaire, params) {
  const { endpoint, recaptchaKey } = params;
  if (!endpoint?.trim() || !recaptchaKey?.trim()) {
    if (endpoint?.trim() && !recaptchaKey?.trim()) {
      void initialiserRecaptchaContact(params);
    }
    return () => Promise.resolve();
  }

  let promesse = null;
  const lancer = () => {
    if (!promesse) promesse = initialiserRecaptchaContact(params);
    return promesse;
  };

  formulaire.addEventListener('focusin', () => void lancer(), { once: true });
  return lancer;
}
