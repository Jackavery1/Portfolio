/**
 * Chargement dynamique des scripts Google reCAPTCHA v2/v3.
 */

import { cleDansScriptRecaptchaV3 } from '../utils/validation.js';

let scriptPromise = null;
let cleSiteChargee = null;

export function reinitialiserEtatChargement() {
  scriptPromise = null;
  cleSiteChargee = null;
}

export function retirerScriptsRecaptcha() {
  document
    .querySelectorAll('script[data-recaptcha-v3], script[data-recaptcha-v2]')
    .forEach((el) => el.remove());
  reinitialiserEtatChargement();
}

function attendreGrecaptcha(g) {
  return new Promise((resolve) => {
    g.ready(() => resolve(g));
  });
}

export function chargerScriptV3(siteKey) {
  if (typeof window !== 'undefined' && window.__E2E_RECAPTCHA_TOKEN && window.grecaptcha) {
    cleSiteChargee = siteKey?.trim();
    return Promise.resolve(window.grecaptcha).then(attendreGrecaptcha);
  }

  const key = siteKey?.trim();
  const existant = document.querySelector('script[data-recaptcha-v3]');
  const renderActuel = cleDansScriptRecaptchaV3(existant);

  if (existant && renderActuel && renderActuel !== key) {
    retirerScriptsRecaptcha();
  }

  if (scriptPromise && cleSiteChargee === key) {
    return scriptPromise;
  }

  if (existant && renderActuel === key && window.grecaptcha) {
    cleSiteChargee = key;
    return Promise.resolve(window.grecaptcha).then(attendreGrecaptcha);
  }

  retirerScriptsRecaptcha();
  cleSiteChargee = key;

  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
    s.async = true;
    s.dataset.recaptchaV3 = '1';
    s.onload = () => {
      if (!window.grecaptcha) {
        reinitialiserEtatChargement();
        reject(new Error('reCAPTCHA indisponible après chargement'));
        return;
      }
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
    };
    s.onerror = () => {
      reinitialiserEtatChargement();
      reject(new Error('Script reCAPTCHA bloqué (réseau, AdBlock ou CSP)'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function chargerScriptV2(siteKey) {
  const key = siteKey?.trim();
  if (scriptPromise && cleSiteChargee === `v2:${key}`) {
    return scriptPromise;
  }
  retirerScriptsRecaptcha();
  cleSiteChargee = `v2:${key}`;

  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js';
    s.async = true;
    s.defer = true;
    s.dataset.recaptchaV2 = '1';
    s.onload = () => {
      if (!window.grecaptcha) {
        reinitialiserEtatChargement();
        reject(new Error('reCAPTCHA indisponible'));
        return;
      }
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
    };
    s.onerror = () => {
      reinitialiserEtatChargement();
      reject(new Error('Chargement reCAPTCHA impossible'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}
