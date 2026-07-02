/* ============================================
   reCAPTCHA (Formspree : champ g-recaptcha-response)
   ============================================ */

import { byId } from '../utils/dom.js';
import { cleDansScriptRecaptchaV3 } from '../utils/validation.js';

let scriptPromise = null;
let widgetId = null;
let cleSiteChargee = null;

function retirerScriptsRecaptcha() {
  document
    .querySelectorAll('script[data-recaptcha-v3], script[data-recaptcha-v2]')
    .forEach((el) => el.remove());
  scriptPromise = null;
  cleSiteChargee = null;
  widgetId = null;
}

function chargerScriptV3(siteKey) {
  if (typeof window !== 'undefined' && window.__E2E_RECAPTCHA_TOKEN && window.grecaptcha) {
    cleSiteChargee = siteKey?.trim();
    return Promise.resolve(window.grecaptcha).then(
      (g) =>
        new Promise((resolve) => {
          g.ready(() => resolve(g));
        }),
    );
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
    return Promise.resolve(window.grecaptcha).then(
      (g) =>
        new Promise((resolve) => {
          g.ready(() => resolve(g));
        })
    );
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
        scriptPromise = null;
        cleSiteChargee = null;
        reject(new Error('reCAPTCHA indisponible après chargement'));
        return;
      }
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
    };
    s.onerror = () => {
      scriptPromise = null;
      cleSiteChargee = null;
      reject(new Error('Script reCAPTCHA bloqué (réseau, AdBlock ou CSP)'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

function chargerScriptV2(siteKey) {
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
        scriptPromise = null;
        cleSiteChargee = null;
        reject(new Error('reCAPTCHA indisponible'));
        return;
      }
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
    };
    s.onerror = () => {
      scriptPromise = null;
      cleSiteChargee = null;
      reject(new Error('Chargement reCAPTCHA impossible'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export async function initRecaptcha({ siteKey, version, mountId }) {
  if (typeof window !== 'undefined' && window.__E2E_RECAPTCHA_TOKEN) {
    return true;
  }

  const key = siteKey?.trim();
  if (!key) return false;

  const mount = mountId ? byId(mountId) : null;
  if (version === 3) {
    if (mount) {
      mount.hidden = false;
      mount.className = 'recaptcha-zone recaptcha-zone--v3';
      mount.setAttribute('role', 'status');
      mount.textContent =
        'Vérification anti-spam (reCAPTCHA v3). Domaines Google : 127.0.0.1 et localhost.';
    }
    await chargerScriptV3(key);
    return true;
  }

  if (!mount) return false;
  mount.hidden = false;
  const g = await chargerScriptV2(key);
  if (widgetId != null) {
    g.reset(widgetId);
    return true;
  }
  widgetId = g.render(mount, { sitekey: key });
  return true;
}

export async function obtenirTokenRecaptcha({ siteKey, version, action = 'submit' }) {
  const key = siteKey?.trim();
  if (!key) return null;
  if (window.__E2E_RECAPTCHA_TOKEN) return window.__E2E_RECAPTCHA_TOKEN;

  if (version === 3) {
    const g = await chargerScriptV3(key);
    try {
      return await g.execute(key, { action });
    } catch (err) {
      const detail = err?.message || '';
      if (/invalid site key|not loaded in api/i.test(detail)) {
        retirerScriptsRecaptcha();
        throw new Error(
          `${detail} — Rechargez la page (Ctrl+F5) après avoir changé PORTFOLIO_RECAPTCHA_SITE_KEY dans .env.local, et vérifiez 127.0.0.1 + localhost dans Google reCAPTCHA.`
        );
      }
      throw new Error(
        detail ? `Jeton reCAPTCHA : ${detail}` : 'Impossible de générer le jeton reCAPTCHA'
      );
    }
  }

  const g = await chargerScriptV2(key);
  if (widgetId == null) return null;
  return g.getResponse(widgetId) || null;
}

export function resetRecaptcha() {
  if (widgetId != null && window.grecaptcha) {
    window.grecaptcha.reset(widgetId);
  }
}
