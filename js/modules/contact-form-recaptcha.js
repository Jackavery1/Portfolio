import { initRecaptcha } from './recaptcha.js';

export async function initialiserRecaptchaContact({ endpoint, recaptchaKey, mount, optionsRecaptcha }) {
  if (endpoint && recaptchaKey) {
    try {
      await initRecaptcha(optionsRecaptcha);
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
      'reCAPTCHA non configuré : renseignez PORTFOLIO_RECAPTCHA_SITE_KEY dans .env puis relancez le build.';
  }
}
